import { useI18n } from "@/lib/i18n";
import { BusinessCase, createDefaultBusinessCase } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  businessCase?: BusinessCase;
  onSave: (bc: BusinessCase) => void;
  readonly?: boolean;
}

export function BusinessCaseSection({ businessCase, onSave, readonly }: Props) {
  const { t } = useI18n();
  const [local, setLocal] = useState<BusinessCase>(businessCase || createDefaultBusinessCase());
  const [dirty, setDirty] = useState(false);

  const update = (field: keyof BusinessCase, value: string | number) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(local);
    setDirty(false);
  };

  const numericFields: { key: keyof BusinessCase; prefix?: string; suffix?: string }[] = [
    { key: "investmentCost" },
    { key: "expectedRevenue" },
    { key: "roi" },
    { key: "breakEvenMonths" },
    { key: "paybackPeriod" },
    { key: "npv" },
  ];

  const formatCurrency = (val: number) =>
    val ? new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(val) : "—";

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("investmentCost")}</span>
          <p className="text-xl font-bold text-destructive mt-1">{formatCurrency(local.investmentCost)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("expectedRevenue")}</span>
          <p className="text-xl font-bold text-success mt-1">{formatCurrency(local.expectedRevenue)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("roi")}</span>
          <p className="text-xl font-bold text-primary mt-1">{local.roi ? `${local.roi}%` : "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("breakEvenMonths")}</span>
          <p className="text-xl font-bold text-card-foreground mt-1">{local.breakEvenMonths || "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("paybackPeriod")}</span>
          <p className="text-xl font-bold text-card-foreground mt-1">{local.paybackPeriod || "—"}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">{t("npv")}</span>
          <p className="text-xl font-bold text-primary mt-1">{formatCurrency(local.npv)}</p>
        </div>
      </div>

      {/* Edit form */}
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h4 className="font-semibold text-card-foreground">{t("financialOverview")}</h4>
        <div className="grid gap-4 md:grid-cols-2">
          {numericFields.map(({ key }) => (
            <div key={key}>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
                {t(key as any)}
              </label>
              <Input
                type="number"
                value={local[key] || ""}
                onChange={(e) => update(key, parseFloat(e.target.value) || 0)}
                disabled={readonly}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 block">
            {t("businessCaseNotes")}
          </label>
          <Textarea
            value={local.notes}
            onChange={(e) => update("notes", e.target.value)}
            disabled={readonly}
            rows={4}
            className="text-sm resize-none"
          />
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
