import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Plus } from "lucide-react";
import {
  HypothesisData, ScanKey,
  createDefaultIndustry, createDefaultCustomer, createDefaultCompetitor,
  createDefaultMarketPotential, createDefaultBuyingCenter,
} from "@/lib/hypothesisTypes";
import { useI18n } from "@/lib/i18n";

interface Props {
  hypothesis: HypothesisData;
  onChange: (h: HypothesisData) => void;
  readonly?: boolean;
}

const L = (lang: string, en: string, de: string) => (lang === "de" ? de : en);

function Field({ label, children, empty }: { label: string; children: React.ReactNode; empty?: boolean }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        {empty && (
          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/50 text-amber-600 dark:text-amber-400">
            needs input
          </Badge>
        )}
      </div>
      {children}
    </div>
  );
}

export function HypothesisForm({ hypothesis, onChange, readonly }: Props) {
  const { language } = useI18n();
  const h = hypothesis;

  const set = (patch: Partial<HypothesisData>) =>
    onChange({ ...h, ...patch, updatedAt: new Date().toISOString() });
  const setCore = (patch: Partial<HypothesisData["core"]>) =>
    set({ core: { ...h.core, ...patch } });

  const scans = useMemo(() => h.selectedScans ?? [], [h.selectedScans]);

  return (
    <div className="space-y-6">
      {/* Core */}
      <div className="border rounded-lg p-4 space-y-4 bg-card">
        <h3 className="text-sm font-semibold">{L(language, "Core / Hypothesis", "Kern / Hypothese")}</h3>

        <Field label={L(language, "Hypothesis statement", "Hypothesen-Aussage")} empty={!h.core.hypothesisStatement}>
          <Textarea disabled={readonly} rows={2} value={h.core.hypothesisStatement}
            onChange={(e) => setCore({ hypothesisStatement: e.target.value })} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={L(language, "Client company", "Kunde / Unternehmen")} empty={!h.core.client.company}>
            <Input disabled={readonly} value={h.core.client.company}
              onChange={(e) => setCore({ client: { ...h.core.client, company: e.target.value } })} />
          </Field>
          <Field label={L(language, "Business unit", "Geschäftseinheit")} empty={!h.core.client.businessUnit}>
            <Input disabled={readonly} value={h.core.client.businessUnit}
              onChange={(e) => setCore({ client: { ...h.core.client, businessUnit: e.target.value } })} />
          </Field>
          <Field label={L(language, "Offering name", "Angebotsname")} empty={!h.core.offering.name}>
            <Input disabled={readonly} value={h.core.offering.name}
              onChange={(e) => setCore({ offering: { ...h.core.offering, name: e.target.value } })} />
          </Field>
          <Field label={L(language, "Business model", "Geschäftsmodell")} empty={!h.core.offering.businessModel}>
            <Input disabled={readonly} value={h.core.offering.businessModel} placeholder="one-time / recurring / service"
              onChange={(e) => setCore({ offering: { ...h.core.offering, businessModel: e.target.value as any } })} />
          </Field>
        </div>

        <Field label={L(language, "Offering description", "Angebotsbeschreibung")} empty={!h.core.offering.description}>
          <Textarea disabled={readonly} rows={3} value={h.core.offering.description}
            onChange={(e) => setCore({ offering: { ...h.core.offering, description: e.target.value } })} />
        </Field>

        <StringList
          label={L(language, "Spec anchors (5–10)", "Spec-Anker (5–10)")}
          values={h.core.offering.specAnchors}
          readonly={readonly}
          onChange={(v) => setCore({ offering: { ...h.core.offering, specAnchors: v } })}
        />

        <PairList
          label={L(language, "Target markets", "Zielmärkte")}
          items={h.core.targetMarkets}
          keys={{ a: "segment", b: "region" }}
          labels={{ a: L(language, "Segment", "Segment"), b: L(language, "Region", "Region") }}
          readonly={readonly}
          onChange={(v) => setCore({ targetMarkets: v })}
        />
      </div>

      {/* Scan panels */}
      {scans.length === 0 && (
        <div className="text-sm text-muted-foreground border rounded-lg p-4 bg-muted/20">
          {L(language,
            "Select scans and run the IDA drafter above to add scan input sheets.",
            "Wähle oben Scans aus und starte den IDA-Entwurf, um Scan-Input-Sheets hinzuzufügen.")}
        </div>
      )}

      {scans.length > 0 && (
        <Accordion type="multiple" defaultValue={scans}>
          {scans.includes("industry") && (
            <ScanPanel value="industry" title={L(language, "Industry Scan", "Branchen-Scan")}>
              <IndustryFields h={h} onChange={(v) => set({ industry: v })} readonly={readonly} lang={language} />
            </ScanPanel>
          )}
          {scans.includes("customer") && (
            <ScanPanel value="customer" title={L(language, "Customer Scan", "Kunden-Scan")}>
              <CustomerFields h={h} onChange={(v) => set({ customer: v })} readonly={readonly} lang={language} />
            </ScanPanel>
          )}
          {scans.includes("competitor") && (
            <ScanPanel value="competitor" title={L(language, "Competitor Scan", "Wettbewerber-Scan")}>
              <CompetitorFields h={h} onChange={(v) => set({ competitor: v })} readonly={readonly} lang={language} />
            </ScanPanel>
          )}
          {scans.includes("market_potential") && (
            <ScanPanel value="market_potential" title={L(language, "Market Potential Scan", "Marktpotenzial-Scan")}>
              <MarketPotentialFields h={h} onChange={(v) => set({ marketPotential: v })} readonly={readonly} lang={language} />
            </ScanPanel>
          )}
          {scans.includes("buying_center") && (
            <ScanPanel value="buying_center" title={L(language, "Buying Center Scan", "Buying-Center-Scan")}>
              <BuyingCenterFields h={h} onChange={(v) => set({ buyingCenter: v })} readonly={readonly} lang={language} />
            </ScanPanel>
          )}
        </Accordion>
      )}
    </div>
  );
}

