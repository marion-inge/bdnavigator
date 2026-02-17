import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { calculateTotalScore, Stage, STAGE_ORDER } from "@/lib/types";
import { StageBadge } from "@/components/StageBadge";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { NewOpportunityDialog } from "@/components/NewOpportunityDialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, TrendingUp } from "lucide-react";

export default function Index() {
  const { opportunities } = useStore();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return opportunities
      .filter((o) => {
        const matchesSearch =
          !search ||
          o.title.toLowerCase().includes(search.toLowerCase()) ||
          o.market.toLowerCase().includes(search.toLowerCase()) ||
          o.owner.toLowerCase().includes(search.toLowerCase());
        const matchesStage = stageFilter === "all" || o.stage === stageFilter;
        return matchesSearch && matchesStage;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [opportunities, search, stageFilter]);

  const stageOptions: { value: string; label: string }[] = [
    { value: "all", label: t("allStages") },
    ...STAGE_ORDER.map((s) => ({ value: s, label: t(`stage_${s}` as any) })),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-card-foreground">{t("appTitle")}</h1>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitch />
            <NewOpportunityDialog />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">{t("noOpportunities")}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("title")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("market")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("owner")}
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("stage")}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("score")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((opp) => {
                  const score = calculateTotalScore(opp.scoring);
                  return (
                    <tr
                      key={opp.id}
                      onClick={() => navigate(`/opportunity/${opp.id}`)}
                      className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-card-foreground">{opp.title}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{opp.market || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{opp.owner || "—"}</td>
                      <td className="px-4 py-3">
                        <StageBadge stage={opp.stage} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-primary">{score.toFixed(1)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
