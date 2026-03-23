import { useState, useRef, useEffect } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

// ========== QUÉBEC-SPECIFIC STAGE DATA ==========
const STAGES = [
  { id:"anesthesie", name:"Bloc opératoire", code:"141-S3J-RO", icon:"🫁", color:"#059669",
    desc:"Assistance anesthésique dans un centre hospitalier du réseau québécois",
    topics:["Évaluation pré-op: Mallampati, ASA (I-V), Cormack-Lehane, ouverture buccale, distance thyro-mentonnière, mobilité cervicale, dentition, ATCD d'intubation difficile, allergies, médication, jeûne pré-op","Préparation de la salle: vérification appareil d'anesthésie (test d'étanchéité, calibration vaporisateurs), circuit respiratoire, aspiration murale, chariot d'intubation difficile (Airtraq, bougie, i-gel, LMA, kit de cricothyroïdotomie)","Agents d'induction: propofol (2-2.5 mg/kg), kétamine (1-2 mg/kg), étomidate (0.3 mg/kg) — choix selon hémodynamie du patient","Opioïdes: fentanyl (1-2 μg/kg induction), rémifentanil (perfusion), morphine, hydromorphone — pharmacocinétique et contexte d'utilisation","Curares: succinylcholine (1-1.5 mg/kg pour ISR — fasciculations, hyperkaliémie), rocuronium (0.6-1.2 mg/kg) — monitoring au TOF (train-of-four): T4/T1 ratio, PTC","Agents volatils: sévoflurane (MAC 2.0%), desflurane (MAC 6.0%) — concept de MAC, MAC-awake, facteurs qui modifient le MAC (âge, opioïdes, T°)","Monitoring obligatoire: ECG 5 dérivations, SpO₂, ETCO₂ (capnographie — forme de la courbe), PA non-invasive q3-5min, T° (œsophagienne/tympanique), BIS (40-60 = anesthésie chirurgicale), TOF","Phases d'anesthésie: pré-oxygénation (3-5 min ou 8 capacités vitales) → induction → intubation → maintien → émergence (critères d'extubation: Vt >5mL/kg, FR stable, TOF >0.9, réponse aux commandes, réflexe de toux)","Complications: bronchospasme (↑ pression de crête, capno en pente ascendante), laryngospasme (manœuvre de Larson, succinylcholine), hyperthermie maligne (dantrolène, protocole MH), intubation difficile (algorithme CAFG)","Vasopresseurs en salle: éphédrine (5-10 mg IV bolus — α+β), phényléphrine (50-100 μg IV — α pur), atropine (0.5 mg si bradycardie)","Antagonistes: sugammadex (2 mg/kg réversion modérée, 4 mg/kg profonde, 16 mg/kg ISR — spécifique au rocuronium), néostigmine + glycopyrrolate (réversion classique, TOF doit avoir ≥2 réponses)","Contexte québécois: l'inhalo au bloc travaille en binôme avec l'anesthésiologiste, assure la surveillance clinique autonome (Art. 37s Code des professions), documente au dossier selon normes OPIQ"] },
  { id:"soins_intensifs", name:"Soins intensifs", code:"141-SEE-RO", icon:"💓", color:"#7c3aed",
    desc:"Ventilation mécanique et soins critiques dans une unité de SI québécoise",
    topics:["Modes ventilatoires de base: VAC (volume assisté-contrôlé), PAC (pression assistée-contrôlée), VACI (ventilation assistée-contrôlée intermittente), VS-AI/PEP (ventilation spontanée avec aide inspiratoire et PEP)","Modes avancés: APRV (airway pressure release ventilation), NAVA (neurally adjusted ventilatory assist), ventilation haute fréquence oscillatoire (néonat)","Paramètres essentiels: Vt (6-8 mL/kg poids idéal), FR (12-20), FiO₂ (titrer pour SpO₂ 92-96%), PEP (5+ cmH₂O), aide inspiratoire (8-15 cmH₂O), Ti, trigger (débit ou pression)","Courbes ventilatoires: pression-temps (crête vs plateau = résistance vs compliance), débit-temps (patron expiratoire, auto-PEP), volume-temps","Boucles: P-V (compliance, point d'inflexion), débit-volume (obstruction)","SDRA (ARDS): définition de Berlin (léger P/F 200-300, modéré 100-200, sévère <100), ventilation protectrice (Vt 6 mL/kg, Pplateau ≤30, driving pressure ≤15), décubitus ventral (prone 16h/jour)","Sevrage ventilatoire: critères de préparation (cause résolue, FiO₂ ≤40%, PEP ≤8, hémodynamie stable, conscient), TRE/SBT (tube en T ou AI 5-7/PEP 5 x 30-120 min), indice de Tobin (FR/Vt <105), extubation","VNI: CPAP (pression continue — OAP, apnée du sommeil), BiPAP/VS-AI+PEP (EAMPOC, post-extubation) — masque nasal, facial, Helmet","Monitoring SI: PA invasive (artère radiale — test d'Allen, courbe, amortissement), PVC, cathéter de Swan-Ganz (PAP, PAPO, DC, RVS), ScvO₂/SvO₂, débit cardiaque","GAB aux SI: interprétation systématique, rapport P/F, gradient A-a, shunt vs V/Q mismatch, lactates comme marqueur de perfusion","Sédation aux SI: échelles RASS (-5 à +4) et SAS, protocoles d'éveil quotidien (SAT), BIS monitoring, dexmédétomidine (Precedex)","Protocoles québécois: ordonnances collectives dans les CIUSSS/CISSS, documentation selon normes OPIQ, communication SBAR avec l'équipe"] },
  { id:"urgence", name:"Urgence", code:"141-SD7-RO", icon:"🚨", color:"#e11d48",
    desc:"Soins respiratoires d'urgence et réanimation",
    topics:["Évaluation rapide ABCDE: Airway (perméabilité, obstruction), Breathing (FR, amplitude, tirage, SpO₂, auscultation), Circulation (FC, PA, remplissage capillaire), Disability (GCS, pupilles), Exposure","EAMPOC (exacerbation aiguë de MPOC): O₂ titré SpO₂ 88-92% (risque d'hypercapnie!), VNI BiPAP précoce, salbutamol + ipratropium en nébulisation, corticostéroïdes systémiques, antibiotiques si purulent","Asthme aigu sévère / status asthmaticus: salbutamol haute dose (5 mg nébul continu ou MDI 10-20 bouffées), ipratropium 500 μg q20min x3, MgSO₄ IV 2g, corticostéroïdes, adrénaline SC si anaphylaxie","Pneumothorax: tension (déviation trachéale, absence MV, hypotension → décompression à l'aiguille 2e espace intercostal) vs simple (drain thoracique)","OAP (œdème aigu du poumon): CPAP 10 cmH₂O, nitroglycérine SL/IV, furosémide IV, position assise — différencier cardiogénique vs non-cardiogénique","ISR (intubation à séquence rapide): pré-oxygénation, pas de ventilation intermédiaire, induction + curare simultanés, pression cricoïde (Sellick — controversé), plan B prêt","ACLS au Québec: algorithmes de la Fondation des maladies du cœur, protocoles CIUSSS — rôle de l'inhalo: gestion des voies aériennes, ventilation, monitoring capno (ETCO₂ >10 pendant RCR = bon pronostic)","Embolie pulmonaire: tachycardie + dyspnée + hypoxémie + D-dimères ↑, Wells score, angio-CT → héparine IV, thrombolyse si massive","Trauma thoracique: volet costal (ventilation paradoxale), contusion pulmonaire, hémothorax","Insuffisance respiratoire: Type I (hypoxémique — P/F ↓, PaCO₂ N ou ↓) vs Type II (hypercapnique — PaCO₂ ↑) — approche différente!"] },
  { id:"pediatrie", name:"Pédiatrie / Néonat", code:"141-SG7-RO", icon:"👶", color:"#0284c7",
    desc:"Soins cardiorespiratoires néonatals et pédiatriques",
    topics:["Particularités anatomiques de l'enfant: voies aériennes plus courtes et étroites, larynx plus haut et antérieur, épiglotte en oméga, trachée courte (risque intubation sélective), langue proportionnellement plus grosse, côtes horizontales, respiration diaphragmatique","Bronchiolite (VRS): saison automne-hiver au Québec, enfant <2 ans, tachypnée, tirage, wheezing, crépitants → traitement de SUPPORT (O₂ si SpO₂ <92%, hydratation, aspiration nasale, CPAP nasale si nécessaire), PAS de salbutamol systématique","Croup (laryngotrachéobronchite): toux aboyante, stridor inspiratoire, voix rauque — score de Westley, dexaméthasone PO 0.6 mg/kg, épinéphrine racémique en nébulisation si modéré-sévère, JAMAIS examiner la gorge si suspicion d'épiglottite","Asthme pédiatrique: classification par sévérité et niveau de contrôle, salbutamol MDI + aérochambre (avec masque <5 ans), corticostéroïdes inhalés, plan d'action personnalisé","Détresse respiratoire néonatale (maladie des membranes hyalines — MMH): déficit en surfactant chez prématuré, syndrome de détresse respiratoire du nouveau-né → CPAP nasale précoce, surfactant exogène (Survanta, Curosurf) via technique INSURE ou LISA","Réanimation néonatale (programme NRP): algorithme — sécher, stimuler, positionner → VPP (ventilation en pression positive) 40-60/min → intubation si inefficace → compressions thoraciques 3:1 → adrénaline","Scores: Apgar (0-1-2 min, évaluer activité, pouls, grimace, apparence, respiration), Silverman (évaluation détresse respiratoire du nouveau-né, 0-10)","Calculs pédiatriques: poids estimé (2 x âge + 8 ou Broselow), tube endotrachéal (âge/4 + 4 sans ballonnet, +3.5 avec ballonnet), Vt 6-8 mL/kg, doses médicaments selon poids","Oxygénothérapie pédiatrique: lunettes nasales (max 4 L/min chez nourrisson), masque simple, masque avec réservoir, oxygène à haut débit nasal (Airvo/Optiflow), CPAP nasale"] },
  { id:"fonction_pulm", name:"Épreuves diagnostiques", code:"141-SF6-RO", icon:"📊", color:"#d97706",
    desc:"Tests de fonction pulmonaire et épreuves cardiorespiratoires",
    topics:["Spirométrie: VEMS (volume expiratoire maximal en 1 seconde), CVF (capacité vitale forcée), rapport VEMS/CVF (Tiffeneau — <70% = obstruction selon GOLD), DEP (débit expiratoire de pointe), DEM 25-75%","Courbe débit-volume: patron normal vs obstructif (concavité expiratoire, DEP ↓) vs restrictif (courbe miniature mais forme normale) vs obstruction fixe des voies aériennes supérieures (plateau inspiratoire ET expiratoire) vs obstruction variable","Volumes pulmonaires (pléthysmographie ou dilution à l'hélium): CPT (capacité pulmonaire totale), CRF (capacité résiduelle fonctionnelle), VR (volume résiduel) — VR ↑ et CPT ↑ = hyperinflation (MPOC), CPT ↓ = restriction","DLCO (diffusion du monoxyde de carbone): technique de respiration unique, interprétation — ↓ dans emphysème, fibrose, anémie, embolie; N ou ↑ dans asthme, obésité, polycythémie, hémorragie alvéolaire","Test de provocation bronchique: méthacholine (PC20 <4 mg/mL = hyperréactivité), test à l'effort, test au mannitol — indications et contre-indications","Test de réversibilité: salbutamol 400 μg MDI → spirométrie après 15-20 min, amélioration ≥12% ET ≥200 mL du VEMS = réversibilité significative","Critères ATS/ERS d'acceptabilité: début rapide (volume d'extrapolation rétrograde <5% CVF ou 150 mL), effort maximal, durée ≥6 sec, fin plateau, pas de toux dans la première seconde, reproductibilité (3 courbes dont 2 VEMS à ±150 mL)","ECG: technique d'installation 12 dérivations, lecture systématique (rythme, FC, axe, intervalles PR-QRS-QT, ondes P, complexe QRS, segment ST, onde T), arythmies principales: FA, flutter, tachycardie sinusale, bradycardie, BAV (1er-2e-3e degré), ESV, TV, FV","ECG à l'effort (épreuve d'effort sur tapis roulant — protocole de Bruce): indications, contre-indications, critères d'arrêt, interprétation (sous-décalage ST ≥1mm = ischémie)","Gazométrie artérielle: technique de ponction radiale (test d'Allen modifié, angle 45°, artère radiale au poignet), manipulation de l'échantillon (sans bulle d'air, sur glace), analyse rapide","Test de marche de 6 minutes (TM6): protocole standardisé ATS, mesurer distance, SpO₂, FC, dyspnée (Borg), interprétation (distance prédite selon âge, sexe, taille)"] },
  { id:"integration", name:"Stage d'intégration", code:"141-SH3-RO", icon:"🎯", color:"#0d9488",
    desc:"Intégration de toutes les compétences — autonomie professionnelle selon normes OPIQ",
    topics:["Gestion des priorités avec patients multiples: triage, urgence vs routine, communication efficace avec l'équipe","Communication SBAR: Situation, Background (contexte), Assessment (évaluation), Recommendation — utilisé dans tout le réseau québécois","Éthique et déontologie: Code de déontologie des inhalothérapeutes du Québec, consentement éclairé, confidentialité, droit de l'usager (LSSSS)","Jugement clinique autonome: évaluer, planifier, intervenir, évaluer l'efficacité — documenter selon les normes OPIQ","Ordonnances collectives et protocoles: cadre légal au Québec, ordonnances dans les CIUSSS/CISSS, ajustement de paramètres ventilatoires, oxygénothérapie, sevrage","Rôle de l'inhalo dans l'équipe interdisciplinaire: collaboration avec anesthésiologiste, pneumologue, urgentologue, pédiatre, infirmière, physiothérapeute","Documentation clinique: notes d'évolution au dossier, formulaires standardisés, feuille de surveillance anesthésique, rapport de transfert","Organisation du travail: gestion d'un quart complet (jour/soir/nuit), priorisation des appels, gestion du stress en situation critique, relève professionnelle"] }
];

