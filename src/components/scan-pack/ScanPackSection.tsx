import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  ClipboardCopy, Upload, Trash2, Download, AlertTriangle, CheckCircle2, Circle, Loader2, FileText, Link2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import type { Opportunity } from "@/lib/types";
import {
  ScanPackData, ScanPackKey, ScanStatus, SCAN_PACK_KEYS, SCAN_ORDER_BADGE,
  SCAN_RECOMMENDED_PREDECESSORS, createDefaultScanPack, autoUpgradeStatuses,
  ScanCardState, ScanFileMeta, NON_ASSEMBLER_KEYS,
} from "@/lib/scanPackTypes";
import { formatIntake } from "@/lib/scanPackIntake";


interface Props {
  opportunity: Opportunity;
  onSave: (pack: ScanPackData) => void;
  readonly?: boolean;
}

const BUCKET = "scan-deliverables";
const ACCEPT = ".xlsx,.docx,.pdf,.html,.htm,.zip";

interface ScanMeta {
  key: ScanPackKey;
  name: { en: string; de: string };
  description: { en: string; de: string };
  deliverables: { en: string; de: string };
}

const SCANS: ScanMeta[] = [
  {
    key: "industry",
    name: { en: "Industry Study", de: "Industriestudie" },
    description: {
      en: "Maps the target industry's full value chain with named players per segment. Run FIRST in a new industry.",
      de: "Kartiert die gesamte Wertschöpfungskette der Zielindustrie mit namentlichen Playern je Segment. Startpunkt in einer neuen Industrie.",
    },
    deliverables: {
      en: "Word study (40–80pp), Excel player database, interactive Value Chain Map, optional slide deck.",
      de: "Word-Studie (40–80 S.), Excel-Player-Datenbank, interaktive Value-Chain-Map, optionales Foliendeck.",
    },
  },
  {
    key: "customer",
    name: { en: "Customer Scan", de: "Customer Scan" },
    description: {
      en: "Discovers, verifies and tier-ranks potential customers (A–E). Uses the Industry Study player DB as seed.",
      de: "Identifiziert, verifiziert und tiert potenzielle Kunden (A–E). Nutzt die Player-DB der Industriestudie als Seed.",
    },
    deliverables: {
      en: "PDF report + Excel customer database.",
      de: "PDF-Bericht + Excel-Kundendatenbank.",
    },
  },
  {
    key: "competitor",
    name: { en: "Competitor Scan", de: "Competitor Scan" },
    description: {
      en: "Identifies and benchmarks competitors vs. our offering; share estimates, trends, five strategy frameworks.",
      de: "Identifiziert und benchmarkt Wettbewerber gegen unser Angebot; Marktanteile, Trends, fünf Strategie-Frameworks.",
    },
    deliverables: {
      en: "Word overview + Excel database.",
      de: "Word-Overview + Excel-Datenbank.",
    },
  },
  {
    key: "market_potential",
    name: { en: "Market Potential Scan", de: "Marktpotenzial-Scan" },
    description: {
      en: "TAM/SAM/SOM with conservative/realistic/aggressive scenarios and method triangulation. Requires Customer Scan universe and/or Industry Study data.",
      de: "TAM/SAM/SOM mit konservativen/realistischen/aggressiven Szenarien und Methoden-Triangulation. Benötigt Customer-Scan-Universum und/oder Industriestudien-Daten.",
    },
    deliverables: {
      en: "Report + Excel model.",
      de: "Bericht + Excel-Modell.",
    },
  },
  {
    key: "buying_center",
    name: { en: "Buying Center Scan", de: "Buying-Center-Scan" },
    description: {
      en: "Maps the decision-making unit at shortlisted accounts with verified contacts (Webster/Wind roles). Seeds from the Customer Scan DB.",
      de: "Kartiert das Buying Center bei Shortlist-Accounts mit verifizierten Kontakten (Webster/Wind-Rollen). Seed: Customer-Scan-Datenbank.",
    },
    deliverables: {
      en: "Excel contact database.",
      de: "Excel-Kontaktdatenbank.",
    },
  },
  {
    key: "assembler",
    name: { en: "Scan Pack Assembler", de: "Scan-Pack-Assembler" },
    description: {
      en: "Consolidation layer over the finished pack — READ_ME read-path, merged Account Master (one row per account across all scans), cross-document validation report.",
      de: "Konsolidierungsschicht über das fertige Pack — READ_ME-Lesepfad, gemergte Account-Master-Datei (eine Zeile pro Account über alle Scans), scanübergreifender Validierungsreport.",
    },
    deliverables: {
      en: "READ_ME + Account Master (Excel) + validation report.",
      de: "READ_ME + Account-Master (Excel) + Validierungsreport.",
    },
  },
];

