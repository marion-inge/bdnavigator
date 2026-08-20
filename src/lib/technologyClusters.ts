// Maps free-text technology inputs onto a small set of readable clusters.
// Matching is keyword based and case-insensitive; first matching cluster wins.

export interface TagCluster {
  name: string;
  keywords: string[];
}

export const TECHNOLOGY_CLUSTERS: TagCluster[] = [
  {
    name: "AI & Data Analytics",
    keywords: [
      "ai", "artificial intelligence", "machine learning", "ml", "deep learning",
      "llm", "genai", "generative", "analytic", "data science", "algorithm",
      "predictive", "computer vision", "nlp", "big data",
    ],
  },
  {
    name: "Software & Platforms",
    keywords: [
      "software", "saas", "platform", "app", "cloud", "web", "portal",
      "marketplace", "digital twin", "erp", "crm", "api", "blockchain", "cyber",
    ],
  },
  {
    name: "Sensors & IoT",
    keywords: [
      "sensor", "iot", "internet of things", "monitoring", "measurement",
      "metering", "telemetry", "rfid", "edge device", "wearable", "detection",
    ],
  },
  {
    name: "Automation & Robotics",
    keywords: [
      "automation", "robot", "cobot", "control system", "plc", "scada",
      "mechatronic", "drone", "autonomous", "machine build",
    ],
  },
  {
    name: "Materials & Chemistry",
    keywords: [
      "material", "chemistry", "chemical", "polymer", "coating", "catalyst",
      "membrane", "nano", "composite", "adhesive", "surface", "resin", "metal",
    ],
  },
  {
    name: "Energy & Storage",
    keywords: [
      "energy", "battery", "storage", "hydrogen", "fuel cell", "electroly",
      "solar", "photovolt", "wind", "grid", "power electronics", "heat pump",
      "charging", "carbon capture",
    ],
  },
  {
    name: "Process & Production Technology",
    keywords: [
      "process", "production", "manufactur", "additive", "3d print", "machining",
      "extrusion", "welding", "assembly", "plant", "filtration", "separation",
      "purification", "treatment", "recycl",
    ],
  },
  {
    name: "Analytics Instrumentation & Lab",
    keywords: [
      "spectro", "chromato", "laser", "optic", "photonic", "x-ray", "imaging",
      "lab", "assay", "analyz", "analys", "instrument",
    ],
  },
  {
    name: "Life Science & Biotech",
    keywords: [
      "bio", "biotech", "genom", "medical device", "pharma", "diagnost",
      "cell", "enzyme", "fermentation",
    ],
  },
  {
    name: "Electronics & Hardware",
    keywords: [
      "electronic", "semiconductor", "chip", "hardware", "pcb", "circuit",
      "power supply", "5g", "telecom", "communication", "rf ",
    ],
  },
  {
    name: "Services & Business Models",
    keywords: [
      "service", "consult", "as a service", "subscription", "training",
      "operating model", "business model",
    ],
  },
];

export const GEOGRAPHY_CLUSTERS: TagCluster[] = [
  {
    name: "DACH",
    keywords: ["dach", "german", "deutschland", "austria", "österreich", "swiss", "switzerland", "schweiz"],
  },
  {
    name: "Europe",
    keywords: [
      "europe", "europa", "eu ", "emea", "nordic", "scandinav", "benelux",
      "france", "italy", "spain", "poland", "uk", "united kingdom", "britain",
      "netherlands", "belgium", "portugal", "czech", "nordics", "baltic", "turkey",
    ],
  },
  {
    name: "North America",
    keywords: ["north america", "usa", "u.s.", "united states", "us ", "canada", "mexico", "nafta"],
  },
  {
    name: "Asia-Pacific",
    keywords: [
      "asia", "apac", "china", "japan", "korea", "india", "singapore", "taiwan",
      "australia", "new zealand", "vietnam", "indonesia", "pacific",
    ],
  },
  {
    name: "Middle East & Africa",
    keywords: ["middle east", "gulf", "gcc", "uae", "saudi", "qatar", "africa", "egypt", "israel"],
  },
  {
    name: "Latin America",
    keywords: ["latin america", "latam", "brazil", "argentina", "chile", "colombia", "south america"],
  },
  {
    name: "Global",
    keywords: ["global", "worldwide", "international", "weltweit"],
  },
];

export function clusterByKeywords(raw: string | undefined | null, clusters: TagCluster[]): string {
  if (!raw || !raw.trim()) return "Unspecified";
  const text = ` ${raw.toLowerCase().replace(/[_\-/]/g, " ")} `;
  for (const cluster of clusters) {
    if (cluster.keywords.some((kw) => text.includes(kw))) return cluster.name;
  }
  return "Other";
}

export const clusterTechnology = (raw: string | undefined | null) =>
  clusterByKeywords(raw, TECHNOLOGY_CLUSTERS);

export const clusterGeography = (raw: string | undefined | null) =>
  clusterByKeywords(raw, GEOGRAPHY_CLUSTERS);
