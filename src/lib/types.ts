// Stage identifiers – UI labels differ from code names:
//   "rough_scoring"      → UI: "Idea Scoring"
//   "business_plan"      → UI: "Business Plan"
//   "investment_case"    → UI: "Business Case"
//   "business_case"      → UI: "Implementation and GTM Plan"
export type Stage =
  | "idea"
  | "rough_scoring"       // UI: Idea Scoring
  | "gate1"
  | "business_plan"       // UI: Business Plan
  | "gate2"
  | "investment_case"     // UI: Business Case (Investment Calculation)
  | "gate3"
  | "business_case"       // UI: Implementation and GTM Plan
  | "implement_review"
  | "closed";

export type GateDecision = "go" | "hold" | "no-go";

export interface ScoringCriterion {
  id: string;
  score: number; // 1-5
  comment: string;
}

export interface Scoring {
  marketAttractiveness: ScoringCriterion;
  strategicFit: ScoringCriterion;
  feasibility: ScoringCriterion;
  commercialViability: ScoringCriterion;
  risk: ScoringCriterion;
}

export interface CustomerSegment {
  name: string;
  size: number;
  description: string;
}

export interface CompetitorDimensionRating {
  dimension: string;
  score: number;
  comment: string;
}

export interface CompetitorEntry {
  name: string;
  marketShare: number;
  threatLevel: number;
  dimensionRatings?: CompetitorDimensionRating[];
}

export interface GeographicalRegion {
  region: string;
  potential: number;
  marketSize: string;
  notes: string;
}

export interface MarketYearValue {
  year: number;
  value: number;
}

export interface DetailedMarketAnalysis {
  tam: string;
  tamDescription: string;
  tamProjections: MarketYearValue[];
  sam: string;
  samDescription: string;
  samProjections: MarketYearValue[];
  marketGrowthRate: string;
  targetCustomers: string;
  customerRelationship: string;
  customerSegments: CustomerSegment[];
  competitors: string;
  competitivePosition: string;
  competitorEntries: CompetitorEntry[];
  geographicalRegions: GeographicalRegion[];
}

export interface RevenueProjection {
  year: number;
  revenue: number;
  costs: number;
}

export interface FeasibilityMilestone {
  id: string;
  name: string;
  targetDate: string;
  status: "planned" | "in_progress" | "completed" | "delayed";
}

export interface RiskItem {
  id: string;
  name: string;
  category: "market" | "technical" | "regulatory" | "execution" | "financial";
  probability: number;
  impact: number;
  mitigation: string;
}

export interface AlignmentDimension {
  key: string;
  label: string;
  current: number;
  required: number;
}

export interface CapabilityGap {
  id: string;
  capability: string;
  currentLevel: number;
  requiredLevel: number;
  action: string;
  priority: "high" | "medium" | "low";
}

export interface OrganisationalReadiness {
  score: number;
  culture: string;
  processes: string;
  skills: string;
  leadership: string;
  resources: string;
  stakeholders: string;
  details: string;
}

export type PilotContactStatus = "identified" | "contacted" | "interested" | "loi_confirmed";

export interface PilotCustomerEntry {
  id: string;
  name: string;
  industry: string;
  contactStatus: PilotContactStatus;
  validationResults: string;
  feedback: string;
}

export interface PilotCustomerData {
  score: number;
  entries: PilotCustomerEntry[];
  notes: string;
}

export interface PortfolioFitDimension {
  key: string;
  label: string;
  score: number;
  notes: string;
}

export interface PortfolioFitData {
  score: number;
  dimensions: PortfolioFitDimension[];
  cannibalizationRisk: string;
  crossSellingPotential: string;
  sharedResources: string;
  notes: string;
}

export interface PilotAgreement {
  id: string;
  customerName: string;
  scope: string;
  timeline: string;
  status: "planned" | "active" | "completed" | "cancelled";
  successCriteria: string;
  results: string;
}

export interface LeadGenChannel {
  id: string;
  channel: string;
  strategy: string;
  targetLeads: number;
  actualLeads: number;
  conversionRate: number;
}

