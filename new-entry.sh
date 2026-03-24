#!/bin/bash
# new-entry.sh — Crée une nouvelle entrée dans le cahier de labo
# Usage : ./new-entry.sh TYPE DESCRIPTION
# Types : wet-lab, bioinfo, clinique, note

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATES_DIR="$SCRIPT_DIR/templates"
ENTRIES_DIR="$SCRIPT_DIR/entries"

TODAY=$(date +%Y-%m-%d)
YEAR=$(date +%Y)

# Vérifier les arguments
if [ $# -lt 2 ]; then
    echo "📓 Cahier de labo — Nouvelle entrée"
    echo ""
    echo "Usage : ./new-entry.sh TYPE DESCRIPTION"
    echo ""
    echo "Types disponibles :"
    echo "  wet-lab   → Expérience en laboratoire"
    echo "  bioinfo   → Analyse bioinformatique"
    echo "  clinique  → Données humaines / étude clinique"
    echo "  note      → Note rapide"
    echo ""
    echo "Exemple :"
    echo "  ./new-entry.sh wet-lab coloration-HE-rat-P5"
    echo "  ./new-entry.sh bioinfo rnaseq-analysis-batch3"
    echo "  ./new-entry.sh clinique landmarks-crane-cohorte2"
    echo "  ./new-entry.sh note discussion-directeur"
    exit 1
fi

TYPE="$1"
DESC="$2"

# Mapper le type vers le template
case "$TYPE" in
    wet-lab)
        TEMPLATE="$TEMPLATES_DIR/wet-lab.md"
        ;;
    bioinfo)
        TEMPLATE="$TEMPLATES_DIR/bioinformatique.md"
        ;;
    clinique)
        TEMPLATE="$TEMPLATES_DIR/donnees-humaines.md"
        ;;
    note)
        TEMPLATE="$TEMPLATES_DIR/note-rapide.md"
        ;;
    *)
        echo "❌ Type inconnu : $TYPE"
        echo "   Types valides : wet-lab, bioinfo, clinique, note"
        exit 1
        ;;
esac

# Créer le dossier de l'année si nécessaire
mkdir -p "$ENTRIES_DIR/$YEAR"

# Nom du fichier
FILENAME="${TODAY}_${TYPE}_${DESC}.md"
FILEPATH="$ENTRIES_DIR/$YEAR/$FILENAME"

# Vérifier que le fichier n'existe pas déjà
if [ -f "$FILEPATH" ]; then
    echo "⚠️  Le fichier existe déjà : $FILEPATH"
    echo "   Ouvre-le pour continuer à le remplir."
    exit 1
fi

# Copier le template et remplacer la date
cp "$TEMPLATE" "$FILEPATH"
sed -i "s/YYYY-MM-DD/$TODAY/g" "$FILEPATH" 2>/dev/null || sed -i '' "s/YYYY-MM-DD/$TODAY/g" "$FILEPATH"

echo "✅ Nouvelle entrée créée :"
echo "   📄 $FILEPATH"
echo ""
echo "   Ouvre le fichier et remplis les sections."
echo "   N'oublie pas de commit : git add . && git commit -m \"lab: $DESC\""