const THEORY = [
  { id:"physiopatho", name:"Physiopathologie", icon:"🧬", color:"#e11d48",
    content:"MPOC: emphysème (destruction alvéolaire → ↓ surface d'échanges, perte de recul élastique, air trapping) + bronchite chronique (inflammation, hypersécrétion, obstruction). Classification GOLD (VEMS). EAMPOC: triade purulence + dyspnée + volume expectorations. Asthme: hyperréactivité bronchique, inflammation éosinophilique, bronchospasme réversible, remodelage chronique. SDRA/ARDS: lésion alvéolaire diffuse → œdème non-cardiogénique → atélectasie → shunt → hypoxémie réfractaire. Pneumonie: CAP (communautaire) vs HAP (nosocomiale >48h) vs VAP (sous ventilation >48h). Embolie pulmonaire: thrombus → ↑ espace mort → ↑ V/Q mismatch → hypoxémie + hypocapnie. Pneumothorax: air dans espace pleural → collapse pulmonaire; tension = urgence vitale. Fibrose pulmonaire: restriction, ↓ compliance, ↓ DLCO. OAP: pression hydrostatique ↑ (cardiogénique) vs perméabilité capillaire ↑ (non-cardiogénique = SDRA). Insuffisance respiratoire: Type I (hypoxémique, PaO₂ <60) vs Type II (hypercapnique, PaCO₂ >50)." },
  { id:"pharmaco", name:"Pharmacologie", icon:"💊", color:"#7c3aed",
    content:"BRONCHODILATATEURS — BACA: salbutamol (Ventolin) 2.5-5mg nébul ou 100μg MDI, action en 5-15 min, durée 4-6h. BALA: salmétérol (Serevent), formotérol (Oxeze), durée 12h. ANTICHOLINERGIQUES — ACCA: ipratropium (Atrovent) 500μg nébul, action 15-30 min. ACLA: tiotropium (Spiriva), uméclidinium. COMBINAISONS: salbutamol+ipratropium (Combivent). CSI (corticostéroïdes inhalés): fluticasone (Flovent), budésonide (Pulmicort), ciclésonide — anti-inflammatoire, prévention, rincer la bouche. CSI+BALA: Advair (fluticasone+salmétérol), Symbicort (budésonide+formotérol). Systémiques: prednisone PO, méthylprednisolone IV. ANESTHÉSIE — Induction: propofol (vasodilatation, ↓ PA), kétamine (↑ FC, ↑ PA, bronchodilatateur, dissociatif), étomidate (neutre hémodynamiquement). Opioïdes: fentanyl, rémifentanil, morphine, hydromorphone. Curares: succinylcholine (dépolarisant, fasciculations, hyperkaliémie risque), rocuronium (non-dépolarisant). Volatils: sévoflurane, desflurane — concept MAC. Antagonistes: sugammadex (rocuronium), néostigmine+glycopyrrolate, naloxone (opioïdes), flumazénil (benzos). URGENCE: adrénaline (1mg IV q3-5min ACLS, 0.01mg/kg péd), atropine, amiodarone, vasopressine, NTG, furosémide." },
  { id:"ventilation", name:"Ventilation mécanique", icon:"⚙️", color:"#0d9488",
    content:"PRINCIPES: ventilation en pression positive (inverse de la physiologie normale). Pression transpulmonaire = Palvéolaire - Ppleurale. Compliance = ΔV/ΔP (N: 60-100 mL/cmH₂O). Résistance = ΔP/Débit (N: 1-3 cmH₂O/L/s). MODES — VAC: Vt et FR garantis, pression variable. PAC: pression fixe, Vt variable (dépend compliance/résistance). VACI: respiration spontanée entre les cycles obligatoires. VS-AI/PEP: tout spontané avec aide inspiratoire et PEP. APRV: deux niveaux de pression, temps inversé. NAVA: proportionnel à l'activité diaphragmatique (EAdi). PARAMÈTRES: Vt 6-8 mL/kg poids prédit, FR 12-20, FiO₂ titrer pour SpO₂ cible, PEP ≥5 cmH₂O, AI 8-15, trigger débit (-2 L/min) ou pression (-1 à -2 cmH₂O), Ti 0.8-1.2s. ALARMES: pression haute (obstruction, bronchospasme, toux, morsure tube), pression basse (fuite, déconnexion), Vt bas (fuite en PAC, ↓ compliance), apnée. COURBES: Pression-temps (Pcrête - Pplateau = résistance; Pplateau = compliance), Débit-temps (expiratoire retourne à zéro? sinon auto-PEP), Volume-temps. VENTILATION PROTECTRICE (ARDS Network): Vt 6 mL/kg PP, Pplateau ≤30, driving pressure (Pplateau-PEP) ≤15, PEP selon table FiO₂/PEP, prone 16h/jour si P/F <150. SEVRAGE: critères préalables, TRE (tube en T ou AI 5-7/PEP 5 x 30-120 min), indice de Tobin FR/Vt <105 respir/min/L, test de fuite du ballonnet. VNI: CPAP (1 niveau pression — OAP, apnée sommeil, post-extubation), BiPAP (2 niveaux — EAMPOC, hypoventilation, post-extubation à risque). Interfaces: masque nasal, masque oronasal, masque facial total, casque (Helmet). Optiflow/haut débit nasal: 30-60 L/min, humidifié chauffé, FiO₂ titrée." },
  { id:"gab", name:"Gaz artériels (GAB)", icon:"🩸", color:"#e11d48",
    content:"VALEURS NORMALES: pH 7.35-7.45, PaCO₂ 35-45 mmHg, PaO₂ 80-100 mmHg (diminue avec âge: PaO₂ prédite = 109 - 0.43 × âge), HCO₃⁻ 22-26 mEq/L, BE ±2, SaO₂ >95%, lactates <2 mmol/L. MÉTHODE: 1) pH → acidose (<7.35) ou alcalose (>7.45)? 2) PaCO₂ → composante respiratoire 3) HCO₃⁻ → composante métabolique 4) Identifier le désordre PRIMAIRE (celui qui explique le pH) 5) Compensation? Calculer: acidose métab → PaCO₂ attendue = 1.5(HCO₃⁻)+8±2 (Winter), alcalose métab → PaCO₂ attendue = 0.7(HCO₃⁻)+21±2 6) PaO₂ et P/F ratio (PaO₂/FiO₂) → oxygénation 7) Gradient A-a = (FiO₂ × 713) - (PaCO₂/0.8) - PaO₂, normal <10+0.4×âge. DÉSORDRES: Acidose respiratoire (hypoventilation: MPOC, surdosage opioïdes, neuromusculaire) → aiguë: ΔpH 0.08/10mmHg ΔPaCO₂; chronique: ΔpH 0.03/10mmHg. Alcalose respiratoire (hyperventilation: anxiété, embolie, sepsis). Acidose métabolique: trou anionique élevé (Na-Cl-HCO₃, N: 8-12) = MUDPILES (Méthanol, Urémie, Diabète/acidocétose, Propylène glycol, INH/Iron, Lactates, Éthylène glycol, Salicylates); trou anionique normal = pertes HCO₃ (diarrhée, acidose tubulaire rénale). Alcalose métabolique: vomissements, diurétiques, aspiration NG." },
  { id:"monitoring", name:"Monitorage", icon:"📈", color:"#d97706",
    content:"ECG 12 DÉRIVATIONS: installation (10 électrodes, 6 précordiales V1-V6), lecture systématique: 1) Rythme régulier? 2) FC (300/nb grands carrés entre 2 R) 3) Onde P présente avant chaque QRS? 4) PR 0.12-0.20s 5) QRS <0.12s 6) Axe 7) Segment ST (sus/sous-décalage) 8) Onde T. ARYTHMIES: Tachycardie sinusale (>100, P normales). FA (irrégulièrement irrégulier, pas de P, ligne de base ondulante). Flutter (dents de scie, bloc 2:1 = FC ~150). BAV 1° (PR >0.20s). BAV 2° Mobitz I (PR s'allonge puis QRS manqué). BAV 2° Mobitz II (PR fixe, QRS manqué — dangereux). BAV 3° (dissociation complète P-QRS). ESV (QRS large, pas de P, pause compensatrice). TV (≥3 ESV consécutives, QRS larges réguliers). FV (chaos — défibrillation immédiate). CAPNOGRAPHIE: forme normale = rectangle avec plateau alvéolaire. Phase I (espace mort), II (pente ascendante — mélange), III (plateau alvéolaire — gaz alvéolaire pur), angle α (pente III — ↑ dans obstruction). ETCO₂ N: 35-45 mmHg. ↑ ETCO₂: hypoventilation, ↑ métabolisme, ↑ DC. ↓ ETCO₂: hyperventilation, ↓ DC, embolie, arrêt cardiaque. Gradient PaCO₂-ETCO₂ N: 2-5 mmHg (↑ = ↑ espace mort). OXYMÉTRIE: principe spectrophotométrie (absorbance HbO₂ vs Hb). Limites: HbCO (fausse ↑), MetHb (tend vers 85%), hypoperfusion, vernis, mouvement. TOF: 4 stimulations → nombre de réponses = profondeur du bloc; T4/T1 ratio; TOF >0.9 = décurarisation adéquate. BIS: 0-100, chirurgie 40-60, sédation légère 60-80." },
  { id:"voies", name:"Voies aériennes", icon:"🫁", color:"#059669",
    content:"ANATOMIE: cavité nasale → pharynx (naso/oro/laryngo) → larynx (épiglotte, cordes vocales, sous-glotte) → trachée (10-12 cm adulte, bifurcation carène T4-5) → bronches souches (droite plus verticale = intubation sélective). Chez l'enfant: larynx plus haut (C3-4 vs C5-6 adulte), épiglotte en oméga, partie la plus étroite = sous-glotte (vs cordes vocales chez adulte). ÉVALUATION PRÉDICTIVE: Mallampati (I-IV: visibilité des structures pharyngées), Cormack-Lehane (I-IV: vue laryngoscopie), distance thyro-mentonnière (>6cm = favorable), ouverture buccale (>3cm), mobilité cervicale, ATCD intubation difficile, obésité, barbe, cou court, rétrognathie. LEMON: Look, Evaluate 3-3-2, Mallampati, Obstruction, Neck mobility. ALGORITHME D'INTUBATION DIFFICILE (adapté CAFG — Canadian Airway Focus Group): Plan A (laryngoscopie directe ou vidéo), Plan B (dispositif supraglottique: i-gel, LMA), Plan C (intubation par fibroscope), Plan D (accès frontal du cou — cricothyroïdotomie). INTUBATION: préparation (SOAP-ME: Suction, Oxygen, Airway equipment, Pharmacy, Monitoring Equipment), pré-oxygénation, laryngoscopie (Macintosh #3-4 ou vidéolaryngoscope), confirmation (capnographie = gold standard, auscultation bilatérale + épigastre, RX poumon si doute). Taille tube: homme 7.5-8.0 mm, femme 7.0-7.5 mm, enfant (âge/4)+4. ISR: fentanyl → propofol → succinylcholine ou rocuronium haute dose → intubation sans ventilation. Dispositifs supraglottiques: i-gel (sans ballonnet, taille selon poids), LMA classique et ProSeal. EXTUBATION: critères (éveillé, réflexes protecteurs, force musculaire TOF >0.9, ventilation adéquate, oxygénation stable), test de fuite du ballonnet (si risque œdème), aspiration avant, O₂ 100%, retrait, surveillance." }
];