export interface LeadGenActivity {
  id: string;
  activity: string;
  status: "planned" | "in_progress" | "completed";
  date: string;
  notes: string;
}

export interface LeadGenerationData {
  channels: LeadGenChannel[];
  activities: LeadGenActivity[];
  pipelineNotes: string;
}

/** Business Plan data – formerly "DetailedScoring" */
export interface BusinessPlanData {
  marketAttractiveness: { score: number; analysis: DetailedMarketAnalysis };
  strategicFit: { score: number; details: string; alignmentDimensions?: AlignmentDimension[]; capabilityGaps?: CapabilityGap[] };
  feasibility: { score: number; details: string; trl?: number; milestones?: FeasibilityMilestone[] };
  commercialViability: {
    score: number;
    details: string;
    pricingModel: string;
    unitPrice: number;
    grossMargin: number;
    projections: RevenueProjection[];
    breakEvenUnits: number;
  };
  risk: { score: number; details: string; riskItems?: RiskItem[] };
  competitorLandscape?: { score: number; analysis: DetailedMarketAnalysis };
  organisationalReadiness?: OrganisationalReadiness;
  pilotCustomer?: PilotCustomerData;
  portfolioFit?: PortfolioFitData;
  tamOverview?: import("./businessPlanTypes").TamOverviewData;
  samOverview?: import("./businessPlanTypes").SamOverviewData;
  somOverview?: import("./businessPlanTypes").SomOverviewData;
  combinedInterpretation?: import("./businessPlanTypes").CombinedInterpretation;
}

/** @deprecated Use BusinessPlanData instead */
export type DetailedScoring = BusinessPlanData;

export interface BusinessCase {
  investmentCost: number;
  expectedRevenue: number;
  roi: number;
  breakEvenMonths: number;
  paybackPeriod: number;
  npv: number;
  notes: string;
}

/** Investment Calculation Sheet – mirrors internal controlling template */
export interface InvestmentCaseYearData {
  year: number;
  investmentExternal: number;
  investmentInternal: number;
  rdExternal: number;
  rdInternal: number;
  sales: number;
  cogs: number;
  grossMarginPct: number;
  sellingExpenses: number;
  gaExpenses: number;
  otherExpenses: number;
}

export interface InvestmentCaseParameters {
  projectStart: number;
  startOfOperation: number;
  projectDuration: number;
  isSoftwareOnly: boolean;
  marketSize: number;
  marketGrowthRate: number;
  portfolioCoverage: number;
  visibility: number;
  visibilityGrowthRate: number;
  hitrate: number;
  gaExpensesPct: number;
  sellingExpensesPct: number;
  rdDepreciationYears: number;
  investDepreciationYears: number;
  wacc: number;
  inventoryDays: number;
  receivableDays: number;
  payableDays: number;
}

export interface InvestmentCaseData {
  parameters: InvestmentCaseParameters;
  yearData: InvestmentCaseYearData[];
  notes: string;
}

export function createDefaultInvestmentCase(): InvestmentCaseData {
  const currentYear = new Date().getFullYear();
  const duration = 6;
  const years: InvestmentCaseYearData[] = [];
  for (let i = 0; i <= duration + 4; i++) {
    years.push({
      year: currentYear + i,
      investmentExternal: 0,
      investmentInternal: 0,
      rdExternal: 0,
      rdInternal: 0,
      sales: 0,
      cogs: 0,
      grossMarginPct: 30,
      sellingExpenses: 0,
      gaExpenses: 0,
      otherExpenses: 0,
    });
  }
  return {
    parameters: {
      projectStart: currentYear,
      startOfOperation: currentYear + 1,
      projectDuration: duration,
      isSoftwareOnly: false,
      marketSize: 0,
      marketGrowthRate: 5,
      portfolioCoverage: 40,
      visibility: 50,
      visibilityGrowthRate: 5,
      hitrate: 30,
      gaExpensesPct: 10,
      sellingExpensesPct: 10,
      rdDepreciationYears: 6,
      investDepreciationYears: 10,
      wacc: 10,
      inventoryDays: 30,
      receivableDays: 45,
      payableDays: 30,
    },
    yearData: years,
    notes: "",
  };
}

