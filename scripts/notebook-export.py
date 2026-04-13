#!/usr/bin/env python3
"""
scripts/notebook-export.py
EPIC 0.1 — Bridge PhD_Notebook → NKG_online

Lit la base SQLite de PhD_Notebook et génère les fichiers YAML pour Astro.

Outputs :
  src/data/specimens.yaml         ← litters + samples
  src/data/experiments-live.yaml  ← experiments + liens samples

Usage :
  python scripts/notebook-export.py
  python scripts/notebook-export.py --db ~/Code/PhD_Notebook/data/notebook.db
  python scripts/notebook-export.py --dry-run
  python scripts/notebook-export.py --only specimens
  python scripts/notebook-export.py --only experiments

Variable d'environnement (alternative à --db) :
  export NOTEBOOK_DB=~/Code/PhD_Notebook/data/notebook.db
"""

import argparse
import json
import os
import sqlite3
import sys
from datetime import datetime
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML requis : pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).parent.parent
DATA = ROOT / "src" / "data"

DEFAULT_DB = os.environ.get(
    "NOTEBOOK_DB",
    str(Path.home() / "Code" / "PhD_Notebook" / "data" / "notebook.db"),
)

HEADER = (
    "# Auto-généré par scripts/notebook-export.py\n"
    "# Ne pas éditer manuellement — relancer le script pour mettre à jour.\n\n"
)


# ── Connexion ──────────────────────────────────────────────────────────────────

def connect(db_path: str) -> sqlite3.Connection:
    path = Path(db_path).expanduser().resolve()
    if not path.exists():
        print(f"Erreur : base SQLite introuvable : {path}", file=sys.stderr)
        print("Vérifiez le chemin ou définissez NOTEBOOK_DB.", file=sys.stderr)
        sys.exit(1)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    return conn


# ── Helpers ────────────────────────────────────────────────────────────────────

def fmt_date(val) -> str | None:
    """Convertit une valeur date SQLite en chaîne ISO YYYY-MM-DD."""
    if val is None:
        return None
    s = str(val).strip()
    return s[:10] if s else None


def clean_str(val) -> str | None:
    """Retourne None si la valeur est vide/nulle."""
    if val is None:
        return None
    s = str(val).strip()
    return s if s else None


def dump_yaml(data: dict) -> str:
    """Sérialise en YAML lisible, sans tags Python."""
    return yaml.dump(
        data,
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
        width=120,
    )


# ── Export specimens ───────────────────────────────────────────────────────────

def export_specimens(conn: sqlite3.Connection) -> dict:
    """
    Exporte litters + samples.

    Structure YAML générée :
      specimens-data:
        generated_at: "2026-04-13T12:00:00"
        count: 42
        specimens:
          - code: "NK-001"
            stage: "P7"
            genotype: "WT"
            sex: "M"             # optionnel
            litter: "L-001"      # optionnel
            sacrifice_date: "2026-03-15"  # optionnel
            status: "used"
            status_note: "..."   # optionnel
            notes: "..."         # optionnel
    """
    cur = conn.cursor()

    cur.execute("""
        SELECT
            s.code,
            s.stage,
            s.genotype,
            s.sex,
            s.status,
            s.status_note,
            s.notes,
            l.code          AS litter_code,
            l.sacrifice_date
        FROM samples s
        LEFT JOIN litters l ON l.id = s.litter_id
        ORDER BY l.sacrifice_date DESC NULLS LAST, s.code
    """)

    specimens = []
    for row in cur.fetchall():
        entry: dict = {
            "code":     row["code"],
            "stage":    row["stage"],
            "genotype": row["genotype"],
        }
        if sex := clean_str(row["sex"]):
            entry["sex"] = sex
        if litter := clean_str(row["litter_code"]):
            entry["litter"] = litter
        if sdate := fmt_date(row["sacrifice_date"]):
            entry["sacrifice_date"] = sdate
        entry["status"] = row["status"]
        if sn := clean_str(row["status_note"]):
            entry["status_note"] = sn
        if notes := clean_str(row["notes"]):
            entry["notes"] = notes
        specimens.append(entry)

    return {
        "specimens-data": {
            "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "count":        len(specimens),
            "specimens":    specimens,
        }
    }


