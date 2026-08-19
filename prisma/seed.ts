import { prisma } from "../src/lib/prisma.ts";
import { hashPassword } from "../src/lib/auth.ts";

type SeedOffer = {
  title: string;
  sector: string;
  city: string;
  contractType: string;
  description: string;
  missions: string[];
  atsCriteria: {
    minEducationLevel: string;
    minExperienceYears: number;
    requiredLanguages: string[];
    keySkills: string[];
    niceToHave: string[];
  };
  preScreeningQuestions: string[];
  deadlineDaysFromNow: number;
};

const companies: Array<{
  email: string;
  name: string;
  sector: string;
  city: string;
  description: string;
  isVerified: boolean;
  offers: SeedOffer[];
}> = [
  {
    email: "rh@logicoregroup.cd",
    name: "LogiCore Group SARL",
    sector: "Logistique & Transport",
    city: "Kinshasa",
    description:
      "Groupe logistique opérant à travers la RDC, spécialisé dans le transport et la gestion d'entrepôts.",
    isVerified: true,
    offers: [
      {
        title: "Responsable Logistique",
        sector: "Logistique & Transport",
        city: "Kinshasa",
        contractType: "CDI",
        description:
          "LogiCore Group SARL recherche un(e) Responsable Logistique pour piloter la chaîne d'approvisionnement de ses opérations à Kinshasa.",
        missions: [
          "Superviser la réception, le stockage et l'expédition des marchandises",
          "Coordonner les prestataires de transport et de dédouanement",
          "Optimiser les coûts et délais de la chaîne logistique",
        ],
        atsCriteria: {
          minEducationLevel: "Bac+3",
          minExperienceYears: 3,
          requiredLanguages: ["Français", "Anglais"],
          keySkills: ["Gestion d'entrepôt", "Supply chain", "Excel avancé"],
          niceToHave: ["Certification en logistique", "Permis de conduire"],
        },
        preScreeningQuestions: [
          "Avez-vous déjà géré une équipe logistique de plus de 5 personnes ?",
        ],
        deadlineDaysFromNow: 30,
      },
      {
        title: "Gestionnaire de Stock",
        sector: "Logistique & Transport",
        city: "Matadi",
        contractType: "CDI",
        description:
          "Rejoignez notre entrepôt de Matadi pour assurer le suivi précis des stocks et des inventaires.",
        missions: ["Tenir l'inventaire à jour", "Réceptionner et vérifier les livraisons"],
        atsCriteria: {
          minEducationLevel: "Bac+2",
          minExperienceYears: 1,
          requiredLanguages: ["Français"],
          keySkills: ["Gestion des stocks", "Excel"],
          niceToHave: [],
        },
        preScreeningQuestions: [],
        deadlineDaysFromNow: 21,
      },
    ],
  },
  {
    email: "recrutement@miningsolutions.cd",
    name: "Mining Solutions RDC",
    sector: "Finance & Comptabilité",
    city: "Lubumbashi",
    description: "Prestataire de services financiers pour le secteur minier en RDC.",
    isVerified: true,
    offers: [
      {
        title: "Comptable Senior",
        sector: "Finance & Comptabilité",
        city: "Lubumbashi",
        contractType: "CDI",
        description:
          "Mining Solutions RDC recherche un(e) Comptable Senior pour renforcer son équipe finance à Lubumbashi.",
        missions: ["Tenir la comptabilité générale et analytique", "Préparer les états financiers mensuels"],
        atsCriteria: {
          minEducationLevel: "Bac+4",
          minExperienceYears: 5,
          requiredLanguages: ["Français"],
          keySkills: ["Sage", "Normes OHADA", "Fiscalité RDC"],
          niceToHave: ["Anglais professionnel"],
        },
        preScreeningQuestions: ["Combien d'années d'expérience avez-vous en normes OHADA ?"],
        deadlineDaysFromNow: 14,
      },
      {
        title: "Analyste Financier(ère)",
        sector: "Finance & Comptabilité",
        city: "Lubumbashi",
        contractType: "CDI",
        description: "Analysez la performance financière de nos projets miniers.",
        missions: ["Modéliser les flux financiers", "Produire des rapports pour la direction"],
        atsCriteria: {
          minEducationLevel: "Bac+4",
          minExperienceYears: 2,
          requiredLanguages: ["Français", "Anglais"],
          keySkills: ["Excel avancé", "Modélisation financière"],
          niceToHave: [],
        },
        preScreeningQuestions: [],
        deadlineDaysFromNow: 25,
      },
    ],
  },
  {
    email: "contact@avenircongo.org",
    name: "ONG Avenir Congo",
    sector: "Communication & Marketing",
    city: "Goma",
    description: "Organisation non gouvernementale active dans le développement communautaire à l'Est de la RDC.",
    isVerified: false,
    offers: [
      {
        title: "Chargé de Communication",
        sector: "Communication & Marketing",
        city: "Goma",
        contractType: "CDD",
        description:
          "ONG Avenir Congo recherche un(e) Chargé(e) de Communication pour animer sa présence digitale à Goma.",
        missions: ["Gérer les réseaux sociaux de l'organisation", "Produire des contenus (photo, vidéo, texte)"],
        atsCriteria: {
          minEducationLevel: "Bac+3",
          minExperienceYears: 1,
          requiredLanguages: ["Français", "Swahili"],
          keySkills: ["Réseaux sociaux", "Rédaction", "Canva"],
          niceToHave: ["Montage vidéo"],
        },
        preScreeningQuestions: [],
        deadlineDaysFromNow: 10,
      },
    ],
  },
  {
    email: "jobs@teleconnect.cd",
    name: "TeleConnect RDC",
    sector: "Informatique & Télécoms",
    city: "Kinshasa",
    description: "Opérateur télécoms desservant Kinshasa et ses environs.",
    isVerified: true,
    offers: [
      {
        title: "Ingénieur Réseaux",
        sector: "Informatique & Télécoms",
        city: "Kinshasa",
        contractType: "CDI",
        description:
          "TeleConnect RDC recherche un(e) Ingénieur Réseaux pour maintenir et faire évoluer son infrastructure télécoms.",
        missions: ["Administrer les équipements réseau", "Superviser la disponibilité de l'infrastructure"],
        atsCriteria: {
          minEducationLevel: "Bac+5",
          minExperienceYears: 2,
          requiredLanguages: ["Français", "Anglais"],
          keySkills: ["Cisco", "TCP/IP", "Sécurité réseau"],
          niceToHave: ["Certification CCNA"],
        },
        preScreeningQuestions: ["Possédez-vous une certification Cisco (CCNA ou supérieure) ?"],
        deadlineDaysFromNow: 20,
      },
      {
        title: "Développeur(se) Web",
        sector: "Informatique & Télécoms",
        city: "Kinshasa",
        contractType: "CDI",
        description: "Participez au développement de nos outils internes et de notre portail client.",
        missions: ["Développer de nouvelles fonctionnalités", "Corriger des anomalies"],
        atsCriteria: {
          minEducationLevel: "Bac+3",
          minExperienceYears: 1,
          requiredLanguages: ["Français"],
          keySkills: ["JavaScript", "React", "API REST"],
          niceToHave: [],
        },
        preScreeningQuestions: [],
        deadlineDaysFromNow: 18,
      },
    ],
  },
];