export interface GateRecord {
  id: string;
  gate: "gate1" | "gate2" | "gate3";
  decision: GateDecision;
  comment: string;
  decider: string;
  date: string;
}

export interface PorterForce {
  intensity: number;
  description: string;
}

export interface PortersFiveForces {
  competitiveRivalry: PorterForce;
  threatOfNewEntrants: PorterForce;
  threatOfSubstitutes: PorterForce;
  bargainingPowerBuyers: PorterForce;
  bargainingPowerSuppliers: PorterForce;
  description: string;
  rationale: string;
}

export interface ValueChainStage {
  id: string;
  name: string;
  isOurPosition: boolean;
  marginAttractiveness: number;
  differentiators: string;
  dynamics: string;
}

export interface IndustryValueChain {
  stages: ValueChainStage[];
  description: string;
  rationale: string;
}

function createDefaultValueChainStages(): ValueChainStage[] {
  return [
    { id: "vc-1", name: "Raw Materials", isOurPosition: false, marginAttractiveness: 2, differentiators: "", dynamics: "" },
    { id: "vc-2", name: "Components / Manufacturing", isOurPosition: false, marginAttractiveness: 3, differentiators: "", dynamics: "" },
    { id: "vc-3", name: "Assembly / Integration", isOurPosition: false, marginAttractiveness: 3, differentiators: "", dynamics: "" },
    { id: "vc-4", name: "Distribution / Sales", isOurPosition: false, marginAttractiveness: 3, differentiators: "", dynamics: "" },
    { id: "vc-5", name: "After-Sales / Service", isOurPosition: false, marginAttractiveness: 4, differentiators: "", dynamics: "" },
  ];
}

export function createDefaultValueChain(): IndustryValueChain {
  return { stages: createDefaultValueChainStages(), description: "", rationale: "" };
}

export interface CustomerSegmentEntry {
  id: string;
  name: string;
  size: string;
  needs: string;
  willingnessToPay: string;
  priority: "high" | "medium" | "low";
}

export interface CompetitorAnalysisEntry {
  id: string;
  name: string;
  strengths: string;
  weaknesses: string;
  marketShare: string;
  strategy: string;
  threatLevel: number;
}

export interface CustomerInterviewEntry {
  id: string;
  date: string;
  customerName: string;
  role: string;
  keyInsights: string;
  painPoints: string;
  quotes: string;
}

export interface InternalInterviewEntry {
  id: string;
  date: string;
  intervieweeName: string;
  role: string;
  department: string;
  keyInsights: string;
  recommendations: string;
  quotes: string;
}

export interface MarketResearchData {
  secondaryResearch: string;
  primaryResearch: string;
  keyFigures: string;
  methodology: string;
  centralInsights: string;
  description: string;
  rationale: string;
}

export interface PositioningLandscapeEntry {
  id: string;
  name: string;
  isOurs: boolean;
  xValue: number;
  yValue: number;
}

export interface PositioningLandscapeData {
  xAxisLabel: string;
  yAxisLabel: string;
  entries: PositioningLandscapeEntry[];
  description: string;
  rationale: string;
}

export interface LeanCanvas {
  problem: string;
  solution: string;
  uniqueValueProposition: string;
  unfairAdvantage: string;
  customerSegments: string;
  keyMetrics: string;
  channels: string;
  costStructure: string;
  revenueStreams: string;
  description: string;
  rationale: string;
}

export interface ValuePropositionCanvas {
  customerJobs: string;
  customerPains: string;
  customerGains: string;
  productsServices: string;
  painRelievers: string;
  gainCreators: string;
  description: string;
  rationale: string;
}

export interface CustomerBenefitAnalysis {
  functionalBenefits: string;
  emotionalBenefits: string;
  socialBenefits: string;
  selfExpressiveBenefits: string;
  description: string;
  rationale: string;
}

export interface ThreeCircleModel {
  ourValue: string;
  competitorValue: string;
  customerNeeds: string;
  ourUnique: string;
  theirUnique: string;
  commonValue: string;
  unmetNeeds: string;
  description: string;
  rationale: string;
}