function ScanPanel({ value, title, children }: { value: string; title: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value} className="border rounded-lg mb-3 bg-card px-4">
      <AccordionTrigger className="text-sm font-semibold hover:no-underline">{title}</AccordionTrigger>
      <AccordionContent className="pt-2 pb-4 space-y-3">{children}</AccordionContent>
    </AccordionItem>
  );
}

/* ---------- Sub-forms ---------- */

function IndustryFields({ h, onChange, readonly, lang }: { h: HypothesisData; onChange: (v: any) => void; readonly?: boolean; lang: string }) {
  const i = h.industry ?? createDefaultIndustry();
  const set = (patch: any) => onChange({ ...i, ...patch });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={L(lang, "Study purpose", "Studienzweck")} empty={!i.studyPurpose}>
          <Input disabled={readonly} value={i.studyPurpose} onChange={(e) => set({ studyPurpose: e.target.value })}
            placeholder="market_entry / geo_expansion / partner_supplier_search / competitive_positioning / portfolio_gap_screening" />
        </Field>
        <Field label={L(lang, "Depth", "Tiefe")} empty={!i.depth}>
          <Input disabled={readonly} value={i.depth} onChange={(e) => set({ depth: e.target.value })}
            placeholder="strategic_overview / thorough / exhaustive" />
        </Field>
      </div>
      <StringList label={L(lang, "Segments in depth", "Segmente (Tiefe)")} values={i.segmentsInDepth} readonly={readonly} onChange={(v) => set({ segmentsInDepth: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StringList label={L(lang, "Geography – primary", "Geografie – primär")} values={i.geography.primary} readonly={readonly} onChange={(v) => set({ geography: { ...i.geography, primary: v } })} />
        <StringList label={L(lang, "Geography – baseline", "Geografie – Baseline")} values={i.geography.baseline} readonly={readonly} onChange={(v) => set({ geography: { ...i.geography, baseline: v } })} />
        <StringList label={L(lang, "Geography – light", "Geografie – leicht")} values={i.geography.light} readonly={readonly} onChange={(v) => set({ geography: { ...i.geography, light: v } })} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(["valueChainMap", "wordStudy", "excelPlayerDb", "slideDeck"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <Checkbox disabled={readonly} checked={i.outputs[k]}
              onCheckedChange={(v) => set({ outputs: { ...i.outputs, [k]: !!v } })} />
            <span className="capitalize">{k}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function CustomerFields({ h, onChange, readonly, lang }: { h: HypothesisData; onChange: (v: any) => void; readonly?: boolean; lang: string }) {
  const c = h.customer ?? createDefaultCustomer();
  const set = (patch: any) => onChange({ ...c, ...patch });
  const fields: Array<[keyof typeof c, string, string]> = [
    ["products", "Products", "Produkte"],
    ["reportMode", "Report mode", "Report-Modus"],
    ["useCases", "Use cases", "Anwendungsfälle"],
    ["businessModel", "Business model", "Geschäftsmodell"],
    ["targetMarket", "Target market", "Zielmarkt"],
    ["customerTypes", "Customer types", "Kundentypen"],
    ["preferences", "Preferences", "Präferenzen"],
    ["tierCriteria", "Tier criteria", "Tier-Kriterien"],
    ["additionalComments", "Additional comments", "Zusätzliche Kommentare"],
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {fields.map(([k, en, de]) => (
        <Field key={k as string} label={L(lang, en, de)} empty={!c[k]}>
          <Textarea disabled={readonly} rows={2} value={c[k] as string} onChange={(e) => set({ [k]: e.target.value })} />
        </Field>
      ))}
    </div>
  );
}

function CompetitorFields({ h, onChange, readonly, lang }: { h: HypothesisData; onChange: (v: any) => void; readonly?: boolean; lang: string }) {
  const c = h.competitor ?? createDefaultCompetitor();
  const set = (patch: any) => onChange({ ...c, ...patch });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={L(lang, "Client", "Kunde")} empty={!c.client}>
          <Input disabled={readonly} value={c.client} onChange={(e) => set({ client: e.target.value })} />
        </Field>
        <Field label={L(lang, "Offering name", "Angebotsname")} empty={!c.offering.name}>
          <Input disabled={readonly} value={c.offering.name} onChange={(e) => set({ offering: { ...c.offering, name: e.target.value } })} />
        </Field>
      </div>
      <Field label={L(lang, "Offering description", "Angebotsbeschreibung")} empty={!c.offering.description}>
        <Textarea disabled={readonly} rows={2} value={c.offering.description}
          onChange={(e) => set({ offering: { ...c.offering, description: e.target.value } })} />
      </Field>
      <StringList label={L(lang, "Spec anchors", "Spec-Anker")} values={c.offering.specAnchors} readonly={readonly}
        onChange={(v) => set({ offering: { ...c.offering, specAnchors: v } })} />
      <PairList label={L(lang, "Target markets", "Zielmärkte")} items={c.targetMarkets}
        keys={{ a: "segment", b: "region" }} labels={{ a: "Segment", b: "Region" }} readonly={readonly}
        onChange={(v) => set({ targetMarkets: v })} />
      <PairList label={L(lang, "Known competitors", "Bekannte Wettbewerber")} items={c.knownCompetitors}
        keys={{ a: "name", b: "clientBelief" }}
        labels={{ a: L(lang, "Name", "Name"), b: L(lang, "Client belief", "Kundenbild") }} readonly={readonly}
        onChange={(v) => set({ knownCompetitors: v })} />
      <StringList label={L(lang, "Benchmark criteria", "Benchmark-Kriterien")} values={c.benchmarkCriteria} readonly={readonly}
        onChange={(v) => set({ benchmarkCriteria: v })} />
      <div className="grid gap-3 sm:grid-cols-4">
        <Field label={L(lang, "Depth cap", "Tiefen-Cap")}>
          <Input type="number" disabled={readonly} value={c.depthCap}
            onChange={(e) => set({ depthCap: Number(e.target.value) || 0 })} />
        </Field>
        <Field label={L(lang, "Target margin", "Zielmarge")} empty={!c.targetCosting.targetMargin}>
          <Input disabled={readonly} value={c.targetCosting.targetMargin}
            onChange={(e) => set({ targetCosting: { ...c.targetCosting, targetMargin: e.target.value } })} />
        </Field>
        <Field label={L(lang, "Current cost", "Aktuelle Kosten")} empty={!c.targetCosting.currentCost}>
          <Input disabled={readonly} value={c.targetCosting.currentCost}
            onChange={(e) => set({ targetCosting: { ...c.targetCosting, currentCost: e.target.value } })} />
        </Field>
        <Field label={L(lang, "WTP anchors", "WTP-Anker")} empty={!c.targetCosting.wtpAnchors}>
          <Input disabled={readonly} value={c.targetCosting.wtpAnchors}
            onChange={(e) => set({ targetCosting: { ...c.targetCosting, wtpAnchors: e.target.value } })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {(["vpc", "cba", "threeCircle", "positioning", "targetCosting"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 text-sm">
            <Checkbox disabled={readonly} checked={c.frameworks[k]}
              onCheckedChange={(v) => set({ frameworks: { ...c.frameworks, [k]: !!v } })} />
            <span>{k}</span>
          </label>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={L(lang, "Preferences", "Präferenzen")} empty={!c.preferences}>
          <Textarea disabled={readonly} rows={2} value={c.preferences} onChange={(e) => set({ preferences: e.target.value })} />
        </Field>
        <Field label={L(lang, "Additional comments", "Zusätzliche Kommentare")} empty={!c.additionalComments}>
          <Textarea disabled={readonly} rows={2} value={c.additionalComments} onChange={(e) => set({ additionalComments: e.target.value })} />
        </Field>
      </div>
    </>
  );
}

function MarketPotentialFields({ h, onChange, readonly, lang }: { h: HypothesisData; onChange: (v: any) => void; readonly?: boolean; lang: string }) {
  const m = h.marketPotential ?? createDefaultMarketPotential();
  const set = (patch: any) => onChange({ ...m, ...patch });
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label={L(lang, "Price / unit or seat", "Preis / Einheit oder Seat")} empty={!m.pricePerUnitOrSeat}>
          <Input disabled={readonly} value={m.pricePerUnitOrSeat} onChange={(e) => set({ pricePerUnitOrSeat: e.target.value })} />
        </Field>
        <Field label={L(lang, "Recurring / one-time", "Wiederkehrend / einmalig")} empty={!m.recurringOrOneTime}>
          <Input disabled={readonly} value={m.recurringOrOneTime}
            onChange={(e) => set({ recurringOrOneTime: e.target.value as any })}
            placeholder="recurring / one_time" />
        </Field>
        <Field label={L(lang, "Currency", "Währung")}>
          <Input disabled={readonly} value={m.currency} onChange={(e) => set({ currency: e.target.value })} />
        </Field>
        <Field label={L(lang, "Base year", "Basisjahr")} empty={!m.baseYear}>
          <Input disabled={readonly} value={m.baseYear} onChange={(e) => set({ baseYear: e.target.value })} />
        </Field>
        <Field label={L(lang, "Win-rate assumption", "Annahme Gewinnrate")} empty={!m.winRateAssumption}>
          <Input disabled={readonly} value={m.winRateAssumption} onChange={(e) => set({ winRateAssumption: e.target.value })} />
        </Field>
        <Field label={L(lang, "Adoption assumption", "Annahme Adoption")} empty={!m.adoptionAssumption}>
          <Input disabled={readonly} value={m.adoptionAssumption} onChange={(e) => set({ adoptionAssumption: e.target.value })} />
        </Field>
      </div>
      <Field label={L(lang, "Addressable share assumption", "Annahme adressierbarer Anteil")} empty={!m.addressableShareAssumption}>
        <Input disabled={readonly} value={m.addressableShareAssumption} onChange={(e) => set({ addressableShareAssumption: e.target.value })} />
      </Field>
      <PairList label={L(lang, "Units per customer type", "Einheiten pro Kundentyp")} items={m.unitsPerCustomerType}
        keys={{ a: "customerType", b: "units" }}
        labels={{ a: L(lang, "Customer type", "Kundentyp"), b: L(lang, "Units", "Einheiten") }}
        readonly={readonly} onChange={(v) => set({ unitsPerCustomerType: v })} />
      <div className="grid gap-3 sm:grid-cols-3">
        {(["conservative", "realistic", "aggressive"] as const).map((k) => (
          <Field key={k} label={L(lang, `Scenario – ${k}`, `Szenario – ${k}`)} empty={!m.scenarios[k]}>
            <Textarea disabled={readonly} rows={2} value={m.scenarios[k]}
              onChange={(e) => set({ scenarios: { ...m.scenarios, [k]: e.target.value } })} />
          </Field>
        ))}
      </div>
    </>
  );
}

function BuyingCenterFields({ h, onChange, readonly, lang }: { h: HypothesisData; onChange: (v: any) => void; readonly?: boolean; lang: string }) {
  const b = h.buyingCenter ?? createDefaultBuyingCenter();
  const set = (patch: any) => onChange({ ...b, ...patch });
  return (
    <>
      <Field label={L(lang, "Offering description", "Angebotsbeschreibung")} empty={!b.offeringDescription}>
        <Textarea disabled={readonly} rows={3} value={b.offeringDescription} onChange={(e) => set({ offeringDescription: e.target.value })} />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={L(lang, "Seed input type", "Seed-Input-Typ")} empty={!b.seedInputType}>
          <Input disabled={readonly} value={b.seedInputType} onChange={(e) => set({ seedInputType: e.target.value })}
            placeholder="customer_scan_db / crm_export / lead_list / manual_account_list" />
        </Field>
        <Field label={L(lang, "Depth", "Tiefe")} empty={!b.depth}>
          <Input disabled={readonly} value={b.depth} onChange={(e) => set({ depth: e.target.value })}
            placeholder="full_mapping_50 / contact_coverage_400" />
        </Field>
      </div>
      <Field label={L(lang, "Shortlist rule", "Shortlist-Regel")} empty={!b.shortlistRule}>
        <Textarea disabled={readonly} rows={2} value={b.shortlistRule} onChange={(e) => set({ shortlistRule: e.target.value })} />
      </Field>
      <Field label={L(lang, "Delivery notes", "Liefer-Notizen")} empty={!b.deliveryNotes}>
        <Textarea disabled={readonly} rows={2} value={b.deliveryNotes} onChange={(e) => set({ deliveryNotes: e.target.value })} />
      </Field>
    </>
  );
}

/* ---------- Reusable list widgets ---------- */

function StringList({ label, values, onChange, readonly }: { label: string; values: string[]; onChange: (v: string[]) => void; readonly?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="space-y-1">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <Input disabled={readonly} value={v} onChange={(e) => {
              const next = [...values]; next[i] = e.target.value; onChange(next);
            }} />
            {!readonly && (
              <Button variant="ghost" size="icon" onClick={() => onChange(values.filter((_, j) => j !== i))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        {!readonly && (
          <Button variant="outline" size="sm" onClick={() => onChange([...values, ""])} className="gap-1">
            <Plus className="h-3 w-3" /> Add
          </Button>
        )}
      </div>
    </div>
  );
}

function PairList<T extends Record<string, any>>(
  { label, items, keys, labels, onChange, readonly }:
  { label: string; items: T[]; keys: { a: keyof T & string; b: keyof T & string }; labels: { a: string; b: string }; onChange: (v: T[]) => void; readonly?: boolean }
) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="space-y-1">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <Input disabled={readonly} placeholder={labels.a} value={(it as any)[keys.a] ?? ""}
              onChange={(e) => { const next = [...items]; (next[i] as any)[keys.a] = e.target.value; onChange(next); }} />
            <Input disabled={readonly} placeholder={labels.b} value={(it as any)[keys.b] ?? ""}
              onChange={(e) => { const next = [...items]; (next[i] as any)[keys.b] = e.target.value; onChange(next); }} />
            {!readonly && (
              <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, j) => j !== i))}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
        {!readonly && (
          <Button variant="outline" size="sm" onClick={() => onChange([...items, { [keys.a]: "", [keys.b]: "" } as any])} className="gap-1">
            <Plus className="h-3 w-3" /> Add
          </Button>
        )}
      </div>
    </div>
  );
}
