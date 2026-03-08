import { useI18n } from "@/lib/i18n";
import { DetailedScoring, StrategicAnalyses, createDefaultDetailedScoring, createDefaultStrategicAnalyses } from "@/lib/types";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CombinedOverview } from "./CombinedOverview";
import { TamOverview } from "./TamOverview";
import { SamOverview } from "./SamOverview";
import { SomOverview } from "./SomOverview";
import { StrategicFitTab } from "@/components/detailed-scoring/StrategicFitTab";
import { PortfolioFitTab } from "@/components/detailed-scoring/PortfolioFitTab";
import { FeasibilityTab } from "@/components/detailed-scoring/FeasibilityTab";
import { OrganisationalReadinessTab } from "@/components/detailed-scoring/OrganisationalReadinessTab";
import { RiskTab } from "@/components/detailed-scoring/RiskTab";
import { CustomerLandscapeTab } from "@/components/detailed-scoring/CustomerLandscapeTab";
import { CompetitorLandscapeTab } from "@/components/detailed-scoring/CompetitorLandscapeTab";
import { CommercialViabilityTab } from "@/components/detailed-scoring/CommercialViabilityTab";
import { PilotCustomerTab } from "@/components/detailed-scoring/PilotCustomerTab";
import { MarketAttractivenessTab } from "@/components/detailed-scoring/MarketAttractivenessTab";
import { Globe, Target, TrendingUp, BarChart3, FolderOpen, ExternalLink } from "lucide-react";

export type StrategicAnalysisTab = string;

interface Props {
  detailedScoring?: DetailedScoring;
  strategicAnalyses?: StrategicAnalyses;
  onSaveDetailed: (ds: DetailedScoring) => void;
  onSaveStrategic: (sa: StrategicAnalyses) => void;
  readonly?: boolean;
  onNavigateToAnalysis?: (analysisTab: StrategicAnalysisTab) => void;
}

function ModelLinkCard({ name, description, tabKey, onNavigate, icon }: {
  name: string; description: string; tabKey: string; onNavigate?: (tab: string) => void; icon?: string;
}) {
  return (
    <div className="rounded-lg border border-border p-3 flex items-center justify-between gap-3 hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground">{icon && <span className="mr-1.5">{icon}</span>}{name}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      </div>
      {onNavigate && (
        <Button size="sm" variant="outline" onClick={() => onNavigate(tabKey)} className="shrink-0 gap-1">
          <ExternalLink className="h-3 w-3" />
          Open
        </Button>
      )}
    </div>
  );
}

