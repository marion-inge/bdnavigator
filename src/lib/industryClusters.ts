// Maps free-text industry inputs onto a small set of readable clusters.
// Matching is keyword based and case-insensitive; first matching cluster wins.
import { clusterByKeywords } from "./technologyClusters";


export interface IndustryCluster {
  name: string;
  keywords: string[];
}

export const INDUSTRY_CLUSTERS: IndustryCluster[] = [
  {
    name: "Energy & Utilities",
    keywords: [
      "energy", "energie", "power", "utility", "utilities", "grid", "electric",
      "renewable", "solar", "wind", "hydrogen", "h2", "fuel cell", "battery",
      "storage", "nuclear", "oil", "gas", "petro", "biogas", "heating", "district heat",
    ],
  },
  {
    name: "Chemicals & Materials",
    keywords: [
      "chemical", "chemie", "material", "polymer", "plastic", "coating", "paint",
      "specialty chem", "petrochem", "resin", "composite", "metal", "steel",
      "aluminium", "aluminum", "mining", "cement", "glass", "ceramic",
    ],
  },
  {
    name: "Water & Environment",
    keywords: [
      "water", "wasser", "waste", "environment", "environmental", "recycl",
      "circular", "emission", "pfas", "pollution", "sustainab", "climate", "carbon",
    ],
  },
  {
    name: "Industrial Manufacturing",
    keywords: [
      "manufactur", "industrial", "industrie", "machinery", "machine build",
      "equipment", "engineering", "factory", "production", "automation",
      "robot", "mechanical", "plant", "process industry", "oem", "tooling",
    ],
  },
  {
    name: "Mobility & Transport",
    keywords: [
      "automotive", "mobility", "transport", "logistics", "supply chain", "rail",
      "aviation", "aerospace", "shipping", "maritime", "marine", "fleet", "ev ",
      "e-mobility", "truck", "port",
    ],
  },
  {
    name: "Healthcare & Life Sciences",
    keywords: [
      "health", "medical", "medtech", "pharma", "biotech", "life science",
      "clinical", "hospital", "diagnost", "care", "drug", "therap",
    ],
  },
  {
    name: "Food & Agriculture",
    keywords: [
      "food", "beverage", "agri", "farm", "nutrition", "dairy", "brewing",
      "fmcg", "consumer goods", "packaging",
    ],
  },
  {
    name: "Technology & Software",
    keywords: [
      "software", "saas", "it ", "information technology", "digital", "data",
      "ai", "artificial intelligence", "cloud", "platform", "cyber", "iot",
      "semiconductor", "electronics", "telecom", "internet", "sensor",
    ],
  },
  {
    name: "Construction & Real Estate",
    keywords: [
      "construction", "building", "real estate", "infrastructure", "architecture",
      "facility", "hvac", "smart building", "property",
    ],
  },
  {
    name: "Financial & Professional Services",
    keywords: [
      "financ", "bank", "insur", "fintech", "consult", "service provider",
      "professional service", "legal", "education", "public sector", "government",
      "retail", "e-commerce", "commerce",
    ],
  },
];

export function clusterIndustry(raw: string | undefined | null): string {
  return clusterByKeywords(raw, INDUSTRY_CLUSTERS);
}

