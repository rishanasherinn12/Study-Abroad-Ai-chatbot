from openai import OpenAI

import config
from vector_store import VectorStore

SYSTEM_PROMPT = """You are a helpful assistant that answers questions using the provided document context.

Rules:
- Use ONLY the information in the <context> blocks below to answer.
- If the answer is not in the context, say: "I don't have enough information in the uploaded documents to answer that."
- Cite the source filename in parentheses after each fact, e.g. (sample.txt).
- Be concise and accurate. Do not invent information.
"""


class RAGEngine:
    def __init__(self, store: VectorStore):
        self.store = store
        # Groq is OpenAI-compatible — same SDK, different base_url.
        self.client = OpenAI(
            api_key=config.GROQ_API_KEY,
            base_url=config.GROQ_BASE_URL,
        )

    def _build_context(self, hits: list[dict]) -> str:
        if not hits:
            return "<context>No documents have been uploaded yet.</context>"
        blocks = []
        for hit in hits:
            blocks.append(
                f"<context source=\"{hit['source']}\" chunk={hit['chunk_index']}>\n"
                f"{hit['text']}\n"
                f"</context>"
            )
        return "\n\n".join(blocks)

    def answer(self, question: str, history: list[dict] | None = None) -> dict:
        hits = self.store.search(question)
        context_block = self._build_context(hits)

        user_content = f"{context_block}\n\nQuestion: {question}"

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        if history:
            for turn in history[-6:]:
                messages.append({"role": turn["role"], "content": turn["content"]})
        messages.append({"role": "user", "content": user_content})

        response = self.client.chat.completions.create(
            model=config.GROQ_MODEL,
            messages=messages,
            max_tokens=1024,
            temperature=0.2,
        )

        answer_text = response.choices[0].message.content or ""
        sources = sorted({hit["source"] for hit in hits})

        return {
            "answer": answer_text.strip(),
            "sources": sources,
            "retrieved_chunks": len(hits),
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            },
        }
