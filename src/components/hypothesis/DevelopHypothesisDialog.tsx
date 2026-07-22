import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { invokeFunction } from "@/lib/backendAdapter";
import { ALL_SCAN_KEYS, ScanKey, HypothesisData, mergeHypothesisDraft, createDefaultHypothesis } from "@/lib/hypothesisTypes";
import { toast } from "sonner";
import idaRobot from "@/assets/ida-robot.png";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  opportunityId: string;
  existing?: HypothesisData;
  onDrafted: (h: HypothesisData) => void;
}

const SCAN_LABELS: Record<ScanKey, { en: string; de: string; desc: { en: string; de: string } }> = {
  industry:         { en: "Industry Scan",         de: "Branchen-Scan",         desc: { en: "Study purpose, segments, geography, outputs.", de: "Studienzweck, Segmente, Geografie, Outputs." } },
  customer:         { en: "Customer Scan",         de: "Kunden-Scan",           desc: { en: "Products, use cases, target market, tiers.", de: "Produkte, Anwendungsfälle, Zielmarkt, Tiers." } },
  competitor:       { en: "Competitor Scan",       de: "Wettbewerber-Scan",     desc: { en: "Known competitors, benchmark criteria, frameworks.", de: "Bekannte Wettbewerber, Benchmark-Kriterien, Frameworks." } },
  market_potential: { en: "Market Potential Scan", de: "Marktpotenzial-Scan",   desc: { en: "Pricing, units, win-rate & adoption assumptions.", de: "Preise, Stückzahlen, Gewinnraten- & Adoption-Annahmen." } },
  buying_center:    { en: "Buying Center Scan",    de: "Buying-Center-Scan",    desc: { en: "Seed input, shortlist rule, depth of mapping.", de: "Seed-Input, Shortlist-Regel, Mapping-Tiefe." } },
};

export function DevelopHypothesisDialog({ open, onOpenChange, opportunityId, existing, onDrafted }: Props) {
  const { language } = useI18n();
  const [selected, setSelected] = useState<Set<ScanKey>>(
    new Set(existing?.selectedScans ?? ALL_SCAN_KEYS),
  );
  const [overwrite, setOverwrite] = useState(false);
  const [running, setRunning] = useState(false);

  const toggle = (k: ScanKey) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const run = async () => {
    const scans = Array.from(selected);
    if (scans.length === 0) return;
    setRunning(true);
    try {
      const { data, error } = await invokeFunction("hypothesis-draft", {
        opportunityId,
        selectedScans: scans,
        language,
      });
      if (error || !data || (data as any).error) {
        const msg = (error as any)?.message || (data as any)?.error || "Unknown error";
        toast.error(language === "de" ? `IDA-Fehler: ${msg}` : `IDA error: ${msg}`);
        return;
      }
      const base = existing ?? createDefaultHypothesis();
      const merged = mergeHypothesisDraft(
        { ...base, selectedScans: Array.from(new Set([...(base.selectedScans || []), ...scans])) },
        data as Partial<HypothesisData>,
        overwrite,
      );
      onDrafted(merged);
      toast.success(language === "de" ? "Hypothese entworfen" : "Hypothesis drafted");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <img src={idaRobot} alt="" className="h-5 w-5" />
            {language === "de" ? "Hypothese mit IDA entwickeln" : "Develop Hypothesis with IDA"}
          </DialogTitle>
          <DialogDescription>
            {language === "de"
              ? "IDA nutzt die Idee und die Fragebogen-Antworten, um die Input-Sheets für die ausgewählten Scans vorzubefüllen. Fehlende Fakten bleiben leer und müssen manuell ergänzt werden."
              : "IDA uses the idea and questionnaire answers to pre-fill the input sheets for the selected scans. Missing facts stay empty for you to fill in."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-1">
          {ALL_SCAN_KEYS.map((k) => {
            const info = SCAN_LABELS[k];
            const label = language === "de" ? info.de : info.en;
            const desc = language === "de" ? info.desc.de : info.desc.en;
            return (
              <label key={k} className="flex items-start gap-2 p-2 rounded border border-border hover:bg-muted/40 cursor-pointer">
                <Checkbox checked={selected.has(k)} onCheckedChange={() => toggle(k)} className="mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </label>
            );
          })}
          <label className="flex items-center gap-2 pt-2 text-xs text-muted-foreground cursor-pointer">
            <Checkbox checked={overwrite} onCheckedChange={(v) => setOverwrite(!!v)} />
            {language === "de"
              ? "Bestehende Eingaben mit dem KI-Entwurf überschreiben"
              : "Overwrite existing entries with the AI draft"}
          </label>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={running}>
            {language === "de" ? "Abbrechen" : "Cancel"}
          </Button>
          <Button onClick={run} disabled={selected.size === 0 || running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <img src={idaRobot} alt="" className="h-4 w-4" />}
            {running
              ? (language === "de" ? "IDA arbeitet..." : "IDA is drafting...")
              : (language === "de" ? "Entwurf erstellen" : "Draft with IDA")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
