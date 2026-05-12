import json
import re
from pathlib import Path

from rank_bm25 import BM25Okapi

import config


def _tokenize(text: str) -> list[str]:
    return re.findall(r"\b\w+\b", text.lower())


class VectorStore:
    """Local lexical (BM25) index over chunks with JSON persistence.

    No embeddings, no API calls — pure local keyword retrieval. Works
    offline, fast for tens of thousands of chunks, no native deps.

    Files written to config.VECTOR_DB_DIR:
      - corpus.json : list of {source, chunk_index, text, tokens}
    """

    def __init__(self):
        db_dir = Path(config.VECTOR_DB_DIR)
        db_dir.mkdir(parents=True, exist_ok=True)
        self.corpus_path = db_dir / "corpus.json"
        self._load()

    def _load(self) -> None:
        if self.corpus_path.exists():
            self.corpus = json.loads(self.corpus_path.read_text(encoding="utf-8"))
        else:
            self.corpus = []
        self._rebuild_index()

    def _rebuild_index(self) -> None:
        if self.corpus:
            self.index = BM25Okapi([doc["tokens"] for doc in self.corpus])
        else:
            self.index = None

    def _save(self) -> None:
        self.corpus_path.write_text(
            json.dumps(self.corpus, indent=2), encoding="utf-8"
        )

    def add_chunks(self, chunks: list[str], source: str) -> int:
        if not chunks:
            return 0
        for i, chunk in enumerate(chunks):
            self.corpus.append({
                "source": source,
                "chunk_index": i,
                "text": chunk,
                "tokens": _tokenize(chunk),
            })
        self._rebuild_index()
        self._save()
        return len(chunks)

    def search(self, query: str, top_k: int | None = None) -> list[dict]:
        top_k = top_k or config.TOP_K
        if not self.corpus or self.index is None:
            return []
        q_tokens = _tokenize(query)
        if not q_tokens:
            return []
        scores = self.index.get_scores(q_tokens)
        n = min(top_k, len(self.corpus))
        ranked = sorted(enumerate(scores), key=lambda x: -x[1])[:n]
        hits = []
        for idx, score in ranked:
            if score <= 0:
                continue
            doc = self.corpus[idx]
            hits.append({
                "text": doc["text"],
                "source": doc["source"],
                "chunk_index": doc["chunk_index"],
                "score": float(score),
            })
        return hits

    def list_sources(self) -> list[dict]:
        counts: dict[str, int] = {}
        for doc in self.corpus:
            counts[doc["source"]] = counts.get(doc["source"], 0) + 1
        return [{"source": s, "chunks": c} for s, c in sorted(counts.items())]

    def delete_source(self, source: str) -> int:
        before = len(self.corpus)
        self.corpus = [d for d in self.corpus if d["source"] != source]
        removed = before - len(self.corpus)
        if removed > 0:
            self._rebuild_index()
            self._save()
        return removed

    def total_chunks(self) -> int:
        return len(self.corpus)
