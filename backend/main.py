from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAIError
from pydantic import BaseModel

import config
from document_processor import chunk_text, load_document
from rag_engine import RAGEngine
from vector_store import VectorStore

ALLOWED_EXTENSIONS = {".pdf", ".txt", ".md"}

app = FastAPI(title="RAG Chatbot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

if not config.GROQ_API_KEY:
    print("\n[WARNING] GROQ_API_KEY is not set. Add it to backend/.env and restart.\n")

store = VectorStore()
engine = RAGEngine(store)


class ChatTurn(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    history: list[ChatTurn] = []


@app.get("/")
def root():
    return {
        "name": "RAG Chatbot API",
        "llm_provider": "groq",
        "model": config.GROQ_MODEL,
        "retrieval": "BM25 (local, no API)",
        "groq_key_configured": bool(config.GROQ_API_KEY),
        "endpoints": ["/health", "/upload", "/chat", "/sources", "/sources/{name}"],
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "groq_key_configured": bool(config.GROQ_API_KEY),
        "total_chunks": store.total_chunks(),
        "sources": len(store.list_sources()),
    }


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{suffix}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
        )

    safe_name = Path(file.filename).name
    save_path = Path(config.UPLOADS_DIR) / safe_name
    contents = await file.read()
    save_path.write_bytes(contents)

    try:
        text = load_document(str(save_path))
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {exc}")

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(status_code=400, detail="No extractable text found in file.")

    store.delete_source(safe_name)
    try:
        added = store.add_chunks(chunks, source=safe_name)
    except Exception as exc:
        print(f"[Indexing error] {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=500, detail=f"Indexing failed: {exc}")

    return {
        "filename": safe_name,
        "chunks_added": added,
        "total_chunks": store.total_chunks(),
    }


@app.post("/chat")
def chat(req: ChatRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question is empty.")
    if not config.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="GROQ_API_KEY is not set. Add it to backend/.env and restart the server.",
        )
    history = [t.model_dump() for t in req.history]
    try:
        return engine.answer(req.question, history=history)
    except OpenAIError as exc:
        print(f"[Groq API error during chat] {type(exc).__name__}: {exc}")
        raise HTTPException(
            status_code=502,
            detail=f"Groq API request failed: {exc}. "
                   f"Check your GROQ_API_KEY and that the model '{config.GROQ_MODEL}' is available.",
        )
    except Exception as exc:
        print(f"[Chat error] {type(exc).__name__}: {exc}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {exc}")


@app.get("/sources")
def sources():
    return {"sources": store.list_sources(), "total_chunks": store.total_chunks()}


@app.delete("/sources/{name}")
def delete_source(name: str):
    removed = store.delete_source(name)
    file_path = Path(config.UPLOADS_DIR) / name
    if file_path.exists():
        file_path.unlink()
    return {"deleted_chunks": removed, "filename": name}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