export interface PositioningStatement {
  targetAudience: string;
  category: string;
  keyBenefit: string;
  reasonToBelieve: string;
  competitiveAlternative: string;
  differentiator: string;
  statement: string;
  description: string;
  rationale: string;
}

export interface BusinessModelCanvas {
  valueProposition: string;
  customerSegments: string;
  channels: string;
  customerRelationships: string;
  revenueStreams: string;
  keyResources: string;
  keyActivities: string;
  keyPartners: string;
  costStructure: string;
  description: string;
  rationale: string;
}

// ═══ Strategic Analyses – grouped by TAM / SAM / SOM / Idea Scoring ═══

export interface IdeaScoringModels {
  ansoff: { position: string; description: string; rationale: string };
  bcg: { position: string; description: string; rationale: string };
  mckinsey: { position: string; description: string; rationale: string };
  threeHorizons: { horizon: string; description: string; rationale: string };
}

export interface TamModels {
  marketResearch?: MarketResearchData;
  pestel: {
    political: string; economic: string; social: string;
    technological: string; environmental: string; legal: string;
    description: string; rationale: string;
  };
  porter: PortersFiveForces;
  swot: {
    strengths: string; weaknesses: string; opportunities: string; threats: string;
    description: string; rationale: string;
  };
  valueChain?: IndustryValueChain;
}

export interface SamModels {
  customerSegmentation?: { entries: CustomerSegmentEntry[]; description: string; rationale: string };
  customerInterviewing?: { entries: CustomerInterviewEntry[]; description: string; rationale: string };
  internalAffiliateInterviews?: { entries: InternalInterviewEntry[]; description: string; rationale: string };
  internalBUInterviews?: { entries: InternalInterviewEntry[]; description: string; rationale: string };
  businessModelling?: BusinessModelCanvas;
  leanCanvas?: LeanCanvas;
}

export interface SomModels {
  competitorAnalysis?: { entries: CompetitorAnalysisEntry[]; description: string; rationale: string };
  valuePropositionCanvas?: ValuePropositionCanvas;
  customerBenefitAnalysis?: CustomerBenefitAnalysis;
  threeCircleModel?: ThreeCircleModel;
  positioningStatement?: PositioningStatement;
  positioningLandscape?: PositioningLandscapeData;
}

export interface StrategicAnalyses {
  ideaScoring: IdeaScoringModels;
  tam: TamModels;
  sam: SamModels;
  som: SomModels;
}

function createDefaultPorter(): PortersFiveForces {
  const force = (): PorterForce => ({ intensity: 3, description: "" });
  return {
    competitiveRivalry: force(),
    threatOfNewEntrants: force(),
    threatOfSubstitutes: force(),
    bargainingPowerBuyers: force(),
    bargainingPowerSuppliers: force(),
    description: "",
    rationale: "",
  };
}

export function createDefaultStrategicAnalyses(): StrategicAnalyses {
  return {
    ideaScoring: {
      ansoff: { position: "", description: "", rationale: "" },
      bcg: { position: "", description: "", rationale: "" },
      mckinsey: { position: "", description: "", rationale: "" },
      threeHorizons: { horizon: "", description: "", rationale: "" },
    },
    tam: {
      pestel: { political: "", economic: "", social: "", technological: "", environmental: "", legal: "", description: "", rationale: "" },
      porter: createDefaultPorter(),
      swot: { strengths: "", weaknesses: "", opportunities: "", threats: "", description: "", rationale: "" },
      valueChain: createDefaultValueChain(),
    },
    sam: {
      customerSegmentation: { entries: [], description: "", rationale: "" },
      customerInterviewing: { entries: [], description: "", rationale: "" },
      businessModelling: {
        valueProposition: "", customerSegments: "", channels: "", customerRelationships: "",
        revenueStreams: "", keyResources: "", keyActivities: "", keyPartners: "", costStructure: "",
        description: "", rationale: "",
      },
      leanCanvas: {
        problem: "", solution: "", uniqueValueProposition: "", unfairAdvantage: "",
        customerSegments: "", keyMetrics: "", channels: "", costStructure: "", revenueStreams: "",
        description: "", rationale: "",
      },
    },
    som: {
      valuePropositionCanvas: {
        customerJobs: "", customerPains: "", customerGains: "",
        productsServices: "", painRelievers: "", gainCreators: "",
        description: "", rationale: "",
      },
      customerBenefitAnalysis: {
        functionalBenefits: "", emotionalBenefits: "", socialBenefits: "", selfExpressiveBenefits: "",
        description: "", rationale: "",
      },
      threeCircleModel: {
        ourValue: "", competitorValue: "", customerNeeds: "",
        ourUnique: "", theirUnique: "", commonValue: "", unmetNeeds: "",
        description: "", rationale: "",
      },
      positioningStatement: {
        targetAudience: "", category: "", keyBenefit: "", reasonToBelieve: "",
        competitiveAlternative: "", differentiator: "", statement: "",
        description: "", rationale: "",
      },
      positioningLandscape: { xAxisLabel: "", yAxisLabel: "", entries: [], description: "", rationale: "" },
    },
  };
}