// ========== AI PROMPTS (QUÉBEC-SPECIFIC) ==========
const mkSimSys = (st, diff) => {
  const dl = diff==="guide"?"GUIDÉ: indices subtils, un problème principal, guide pas à pas.":diff==="autonome"?"AUTONOME: comme en vrai stage au Québec, peu d'indices, comorbidités.":"EXPERT: complexe, atypique, complications, comorbidités multiples.";
  return `Tu es un inhalothérapeute senior dans un centre hospitalier du réseau québécois (CIUSSS/CISSS). Tu supervises une stagiaire de 3e année (programme 141.A0) du Cégep de Rosemont à Montréal.

CONTEXTE CRITIQUE — Feedback des évaluateurs de stage:
1. Trop ROBOTIQUE — récite des protocoles sans adapter au patient spécifique
2. N'ANTICIPE PAS — attend passivement qu'on lui dise quoi faire
3. Pas de LIENS THÉORIE-PRATIQUE — ne comprend pas le pourquoi physiopathologique

MILIEU: ${st.name} (${st.code})
NIVEAU: ${dl}
SUJETS À INTÉGRER: ${st.topics.join(" | ")}

DIRECTIVES QUÉBÉCOISES STRICTES:
- Terminologie québécoise UNIQUEMENT: inhalo (pas respiratory therapist), GAB (pas ABG), nébul (pas aérosol), saturométrie, TET (tube endotrachéal), bi-niveau ou BiPAP (pas BiLevel), DSA (pas AED)
- Contexte québécois: CIUSSS, CISSS, OPIQ, ordonnances collectives, loi 90, article 37s Code des professions
- Noms commerciaux canadiens des médicaments: Ventolin (salbutamol), Atrovent (ipratropium), Flovent (fluticasone), Spiriva (tiotropium), Combivent, Advair, Symbicort
- Équipement courant au Québec: ventilateurs Dräger, Maquet Servo, PB840/980, Hamilton, moniteurs Philips/GE, appareil d'anesthésie Dräger Primus/Perseus
- Milieu réaliste: noms d'hôpitaux québécois crédibles (ex: Hôpital Maisonneuve-Rosemont, CHUM, Hôpital Sacré-Cœur, Sainte-Justine pour pédiatrie)

PREMIER MESSAGE — Scénario clinique immersif:
- Unité précise, moment du quart, contexte réaliste
- Patient: âge, sexe, poids, taille, raison d'admission/chirurgie, ATCD complets, médication à domicile, allergies
- Données cliniques détaillées: tous les signes vitaux, résultats de labo/imagerie pertinents
- Événement déclencheur qui nécessite réflexion/action immédiate
- UNE question ouverte qui force l'anticipation

POUR CHAQUE RÉPONSE:
1. Rétroaction SPÉCIFIQUE (2-3 phrases — jamais vague)
2. ROBOTIQUE → "OK mais CE patient-là, avec [condition spécifique], tu adaptes comment?"
3. PAS D'ANTICIPATION → "Regarde tes données. Dans 10-15 minutes, tu t'attends à quoi? Tu prépares quoi en avance?"
4. PAS DE LIENS → "Pourquoi ÇA marche au niveau physiopathologique? Explique le mécanisme."
5. BON RAISONNEMENT → "Excellent! C'est exactement ce raisonnement-là qu'on veut voir!"
6. Évolution réaliste du scénario

STYLE: Tutoiement naturel, max 160 mots, JAMAIS donner la réponse.`;
};

