import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import idaRobot from "@/assets/ida-robot.png";
import { DetailedScoring, StrategicAnalyses } from "@/lib/types";
import { createDefaultSamOverview, createDefaultSomOverview } from "@/lib/businessPlanTypes";

interface Rec { field: string; label: string; type: "text" | "number"; proposedValue: string; rationale: string }

interface Props {
  scoring: DetailedScoring;
  analyses: StrategicAnalyses;
  onSaveDetailed: (d: DetailedScoring) => void;
  onNavigateTamSamSom?: () => void;
  readonly?: boolean;
}

function getCurrent(scoring: any, field: string): string {
  const sam = scoring.samOverview || {};
  const som = scoring.somOverview || {};
  if (field.startsWith("som.projection.")) {
    const y = Number(field.split(".")[2]);
    return String(som.projections?.find((p: any) => p.year === y)?.value ?? "");
  }
  const [grp, k] = field.split(".");
  const v = (grp === "sam" ? sam : som)[k];
  return v == null ? "" : String(v);
}

export function IdaCalibrationPanel({ scoring, analyses, onSaveDetailed, onNavigateTamSamSom, readonly }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => (language === "de" ? de : en);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [recs, setRecs] = useState<Rec[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const run = async () => {
    setLoading(true);
    try {
      const sam: any = analyses.sam || {};
      const evidence = {
        customerInterviews: sam.customerInterviewing,
        affiliateInterviews: sam.internalAffiliateInterviews,
        buInterviews: sam.internalBUInterviews,
        pilotsAndLeads: scoring.pilotCustomer,
      };
      const s: any = scoring;
      const { data, error } = await supabase.functions.invoke("ida-verification-calibration", {
        body: { language, evidence, current: { samOverview: s.samOverview, somOverview: s.somOverview } },
      });
      if (error || data?.error) throw new Error(data?.error || error?.message || "IDA failed");
      setSummary(data.summary || "");
      setRecs(data.recommendations || []);
      setSelected(Object.fromEntries((data.recommendations || []).map((_: any, i: number) => [i, true])));
      if (!data.recommendations?.length) toast.info(bp("No adjustments recommended.", "Keine Anpassungen empfohlen."));
    } catch (e: any) {
      toast.error(e.message || "IDA failed");
    } finally {
      setLoading(false);
    }
  };

  const apply = () => {
    const s: any = scoring;
    const sam: any = { ...createDefaultSamOverview(), ...(s.samOverview || {}) };
    const som: any = { ...createDefaultSomOverview(), ...(s.somOverview || {}) };
    som.projections = [...(som.projections || [])];
    let n = 0;
    recs.forEach((r, i) => {
      if (!selected[i]) return;
      const num = parseFloat(String(r.proposedValue).replace(/[^\d.,-]/g, "").replace(",", "."));
      const val = r.type === "number" ? (isNaN(num) ? undefined : num) : r.proposedValue;
      if (val === undefined) return;
      if (r.field.startsWith("som.projection.")) {
        const y = Number(r.field.split(".")[2]);
        const idx = som.projections.findIndex((p: any) => p.year === y);
        if (idx >= 0) som.projections[idx] = { ...som.projections[idx], value: val };
        else som.projections.push({ year: y, value: val });
      } else {
        const [grp, k] = r.field.split(".");
        (grp === "sam" ? sam : som)[k] = val;
      }
      n++;
    });
    if (!n) return;
    onSaveDetailed({ ...scoring, samOverview: sam, somOverview: som } as any);
    toast.success(bp(`${n} adjustment(s) applied to TAM SAM SOM`, `${n} Anpassung(en) in TAM SAM SOM übernommen`));
    setRecs(recs.filter((_, i) => !selected[i]));
    setSelected({});
  };

  return (
    <Card className="border-primary/40">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-lg">{bp("Verification Impact on TAM SAM SOM", "Auswirkung der Verifizierung auf TAM SAM SOM")}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {bp("IDA compares interview and pilot findings with your SAM/SOM assumptions and recommends adjustments you can apply directly.",
                "IDA vergleicht Interview- und Pilot-Erkenntnisse mit Ihren SAM/SOM-Annahmen und empfiehlt Anpassungen, die Sie direkt übernehmen können.")}
          </p>
        </div>
        <div className="flex gap-2">
          {onNavigateTamSamSom && (
            <Button variant="outline" size="sm" onClick={onNavigateTamSamSom}>{bp("Open TAM SAM SOM", "TAM SAM SOM öffnen")}</Button>
          )}
          <Button size="sm" onClick={run} disabled={loading || readonly} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <img src={idaRobot} alt="" className="h-4 w-4" />}
            {loading ? bp("IDA is analyzing...", "IDA analysiert...") : bp("Ask IDA for adjustments", "IDA Anpassungen empfehlen lassen")}
          </Button>
        </div>
      </CardHeader>
      {(summary || recs.length > 0) && (
        <CardContent className="space-y-4">
          {summary && <p className="text-sm">{summary}</p>}
          {recs.map((r, i) => (
            <div key={i} className="rounded-md border p-3 space-y-2">
              <label className="flex items-center gap-2 font-medium">
                <Checkbox checked={!!selected[i]} onCheckedChange={(v) => setSelected({ ...selected, [i]: !!v })} />
                {r.label} <span className="text-xs text-muted-foreground">({r.field.startsWith("sam") ? "SAM" : "SOM"})</span>
              </label>
              <div className="grid gap-2 md:grid-cols-2 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">{bp("Current", "Aktuell")}</div>
                  <div className="whitespace-pre-wrap rounded bg-muted p-2 min-h-[2.5rem]">{getCurrent(scoring, r.field) || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{bp("Proposed (editable)", "Vorschlag (bearbeitbar)")}</div>
                  <Textarea rows={r.type === "number" ? 1 : 3} value={r.proposedValue}
                    onChange={(e) => setRecs(recs.map((x, j) => (j === i ? { ...x, proposedValue: e.target.value } : x)))} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{r.rationale}</p>
            </div>
          ))}
          {recs.length > 0 && (
            <Button onClick={apply} disabled={readonly || !Object.values(selected).some(Boolean)}>
              {bp("Apply selected to TAM SAM SOM", "Ausgewählte in TAM SAM SOM übernehmen")}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
