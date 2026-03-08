import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { AgentType } from "@/lib/agentService";
import { AgentChat } from "./AgentChat";
import idaAvatar from "@/assets/ida-robot.png";
import markAvatar from "@/assets/mark-robot.png";

interface Props {
  context: Record<string, unknown>;
  sectionLabel: string;
}

export function AgentPanel({ context, sectionLabel }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;
  const [openAgent, setOpenAgent] = useState<AgentType | null>(null);

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpenAgent("ida")}
          className="group flex items-center gap-2 rounded-lg border-2 border-agent-ida/30 bg-agent-ida-light px-3 py-2 text-sm font-medium transition-all hover:border-agent-ida hover:shadow-md hover:shadow-agent-ida/10"
          title={bp("Ask IDA – Internal Data Analyst", "IDA fragen – Interne Datenanalystin")}
        >
          <img src={idaAvatar} alt="IDA" className="h-7 w-7 rounded-full" />
          <span className="text-agent-ida font-semibold">IDA</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">{bp("Data Analyst", "Datenanalystin")}</span>
        </button>

        <button
          onClick={() => setOpenAgent("mark")}
          className="group flex items-center gap-2 rounded-lg border-2 border-agent-mark/30 bg-agent-mark-light px-3 py-2 text-sm font-medium transition-all hover:border-agent-mark hover:shadow-md hover:shadow-agent-mark/10"
          title={bp("Ask Mark – Market Researcher", "Mark fragen – Marktforscher")}
        >
          <img src={markAvatar} alt="Mark" className="h-7 w-7 rounded-full" />
          <span className="text-agent-mark font-semibold">Mark</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">{bp("Market Researcher", "Marktforscher")}</span>
        </button>
      </div>

      {openAgent && (
        <AgentChat
          agent={openAgent}
          context={context}
          sectionLabel={sectionLabel}
          onClose={() => setOpenAgent(null)}
        />
      )}
    </>
  );
}
