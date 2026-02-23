import { useI18n } from "@/lib/i18n";
import { DetailedScoring, CustomerSegment } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { Users, Plus, Trash2 } from "lucide-react";

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

export function CustomerLandscapeTab({ scoring, onUpdate, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState(scoring.marketAttractiveness);
  const [dirty, setDirty] = useState(false);

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
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-xl border-2 border-border bg-card p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-card-foreground">{t("maCustomerLandscape")}</h3>
        </div>
      </div>

      {/* Customer Landscape Content */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-card-foreground">{t("maCustomerLandscape")}</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("targetCustomers")}</h4>
            <Textarea value={local.analysis.targetCustomers} onChange={(e) => update("targetCustomers", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("targetCustomersPlaceholder")} />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-card-foreground">{t("customerRelationship")}</h4>
            <Textarea value={local.analysis.customerRelationship} onChange={(e) => update("customerRelationship", e.target.value)} disabled={readonly} rows={3} className="text-sm resize-none" placeholder={t("customerRelationshipPlaceholder")} />
          </div>
        </div>

        {/* Customer Segments Pie Chart */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-card-foreground">{t("maCustomerSegments")}</h4>
            {!readonly && (
              <Button variant="outline" size="sm" onClick={addSegment}>
                <Plus className="h-3 w-3 mr-1" />{t("maAddSegment")}
              </Button>
            )}
          </div>

          {segments.length > 0 && (
            <div className="rounded-lg border border-border bg-background/50 p-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={segments.filter(s => s.name && s.size > 0)}
                    dataKey="size"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={80}
                    label={({ name, size }) => `${name} (${size}%)`}
                    labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                  >
                    {segments.filter(s => s.name && s.size > 0).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {segments.length === 0 && (
            <p className="text-sm text-muted-foreground italic py-3">{t("maNoSegments")}</p>
          )}

          {segments.map((seg, idx) => (
            <div key={idx} className="rounded-lg border border-border bg-background/50 p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={seg.name} onChange={(e) => updateSegment(idx, "name", e.target.value)} disabled={readonly} placeholder={t("maSegmentName")} className="flex-1" />
                <Input type="number" value={seg.size} onChange={(e) => updateSegment(idx, "size", Number(e.target.value))} disabled={readonly} placeholder={t("maSegmentSize")} className="w-24" />
                {!readonly && (
                  <Button variant="ghost" size="sm" onClick={() => removeSegment(idx)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                )}
              </div>
              <Input value={seg.description} onChange={(e) => updateSegment(idx, "description", e.target.value)} disabled={readonly} placeholder={t("maSegmentDesc")} className="text-sm" />
            </div>
          ))}
        </div>
      </div>

      {!readonly && (
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty}>{t("save")}</Button>
        </div>
      )}
    </div>
  );
}
