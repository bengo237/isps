/* Modèle 2 « Vigie » : contenus partagés entre les pages */
window.VIGIE = {

  roles: {
    direction: {
      label: "Direction d'installation",
      hint: "Port, terminal, raffinerie, base offshore",
      title: "Obtenir la conformité, puis la garder",
      text: "C'est vous qui répondez de la sûreté devant l'autorité désignée. Nous pilotons la démarche et vous savez à tout moment où en est le dossier.",
      priorities: [
        { t: "Évaluation et plan de sûreté", d: "Un dossier prêt pour l'approbation", href: "#explorer" },
        { t: "Un agent de sûreté opérationnel", d: "Formation du PFSO et de ses adjoints", href: "formations.html?m=pfso" },
        { t: "Préparation à la vérification", d: "Audit à blanc et plan d'actions", href: "demande.html?besoin=isps" }
      ],
      mods: ["pfso", "audit", "sensibilisation"],
      spot: "zone"
    },
    surete: {
      label: "PFSO et équipes de sûreté",
      hint: "Agents, chefs de poste, contrôle d'accès",
      title: "Des procédures applicables sur le terrain",
      text: "Vous faites vivre le plan au quotidien et à chaque changement de niveau. Nous formons vos équipes et mettons le dispositif à l'épreuve lors d'exercices réalistes.",
      priorities: [
        { t: "Contrôle d'accès et zones restreintes", d: "Ce qui change aux niveaux 1, 2 et 3", href: "#explorer" },
        { t: "Formation des équipes", d: "Personnel ayant des tâches de sûreté", href: "formations.html?m=personnel" },
        { t: "Exercices", d: "Scénarios réalistes et retour d'expérience", href: "formations.html?m=exercices" }
      ],
      mods: ["personnel", "exercices", "pfso"],
      spot: "portail"
    },
    compagnie: {
      label: "Compagnie maritime",
      hint: "Armateurs, CSO, commandants",
      title: "Des navires prêts à chaque escale",
      text: "Chaque port a ses exigences et vos navires doivent y répondre. Nous formons vos agents de sûreté et préparons avec vous les échanges avec les installations.",
      priorities: [
        { t: "Interface navire-port", d: "Déclarations de sûreté, exercices conjoints", href: "#explorer" },
        { t: "Agents de sûreté de la compagnie", d: "Formation CSO", href: "formations.html?m=cso" },
        { t: "Agents de sûreté du navire", d: "Formation SSO", href: "formations.html?m=sso" }
      ],
      mods: ["cso", "sso", "exercices"],
      spot: "quai"
    },
    cyber: {
      label: "Informatique et cybersécurité",
      hint: "DSI, RSSI, responsables réseau",
      title: "Protéger aussi les systèmes de sûreté",
      text: "Une panne ou une attaque sur le contrôle d'accès, la vidéosurveillance ou les réseaux d'exploitation peut ouvrir une brèche bien réelle sur le site. C'est pourquoi nous les prenons en compte dans l'évaluation de sûreté.",
      priorities: [
        { t: "Systèmes informatiques de sûreté", d: "Ce qui change aux niveaux 1, 2 et 3", href: "#explorer" },
        { t: "Cybersécurité des systèmes portuaires", d: "Formation des équipes techniques", href: "formations.html?m=cyber" },
        { t: "Fraude et cybercriminalité", d: "Sensibilisation de la direction et des équipes", href: "formations.html?m=cybercrim" }
      ],
      mods: ["cyber", "cybercrim", "audit"],
      spot: "si"
    }
  },

  levels: [
    { n: 1, name: "Normal", def: "Mesures appliquées en permanence" },
    { n: 2, name: "Renforcé", def: "Mesures supplémentaires pendant un risque accru" },
    { n: 3, name: "Exceptionnel", def: "Mesures spécifiques quand un incident est probable ou imminent" }
  ],

  spots: [
    { id: "portail", x: 6, y: 47, title: "Portail et contrôle d'accès",
      desc: "C'est ici que l'on contrôle les personnes, les véhicules et les livraisons qui entrent sur le site.",
      levels: [
        "Vérifier l'identité et le motif de chaque entrée, tenir les registres",
        "Contrôles plus nombreux et plus poussés, moins de points d'accès ouverts",
        "Accès limité aux personnes autorisées, fermeture des accès non essentiels"
      ],
      service: "Nous rédigeons les procédures d'accès, mettons en place les registres et formons les agents de contrôle.",
      mod: "personnel" },
    { id: "zone", x: 56, y: 36, title: "Zones d'accès restreint",
      desc: "Les zones de stockage, de manutention ou d'équipements sensibles, où chaque entrée doit être justifiée.",
      levels: [
        "Zones délimitées, signalées et accès contrôlés",
        "Surveillance renforcée et patrouilles plus fréquentes",
        "Interdiction temporaire d'accès, fouilles, surveillance continue"
      ],
      service: "Nous délimitons ces zones lors de l'évaluation de sûreté et rédigeons les consignes qui s'y appliquent.",
      mod: "pfso" },
    { id: "quai", x: 62, y: 72, title: "Quai et interface navire-port",
      desc: "L'endroit où l'installation et le navire travaillent ensemble.",
      levels: [
        "Surveillance des postes à quai, du fret et des provisions de bord",
        "Déclaration de sûreté si nécessaire, contrôle renforcé du fret",
        "Suspension ou limitation des opérations avec le navire sur instruction"
      ],
      service: "Nous préparons les déclarations de sûreté, assurons la coordination avec les agents de sûreté des navires et organisons des exercices conjoints.",
      mod: "sso" },
    { id: "eau", x: 22, y: 86, title: "Plan d'eau et mouillage",
      desc: "L'accès par la mer, souvent le moins surveillé.",
      levels: [
        "Surveillance du plan d'eau, des approches et de la zone de mouillage",
        "Patrouilles nautiques et éclairage renforcé",
        "Restrictions de navigation en coordination avec les autorités maritimes"
      ],
      service: "Nous analysons la menace côté mer et construisons des scénarios d'exercice adaptés au golfe de Guinée.",
      mod: "exercices" },
    { id: "controle", x: 16, y: 15, title: "Poste de contrôle",
      desc: "Il centralise la vidéosurveillance, les alarmes et les communications de sûreté.",
      levels: [
        "Communications de sûreté disponibles en permanence, veille vidéo",
        "Veille renforcée, liaison directe avec les navires à quai",
        "Cellule de crise activée, liaison continue avec les autorités"
      ],
      service: "Nous organisons la veille, écrivons les procédures d'alerte et conduisons des exercices de crise.",
      mod: "exercices" },
    { id: "si", x: 32, y: 15, title: "Systèmes informatiques",
      desc: "Les réseaux, le contrôle d'accès, la vidéo et les logiciels qui font tourner le terminal.",
      levels: [
        "Comptes maîtrisés, sauvegardes, réseaux séparés, accès à distance encadrés",
        "Surveillance des journaux, accès à distance restreints au strict nécessaire",
        "Mode dégradé, isolement des systèmes, bascule sur procédures manuelles"
      ],
      service: "Nous intégrons les cyberrisques à l'évaluation de sûreté, puis rédigeons les politiques de sécurité et la procédure de réponse à incident.",
      mod: "cyber" }
  ],

  domains: {
    surete: "Sûreté portuaire",
    navire: "Navires",
    cyber: "Cybersécurité",
    qse: "QSE"
  },

  modules: [
    { id: "pfso", d: "surete", title: "Agent de sûreté de l'installation portuaire (PFSO)",
      who: "PFSO, adjoints et futurs PFSO", days: "3 jours", format: "Inter ou intra-entreprise",
      goals: ["Comprendre le cadre SOLAS et le code ISPS", "Conduire l'évaluation et tenir le plan de sûreté à jour", "Organiser les entraînements, les exercices et les audits"],
      prog: ["Rôle et responsabilités du PFSO", "Évaluation de sûreté et plan de sûreté", "Niveaux de sûreté et déclaration de sûreté", "Entraînements, exercices, registres et audits"] },
    { id: "personnel", d: "surete", title: "Personnel ayant des tâches de sûreté",
      who: "Agents de sûreté, chefs de poste, contrôle d'accès", days: "2 jours", format: "Intra-entreprise, sur site",
      goals: ["Appliquer les procédures de contrôle d'accès", "Reconnaître un comportement ou un objet suspect", "Savoir quoi faire à chaque niveau de sûreté"],
      prog: ["Contrôle des personnes, véhicules et livraisons", "Fouilles et inspections", "Patrouilles et zones d'accès restreint", "Conduite à tenir en cas d'incident"] },
    { id: "sensibilisation", d: "surete", title: "Sensibilisation de tout le personnel",
      who: "Employés, sous-traitants, intervenants", days: "Une demi-journée", format: "Sur site ou à distance",
      goals: ["Connaître les règles de sûreté de l'installation", "Signaler une situation anormale", "Comprendre son rôle selon le niveau de sûreté"],
      prog: ["Pourquoi la sûreté portuaire", "Zones et badges", "Situations suspectes et signalement", "Changement de niveau de sûreté"] },
    { id: "sso", d: "navire", title: "Agent de sûreté du navire (SSO)",
      who: "Officiers désignés agents de sûreté du navire", days: "3 jours", format: "Inter ou intra-entreprise",
      goals: ["Mettre en œuvre le plan de sûreté du navire", "Conduire les inspections et les entraînements à bord", "Coordonner avec le PFSO à chaque escale"],
      prog: ["Code ISPS et plan de sûreté du navire", "Inspections et contrôle des accès à bord", "Interface navire-port et déclaration de sûreté", "Entraînements et registres"] },
    { id: "cso", d: "navire", title: "Agent de sûreté de la compagnie (CSO)",
      who: "CSO, responsables flotte et conformité", days: "3 jours", format: "Inter ou intra-entreprise",
      goals: ["Organiser la sûreté de la flotte", "Superviser les évaluations et les plans de sûreté des navires", "Préparer les vérifications et les audits"],
      prog: ["Responsabilités de la compagnie", "Évaluation de sûreté du navire", "Approbation et suivi des plans", "Audits internes et exercices"] },
    { id: "exercices", d: "surete", title: "Concevoir et conduire les exercices de sûreté",
      who: "PFSO, CSO, encadrement des opérations", days: "2 jours", format: "Intra-entreprise, sur site",
      goals: ["Construire un programme annuel d'entraînements et d'exercices", "Écrire des scénarios réalistes", "Tirer les enseignements et suivre les actions"],
      prog: ["Exigences du code en matière d'exercices", "Scénarios : intrusion, colis suspect, menace côté mer", "Animation et observation", "Retour d'expérience et plan d'actions"] },
    { id: "audit", d: "surete", title: "Audit interne de sûreté",
      who: "PFSO, auditeurs internes, qualité", days: "2 jours", format: "Inter ou intra-entreprise",
      goals: ["Préparer et conduire un audit interne de sûreté", "Évaluer l'application du plan", "Rédiger un rapport utile à la direction"],
      prog: ["Référentiels et critères d'audit", "Préparation et échantillonnage", "Entretiens et observations terrain", "Rapport et suivi des écarts"] },
    { id: "cyber", d: "cyber", title: "Cybersécurité des systèmes portuaires",
      who: "Informatique, sûreté et exploitation", days: "2 jours", format: "Inter ou intra-entreprise",
      goals: ["Identifier les systèmes critiques de l'installation", "Intégrer les cyberrisques à l'évaluation de sûreté", "Préparer la réponse à un incident"],
      prog: ["Contrôle d'accès et vidéosurveillance en réseau", "Segmentation, comptes et accès à distance", "Sauvegardes et mode dégradé", "Gestion d'incident et conservation des preuves"] },
    { id: "cybercrim", d: "cyber", title: "Cybercriminalité et fraude : reconnaître et réagir",
      who: "Direction et ensemble du personnel", days: "1 jour", format: "Sur site ou à distance",
      goals: ["Reconnaître l'hameçonnage et la fraude au président", "Adopter les bons réflexes au quotidien", "Signaler vite et bien"],
      prog: ["Panorama des menaces actuelles", "Études de cas réels anonymisés", "Mots de passe, double authentification, appareils", "Que faire en cas d'incident"] },
    { id: "qse", d: "qse", title: "Systèmes de management QSE intégrés",
      who: "Responsables QHSE, encadrement", days: "3 jours", format: "Inter ou intra-entreprise",
      goals: ["Articuler ISO 9001, ISO 14001 et ISO 45001", "Préparer un référentiel MASE", "Piloter par les risques et l'amélioration continue"],
      prog: ["Structure commune des normes", "Analyse des risques et document unique", "Audit interne et revue de direction", "Actions correctives et indicateurs"] }
  ],

  skills: ["Installations portuaires", "Navires", "Réglementation", "Exercices et audits", "Formation", "QSE", "Cybersécurité"],

  team: [
    { id: "ne", mono: "NE", name: "Nadège Essomba", role: "Associée fondatrice, sûreté portuaire et QSE",
      sum: "Dix ans en sûreté, sécurité et QSE sur des sites portuaires et industriels.",
      cv: ["Ancienne responsable QHSSE d'un organisme de sûreté reconnu : audits de sûreté et certification ISPS de deux ports en eau profonde, d'une raffinerie et d'une base logistique pétrolière",
           "Conception de plans de sûreté et formation d'agents de sûreté d'installations portuaires",
           "Coordination sûreté et sécurité d'un site industriel portuaire, avec une équipe de 16 agents",
           "Systèmes de management intégrés ISO 9001, ISO 14001, ISO 45001 et MASE",
           "Mastère spécialisé Manager des systèmes QSE, Master 2 QSE",
           "Formée agent de sûreté d'installation portuaire, auditrice QSE intégré certifiée"],
      lv: [2, 0, 1, 2, 2, 2, 0] },
    { id: "ak", mono: "AK", name: "Arnaud Kemayou", role: "Associé, cybersécurité et investigation numérique",
      sum: "Ingénieur, spécialiste de la sécurité des systèmes d'information et de l'investigation numérique.",
      cv: ["Responsable de la sécurité des systèmes d'information dans le secteur financier",
           "Parcours en ingénierie sécurité, DevSecOps, réseaux et cybersécurité",
           "Consultant et formateur en cybersécurité et cybercriminalité au sein d'un organisme de sûreté reconnu",
           "Gouvernance ISO 27001, gestion d'incidents, investigation numérique",
           "Certifications ISO 27001, CCNP, NSE4, NSEPTA et CCT",
           "Distinction nationale en cybersécurité"],
      lv: [1, 0, 1, 1, 2, 0, 2] },
    { id: "jm", mono: "JM", name: "Joël Mvondo", role: "Auditeur ISPS navires, formateur SSO et CSO",
      sum: "Ancien commandant de la marine marchande, vingt ans de navigation.",
      cv: ["Commandement de pétroliers et de porte-conteneurs",
           "Audits de sûreté à bord et revue des plans de sûreté des navires",
           "Formation des agents de sûreté du navire (SSO) et de la compagnie (CSO)",
           "Interface navire-port : déclarations de sûreté et exercices conjoints"],
      lv: [1, 2, 1, 2, 2, 0, 0] },
    { id: "ha", mono: "HA", name: "Hélène Atangana", role: "Juriste, droit maritime et conformité",
      sum: "Juriste en droit maritime et portuaire, douze ans d'expérience.",
      cv: ["Convention SOLAS, chapitre XI-2, code ISPS et textes nationaux d'application",
           "Dossiers d'approbation et échanges avec l'autorité désignée",
           "Contrats de prestation de sûreté et clauses de sous-traitance",
           "Veille réglementaire et mise à jour des procédures"],
      lv: [1, 1, 2, 0, 1, 0, 0] },
    { id: "pn", mono: "PN", name: "Patrick Ngando", role: "Expert évaluation de sûreté et analyse de la menace",
      sum: "Ancien officier de marine, spécialiste de la sûreté maritime.",
      cv: ["Évaluations de sûreté d'installations portuaires et analyse de la menace dans le golfe de Guinée",
           "Scénarios d'exercices : intrusion, colis suspect, passager clandestin, attaque côté mer",
           "Coordination avec les forces de l'ordre, les services de secours et les autorités maritimes"],
      lv: [2, 1, 1, 2, 1, 0, 0] }
  ],

  needs: [
    { id: "isps", t: "Accompagnement ISPS", d: "Évaluation, plan de sûreté, vérification" },
    { id: "formation", t: "Formation", d: "Agents de sûreté, équipes, direction" },
    { id: "exercices", t: "Exercices et audits", d: "Scénarios, audit à blanc, suivi" },
    { id: "qse", t: "Management QSE", d: "ISO 9001, 14001, 45001, MASE" },
    { id: "cyber", t: "Cybersécurité", d: "Systèmes de sûreté, fraude, incidents" }
  ],

  mail: "contact@capsurete.example"
};
