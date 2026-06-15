#!/usr/bin/env python3
"""Convierte references.bib -> data/publications.json (fuente única de publicaciones)."""
import argparse, json, os, sys

try:
    import bibtexparser
except ImportError:
    sys.exit("Falta dependencia: pip install 'bibtexparser>=1.4,<2.0'")


def normalize_authors(raw: str):
    authors = []
    for part in raw.replace("\n", " ").split(" and "):
        part = part.strip()
        if not part:
            continue
        if "," in part:
            last, first = [s.strip() for s in part.split(",", 1)]
            authors.append(f"{first} {last}".strip())
        else:
            authors.append(part)
    return authors


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", default="references.bib")
    ap.add_argument("--output", default="data/publications.json")
    args = ap.parse_args()

    if not os.path.exists(args.input):
        sys.exit(f"No existe {args.input}")

    with open(args.input, encoding="utf-8") as f:
        db = bibtexparser.load(f)

    pubs = []
    for e in db.entries:
        pubs.append({
            "key": e.get("ID", ""),
            "type": e.get("ENTRYTYPE", ""),
            "title": e.get("title", "").strip("{} "),
            "authors": normalize_authors(e.get("author", "")),
            "year": int(e["year"]) if e.get("year", "").isdigit() else 0,
            "venue": e.get("journal") or e.get("booktitle") or "",
            "doi": e.get("doi", ""),
            "url": e.get("url", ""),
        })

    pubs.sort(key=lambda p: (-p["year"], p["title"].lower()))
    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(pubs, f, ensure_ascii=False, indent=2)
    print(f"Escritas {len(pubs)} publicaciones en {args.output}")


if __name__ == "__main__":
    main()
