import { useConfirm } from "@/components/ConfirmProvider";
import { useI18n } from "@/lib/i18n";
import { DetailedScoring, CustomerSegment } from "@/lib/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Users, Plus, Trash2 } from "lucide-react";
import { EditableSection } from "@/components/EditableSection";

interface Props {
  scoring: DetailedScoring;
  onUpdate: (scoring: DetailedScoring) => void;
  readonly?: boolean;
}

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.3)",
  "hsl(var(--accent))",
];

const PIE_SWATCH_CLASSES = [
  "bg-primary",
  "bg-primary/70",
  "bg-primary/50",
  "bg-primary/30",
  "bg-accent",
];

export function CustomerLandscapeTab({ scoring, onUpdate, readonly: propReadonly }: Props) {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [local, setLocal] = useState(scoring.marketAttractiveness);
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);
  const readonly = propReadonly || !editing;

  useEffect(() => {
    if (dirty) return;
    setLocal(scoring.marketAttractiveness);
  }, [dirty, scoring.marketAttractiveness]);

  const update = (field: keyof typeof local.analysis, value: string) => {
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, [field]: value } }));
    setDirty(true);
  };

  const handleSave = () => {
    onUpdate({ ...scoring, marketAttractiveness: local });
    setDirty(false);
  };

  // Customer segments
  const segments = local.analysis.customerSegments || [];
  const chartSegments = segments.filter((segment) => segment.name.trim() && segment.size > 0);
  const totalShare = chartSegments.reduce((sum, segment) => sum + segment.size, 0);
  const addSegment = () => {
    const newSeg: CustomerSegment = { name: "", size: 0, description: "" };
    setLocal((prev) => ({ ...prev, analysis: { ...prev.analysis, customerSegments: [...(prev.analysis.customerSegments || []), newSeg] } }));
    setDirty(true);
  };
  const updateSegment = (idx: number, field: keyof CustomerSegment, value: string | number) => {
    setLocal((prev) => {
      const segs = [...(prev.analysis.customerSegments || [])];
      segs[idx] = { ...segs[idx], [field]: value };
      return { ...prev, analysis: { ...prev.analysis, customerSegments: segs } };
    });
    setDirty(true);
  };
  const removeSegment = (idx: number) => {
    setLocal((prev) => ({
      ...prev, analysis: { ...prev.analysis, customerSegments: (prev.analysis.customerSegments || []).filter((_, i) => i !== idx) }
    }));
    setDirty(true);
  };

  return (
    <EditableSection editing={editing} onEdit={() => setEditing(true)} onSave={() => { handleSave(); setEditing(false); }} readonly={propReadonly} dirty={dirty}>
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex items-start gap-3 border-b border-border pb-5">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{t("maCustomerLandscape")}</h3>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{t("maCustomerLandscapeDescription")}</p>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("targetCustomers")}</h4>
            <Textarea value={local.analysis.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("targetCustomersPlaceholder")} />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("customerRelationship")}</h4>
            <Textarea value={local.analysis.customerRelationship} onChange={(e) => update("customerRelationship", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("customerRelationshipPlaceholder")} />
          </div>
        </div>

        <div className="space-y-4 border-t border-border pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h4 className="font-semibold text-card-foreground">{t("maCustomerSegments")}</h4>
              <p className="mt-1 text-sm text-muted-foreground">{t("maCustomerSegmentsDescription")}</p>
            </div>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addSegment} className="self-start">
                <Plus className="h-3 w-3 mr-1" />{t("maAddSegment")}
              </Button>
            )}
          </div>

          {chartSegments.length > 0 && (
            <div className="grid items-center gap-6 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-[minmax(220px,0.8fr)_minmax(240px,1.2fr)]">
              <div aria-label={t("maSegmentDistribution")}>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={chartSegments} dataKey="size" nameKey="name" cx="50%" cy="50%" innerRadius={52} outerRadius={88} paddingAngle={2}>
                      {chartSegments.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, t("maSegmentShare")]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="min-w-0">
                <h5 className="text-sm font-semibold text-foreground">{t("maSegmentDistribution")}</h5>
                <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-2">
                  {chartSegments.map((segment, index) => (
                    <div key={`${segment.name}-${index}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 text-sm">
                      <span className={`h-3 w-3 rounded-sm ${PIE_SWATCH_CLASSES[index % PIE_SWATCH_CLASSES.length]}`} aria-hidden="true" />
                      <span className="truncate text-foreground" title={segment.name}>{segment.name}</span>
                      <span className="font-medium tabular-nums text-foreground">{segment.size}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-border pt-3 text-sm">
                  <span className="text-muted-foreground">{t("maTotalShare")}</span>
                  <span className={`font-semibold tabular-nums ${totalShare === 100 ? "text-foreground" : "text-destructive"}`}>{totalShare}%</span>
                </div>
              </div>
            </div>
          )}

          {segments.length === 0 && (
            <div className="rounded-lg border border-dashed border-border px-5 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("maNoSegments")}</p>
            </div>
          )}

          {segments.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th scope="col" className="w-[30%] px-3 py-2.5 font-semibold text-foreground">{t("maSegmentName")}</th>
                    <th scope="col" className="w-28 px-3 py-2.5 font-semibold text-foreground">{t("maSegmentSize")}</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold text-foreground">{t("maSegmentDesc")}</th>
                    {!readonly && <th scope="col" className="w-14 px-3 py-2.5 text-right font-semibold text-foreground">{t("maActions")}</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {segments.map((segment, index) => (
                    <tr key={index}>
                      <td className="p-2"><Input value={segment.name} onChange={(event) => updateSegment(index, "name", event.target.value)} disabled={readonly} placeholder={t("maSegmentName")} /></td>
                      <td className="p-2"><Input type="number" min={0} max={100} value={segment.size} onChange={(event) => updateSegment(index, "size", Number(event.target.value))} disabled={readonly} aria-label={t("maSegmentSize")} /></td>
                      <td className="p-2"><Input value={segment.description} onChange={(event) => updateSegment(index, "description", event.target.value)} disabled={readonly} placeholder={t("maSegmentDesc")} /></td>
                      {!readonly && (
                        <td className="p-2 text-right">
                          <Button variant="ghost" size="icon" onClick={() => confirm(() => removeSegment(index))} aria-label={t("maDeleteSegment")} title={t("maDeleteSegment")}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
    </EditableSection>
  );
}
