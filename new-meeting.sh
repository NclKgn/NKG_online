#!/bin/bash
# new-meeting.sh — Crée une nouvelle note de réunion
# Usage : ./new-meeting.sh TYPE [DESCRIPTION]
# Types : superviseur, comite, labo, collaboration, discussion

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/meetings/templates"
ENTRIES_DIR="$SCRIPT_DIR/meetings/entries"

TODAY=$(date +%Y-%m-%d)
YEAR=$(date +%Y)

if [ $# -lt 1 ]; then
    echo "🗓️ Réunions PhD — Nouvelle note"
    echo ""
    echo "Usage : ./new-meeting.sh TYPE [DESCRIPTION]"
    echo ""
    echo "Types :"
    echo "  superviseur    → Réunion avec le directeur de thèse"
    echo "  comite         → Comité de suivi de thèse"
    echo "  labo           → Réunion d'équipe / labo"
    echo "  collaboration  → Réunion avec collaborateurs externes"
    echo "  discussion     → Discussion informelle"
    echo ""
    echo "Exemples :"
    echo "  ./new-meeting.sh superviseur"
    echo "  ./new-meeting.sh labo point-lightsheet"
    echo "  ./new-meeting.sh discussion conseil-stats-dr-martin"
    exit 1
fi

TYPE="$1"
DESC="${2:-}"

case "$TYPE" in
    superviseur)   TEMPLATE="$TEMPLATES_DIR/superviseur.md" ;;
    comite)        TEMPLATE="$TEMPLATES_DIR/comite-suivi.md" ;;
    labo)          TEMPLATE="$TEMPLATES_DIR/labo.md" ;;
    collaboration) TEMPLATE="$TEMPLATES_DIR/collaboration.md" ;;
    discussion)    TEMPLATE="$TEMPLATES_DIR/discussion.md" ;;
    *)
        echo "❌ Type inconnu : $TYPE"
        echo "   Types valides : superviseur, comite, labo, collaboration, discussion"
        exit 1
        ;;
esac

mkdir -p "$ENTRIES_DIR/$YEAR"

if [ -n "$DESC" ]; then
    FILENAME="${TODAY}_${TYPE}_${DESC}.md"
else
    FILENAME="${TODAY}_${TYPE}.md"
fi

FILEPATH="$ENTRIES_DIR/$YEAR/$FILENAME"

if [ -f "$FILEPATH" ]; then
    echo "⚠️  Le fichier existe déjà : $FILEPATH"
    exit 1
fi

cp "$TEMPLATE" "$FILEPATH"
sed -i "s/YYYY-MM-DD/$TODAY/g" "$FILEPATH" 2>/dev/null || sed -i '' "s/YYYY-MM-DD/$TODAY/g" "$FILEPATH"

echo "✅ Nouvelle note de réunion créée :"
echo "   📄 $FILEPATH"
echo ""
echo "   Remplis le contenu, puis :"
echo "   git add . && git commit -m \"meeting: $TYPE $(echo $DESC | tr '-' ' ')\" && git push"