export function BusinessPlanSection({ detailedScoring, strategicAnalyses, onSaveDetailed, onSaveStrategic, readonly, onNavigateToAnalysis }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  const [scoring, setScoring] = useState<DetailedScoring>(detailedScoring || createDefaultDetailedScoring());

  const handleUpdateScoring = (updated: DetailedScoring) => {
    setScoring(updated);
    onSaveDetailed(updated);
  };

  return (
    <Tabs defaultValue="combined" className="space-y-6">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="combined" className="text-xs sm:text-sm gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          {bp("Overview", "Übersicht")}
        </TabsTrigger>
        <TabsTrigger value="tam" className="text-xs sm:text-sm gap-1.5">
          <Globe className="h-3.5 w-3.5" />
          TAM
        </TabsTrigger>
        <TabsTrigger value="sam" className="text-xs sm:text-sm gap-1.5">
          <Target className="h-3.5 w-3.5" />
          SAM
        </TabsTrigger>
        <TabsTrigger value="som" className="text-xs sm:text-sm gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          SOM
        </TabsTrigger>
        <TabsTrigger value="others" className="text-xs sm:text-sm gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" />
          {bp("Others", "Sonstige")}
        </TabsTrigger>
      </TabsList>

      {/* Combined Overview */}
      <TabsContent value="combined">
        <CombinedOverview scoring={scoring} />
      </TabsContent>

      {/* TAM Section */}
      <TabsContent value="tam">
        <Tabs defaultValue="tam-overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="tam-overview" className="text-xs">{bp("Overview", "Übersicht")}</TabsTrigger>
            <TabsTrigger value="tam-market" className="text-xs">{bp("Market Data", "Marktdaten")}</TabsTrigger>
            <TabsTrigger value="tam-pestel" className="text-xs">PESTEL</TabsTrigger>
            <TabsTrigger value="tam-valuechain" className="text-xs">{bp("Value Chain", "Wertschöpfungskette")}</TabsTrigger>
            <TabsTrigger value="tam-porter" className="text-xs">Porter's</TabsTrigger>
            <TabsTrigger value="tam-swot" className="text-xs">SWOT</TabsTrigger>
          </TabsList>
          <TabsContent value="tam-overview">
            <TamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="tam-market">
            <MarketAttractivenessTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="tam-pestel">
            <ModelLinkCard name="PESTEL" description={bp("Political, economic, social, technological, environmental, legal factors affecting the total market.", "Politische, ökonomische, soziale, technologische, ökologische, rechtliche Faktoren.")} tabKey="pestel" onNavigate={onNavigateToAnalysis} icon="🏛️" />
          </TabsContent>
          <TabsContent value="tam-valuechain">
            <ModelLinkCard name={bp("Industry Value Chain", "Branchen-Wertschöpfungskette")} description={bp("Position in the value chain, relevant actors, margin attractiveness.", "Position in der Wertschöpfungskette, relevante Akteure, Margenattraktivität.")} tabKey="valueChain" onNavigate={onNavigateToAnalysis} icon="🔗" />
          </TabsContent>
          <TabsContent value="tam-porter">
            <ModelLinkCard name="Porter's Five Forces" description={bp("Competitive rivalry, threat of new entrants/substitutes, bargaining power of buyers/suppliers.", "Wettbewerbsrivalität, Bedrohung durch neue Marktteilnehmer/Substitute, Verhandlungsmacht.")} tabKey="porter" onNavigate={onNavigateToAnalysis} icon="⚔️" />
          </TabsContent>
          <TabsContent value="tam-swot">
            <ModelLinkCard name="SWOT" description={bp("Strengths/weaknesses to address the total market, opportunities/risks from market development.", "Stärken/Schwächen zur Adressierung des Gesamtmarktes, Chancen/Risiken aus der Marktentwicklung.")} tabKey="swot" onNavigate={onNavigateToAnalysis} icon="📊" />
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* SAM Section */}
      <TabsContent value="sam">
        <Tabs defaultValue="sam-overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="sam-overview" className="text-xs">{bp("Overview", "Übersicht")}</TabsTrigger>
            <TabsTrigger value="sam-customers" className="text-xs">{bp("Customer Landscape", "Kundenlandschaft")}</TabsTrigger>
            <TabsTrigger value="sam-strategic" className="text-xs">{bp("Strategic Fit", "Strateg. Fit")}</TabsTrigger>
            <TabsTrigger value="sam-portfolio" className="text-xs">{bp("Portfolio Fit", "Portfolio Fit")}</TabsTrigger>
            <TabsTrigger value="sam-feasibility" className="text-xs">{bp("Feasibility", "Machbarkeit")}</TabsTrigger>
            <TabsTrigger value="sam-org" className="text-xs">{bp("Org Readiness", "Org. Readiness")}</TabsTrigger>
            <TabsTrigger value="sam-risk" className="text-xs">{bp("Risk", "Risiko")}</TabsTrigger>
            <TabsTrigger value="sam-models" className="text-xs">{bp("Models", "Modelle")}</TabsTrigger>
          </TabsList>
          <TabsContent value="sam-overview">
            <SamOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-customers">
            <CustomerLandscapeTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-strategic">
            <StrategicFitTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-portfolio">
            <PortfolioFitTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-feasibility">
            <FeasibilityTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-org">
            <OrganisationalReadinessTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-risk">
            <RiskTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="sam-models">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">{bp("SAM Supporting Models", "SAM-Unterstützende Modelle")}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                <ModelLinkCard name={bp("Customer Segmentation", "Kundensegmentierung")} description={bp("Segmentation by customer groups, use cases, size, maturity.", "Segmentierung nach Kundengruppen, Use Cases, Größe, Reifegrad.")} tabKey="custSeg" onNavigate={onNavigateToAnalysis} icon="👥" />
                <ModelLinkCard name={bp("Customer Interviews", "Kundeninterviews")} description={bp("Interview guides, key quotes, insights, quantified hypotheses.", "Interviewleitfäden, zentrale Zitate, Insights, quantifizierte Hypothesen.")} tabKey="custInt" onNavigate={onNavigateToAnalysis} icon="🎤" />
                <ModelLinkCard name={bp("Business Model Canvas", "Business Model Canvas")} description={bp("Full business model canvas for the serviceable market.", "Vollständiges Business Model Canvas für den adressierbaren Markt.")} tabKey="bizModel" onNavigate={onNavigateToAnalysis} icon="📐" />
                <ModelLinkCard name="Lean Canvas" description={bp("Problem-solution fit focused template for the SAM.", "Problem-Solution-Fit-Template für den SAM.")} tabKey="leanCanvas" onNavigate={onNavigateToAnalysis} icon="📝" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* SOM Section */}
      <TabsContent value="som">
        <Tabs defaultValue="som-overview" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="som-overview" className="text-xs">{bp("Overview", "Übersicht")}</TabsTrigger>
            <TabsTrigger value="som-competitor" className="text-xs">{bp("Competitors", "Wettbewerb")}</TabsTrigger>
            <TabsTrigger value="som-pricing" className="text-xs">{bp("Pricing", "Pricing")}</TabsTrigger>
            <TabsTrigger value="som-pilot" className="text-xs">{bp("Pilot & Leads", "Pilot & Leads")}</TabsTrigger>
            <TabsTrigger value="som-models" className="text-xs">{bp("Models", "Modelle")}</TabsTrigger>
          </TabsList>
          <TabsContent value="som-overview">
            <SomOverview scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-competitor">
            <CompetitorLandscapeTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-pricing">
            <CommercialViabilityTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-pilot">
            <PilotCustomerTab scoring={scoring} onUpdate={handleUpdateScoring} readonly={readonly} />
          </TabsContent>
          <TabsContent value="som-models">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">{bp("SOM Supporting Models", "SOM-Unterstützende Modelle")}</h3>
              <div className="grid gap-2 md:grid-cols-2">
                <ModelLinkCard name={bp("Value Proposition Canvas", "Value Proposition Canvas")} description={bp("Customer jobs, pains, gains vs. our value profile.", "Kundenaufgaben, Pains, Gains vs. unser Wertprofil.")} tabKey="vpc" onNavigate={onNavigateToAnalysis} icon="💎" />
                <ModelLinkCard name={bp("Customer Benefit Analysis", "Kundennutzenanalyse")} description={bp("Functional, emotional, social, self-expressive benefits.", "Funktionaler, emotionaler, sozialer, selbstdarstellender Nutzen.")} tabKey="cba" onNavigate={onNavigateToAnalysis} icon="🎯" />
                <ModelLinkCard name={bp("Three Circle Model", "Drei-Kreise-Modell")} description={bp("Our value vs. competitor value vs. customer needs — differentiation.", "Unser Wert vs. Wettbewerberwert vs. Kundenbedürfnisse — Differenzierung.")} tabKey="tcm" onNavigate={onNavigateToAnalysis} icon="⭕" />
                <ModelLinkCard name={bp("Positioning Statement", "Positionierungsaussage")} description={bp("Target audience, category, key benefit, differentiator.", "Zielgruppe, Kategorie, Hauptnutzen, Differenzierung.")} tabKey="positioning" onNavigate={onNavigateToAnalysis} icon="📍" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </TabsContent>

      {/* Others */}
      <TabsContent value="others">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">{bp("Other Strategic Models", "Sonstige strategische Modelle")}</h2>
            <p className="text-sm text-muted-foreground">{bp("Strategic frameworks not directly assignable to TAM, SAM, or SOM.", "Strategische Frameworks, die nicht direkt TAM, SAM oder SOM zuordenbar sind.")}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <ModelLinkCard name={bp("Ansoff Matrix", "Ansoff-Matrix")} description={bp("Growth strategy classification: market penetration, product/market development, diversification.", "Wachstumsstrategien: Marktdurchdringung, Produkt-/Marktentwicklung, Diversifikation.")} tabKey="ansoff" onNavigate={onNavigateToAnalysis} icon="📊" />
            <ModelLinkCard name={bp("BCG Matrix", "BCG-Matrix")} description={bp("Portfolio analysis by market share and growth rate: Star, Cash Cow, Question Mark, Dog.", "Portfolio-Analyse nach Marktanteil und Wachstum: Star, Cash Cow, Fragezeichen, Armer Hund.")} tabKey="bcg" onNavigate={onNavigateToAnalysis} icon="⭐" />
            <ModelLinkCard name={bp("McKinsey Matrix", "McKinsey-Matrix")} description={bp("9-cell matrix: industry attractiveness vs. competitive strength.", "9-Felder-Matrix: Branchenattraktivität vs. Wettbewerbsstärke.")} tabKey="mckinsey" onNavigate={onNavigateToAnalysis} icon="📈" />
            <ModelLinkCard name={bp("3 Horizons of Growth", "3 Horizonte des Wachstums")} description={bp("Horizon 1 (core), Horizon 2 (emerging), Horizon 3 (future) classification.", "Horizont 1 (Kern), Horizont 2 (aufstrebend), Horizont 3 (Zukunft) Einordnung.")} tabKey="threeHorizons" onNavigate={onNavigateToAnalysis} icon="🌅" />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