const mkTheorySys = (t) => `Tu es un professeur en inhalothérapie au Cégep de Rosemont. Session de révision théorique avec une étudiante de 3e année qui a de la difficulté à faire des liens théorie↔pratique.

SUJET: ${t.name}
CONTENU: ${t.content}

APPROCHE:
- Commence par une QUESTION CLINIQUE qui amène le concept (ex: "Un patient MPOC arrive à l'urgence avec SpO₂ 78%. Tu mets l'O₂ à 100%. Est-ce une bonne idée? Pourquoi?")
- Creuse avec "pourquoi?", "qu'est-ce qui se passe physiologiquement?", "et si le patient avait aussi [condition]?"
- TOUJOURS faire le pont: théorie → situation clinique réelle au Québec
- Terminologie québécoise strictement (GAB, nébul, inhalo, Ventolin, etc.)
- Après une bonne réponse, connecte à un concept adjacent

STYLE: Tutoiement, enthousiaste mais exigeant, max 130 mots. Compréhension > mémorisation.`;

const gabSys = `Tu es un expert en GAB dans un centre hospitalier québécois. Tu entraînes une stagiaire inhalo de 3e année du Cégep de Rosemont.

VALEURS NORMALES: pH 7.35-7.45 | PaCO₂ 35-45 | PaO₂ 80-100 (↓ avec âge) | HCO₃⁻ 22-26 | BE ±2 | SaO₂ >95% | Lactates <2

PREMIER MESSAGE: Contexte patient québécois bref (2-3 phrases), valeurs GAB complètes. Varie les désordres. Demande: "Interprète ce GAB et dis-moi ta conduite."

POUR CHAQUE RÉPONSE:
- Vérifie sa méthode systématique
- Erreur → guide sans donner la réponse
- Correct → "Bon!" puis NOUVEAU cas immédiatement, plus complexe
- Lie TOUJOURS au contexte clinique du patient
- Utilise des patients crédibles (MPOC exacerbé à l'urgence du CHUM, trauma à Sacré-Cœur, etc.)

STYLE: Direct, rapide, max 130 mots. GAB (pas ABG). Tutoiement québécois.`;

