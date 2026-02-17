import { useI18n, Language } from "@/lib/i18n";

export function LanguageSwitch() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center rounded-md border border-border bg-card overflow-hidden text-sm">
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1.5 font-medium transition-colors ${
          language === "en"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("de")}
        className={`px-3 py-1.5 font-medium transition-colors ${
          language === "de"
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        DE
      </button>
    </div>
  );
}
