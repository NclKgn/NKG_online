#!/usr/bin/env python3
"""
scripts/generate-newsletter.py
EPIC 11.1 — Newsletter auto-générée

Génère un brouillon de newsletter hebdomadaire à partir des :
  - Entrées de cahier de labo (src/content/lab-entries/)
  - Expériences actives (src/content/experiments/)
  - Progression collecte (src/data/collecte.yaml)
  - Avancement thèse (src/data/thesis.yaml)

Usage :
    python scripts/generate-newsletter.py              # date = aujourd'hui
    python scripts/generate-newsletter.py --date 2026-04-11
    python scripts/generate-newsletter.py --force      # écrase si existant
"""

import argparse
import sys
from datetime import date, timedelta
from pathlib import Path

try:
    import yaml
except ImportError:
    print("PyYAML requis : pip install pyyaml", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).parent.parent
CONTENT = ROOT / "src" / "content"
DATA = ROOT / "src" / "data"
NEWSLETTER_DIR = CONTENT / "newsletter"

# ── Helpers ────────────────────────────────────────────────────────────────────

def parse_frontmatter(path: Path) -> dict:
    """Extrait le frontmatter YAML d'un fichier Markdown."""
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}
    try:
        fm = yaml.safe_load(parts[1]) or {}
        return fm if isinstance(fm, dict) else {}
    except yaml.YAMLError:
        return {}


def week_range(ref: date) -> tuple[date, date]:
    """Renvoie (lundi, dimanche) de la semaine contenant ref."""
    monday = ref - timedelta(days=ref.weekday())
    sunday = monday + timedelta(days=6)
    return monday, sunday


MOIS_FR = [
    "", "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
]


def fmt_day(d: date) -> str:
    """Jour sans zéro initial (cross-platform)."""
    return str(d.day)


def fmt_month_fr(d: date) -> str:
    """Mois en français."""
    return MOIS_FR[d.month]


# ── Chargement des données ─────────────────────────────────────────────────────

def load_lab_entries(week_start: date, week_end: date) -> list[dict]:
    """Entrées de labo dont la date tombe dans la semaine."""
    entries = []
    lab_dir = CONTENT / "lab-entries"
    if not lab_dir.exists():
        return entries
    for path in sorted(lab_dir.glob("*.md")):
        if path.stem.upper() == "TEMPLATE":
            continue
        fm = parse_frontmatter(path)
        if not fm or fm.get("draft"):
            continue
        entry_date = fm.get("date")
        if isinstance(entry_date, str):
            try:
                entry_date = date.fromisoformat(entry_date)
            except ValueError:
                continue
        if isinstance(entry_date, date) and week_start <= entry_date <= week_end:
            entries.append({
                "title": fm.get("title", path.stem),
                "date":  entry_date,
                "tags":  fm.get("tags", []),
            })
    return entries


def load_experiments(week_start: date, week_end: date) -> list[dict]:
    """Expériences créées cette semaine + expériences en cours."""
    exps = []
    exp_dir = CONTENT / "experiments"
    if not exp_dir.exists():
        return exps
    for path in sorted(exp_dir.glob("*.md")):
        if path.stem.upper() == "TEMPLATE":
            continue
        fm = parse_frontmatter(path)
        if not fm or fm.get("draft"):
            continue
        exp_date = fm.get("date")
        if isinstance(exp_date, str):
            try:
                exp_date = date.fromisoformat(exp_date)
            except ValueError:
                continue
        in_week  = isinstance(exp_date, date) and week_start <= exp_date <= week_end
        is_ongoing = fm.get("status") == "ongoing"
        if in_week or is_ongoing:
            exps.append({
                "title":  fm.get("title", path.stem),
                "date":   exp_date,
                "status": fm.get("status", "planned"),
                "tags":   fm.get("tags", []),
            })
    return exps


def load_collecte() -> list[dict]:
    """Progression collecte depuis collecte.yaml."""
    path = DATA / "collecte.yaml"
    if not path.exists():
        return []
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    items = []
    for key, val in data.items():
        if isinstance(val, dict):
            items.append({
                "key":    key,
                "label":  val.get("label", key),
                "partie": val.get("partie", ""),
                "statut": val.get("statut", ""),
                "value":  int(val.get("value", 0)),
            })
    return items


def load_thesis() -> dict:
    """Avancement rédaction depuis thesis.yaml."""
    path = DATA / "thesis.yaml"
    if not path.exists():
        return {}
    data = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    td = data.get("thesis-data", {})
    chapters = td.get("chapters", [])
    done        = [c for c in chapters if c.get("status") == "termine"]
    in_progress = [c for c in chapters if c.get("status") == "en-cours"]
    return {
        "total":             len(chapters),
        "done":              len(done),
        "in_progress":       len(in_progress),
        "in_progress_titles": [c.get("title", "") for c in in_progress],
    }


# ── Calculs ────────────────────────────────────────────────────────────────────