/** Migrate old flat StrategicAnalyses format to new grouped format */
export function migrateStrategicAnalyses(raw: any): StrategicAnalyses {
  if (!raw) return createDefaultStrategicAnalyses();
  // Already in new format
  if (raw.ideaScoring && raw.tam && raw.sam && raw.som) return raw as StrategicAnalyses;
  // Migrate from old flat format
  const defaults = createDefaultStrategicAnalyses();
  return {
    ideaScoring: {
      ansoff: raw.ansoff || defaults.ideaScoring.ansoff,
      bcg: raw.bcg || defaults.ideaScoring.bcg,
      mckinsey: raw.mckinsey || defaults.ideaScoring.mckinsey,
      threeHorizons: raw.threeHorizons || defaults.ideaScoring.threeHorizons,
    },
    tam: {
      marketResearch: raw.marketResearch,
      pestel: raw.pestel || defaults.tam.pestel,
      porter: raw.porter || defaults.tam.porter,
      swot: raw.swot || defaults.tam.swot,
      valueChain: raw.valueChain || defaults.tam.valueChain,
    },
    sam: {
      customerSegmentation: raw.customerSegmentation || defaults.sam.customerSegmentation,
      customerInterviewing: raw.customerInterviewing || defaults.sam.customerInterviewing,
      internalAffiliateInterviews: raw.internalAffiliateInterviews,
      internalBUInterviews: raw.internalBUInterviews,
      businessModelling: raw.businessModelling || defaults.sam.businessModelling,
      leanCanvas: raw.leanCanvas || defaults.sam.leanCanvas,
    },
    som: {
      competitorAnalysis: raw.competitorAnalysis,
      valuePropositionCanvas: raw.valuePropositionCanvas || defaults.som.valuePropositionCanvas,
      customerBenefitAnalysis: raw.customerBenefitAnalysis || defaults.som.customerBenefitAnalysis,
      threeCircleModel: raw.threeCircleModel || defaults.som.threeCircleModel,
      positioningStatement: raw.positioningStatement || defaults.som.positioningStatement,
      positioningLandscape: raw.positioningLandscape || defaults.som.positioningLandscape,
    },
  };
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface GoToMarketPlan {
  targetSegments: string;
  channels: string;
  launchDate: string;
  pricingStrategy: string;
  keyPartners: string;
  kpis: string;
  notes: string;
  checklist: ChecklistItem[];
  pilotAgreements?: PilotAgreement[];
  pilotNotes?: string;
  leadGeneration?: LeadGenerationData;
}

export interface ImplementReview {
  status: string;
  progressNotes: string;
  lessonsLearned: string;
  nextSteps: string;
  reviewDate: string;
  reviewOutcome: string;
  notes: string;
  checklist: ChecklistItem[];
}

export function createDefaultGoToMarketPlan(): GoToMarketPlan {
  return {
    targetSegments: "", channels: "", launchDate: "", pricingStrategy: "",
    keyPartners: "", kpis: "", notes: "", checklist: [],
  };
}

export function createDefaultImplementReview(): ImplementReview {
  return {
    status: "", progressNotes: "", lessonsLearned: "", nextSteps: "",
    reviewDate: "", reviewOutcome: "", notes: "", checklist: [],
  };
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  solutionDescription?: string;
  industry: string;
  geography: string;
  technology: string;
  owner: string;
  ideaBringer?: string;
  stage: Stage;
  scoring: Scoring;                                  // UI: Idea Scoring data
  businessPlan?: BusinessPlanData;                    // UI: Business Plan data
  investmentCase?: InvestmentCaseData;               // UI: Business Case (Investment Calculation)
  businessCase?: BusinessCase;                       // UI: Implementation and GTM Plan data
  strategicAnalyses?: StrategicAnalyses;
  goToMarketPlan?: GoToMarketPlan;
  implementReview?: ImplementReview;
  roughScoringAnswers?: Record<string, number>;
  roughScoringComments?: Record<string, string>;
  roughScoringSources?: Record<string, string[]>;
  gates: GateRecord[];
  createdAt: string;
}

export const SCORING_WEIGHTS: Record<keyof Scoring, number> = {
  marketAttractiveness: 3,
  strategicFit: 1,
  feasibility: 2,
  commercialViability: 2,
  risk: 1,
};

export function calculateTotalScore(scoring: Scoring): number {
  const entries = Object.entries(SCORING_WEIGHTS) as [keyof Scoring, number][];
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [key, weight] of entries) {
    const score = key === "risk" ? 6 - scoring[key].score : scoring[key].score;
    weightedSum += score * weight;
    totalWeight += weight;
  }
  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

export function createDefaultScoring(): Scoring {
  const makeCriterion = (id: string): ScoringCriterion => ({
    id,
    score: 3,
    comment: "",
  });
  return {
    marketAttractiveness: makeCriterion("marketAttractiveness"),
    strategicFit: makeCriterion("strategicFit"),
    feasibility: makeCriterion("feasibility"),
    commercialViability: makeCriterion("commercialViability"),
    risk: makeCriterion("risk"),
  };
}

export function createDefaultBusinessPlan(): BusinessPlanData {
  return {
    marketAttractiveness: {
      score: 3,
      analysis: {
        tam: "", tamDescription: "",
        tamProjections: [1,2,3,4,5].map((y) => ({ year: y, value: 0 })),
        sam: "", samDescription: "",
        samProjections: [1,2,3,4,5].map((y) => ({ year: y, value: 0 })),
        marketGrowthRate: "", targetCustomers: "", customerRelationship: "",
        customerSegments: [], competitors: "", competitivePosition: "",
        competitorEntries: [], geographicalRegions: [],
      },
    },
    strategicFit: { score: 3, details: "", alignmentDimensions: [], capabilityGaps: [] },
    feasibility: { score: 3, details: "", trl: 1, milestones: [] },
    commercialViability: {
      score: 3,
      details: "",
      pricingModel: "",
      unitPrice: 0,
      grossMargin: 0,
      projections: [
        { year: 1, revenue: 0, costs: 0 },
        { year: 2, revenue: 0, costs: 0 },
        { year: 3, revenue: 0, costs: 0 },
        { year: 4, revenue: 0, costs: 0 },
        { year: 5, revenue: 0, costs: 0 },
      ],
      breakEvenUnits: 0,
    },
    risk: { score: 3, details: "", riskItems: [] },
  };
}

/** @deprecated Use createDefaultBusinessPlan instead */
export function createDefaultDetailedScoring(): BusinessPlanData {
  return createDefaultBusinessPlan();
}

export function createDefaultBusinessCase(): BusinessCase {
  return {
    investmentCost: 0,
    expectedRevenue: 0,
    roi: 0,
    breakEvenMonths: 0,
    paybackPeriod: 0,
    npv: 0,
    notes: "",
  };
}

export const STAGE_ORDER: Stage[] = [
  "idea",
  "rough_scoring",
  "gate1",
  "business_plan",
  "gate2",
  "investment_case",
  "gate3",
  "business_case",
  "implement_review",
  "closed",
];