const espSys = `Tu es évaluateur pour l'ESP (épreuve synthèse de programme) en Techniques d'inhalothérapie (141.A0) au Québec. Étudiante 3e année, Cégep de Rosemont.

L'ESP évalue l'INTÉGRATION des compétences ministérielles:
002C Appareils d'inhalothérapie | 002D Communication patient/famille/équipe | 002F Modalité thérapeutique ↔ désordre | 002G Préparation médicaments | 002H Traitements (adulte/enfant/nouveau-né) | 002J ECG | 002K Fonctions pulmonaires | 002L Anesthésie | 002M Ventilation mécanique | 002N Traitements cardiopulmonaires | 002P Organisation du travail

Mise en situation: complexe, MULTI-DOMAINES, contexte québécois (CIUSSS/hôpital). Exige évaluation + priorisation + justification. Fais évoluer avec nouvelles données. Intègre TOUS les domaines progressivement.

STYLE: Plus formel, tutoiement, max 170 mots. Terminologie québécoise.`;

const debSys = `Analyse cette session. JSON VALIDE uniquement, sans backtick:
{"scores":{"anticipation":0,"raisonnement":0,"connaissances":0,"liens":0,"communication":0},"resume":"2 phrases","forts":["max 3"],"ameliorer":["max 3"],"reviser":["2-3 concepts précis à revoir"],"conseil":"1 conseil concret pour son stage"}
Scores /10. Honnête, constructif, encourageant. Tout en français québécois.`;

// ========== API ==========
const callAI = async (msgs, sys) => {
  const r = await fetch("/api/chat", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ messages:msgs, system:sys })
  });
  const d = await r.json();
  if(d.error) throw new Error(d.error.message||"Erreur");
  return d.content.map(b=>b.text||"").join("\n");
};

// ========== STORAGE ==========
const loadData = async () => {
  try { const d = localStorage.getItem("inhaloprep-progress"); return d ? JSON.parse(d) : { sessions:[], totalTime:0 }; }
  catch { return { sessions:[], totalTime:0 }; }
};
const saveData = async (data) => {
  try { localStorage.setItem("inhaloprep-progress", JSON.stringify(data)); } catch(e) { console.error(e); }
};

// ========== COMPONENTS ==========
const Bar = ({label,score}) => {
  const c = score>=8?"bg-emerald-500":score>=6?"bg-teal-500":score>=4?"bg-amber-500":"bg-rose-500";
  return <div className="mb-3"><div className="flex justify-between mb-1"><span className="text-sm text-slate-600">{label}</span><span className="text-sm font-bold text-slate-800">{score}/10</span></div><div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div className={`h-full rounded-full ${c} transition-all duration-700`} style={{width:`${Math.max(4,score*10)}%`}}/></div></div>;
};