const STATUS_LABEL: Record<ScanStatus, { en: string; de: string }> = {
  not_started: { en: "Not started", de: "Nicht gestartet" },
  intake_ready: { en: "Intake ready", de: "Intake bereit" },
  running: { en: "Running", de: "Läuft" },
  done: { en: "Done", de: "Fertig" },
};

export function ScanPackSection({ opportunity, onSave, readonly }: Props) {
  const { language } = useI18n();
  const L = <T,>(en: T, de: T) => (language === "de" ? de : en);

  const initialPack = useMemo(
    () => autoUpgradeStatuses(opportunity.scanPack ?? createDefaultScanPack(), opportunity.hypothesis),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [opportunity.id],
  );
  const [pack, setPack] = useState<ScanPackData>(initialPack);

  // Persist automatic upgrade so intake_ready sticks.
  useEffect(() => {
    if (JSON.stringify(initialPack) !== JSON.stringify(opportunity.scanPack ?? createDefaultScanPack())) {
      onSave(initialPack);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: ScanPackKey, patch: Partial<ScanCardState>) => {
    const next: ScanPackData = {
      ...pack,
      [key]: { ...pack[key], ...patch, updatedAt: new Date().toISOString() },
    };
    setPack(next);
    onSave(next);
  };

  const hypothesisPresent = !!opportunity.hypothesis;
  const hypothesisDraft = opportunity.hypothesis?.status !== "confirmed";
  const allScansDone = NON_ASSEMBLER_KEYS.every((k) => pack[k].status === "done");
  const doneCount = SCAN_PACK_KEYS.filter((k) => pack[k].status === "done").length;

  if (!hypothesisPresent) {
    return (
      <div className="rounded-lg border border-border p-6 text-sm text-muted-foreground">
        {L(
          "Draft a hypothesis first — the Scan Pack module opens once at least a draft hypothesis exists.",
          "Bitte zuerst eine Hypothese entwerfen — das Scan-Pack-Modul öffnet sich, sobald mindestens ein Entwurf existiert.",
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">{L("Scan Pack", "Scan Pack")}</h2>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {L(
              "Execute the five market-intelligence scans and assemble the pack. Each card runs off the intake saved in the Hypothesis tab.",
              "Führe die fünf Market-Intelligence-Scans aus und assembliere das Pack. Jede Karte nutzt das Intake aus dem Hypothesen-Tab.",
            )}
          </p>
        </div>
        <div className="flex items-center gap-3 min-w-[180px]">
          <Progress value={(doneCount / 6) * 100} className="w-32" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {doneCount}/6 {L("done", "fertig")}
          </span>
        </div>
      </div>

      {hypothesisDraft && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          {L(
            "Your hypothesis is still a draft. Recommended: confirm it before commissioning the scans — but you can proceed.",
            "Deine Hypothese ist noch ein Entwurf. Empfehlung: bestätige sie vor Beauftragung der Scans — du kannst aber weitermachen.",
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {SCANS.map((meta) => (
          <ScanCard
            key={meta.key}
            meta={meta}
            state={pack[meta.key]}
            pack={pack}
            opportunity={opportunity}
            update={(patch) => update(meta.key, patch)}
            readonly={!!readonly}
            allScansDone={allScansDone}
            L={L}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================

interface CardProps {
  meta: ScanMeta;
  state: ScanCardState;
  pack: ScanPackData;
  opportunity: Opportunity;
  update: (patch: Partial<ScanCardState>) => void;
  readonly: boolean;
  allScansDone: boolean;
  L: <T,>(en: T, de: T) => T;
}

function ScanCard({ meta, state, pack, opportunity, update, readonly, allScansDone, L }: CardProps) {
  const { language } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const isAssembler = meta.key === "assembler";
  const hardGated = isAssembler && !allScansDone;

  const preds = SCAN_RECOMMENDED_PREDECESSORS[meta.key];
  const missingPreds = preds
    .filter((p) => pack[p]?.status !== "done")
    .filter((p) => !isAssembler); // assembler shows its own hard-gate message

  const StatusIcon =
    state.status === "done" ? CheckCircle2
    : state.status === "running" ? Loader2
    : state.status === "intake_ready" ? FileText
    : Circle;

  const setStatus = (next: ScanStatus) => {
    const patch: Partial<ScanCardState> = { status: next };
    if (next === "running" && !state.startedAt) patch.startedAt = new Date().toISOString();
    if (next === "done" && !state.completedAt) patch.completedAt = new Date().toISOString();
    if (next !== "done") patch.completedAt = undefined;
    update(patch);
  };

  const copyIntake = async () => {
    if (isAssembler) return;
    const text = formatIntake(opportunity.hypothesis, meta.key, opportunity.title);
    try {
      await navigator.clipboard.writeText(text);
      toast.success(L("Intake copied to clipboard", "Intake in Zwischenablage kopiert"));
    } catch {
      toast.error(L("Could not copy — clipboard blocked", "Kopieren fehlgeschlagen — Zwischenablage blockiert"));
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const added: ScanFileMeta[] = [];
    for (const f of Array.from(files)) {
      const safeName = f.name.normalize("NFKD").replace(/[^\x20-\x7E]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 100) || "file";
      const path = `${opportunity.id}/${meta.key}/${crypto.randomUUID()}-${safeName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type || undefined });
      if (error) {
        toast.error(`${f.name}: ${error.message}`);
        continue;
      }
      added.push({
        id: crypto.randomUUID(),
        name: f.name,
        path,
        size: f.size,
        mime: f.type,
        uploadedAt: new Date().toISOString(),
      });
    }
    if (added.length) update({ files: [...state.files, ...added] });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = async (f: ScanFileMeta) => {
    await supabase.storage.from(BUCKET).remove([f.path]);
    update({ files: state.files.filter((x) => x.id !== f.id) });
  };

  const downloadFile = async (f: ScanFileMeta) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(f.path, 60 * 10);
    if (error || !data?.signedUrl) {
      toast.error(error?.message ?? "Failed to sign URL");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(language === "de" ? "de-DE" : "en-US") : "—");

  return (
    <Card className={`p-4 flex flex-col gap-3 ${hardGated ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <Badge variant="outline" className="shrink-0 font-mono">{SCAN_ORDER_BADGE[meta.key]}</Badge>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm leading-tight">{L(meta.name.en, meta.name.de)}</h3>
            <p className="text-xs text-muted-foreground mt-1">{L(meta.description.en, meta.description.de)}</p>
          </div>
        </div>
        <Badge variant={state.status === "done" ? "default" : "secondary"} className="gap-1 shrink-0">
          <StatusIcon className={`h-3 w-3 ${state.status === "running" ? "animate-spin" : ""}`} />
          {L(STATUS_LABEL[state.status].en, STATUS_LABEL[state.status].de)}
        </Badge>
      </div>

      <div className="text-[11px] text-muted-foreground">
        <span className="font-medium">{L("Deliverables:", "Ergebnisse:")}</span> {L(meta.deliverables.en, meta.deliverables.de)}
      </div>

      {hardGated && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>{L("Locked until all five scans are Done.", "Gesperrt bis alle fünf Scans fertig sind.")}</span>
        </div>
      )}
      {!hardGated && missingPreds.length > 0 && state.status !== "done" && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-2 text-xs flex items-start gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>
            {L("Works best with a completed ", "Läuft am besten mit abgeschlossener ")}
            {missingPreds.map((p) => SCANS.find((s) => s.key === p)!).map((s) => L(s.name.en, s.name.de)).join(", ")}.
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div><span className="text-muted-foreground">{L("Started", "Gestartet")}:</span> {fmtDate(state.startedAt)}</div>
        <div><span className="text-muted-foreground">{L("Completed", "Abgeschlossen")}:</span> {fmtDate(state.completedAt)}</div>
      </div>

      <div className="flex items-center gap-2">
        <Select value={state.status} onValueChange={(v) => setStatus(v as ScanStatus)} disabled={readonly || hardGated}>
          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(["not_started", "intake_ready", "running", "done"] as ScanStatus[]).map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {L(STATUS_LABEL[s].en, STATUS_LABEL[s].de)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isAssembler && (
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={copyIntake} disabled={hardGated}>
            <ClipboardCopy className="h-3.5 w-3.5" />
            {L("Copy intake", "Intake kopieren")}
          </Button>
        )}
      </div>

      <div>
        <label className="text-[11px] font-medium text-muted-foreground">{L("Result summary", "Ergebnis-Zusammenfassung")}</label>
        <Textarea
          value={state.summary}
          onChange={(e) => update({ summary: e.target.value })}
          disabled={readonly || hardGated}
          rows={3}
          className="mt-1 text-xs"
          placeholder={L("Key insights, findings, conclusions…", "Wichtigste Erkenntnisse, Findings, Schlüsse…")}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-muted-foreground">{L("Deliverable files", "Deliverable-Dateien")}</label>
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={readonly || hardGated || uploading}
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
            {L("Upload", "Hochladen")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => onFiles(e.target.files)}
          />
        </div>
        {state.files.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic">
            {L("No files yet. Accepts xlsx, docx, pdf, html, zip.", "Noch keine Dateien. Erlaubt: xlsx, docx, pdf, html, zip.")}
          </p>
        ) : (
          <ul className="space-y-1">
            {state.files.map((f) => (
              <li key={f.id} className="flex items-center gap-1.5 text-xs border border-border rounded px-2 py-1">
                <Link2 className="h-3 w-3 text-muted-foreground shrink-0" />
                <button className="flex-1 text-left truncate hover:underline" onClick={() => downloadFile(f)}>{f.name}</button>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => downloadFile(f)} title={L("Download", "Herunterladen")}>
                  <Download className="h-3 w-3" />
                </Button>
                {!readonly && !hardGated && (
                  <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => removeFile(f)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
