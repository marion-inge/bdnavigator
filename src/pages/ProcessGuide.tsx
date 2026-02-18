import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, BookOpen } from "lucide-react";

export default function ProcessGuide() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-card-foreground">{t("guideTitle")}</h1>
            </div>
          </div>
          <LanguageSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 space-y-10">
        {/* Stage Gate Process Overview */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t("guideProcessTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("guideProcessDesc")}</p>
          <StageFlowDiagram t={t} />
        </section>

        {/* Stages Detail */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t("guideStagesTitle")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {([
              { stage: "idea" as const, icon: "💡", descKey: "guideStage_idea" as const },
              { stage: "rough_scoring" as const, icon: "📊", descKey: "guideStage_rough_scoring" as const },
              { stage: "gate1" as const, icon: "🚪", descKey: "guideStage_gate1" as const },
              { stage: "detailed_scoring" as const, icon: "🔍", descKey: "guideStage_detailed_scoring" as const },
              { stage: "gate2" as const, icon: "🚪", descKey: "guideStage_gate2" as const },
              { stage: "business_case" as const, icon: "💼", descKey: "guideStage_business_case" as const },
              { stage: "gate3" as const, icon: "🚪", descKey: "guideStage_gate3" as const },
              { stage: "go_to_market" as const, icon: "🚀", descKey: "guideStage_go_to_market" as const },
            ] as const).map(({ stage, icon, descKey }) => (
              <Card key={stage}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{icon}</span> {t(`stage_${stage}`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t(descKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Scoring Categories */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t("guideScoringTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("guideScoringDesc")}</p>

          <Tabs defaultValue="marketAttractiveness" className="space-y-4">
            <TabsList className="flex-wrap h-auto gap-1 p-1">
              <TabsTrigger value="marketAttractiveness" className="text-xs sm:text-sm">{t("marketAttractiveness")}</TabsTrigger>
              <TabsTrigger value="strategicFit" className="text-xs sm:text-sm">{t("strategicFit")}</TabsTrigger>
              <TabsTrigger value="feasibility" className="text-xs sm:text-sm">{t("feasibility")}</TabsTrigger>
              <TabsTrigger value="commercialViability" className="text-xs sm:text-sm">{t("commercialViability")}</TabsTrigger>
              <TabsTrigger value="risk" className="text-xs sm:text-sm">{t("risk")}</TabsTrigger>
            </TabsList>

            <TabsContent value="marketAttractiveness">
              <ScoringCategoryDetail
                t={t}
                title={t("marketAttractiveness")}
                weight={3}
                description={t("guideMA_desc")}
                subcategories={[
                  { name: t("guideMA_sub1"), desc: t("guideMA_sub1_desc") },
                  { name: t("guideMA_sub2"), desc: t("guideMA_sub2_desc") },
                  { name: t("guideMA_sub3"), desc: t("guideMA_sub3_desc") },
                  { name: t("guideMA_sub4"), desc: t("guideMA_sub4_desc") },
                ]}
                scoringTable={[
                  { score: 1, label: t("guideMA_s1") },
                  { score: 2, label: t("guideMA_s2") },
                  { score: 3, label: t("guideMA_s3") },
                  { score: 4, label: t("guideMA_s4") },
                  { score: 5, label: t("guideMA_s5") },
                ]}
              />
            </TabsContent>

            <TabsContent value="strategicFit">
              <ScoringCategoryDetail
                t={t}
                title={t("strategicFit")}
                weight={3}
                description={t("guideSF_desc")}
                subcategories={[
                  { name: t("guideSF_sub1"), desc: t("guideSF_sub1_desc") },
                  { name: t("guideSF_sub2"), desc: t("guideSF_sub2_desc") },
                  { name: t("guideSF_sub3"), desc: t("guideSF_sub3_desc") },
                ]}
                scoringTable={[
                  { score: 1, label: t("guideSF_s1") },
                  { score: 2, label: t("guideSF_s2") },
                  { score: 3, label: t("guideSF_s3") },
                  { score: 4, label: t("guideSF_s4") },
                  { score: 5, label: t("guideSF_s5") },
                ]}
              />
            </TabsContent>

            <TabsContent value="feasibility">
              <ScoringCategoryDetail
                t={t}
                title={t("feasibility")}
                weight={2}
                description={t("guideFE_desc")}
                subcategories={[
                  { name: t("guideFE_sub1"), desc: t("guideFE_sub1_desc") },
                  { name: t("guideFE_sub2"), desc: t("guideFE_sub2_desc") },
                  { name: t("guideFE_sub3"), desc: t("guideFE_sub3_desc") },
                ]}
                scoringTable={[
                  { score: 1, label: t("guideFE_s1") },
                  { score: 2, label: t("guideFE_s2") },
                  { score: 3, label: t("guideFE_s3") },
                  { score: 4, label: t("guideFE_s4") },
                  { score: 5, label: t("guideFE_s5") },
                ]}
              />
            </TabsContent>

            <TabsContent value="commercialViability">
              <ScoringCategoryDetail
                t={t}
                title={t("commercialViability")}
                weight={2}
                description={t("guideCV_desc")}
                subcategories={[
                  { name: t("guideCV_sub1"), desc: t("guideCV_sub1_desc") },
                  { name: t("guideCV_sub2"), desc: t("guideCV_sub2_desc") },
                  { name: t("guideCV_sub3"), desc: t("guideCV_sub3_desc") },
                ]}
                scoringTable={[
                  { score: 1, label: t("guideCV_s1") },
                  { score: 2, label: t("guideCV_s2") },
                  { score: 3, label: t("guideCV_s3") },
                  { score: 4, label: t("guideCV_s4") },
                  { score: 5, label: t("guideCV_s5") },
                ]}
              />
            </TabsContent>

            <TabsContent value="risk">
              <ScoringCategoryDetail
                t={t}
                title={t("risk")}
                weight={1}
                description={t("guideRI_desc")}
                inverted
                subcategories={[
                  { name: t("guideRI_sub1"), desc: t("guideRI_sub1_desc") },
                  { name: t("guideRI_sub2"), desc: t("guideRI_sub2_desc") },
                  { name: t("guideRI_sub3"), desc: t("guideRI_sub3_desc") },
                ]}
                scoringTable={[
                  { score: 1, label: t("guideRI_s1") },
                  { score: 2, label: t("guideRI_s2") },
                  { score: 3, label: t("guideRI_s3") },
                  { score: 4, label: t("guideRI_s4") },
                  { score: 5, label: t("guideRI_s5") },
                ]}
              />
            </TabsContent>
          </Tabs>
        </section>

        {/* Strategic Analyses */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t("guideStrategicTitle")}</h2>
          <p className="text-muted-foreground leading-relaxed">{t("guideStrategicDesc")}</p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "ansoff", icon: "📐", title: t("saAnsoff"), desc: t("guideAnsoffDesc") },
              { key: "bcg", icon: "🐄", title: t("saBcg"), desc: t("guideBcgDesc") },
              { key: "mckinsey", icon: "📊", title: t("saMckinsey"), desc: t("guideMckinseyDesc") },
              { key: "swot", icon: "⚡", title: t("saSwot"), desc: t("guideSwotDesc") },
              { key: "pestel", icon: "🌍", title: t("saPestel"), desc: t("guidePestelDesc") },
              { key: "porter", icon: "⚔️", title: t("saPorter"), desc: t("guidePorterDesc") },
            ].map(({ key, icon, title, desc }) => (
              <Card key={key}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{icon}</span> {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Weighted Score Formula */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">{t("guideFormulaTitle")}</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">{t("guideFormulaDesc")}</p>
              <div className="rounded-lg bg-muted p-4 font-mono text-sm">
                Total = (MA×3 + SF×3 + FE×2 + CV×2 + (6−RI)×1) / 11
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("guideCategory")}</TableHead>
                    <TableHead className="text-center">{t("guideWeight")}</TableHead>
                    <TableHead>{t("guideNote")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { cat: t("marketAttractiveness"), w: 3, note: t("guideWeightNote_MA") },
                    { cat: t("strategicFit"), w: 3, note: t("guideWeightNote_SF") },
                    { cat: t("feasibility"), w: 2, note: t("guideWeightNote_FE") },
                    { cat: t("commercialViability"), w: 2, note: t("guideWeightNote_CV") },
                    { cat: t("risk"), w: 1, note: t("guideWeightNote_RI") },
                  ].map(({ cat, w, note }) => (
                    <TableRow key={cat}>
                      <TableCell className="font-medium">{cat}</TableCell>
                      <TableCell className="text-center">{w}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{note}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

/* Stage flow visual */
function StageFlowDiagram({ t }: { t: (k: string) => string }) {
  const stages = [
    { key: "idea", color: "bg-blue-500" },
    { key: "rough_scoring", color: "bg-indigo-500" },
    { key: "gate1", color: "bg-amber-500" },
    { key: "detailed_scoring", color: "bg-purple-500" },
    { key: "gate2", color: "bg-amber-500" },
    { key: "business_case", color: "bg-teal-500" },
    { key: "gate3", color: "bg-amber-500" },
    { key: "go_to_market", color: "bg-green-500" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {stages.map(({ key, color }, i) => (
        <div key={key} className="flex items-center gap-2">
          <div className={`${color} text-white text-xs font-medium px-3 py-2 rounded-md whitespace-nowrap`}>
            {t(`stage_${key}`)}
          </div>
          {i < stages.length - 1 && <span className="text-muted-foreground text-lg">→</span>}
        </div>
      ))}
    </div>
  );
}

/* Reusable scoring category detail with table */
function ScoringCategoryDetail({
  t,
  title,
  weight,
  description,
  subcategories,
  scoringTable,
  inverted,
}: {
  t: (k: string) => string;
  title: string;
  weight: number;
  description: string;
  subcategories: { name: string; desc: string }[];
  scoringTable: { score: number; label: string }[];
  inverted?: boolean;
}) {
  const scoreColors = inverted
    ? ["bg-green-500/20 text-green-700", "bg-green-500/10 text-green-600", "bg-yellow-500/15 text-yellow-700", "bg-orange-500/15 text-orange-700", "bg-red-500/20 text-red-700"]
    : ["bg-red-500/20 text-red-700", "bg-orange-500/15 text-orange-700", "bg-yellow-500/15 text-yellow-700", "bg-green-500/10 text-green-600", "bg-green-500/20 text-green-700"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm font-normal text-muted-foreground">{t("guideWeight")}: {weight}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

        {subcategories.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">{t("guideSubcategories")}</h4>
            <div className="space-y-2">
              {subcategories.map(({ name, desc }) => (
                <div key={name} className="rounded-md border border-border p-3">
                  <span className="font-medium text-sm">{name}</span>
                  <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold mb-3">{t("guideScoringTable")}</h4>
          {inverted && (
            <p className="text-xs text-muted-foreground mb-2 italic">{t("guideRiskInverted")}</p>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20 text-center">{t("score")}</TableHead>
                <TableHead>{t("guideDefinition")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scoringTable.map(({ score, label }, i) => (
                <TableRow key={score}>
                  <TableCell className="text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${scoreColors[i]}`}>
                      {score}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{label}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