async function main() {
  for (const company of companies) {
    const user = await prisma.user.upsert({
      where: { email: company.email },
      update: {},
      create: {
        name: company.name,
        email: company.email,
        passwordHash: await hashPassword("Demo1234!"),
        role: "COMPANY",
        status: "VALIDATED",
      },
    });

    const organization = await prisma.organization.upsert({
      where: { userId: user.id },
      update: {
        name: company.name,
        sector: company.sector,
        city: company.city,
        description: company.description,
        isVerified: company.isVerified,
      },
      create: {
        userId: user.id,
        name: company.name,
        sector: company.sector,
        city: company.city,
        description: company.description,
        isVerified: company.isVerified,
      },
    });

    for (const offer of company.offers) {
      const existing = await prisma.jobOffer.findFirst({
        where: { organizationId: organization.id, title: offer.title },
      });

      if (existing) continue;

      await prisma.jobOffer.create({
        data: {
          organizationId: organization.id,
          title: offer.title,
          sector: offer.sector,
          city: offer.city,
          contractType: offer.contractType,
          description: offer.description,
          missions: offer.missions,
          atsCriteria: offer.atsCriteria,
          preScreeningQuestions: offer.preScreeningQuestions,
          status: "PUBLISHED",
          publishedAt: new Date(),
          deadline: new Date(Date.now() + offer.deadlineDaysFromNow * 86_400_000),
        },
      });
    }
  }

  // Compte administrateur de démonstration.
  await prisma.user.upsert({
    where: { email: "admin@carrieresrdc.cd" },
    update: {},
    create: {
      name: "Administrateur CarrièresRDC",
      email: "admin@carrieresrdc.cd",
      passwordHash: await hashPassword("Admin1234!"),
      role: "ADMIN",
      status: "VALIDATED",
    },
  });

  // Quelques candidats et comptes en attente de validation pour peupler le panneau admin.
  const candidates = [
    { name: "Grace Mbala", email: "grace.mbala@example.cd" },
    { name: "Patrick Ilunga", email: "patrick.ilunga@example.cd" },
    { name: "Naomie Kalala", email: "naomie.kalala@example.cd" },
  ];

  for (const candidate of candidates) {
    await prisma.user.upsert({
      where: { email: candidate.email },
      update: {},
      create: {
        name: candidate.name,
        email: candidate.email,
        passwordHash: await hashPassword("Demo1234!"),
        role: "CANDIDATE",
        status: "VALIDATED",
      },
    });
  }

  const pendingOrganizations = [
    {
      email: "contact@kivubusinessgroup.cd",
      name: "Kivu Business Group",
      role: "COMPANY" as const,
      sector: "Finance & Comptabilité",
      city: "Goma",
    },
    {
      email: "info@ecolesreussiteplus.cd",
      name: "Écoles Réussite Plus",
      role: "TRAINING_ORG" as const,
      sector: "Éducation & Formation",
      city: "Bukavu",
    },
  ];

  for (const org of pendingOrganizations) {
    const user = await prisma.user.upsert({
      where: { email: org.email },
      update: {},
      create: {
        name: org.name,
        email: org.email,
        passwordHash: await hashPassword("Demo1234!"),
        role: org.role,
        status: "PENDING",
      },
    });

    await prisma.organization.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: org.name,
        sector: org.sector,
        city: org.city,
        isVerified: false,
      },
    });
  }

  console.log("Seed terminé.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
