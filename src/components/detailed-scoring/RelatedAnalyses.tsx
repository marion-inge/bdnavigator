import { useI18n } from "@/lib/i18n";
import { ExternalLink } from "lucide-react";
import type { TranslationKey } from "@/lib/i18n";

// Strategic analysis tab keys used in StrategicAnalysesSection
export type StrategicAnalysisTab =
  | "ansoff" | "bcg" | "mckinsey" | "swot" | "pestel" | "porter"
  | "valueChain" | "custSeg" | "compAnalysis" | "custInt"
  | "bizModel" | "leanCanvas" | "vpc" | "cba" | "tcm" | "positioning"
  | "threeHorizons";

interface AnalysisLink {
  tab: StrategicAnalysisTab;
  labelKey: TranslationKey;
}

// Mapping: which strategic analyses are relevant for each detailed scoring tab
export const ANALYSIS_MAPPING: Record<string, AnalysisLink[]> = {
  market: [
    { tab: "pestel", labelKey: "saPestel" },
    { tab: "porter", labelKey: "saPorter" },
    { tab: "tcm", labelKey: "saTcm" },
  ],
  customer: [
    { tab: "custSeg", labelKey: "saCustSeg" },
    { tab: "custInt", labelKey: "saCustInt" },
    { tab: "vpc", labelKey: "saVpc" },
    { tab: "cba", labelKey: "saCba" },
  ],
  competitor: [
    { tab: "compAnalysis", labelKey: "saCompAnalysis" },
    { tab: "porter", labelKey: "saPorter" },
    { tab: "tcm", labelKey: "saTcm" },
    { tab: "positioning", labelKey: "saPos" },
  ],
  strategic: [
    { tab: "ansoff", labelKey: "saAnsoff" },
    { tab: "bcg", labelKey: "saBcg" },
    { tab: "mckinsey", labelKey: "saMckinsey" },
    { tab: "swot", labelKey: "saSwot" },
    { tab: "valueChain", labelKey: "saValueChain" },
  ],
  feasibility: [
    { tab: "valueChain", labelKey: "saValueChain" },
    { tab: "swot", labelKey: "saSwot" },
  ],
  commercial: [
    { tab: "bizModel", labelKey: "saBizModel" },
    { tab: "leanCanvas", labelKey: "saLeanCanvas" },
    { tab: "vpc", labelKey: "saVpc" },
  ],
  risk: [
    { tab: "pestel", labelKey: "saPestel" },
    { tab: "swot", labelKey: "saSwot" },
    { tab: "porter", labelKey: "saPorter" },
  ],
  orgReadiness: [
    { tab: "swot", labelKey: "saSwot" },
    { tab: "valueChain", labelKey: "saValueChain" },
  ],
};

interface Props {
  scoringTab: string;
  onNavigate?: (analysisTab: StrategicAnalysisTab) => void;
}

export function RelatedAnalyses({ scoringTab, onNavigate }: Props) {
  const { t } = useI18n();
  const links = ANALYSIS_MAPPING[scoringTab];

  if (!links || links.length === 0 || !onNavigate) return null;

  return (
    <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5 shrink-0">
        <ExternalLink className="h-3.5 w-3.5" />
        {t("dsRelatedAnalyses")}:
      </span>
      <div className="flex items-center gap-1.5 flex-wrap">
        {links.map(({ tab, labelKey }) => (
          <button
            key={tab}
            onClick={() => onNavigate(tab)}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
