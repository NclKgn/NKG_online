---
title: "Impact FGFR3 sur la prolifération chondrocytaire SBS"
date: 2026-04-10
status: "planned"
tags: [FGFR3, achondroplasie, synchondrose, prolifération]
draft: false

context: "Les souris Fgfr3G380R montrent un retard de croissance crânio-facial. On cherche à quantifier l'effet spécifique sur la SBS (synchondrose sphéno-basilaire) avant 3 semaines pour comprendre la fenêtre critique."

objective: "Comparer le taux de prolifération chondrocytaire (EdU+) dans la SBS entre souris WT et Fgfr3G380R à P7, P14 et P21."
hypothesis_main: "Si FGFR3 est activé de manière constitutive, alors la prolifération chondrocytaire dans la SBS est réduite dès P7, car FGFR3 active la voie STAT1 qui inhibe la progression G1→S."
hypothesis_null: "La mutation FGFR3G380R n'affecte pas la prolifération chondrocytaire dans la SBS aux stades précoces."
independent_vars: "Génotype (WT vs Fgfr3G380R) et stade (P7, P14, P21)."
dependent_vars: "% cellules EdU+ dans la zone proliférative de la SBS (comptage par champ, immunofluorescence)."
controlled_vars: "Sexe (utiliser uniquement des mâles), heure d'injection EdU (2h avant sacrifice), même opérateur pour les coupes."
protocol: "1. Injection EdU IP (50 mg/kg) 2h avant sacrifice. 2. Dissection tête + fixation PFA 4% 24h. 3. Décalcification EDTA 15% 2 semaines. 4. Coupes coronales 10µm (cryostat). 5. Click-iT EdU revelation. 6. Coloration DAPI. 7. Imagerie confocale 20x. 8. Comptage automatisé ImageJ (plugin Cell Counter)."
vigilance_points: "Décalcification incomplète = artefacts de coupe. Vérifier que la SBS est dans le plan de coupe avant de commencer le comptage. N minimum = 4 par groupe."

next_actions: "Si effet confirmé à P7 : ajouter expérience RNAscope FGFR3/STAT1 sur coupes adjacentes."
links: "Passos-Bueno 2008 (FGFR3 signaling review) ; protocole EdU maison : /protocols/edu_proliferation.md"
---
