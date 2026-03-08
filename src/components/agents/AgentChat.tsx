import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n";
import { AgentType, AgentMessage, streamAgentChat } from "@/lib/agentService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Loader2 } from "lucide-react";
import idaAvatar from "@/assets/ida-robot.png";
import markAvatar from "@/assets/mark-robot.png";

interface Props {
  agent: AgentType;
  context: Record<string, unknown>;
  sectionLabel: string;
  onClose: () => void;
}

const AGENT_CONFIG = {
  ida: {
    name: "IDA",
    subtitle: { en: "Internal Data Analyst", de: "Interne Datenanalystin" },
    avatar: idaAvatar,
    colorClass: "agent-ida",
    greeting: {
      en: "Hi! I'm **IDA**, your Internal Data Analyst. I'll analyze the data in this section and give you insights, find patterns, and highlight strengths & weaknesses. What would you like me to look at?",
      de: "Hallo! Ich bin **IDA**, deine interne Datenanalystin. Ich analysiere die Daten in diesem Bereich und gebe dir Einblicke, finde Muster und zeige Stärken & Schwächen auf. Was soll ich mir ansehen?",
    },
  },
  mark: {
    name: "Mark",
    subtitle: { en: "Market Researcher", de: "Marktforscher" },
    avatar: markAvatar,
    colorClass: "agent-mark",
    greeting: {
      en: "Hey! I'm **Mark**, your Market Researcher. I can suggest improvements based on market best practices, point out relevant industry trends, and recommend external research directions. 🔍 *Note: Live web search coming soon — currently using knowledge-based analysis.* What should I research?",
      de: "Hey! Ich bin **Mark**, dein Marktforscher. Ich kann Verbesserungen basierend auf Markt-Best-Practices vorschlagen, relevante Branchentrends aufzeigen und externe Forschungsrichtungen empfehlen. 🔍 *Hinweis: Live-Websuche kommt bald — aktuell wissensbasierte Analyse.* Was soll ich recherchieren?",
    },
  },
};

export function AgentChat({ agent, context, sectionLabel, onClose }: Props) {
  const { language } = useI18n();
  const lang = language === "de" ? "de" : "en";
  const config = AGENT_CONFIG[agent];

  const [messages, setMessages] = useState<AgentMessage[]>([
    { role: "assistant", content: config.greeting[lang] },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: AgentMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    // Send only user/assistant messages (skip greeting for API)
    const apiMessages = [...messages.slice(1), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamAgentChat({
      agent,
      context: { ...context, sectionLabel },
      messages: apiMessages,
      language,
      onDelta: (chunk) => upsertAssistant(chunk),
      onDone: () => setIsLoading(false),
      onError: (err) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ ${err}` },
        ]);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const borderColor = agent === "ida" ? "border-agent-ida" : "border-agent-mark";
  const headerBg = agent === "ida" ? "bg-agent-ida" : "bg-agent-mark";

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className={`sm:max-w-lg max-h-[80vh] flex flex-col p-0 gap-0 border-2 ${borderColor}`}>
        {/* Header */}
        <div className={`${headerBg} text-white px-4 py-3 flex items-center gap-3 rounded-t-lg`}>
          <img src={config.avatar} alt={config.name} className="h-8 w-8 rounded-full bg-white/20 p-0.5" />
          <div className="flex-1">
            <DialogHeader className="p-0 space-y-0">
              <DialogTitle className="text-white text-base font-bold">{config.name}</DialogTitle>
            </DialogHeader>
            <p className="text-white/80 text-xs">{config.subtitle[lang]} — {sectionLabel}</p>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[50vh]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-muted text-foreground"
                    : agent === "ida"
                      ? "bg-agent-ida-light text-foreground border border-agent-ida/20"
                      : "bg-agent-mark-light text-foreground border border-agent-mark/20"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className={`rounded-xl px-3 py-2 text-sm ${agent === "ida" ? "bg-agent-ida-light border border-agent-ida/20" : "bg-agent-mark-light border border-agent-mark/20"}`}>
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={language === "de" ? `${config.name} fragen...` : `Ask ${config.name}...`}
            className="resize-none min-h-[40px] max-h-[100px]"
            rows={1}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={agent === "ida" ? "bg-agent-ida hover:bg-agent-ida/90" : "bg-agent-mark hover:bg-agent-mark/90"}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