# ── Export experiments ─────────────────────────────────────────────────────────

def export_experiments(conn: sqlite3.Connection) -> dict:
    """
    Exporte experiments + liens vers les samples associés.

    Structure YAML générée :
      experiments-live:
        generated_at: "2026-04-13T12:00:00"
        count: 12
        experiments:
          - code: "EXP-001"
            type: "IF"
            title: "..."        # optionnel
            date_start: "2026-03-10"
            date_end: null      # omis si absent
            status: "ongoing"
            samples: ["NK-001", "NK-002"]  # optionnel
            notes: "..."        # optionnel
            params: {...}       # optionnel
    """
    cur = conn.cursor()

    cur.execute("""
        SELECT id, code, experiment_type, title,
               date_start, date_end, status, notes, params
        FROM experiments
        ORDER BY date_start DESC NULLS LAST, code
    """)
    exp_rows = cur.fetchall()

    # Liens sample → experiment
    cur.execute("""
        SELECT se.experiment_id, s.code AS sample_code
        FROM sample_experiments se
        JOIN samples s ON s.id = se.sample_id
        ORDER BY se.experiment_id, se."order"
    """)
    links: dict[int, list[str]] = {}
    for row in cur.fetchall():
        links.setdefault(row["experiment_id"], []).append(row["sample_code"])

    experiments = []
    for row in exp_rows:
        entry: dict = {
            "code":   row["code"],
            "type":   row["experiment_type"],
        }
        if title := clean_str(row["title"]):
            entry["title"] = title
        if ds := fmt_date(row["date_start"]):
            entry["date_start"] = ds
        if de := fmt_date(row["date_end"]):
            entry["date_end"] = de
        entry["status"] = row["status"]
        if sample_codes := links.get(row["id"]):
            entry["samples"] = sample_codes
        if notes := clean_str(row["notes"]):
            entry["notes"] = notes
        if row["params"]:
            try:
                params = (
                    json.loads(row["params"])
                    if isinstance(row["params"], str)
                    else row["params"]
                )
                if params:
                    entry["params"] = params
            except (json.JSONDecodeError, TypeError):
                pass
        experiments.append(entry)

    return {
        "experiments-live": {
            "generated_at": datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "count":        len(experiments),
            "experiments":  experiments,
        }
    }


# ── Écriture ───────────────────────────────────────────────────────────────────

def write_yaml(data: dict, path: Path, dry_run: bool) -> None:
    content = HEADER + dump_yaml(data)
    if dry_run:
        sep = "=" * 60
        print(f"\n{sep}\n{path.name}\n{sep}\n{content}")
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
        print(f"  ✓  {path.relative_to(ROOT)}")


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Export PhD_Notebook SQLite → NKG_online YAML"
    )
    parser.add_argument(
        "--db", default=DEFAULT_DB,
        metavar="PATH",
        help=f"Chemin vers notebook.db (défaut : {DEFAULT_DB})",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Affiche le YAML sans écrire les fichiers",
    )
    parser.add_argument(
        "--only", choices=["specimens", "experiments"],
        help="N'exporter qu'un seul fichier",
    )
    args = parser.parse_args()

    print(f"Connexion à : {args.db}")
    conn = connect(args.db)

    try:
        if args.only != "experiments":
            data = export_specimens(conn)
            write_yaml(data, DATA / "specimens.yaml", args.dry_run)

        if args.only != "specimens":
            data = export_experiments(conn)
            write_yaml(data, DATA / "experiments-live.yaml", args.dry_run)
    finally:
        conn.close()

    if not args.dry_run:
        print("\nTerminé. Commitez src/data/ et pushez pour rebuilder le site.")


if __name__ == "__main__":
    main()