def collecte_summary(items: list[dict]) -> dict:
    """Moyenne par partie + globale."""
    by_partie: dict[str, list[int]] = {}
    for item in items:
        by_partie.setdefault(item["partie"], []).append(item["value"])
    result = {
        p: round(sum(vals) / len(vals)) for p, vals in by_partie.items()
    }
    all_vals = [i["value"] for i in items]
    result["global"] = round(sum(all_vals) / len(all_vals)) if all_vals else 0
    return result


def auto_tags(lab_entries: list[dict], experiments: list[dict]) -> list[str]:
    """Déduit les tags les plus pertinents de la semaine."""
    tag_set: set[str] = set()
    for e in lab_entries + experiments:
        tag_set.update(e.get("tags", []))
    tags = sorted(tag_set)[:5]
    return tags if tags else ["hebdo"]


# ── Génération ─────────────────────────────────────────────────────────────────

STATUS_FR = {
    "planned":   "planifiée",
    "ongoing":   "en cours",
    "completed": "terminée",
}

PARTIE_LABELS = {
    "biologie":        "Biologie",
    "biomecanique":    "Biomécanique",
    "donnees-humaines":"Données Humaines",
}


def generate(ref_date: date) -> str:
    monday, sunday = week_range(ref_date)
    week_num = ref_date.isocalendar()[1]

    # Données
    lab_entries  = load_lab_entries(monday, sunday)
    experiments  = load_experiments(monday, sunday)
    col_items    = load_collecte()
    col_summary  = collecte_summary(col_items)
    thesis       = load_thesis()
    tags         = auto_tags(lab_entries, experiments)

    # Titre et résumé
    date_range = f"{fmt_day(monday)}–{fmt_day(sunday)} {fmt_month_fr(sunday)} {sunday.year}"
    title = f"Semaine {week_num} — {date_range}"

    summary_parts = []
    ongoing = [e for e in experiments if e["status"] == "ongoing"]
    if ongoing:
        summary_parts.append(f"{len(ongoing)} expérience(s) en cours")
    if col_summary.get("global") is not None:
        summary_parts.append(f"collecte {col_summary['global']}%")
    if thesis.get("done") is not None:
        summary_parts.append(f"{thesis['done']}/{thesis['total']} chapitres rédigés")
    summary = ", ".join(summary_parts) or "Résumé à compléter"

    tags_yaml = "[" + ", ".join(tags) + "]"

    lines: list[str] = [
        "---",
        f'title: "{title}"',
        f"date: {ref_date.isoformat()}",
        f'summary: "{summary}"',
        f"tags: {tags_yaml}",
        "draft: true",
        "---",
        "",
        "## Cahier de labo",
    ]

    if lab_entries:
        for e in lab_entries:
            lines.append(f"- **{e['date'].strftime('%d/%m')}** — {e['title']}")
    else:
        lines.append("- *(aucune entrée cette semaine)*")

    lines += [
        "",
        "## Expériences",
    ]

    if experiments:
        for e in experiments:
            status_label = STATUS_FR.get(e["status"], e["status"])
            lines.append(f"- **{e['title']}** — {status_label}")
    else:
        lines.append("- *(aucun changement cette semaine)*")

    lines += ["", "## Collecte de données"]
    for partie, label in PARTIE_LABELS.items():
        pct = col_summary.get(partie, 0)
        lines.append(f"- **{label}** : {pct}%")
    lines.append(f"- **Global** : {col_summary.get('global', 0)}%")

    lines += ["", "## Rédaction"]
    if thesis:
        in_prog = thesis.get("in_progress_titles", [])
        if in_prog:
            for t in in_prog:
                lines.append(f"- {t} — en cours")
        else:
            lines.append(f"- {thesis['done']}/{thesis['total']} chapitres terminés")
    else:
        lines.append("- *(aucun changement cette semaine)*")

    lines += [
        "",
        "## Notes",
        "*(À compléter avant publication)*",
        "",
    ]

    return "\n".join(lines)


# ── Main ───────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Génère un brouillon de newsletter hebdomadaire"
    )
    parser.add_argument(
        "--date", metavar="YYYY-MM-DD",
        help="Date de référence (défaut : aujourd'hui)"
    )
    parser.add_argument(
        "--force", action="store_true",
        help="Écrase le fichier s'il existe déjà"
    )
    args = parser.parse_args()

    ref_date = date.today()
    if args.date:
        try:
            ref_date = date.fromisoformat(args.date)
        except ValueError:
            print(f"Date invalide : {args.date}", file=sys.stderr)
            sys.exit(1)

    week_num = ref_date.isocalendar()[1]
    year     = ref_date.year
    slug     = f"{year}-W{week_num:02d}-semaine-{week_num}"
    out_path = NEWSLETTER_DIR / f"{slug}.md"

    if out_path.exists() and not args.force:
        print(f"Brouillon déjà existant : {out_path}", file=sys.stderr)
        print("Utilisez --force pour écraser.", file=sys.stderr)
        sys.exit(0)

    NEWSLETTER_DIR.mkdir(parents=True, exist_ok=True)
    content = generate(ref_date)
    out_path.write_text(content, encoding="utf-8")
    print(f"Généré : {out_path}")


if __name__ == "__main__":
    main()