const Dots = () => <div className="flex p-4"><div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm"><span className="text-sm text-slate-400 mr-2">Réflexion</span>{[0,150,300].map(d=><span key={d} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}}/>)}</div></div>;

// ========== MAIN ==========
export default function App() {
  const [tab, setTab] = useState("home");
  const [view, setView] = useState("pick");
  const [selId, setSelId] = useState(null);
  const [diff, setDiff] = useState("autonome");
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [debrief, setDebrief] = useState(null);
  const [err, setErr] = useState("");
  const [progress, setProgress] = useState({sessions:[],totalTime:0});
  const [refOpen, setRefOpen] = useState(null);
  const endRef = useRef(null);
  const sysRef = useRef("");
  const modeRef = useRef("");
  const taRef = useRef(null);
  const t0 = useRef(0);
  const uC = msgs.filter(m=>m.role==="user").length;

  useEffect(()=>{loadData().then(setProgress);},[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,loading]);

  const go = async (mode, sys, prompt) => {
    setErr("");setLoading(true);setView("chat");setMsgs([]);setDebrief(null);
    modeRef.current=mode; sysRef.current=sys; t0.current=Date.now();
    try { const t=await callAI([{role:"user",content:prompt}],sys); setMsgs([{role:"assistant",content:t}]); }
    catch(e){setErr(e.message);} setLoading(false);
  };

  const send = async () => {
    const v=input.trim(); if(!v||loading) return;
    setInput("");setErr("");
    const n=[...msgs,{role:"user",content:v}]; setMsgs(n);setLoading(true);
    try { const t=await callAI([{role:"user",content:"Commence."},...n],sysRef.current); setMsgs([...n,{role:"assistant",content:t}]); }
    catch(e){setErr(e.message);} setLoading(false);
    setTimeout(()=>taRef.current?.focus(),100);
  };

  const bilan = async () => {
    setLoading(true);setErr("");
    try {
      const t=await callAI([...msgs,{role:"user",content:"Bilan pédagogique en JSON."}],debSys);
      const p=JSON.parse(t.replace(/```json|```/g,"").trim());
      setDebrief(p);
      const sc=p.scores||{}; const vs=Object.values(sc).filter(v=>typeof v==="number");
      const avg=vs.length?Math.round(vs.reduce((a,b)=>a+b,0)/vs.length*10)/10:0;
      const mins=Math.round((Date.now()-t0.current)/60000);
      const np={...progress,sessions:[...progress.sessions,{mode:modeRef.current,domain:selId||modeRef.current,avg,date:new Date().toLocaleDateString("fr-CA"),mins}],totalTime:progress.totalTime+mins};
      setProgress(np);saveData(np); setView("debrief");
    } catch{setErr("Erreur bilan.");} setLoading(false);
  };

  const back=()=>{setView("pick");setMsgs([]);setDebrief(null);setErr("");setInput("");};

  // ===== REF MODAL =====
  const RefModal = () => {
    const item = STAGES.find(s=>s.id===refOpen)||THEORY.find(t=>t.id===refOpen);
    if(!item) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4" onClick={()=>setRefOpen(null)}>
        <div className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-2"><span className="text-2xl">{item.icon}</span><h3 className="text-lg font-bold text-slate-900">{item.name}</h3></div>
            <button onClick={()=>setRefOpen(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-lg">✕</button>
          </div>
          <div className="px-5 py-4">
            {item.code&&<div className="text-sm text-slate-400 font-mono mb-3">{item.code}</div>}
            {item.topics&&item.topics.map((t,i)=><div key={i} className="mb-3 text-sm text-slate-700 leading-relaxed border-l-2 border-teal-200 pl-3">{t}</div>)}
            {item.content&&<div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{item.content}</div>}
          </div>
        </div>
      </div>
    );
  };

  // ===== CHAT =====
  const Chat = ({title, color}) => (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={back} className="text-slate-400 hover:text-slate-600 p-1"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg></button>
          <span className="text-sm font-semibold text-slate-800 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {selId&&<button onClick={()=>setRefOpen(selId)} className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium">📋 Aide-mémoire</button>}
          {uC>=3&&<button onClick={bilan} disabled={loading} className="text-sm font-semibold px-4 py-1.5 rounded-lg text-white disabled:opacity-50" style={{backgroundColor:color||"#0d9488"}}>Bilan</button>}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-gradient-to-b from-slate-50 to-white">
        {msgs.map((m,i)=>(
          <div key={i} className={`mb-4 flex ${m.role==="user"?"justify-end":"justify-start"}`}>
            <div className={`max-w-sm rounded-2xl px-4 py-3 leading-relaxed shadow-sm ${m.role==="user"?"text-white rounded-br-sm text-sm":"bg-white text-slate-700 border border-slate-200 rounded-bl-sm text-sm"}`} style={m.role==="user"?{backgroundColor:color||"#0d9488"}:{}}>
              <div style={{whiteSpace:"pre-wrap"}}>{m.content}</div>
            </div>
          </div>
        ))}
        {loading&&<Dots/>}
        {err&&<div className="text-center mb-3"><span className="bg-rose-50 text-rose-600 text-sm border border-rose-200 rounded-lg px-4 py-2 inline-block">{err}</span></div>}
        <div ref={endRef}/>
      </div>
      {uC===0&&msgs.length>0&&!loading&&(
        <div className="px-4 pb-2"><div className="bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5 text-sm text-teal-700 text-center">💡 Réponds comme en stage — l'important c'est ton raisonnement</div></div>
      )}
      <div className="bg-white border-t border-slate-100 px-4 py-3 shrink-0">
        <div className="flex items-end gap-3">
          <textarea ref={taRef} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
            placeholder="Ta réponse clinique..." rows={2}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all" style={{"--tw-ring-color":color||"#0d9488"}}
            disabled={loading||msgs.length===0}/>
          <button onClick={send} disabled={loading||!input.trim()}
            className="text-white p-3 rounded-xl disabled:opacity-30 shrink-0 transition-all" style={{backgroundColor:color||"#0d9488"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );

  // ===== DEBRIEF =====
  const Debrief = () => {
    if(!debrief) return null;
    const sc=debrief.scores||{}; const vs=Object.values(sc).filter(v=>typeof v==="number");
    const avg=vs.length?Math.round(vs.reduce((a,b)=>a+b,0)/vs.length*10)/10:0;
    const ac=avg>=8?"text-emerald-600":avg>=6?"text-teal-600":avg>=4?"text-amber-600":"text-rose-600";
    const rd=[{s:"Anticipation",v:sc.anticipation||0},{s:"Raisonnement",v:sc.raisonnement||0},{s:"Connaissances",v:sc.connaissances||0},{s:"Liens T↔P",v:sc.liens||0},{s:"Communication",v:sc.communication||0}];
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <button onClick={back} className="text-slate-400 hover:text-slate-600 mb-4 flex items-center gap-1 text-sm font-medium"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>Retour</button>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-1">Bilan de session</h2>
          {debrief.resume&&<p className="text-sm text-slate-500 text-center mb-5">{debrief.resume}</p>}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
            <div className="flex items-center justify-between mb-3"><span className="font-semibold text-slate-700">Score global</span><span className={`text-3xl font-bold ${ac}`}>{avg}<span className="text-sm text-slate-400 ml-0.5">/10</span></span></div>
            <div className="flex justify-center my-2">
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={rd} cx="50%" cy="50%" outerRadius="65%"><PolarGrid stroke="#e2e8f0"/><PolarAngleAxis dataKey="s" tick={{fontSize:11,fill:"#64748b"}}/><Radar dataKey="v" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={2} dot={{r:3,fill:"#14b8a6"}}/></RadarChart>
              </ResponsiveContainer>
            </div>
            <Bar label="🔮 Anticipation clinique" score={sc.anticipation||0}/>
            <Bar label="🧠 Raisonnement clinique" score={sc.raisonnement||0}/>
            <Bar label="📖 Connaissances" score={sc.connaissances||0}/>
            <Bar label="🔗 Liens théorie ↔ pratique" score={sc.liens||0}/>
            <Bar label="💬 Communication" score={sc.communication||0}/>
          </div>
          {[{k:"forts",t:"✅ Points forts",bg:"bg-emerald-50",bd:"border-emerald-200",tx:"text-emerald-700"},
            {k:"ameliorer",t:"🎯 À améliorer",bg:"bg-amber-50",bd:"border-amber-200",tx:"text-amber-700"},
            {k:"reviser",t:"📚 Concepts à réviser",bg:"bg-sky-50",bd:"border-sky-200",tx:"text-sky-700"}
          ].map(({k,t,bg,bd,tx})=>debrief[k]?.length>0&&(
            <div key={k} className={`${bg} rounded-2xl border ${bd} p-4 mb-3`}>
              <h3 className={`font-semibold ${tx} text-sm mb-2`}>{t}</h3>
              {debrief[k].map((p,i)=><p key={i} className={`text-sm ${tx} mb-1 leading-relaxed`}>• {p}</p>)}
            </div>
          ))}
          {debrief.conseil&&<div className="bg-teal-50 rounded-2xl border border-teal-200 p-4 mb-5"><h3 className="font-semibold text-teal-800 text-sm mb-1">💡 Conseil pour ton stage</h3><p className="text-sm text-teal-700 leading-relaxed">{debrief.conseil}</p></div>}
          <div className="flex gap-3">
            <button onClick={back} className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-sm">Retour</button>
            <button onClick={back} className="flex-1 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 shadow-lg shadow-teal-100 text-sm">Nouveau</button>
          </div>
        </div>
      </div>
    );
  };

  // ===== SCREENS =====
  const Home = () => {
    const st=progress.sessions; const avg=st.length?Math.round(st.reduce((a,b)=>a+(b.avg||0),0)/st.length*10)/10:0;
    return (
      <div className="h-full overflow-y-auto bg-gradient-to-b from-teal-50 via-white to-white">
        <div className="max-w-lg mx-auto px-5 py-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-3xl mb-4 shadow-lg shadow-teal-200">🫁</div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">InhaloPrep</h1>
            <p className="text-sm text-slate-500 mt-1">Techniques d'inhalothérapie — 141.A0</p>
            <p className="text-sm text-slate-400">Cégep de Rosemont — Québec</p>
          </div>

          {st.length>0&&(
            <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-sm">
              <h3 className="font-semibold text-slate-800 text-sm mb-3">📊 Ta progression</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-3xl font-bold text-teal-600">{st.length}</div><div className="text-sm text-slate-500">Sessions</div></div>
                <div><div className={`text-3xl font-bold ${avg>=7?"text-emerald-600":avg>=5?"text-amber-600":"text-rose-600"}`}>{avg||"—"}</div><div className="text-sm text-slate-500">Moyenne</div></div>
                <div><div className="text-3xl font-bold text-teal-600">{progress.totalTime}</div><div className="text-sm text-slate-500">Minutes</div></div>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {[{t:"sim",icon:"🩺",name:"Simulations cliniques",desc:"Scénarios réalistes dans tes 6 milieux de stage",c:"#0d9488"},
              {t:"theory",icon:"📚",name:"Révision théorique",desc:"Physiopatho, pharmaco, ventilation, GAB, monitorage, voies aériennes",c:"#0284c7"},
              {t:"gab",icon:"🩸",name:"GAB Express",desc:"Interprétation rapide de gaz artériels — cas progressifs",c:"#e11d48"},
              {t:"esp",icon:"🎓",name:"Préparation ESP",desc:"Épreuve synthèse — cas complexes multi-compétences",c:"#7c3aed"}
            ].map(m=>(
              <button key={m.t} onClick={()=>{setTab(m.t);setView("pick");}}
                className="w-full text-left p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm hover:shadow-md group">
                <div className="flex items-center gap-4">
                  <div className="text-3xl group-hover:scale-110 transition-transform">{m.icon}</div>
                  <div className="flex-1"><div className="font-bold text-slate-800">{m.name}</div><div className="text-sm text-slate-500 mt-0.5">{m.desc}</div></div>
                  <svg className="text-slate-300 group-hover:text-teal-500 shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-800 mb-3">📋 Aide-mémoire par stage</h3>
            <div className="grid grid-cols-2 gap-2">
              {STAGES.map(s=>(
                <button key={s.id} onClick={()=>setRefOpen(s.id)} className="text-left p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex items-center gap-2"><span className="text-lg">{s.icon}</span><span className="text-sm font-semibold text-slate-700">{s.name}</span></div>
                  <div className="text-xs text-slate-400 font-mono mt-1">{s.code}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SimPick = () => (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-5 py-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Simulations cliniques</h2>
        <p className="text-sm text-slate-500 mb-5">Scénarios réalistes dans le réseau québécois</p>
        <div className="space-y-2.5 mb-5">
          {STAGES.map(s=>(
            <button key={s.id} onClick={()=>setSelId(s.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selId===s.id?"shadow-sm":"bg-white border-slate-100 hover:border-slate-200"}`}
              style={selId===s.id?{borderColor:s.color,backgroundColor:s.color+"10"}:{}}>
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{s.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2"><span className="font-bold text-slate-800">{s.name}</span><span className="text-xs text-slate-400 font-mono">{s.code}</span></div>
                  <p className="text-sm text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="mb-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Niveau de difficulté</div>
          <div className="flex gap-2">{[{id:"guide",l:"🟢 Guidé"},{id:"autonome",l:"🟡 Autonome"},{id:"expert",l:"🔴 Expert"}].map(d=>(
            <button key={d.id} onClick={()=>setDiff(d.id)} className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all text-sm ${diff===d.id?"bg-teal-50 border-teal-300 text-teal-700":"bg-white border-slate-100 text-slate-500 hover:border-slate-300"}`}>{d.l}</button>
          ))}</div>
        </div>
        <button onClick={()=>{if(!selId)return;const s=STAGES.find(x=>x.id===selId);go("sim",mkSimSys(s,diff),"Commence le scénario clinique.");}}
          disabled={!selId} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selId?"bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-200":"bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
          Commencer le scénario
        </button>
      </div>
    </div>
  );

  const TheoryPick = () => (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-5 py-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Révision théorique</h2>
        <p className="text-sm text-slate-500 mb-5">Comprends le POURQUOI — liens théorie ↔ clinique</p>
        <div className="space-y-2.5 mb-5">
          {THEORY.map(t=>(
            <button key={t.id} onClick={()=>setSelId(t.id)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${selId===t.id?"shadow-sm":"bg-white border-slate-100 hover:border-slate-200"}`}
              style={selId===t.id?{borderColor:t.color,backgroundColor:t.color+"10"}:{}}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{t.icon}</span>
                <div><div className="font-bold text-slate-800">{t.name}</div><div className="text-sm text-slate-500 mt-0.5 line-clamp-2">{t.content.slice(0,100)}...</div></div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={()=>{if(!selId)return;const t=THEORY.find(x=>x.id===selId);go("theory",mkTheorySys(t),"Pose-moi une première question clinique.");}}
          disabled={!selId} className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selId?"bg-sky-600 text-white hover:bg-sky-700 shadow-lg shadow-sky-200":"bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
          Commencer la révision
        </button>
      </div>
    </div>
  );

  const GabPick = () => (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-5 py-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">GAB Express</h2>
        <p className="text-sm text-slate-500 mb-5">Deviens rapide en interprétation de gaz artériels</p>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3">Valeurs normales</h3>
          <div className="space-y-2">
            {[["pH","7.35 – 7.45"],["PaCO₂","35 – 45 mmHg"],["PaO₂","80 – 100 mmHg"],["HCO₃⁻","22 – 26 mEq/L"],["BE","± 2 mEq/L"],["SaO₂","> 95%"],["Lactates","< 2 mmol/L"],["P/F ratio","> 300 = normal"]].map(([k,v])=>
              <div key={k} className="flex justify-between py-1.5 border-b border-slate-50"><span className="font-semibold text-slate-700 text-sm">{k}</span><span className="text-slate-500 font-mono text-sm">{v}</span></div>
            )}
          </div>
        </div>
        <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5 mb-6">
          <h3 className="font-bold text-rose-800 mb-3">Méthode systématique</h3>
          <div className="space-y-1.5 text-sm text-rose-700">
            {["1. pH → acidose ou alcalose?","2. PaCO₂ → composante respiratoire","3. HCO₃⁻ → composante métabolique","4. Quel est le désordre PRIMAIRE?","5. Y a-t-il compensation? (Winter, etc.)","6. PaO₂ + P/F → oxygénation adéquate?","7. Contexte clinique → CAUSE du désordre?"].map((s,i)=><p key={i} className="leading-relaxed">{s}</p>)}
          </div>
        </div>
        <button onClick={()=>{setSelId("gab");go("gab",gabSys,"Donne-moi un premier cas avec GAB.");}}
          className="w-full py-4 rounded-xl font-bold text-lg bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all">
          Commencer
        </button>
      </div>
    </div>
  );

  const EspPick = () => (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-lg mx-auto px-5 py-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">Préparation à l'ESP</h2>
        <p className="text-sm text-slate-500 mb-5">L'épreuve synthèse — DEC + accès permis OPIQ</p>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-3">Compétences ministérielles évaluées</h3>
          <div className="space-y-1.5 text-sm text-slate-600">
            {["002D — Communication patient / famille / équipe","002F — Traitement ↔ désordre cardiopulmonaire","002G — Préparation des médicaments (inhalo + anesthésie)","002H — Traitements adulte, enfant, nouveau-né","002J — ECG: enregistrement et analyse","002K — Tests de fonctions pulmonaires","002L — Soutien technique en anesthésie","002M — Ventilation mécanique (qualité)","002N — Techniques cardiopulmonaires","002P — Organisation du travail"].map((c,i)=><p key={i} className="py-1 border-b border-slate-50">{c}</p>)}
          </div>
        </div>
        <div className="bg-violet-50 rounded-2xl border border-violet-200 p-4 mb-6">
          <p className="text-sm text-violet-700"><strong>💡</strong> L'ESP intègre TOUT ton programme. Si tu te sens moins solide sur certains sujets, commence par les simulations et la révision théorique d'abord.</p>
        </div>
        <button onClick={()=>{setSelId("esp");go("esp",espSys,"Mise en situation clinique complexe pour l'ESP.");}}
          className="w-full py-4 rounded-xl font-bold text-lg bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all">
          Commencer un cas ESP
        </button>
      </div>
    </div>
  );

  // ===== RENDER =====
  const getColor = () => {
    if(tab==="gab") return "#e11d48";
    if(tab==="esp") return "#7c3aed";
    if(tab==="theory") { const t=THEORY.find(x=>x.id===selId); return t?.color||"#0284c7"; }
    const s=STAGES.find(x=>x.id===selId); return s?.color||"#0d9488";
  };
  const getTitle = () => {
    if(tab==="gab") return "🩸 GAB Express";
    if(tab==="esp") return "🎓 Prépa ESP";
    const item=STAGES.find(s=>s.id===selId)||THEORY.find(t=>t.id===selId);
    return item ? `${item.icon} ${item.name}` : "";
  };

  let content;
  if(view==="chat") content=Chat({title:getTitle(), color:getColor()});
  else if(view==="debrief") content=Debrief();
  else if(tab==="home") content=Home();
  else if(tab==="sim") content=SimPick();
  else if(tab==="theory") content=TheoryPick();
  else if(tab==="gab") content=GabPick();
  else content=EspPick();
  
  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex-1 overflow-hidden">{content}</div>
      {refOpen&&<RefModal/>}
      <div className="bg-white border-t border-slate-100 shrink-0">
        <div className="flex justify-around py-2 max-w-lg mx-auto">
          {[{id:"home",icon:"🏠",n:"Accueil"},{id:"sim",icon:"🩺",n:"Simulation"},{id:"theory",icon:"📚",n:"Théorie"},{id:"gab",icon:"🩸",n:"GAB"},{id:"esp",icon:"🎓",n:"ESP"}].map(m=>(
            <button key={m.id} onClick={()=>{setTab(m.id);if(m.id!==tab){setView("pick");setSelId(null);}}}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${tab===m.id?"text-teal-600 bg-teal-50":"text-slate-400 hover:text-slate-600"}`}>
              <span className={`text-lg ${tab===m.id?"scale-110":""} transition-transform`}>{m.icon}</span>
              <span className={`text-xs ${tab===m.id?"font-bold":"font-medium"}`}>{m.n}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
