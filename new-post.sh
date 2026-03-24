#!/bin/bash
# new-post.sh — Crée un nouveau billet de blog
# Usage : ./new-post.sh TYPE TITRE
# Types : semaine, bilan, note

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/blog/templates"
POSTS_DIR="$SCRIPT_DIR/_posts"

TODAY=$(date +%Y-%m-%d)
WEEK_NUM=$(date +%V)

if [ $# -lt 1 ]; then
    echo "📰 Blog PhD — Nouveau billet"
    echo ""
    echo "Usage : ./new-post.sh TYPE [TITRE]"
    echo ""
    echo "Types :"
    echo "  semaine  → Résumé hebdomadaire (par défaut: Semaine $WEEK_NUM)"
    echo "  bilan    → Bilan mensuel"
    echo "  note     → Note courte / avancée ponctuelle"
    echo ""
    echo "Exemples :"
    echo "  ./new-post.sh semaine"
    echo "  ./new-post.sh semaine \"coloration-et-landmarks\""
    echo "  ./new-post.sh bilan"
    echo "  ./new-post.sh note \"premier-resultat-lightsheet\""
    exit 1
fi

TYPE="$1"
CUSTOM_TITLE="${2:-}"

case "$TYPE" in
    semaine)
        TEMPLATE="$TEMPLATES_DIR/semaine.md"
        if [ -z "$CUSTOM_TITLE" ]; then
            SLUG="semaine-${WEEK_NUM}"
        else
            SLUG="semaine-${WEEK_NUM}-${CUSTOM_TITLE}"
        fi
        ;;
    bilan)
        TEMPLATE="$TEMPLATES_DIR/bilan-mensuel.md"
        MONTH_NAME=$(date +%B | tr '[:upper:]' '[:lower:]')
        SLUG="bilan-${MONTH_NAME}"
        ;;
    note)
        TEMPLATE="$TEMPLATES_DIR/note-courte.md"
        if [ -z "$CUSTOM_TITLE" ]; then
            echo "❌ Pour une note, précise un titre : ./new-post.sh note \"mon-titre\""
            exit 1
        fi
        SLUG="$CUSTOM_TITLE"
        ;;
    *)
        echo "❌ Type inconnu : $TYPE"
        echo "   Types valides : semaine, bilan, note"
        exit 1
        ;;
esac

mkdir -p "$POSTS_DIR"

FILENAME="${TODAY}-${SLUG}.md"
FILEPATH="$POSTS_DIR/$FILENAME"

if [ -f "$FILEPATH" ]; then
    echo "⚠️  Le fichier existe déjà : $FILEPATH"
    exit 1
fi

cp "$TEMPLATE" "$FILEPATH"
sed -i "s/YYYY-MM-DD/$TODAY/g" "$FILEPATH" 2>/dev/null || sed -i '' "s/YYYY-MM-DD/$TODAY/g" "$FILEPATH"

# Replace week number in semaine template
if [ "$TYPE" = "semaine" ]; then
    sed -i "s/Semaine XX/Semaine $WEEK_NUM/g" "$FILEPATH" 2>/dev/null || sed -i '' "s/Semaine XX/Semaine $WEEK_NUM/g" "$FILEPATH"
fi

echo "✅ Nouveau billet créé :"
echo "   📄 $FILEPATH"
echo ""
echo "   Remplis le contenu, puis :"
echo "   git add . && git commit -m \"blog: $(echo $SLUG | tr '-' ' ')\" && git push"
