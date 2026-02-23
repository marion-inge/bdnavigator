import { useI18n } from "@/lib/i18n";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface FunnelItem {
  stage: string;
  label: string;
  count: number;
}

interface PipelineFunnelProps {
  data: FunnelItem[];
  activeStage?: string;
  onStageClick?: (stage: string) => void;
}

const STAGE_COLORS = [
  "hsl(215, 50%, 30%)",   // idea
  "hsl(200, 60%, 45%)",   // rough_scoring
  "hsl(38, 90%, 50%)",    // gate1
  "hsl(260, 45%, 55%)",   // detailed_scoring
  "hsl(280, 40%, 50%)",   // gate2
  "hsl(170, 50%, 40%)",   // business_case
  "hsl(320, 45%, 50%)",   // gate3
  "hsl(145, 55%, 40%)",   // go_to_market
  "hsl(30, 70%, 50%)",    // implement_review
];

const STAGE_COLORS_DIM = STAGE_COLORS.map((c) => c.replace(")", " / 0.3)").replace("hsl(", "hsl("));

export function PipelineFunnel({ data, activeStage, onStageClick }: PipelineFunnelProps) {
  const { t } = useI18n();

  if (data.every((d) => d.count === 0)) return null;

  const handleClick = (entry: any) => {
    if (onStageClick && entry?.activePayload?.[0]?.payload) {
      const stage = entry.activePayload[0].payload.stage;
      onStageClick(stage);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">{t("pipelineFunnel")}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="horizontal"
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        >
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "hsl(220, 10%, 50%)" }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "hsl(220, 10%, 50%)" }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(0, 0%, 100%)",
              border: "1px solid hsl(220, 15%, 88%)",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value: number) => [value, t("opportunities")]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((item, idx) => (
              <Cell
                key={idx}
                fill={
                  !activeStage || activeStage === "all"
                    ? STAGE_COLORS[idx]
                    : item.stage === activeStage
                      ? STAGE_COLORS[idx]
                      : STAGE_COLORS_DIM[idx]
                }
                stroke={item.stage === activeStage ? STAGE_COLORS[idx] : "none"}
                strokeWidth={item.stage === activeStage ? 2 : 0}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
