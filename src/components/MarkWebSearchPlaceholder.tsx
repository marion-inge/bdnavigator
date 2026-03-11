import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import markRobot from "@/assets/mark-robot.png";

interface Props {
  titleEn: string;
  titleDe: string;
  descriptionEn: string;
  descriptionDe: string;
}

export function MarkWebSearchPlaceholder({ titleEn, titleDe, descriptionEn, descriptionDe }: Props) {
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  return (
    <div className="rounded-lg border border-dashed border-agent-mark/40 bg-agent-mark-light p-6">
      <div className="flex flex-col items-center text-center gap-3">
        <img src={markRobot} alt="Mark" className="w-16 h-16" />
        <div>
          <h3 className="font-semibold text-card-foreground">
            Mark – {bp(titleEn, titleDe)}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">
            {bp(descriptionEn, descriptionDe)}
          </p>
        </div>
        <Button
          disabled
          variant="outline"
          className="mt-2 border-agent-mark/30 text-agent-mark hover:bg-agent-mark/10 opacity-60 cursor-not-allowed"
        >
          <Search className="h-4 w-4 mr-2" />
          {bp("Coming Soon", "Demnächst verfügbar")}
        </Button>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
          <img src={markRobot} alt="" className="h-3.5 w-3.5" />
          Mark – Market Researcher
        </p>
      </div>
    </div>
  );
}
