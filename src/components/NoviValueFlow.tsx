import {
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Files,
  MessageSquareText,
  ScanSearch,
} from "lucide-react";

type Bp = (en: string, de: string) => string;

interface NoviValueFlowProps {
  bp: Bp;
  variant?: "compact" | "detailed";
}

const phases = [
  {
    number: 1,
    titleEn: "Idea & Scoring",
    titleDe: "Idee & Scoring",
    workEn: "Shape the hypothesis and score 22 criteria.",
    workDe: "Hypothese schärfen und 22 Kriterien bewerten.",
    resultEn: "Comparable idea score",
    resultDe: "Vergleichbarer Ideen-Score",
  },
  {
    number: 2,
    titleEn: "Market Intelligence",
    titleDe: "Marktintelligenz",
    workEn: "Run connected industry, customer, buying-center and competitor scans.",
    workDe: "Verknüpfte Industrie-, Kunden-, Buying-Center- und Wettbewerber-Scans durchführen.",
    resultEn: "Structured evidence pack",
    resultDe: "Strukturiertes Evidenzpaket",
  },
  {
    number: 3,
    titleEn: "TAM SAM SOM",
    titleDe: "TAM SAM SOM",
    workEn: "Model market size, segments, growth, competition and obtainable revenue.",
    workDe: "Marktgröße, Segmente, Wachstum, Wettbewerb und erreichbaren Umsatz modellieren.",
    resultEn: "Traceable market model",
    resultDe: "Nachvollziehbares Marktmodell",
  },
  {
    number: 4,
    titleEn: "Market Verification",
    titleDe: "Marktverifizierung",
    workEn: "Test assumptions in interviews, pilots and the lead pipeline.",
    workDe: "Annahmen in Interviews, Piloten und der Lead-Pipeline prüfen.",
    resultEn: "Validated demand signals",
    resultDe: "Validierte Nachfragesignale",
  },
  {
    number: 5,
    titleEn: "Business Case",
    titleDe: "Business Case",
    workEn: "Translate verified demand into investment, cash flow, NPV, ROI and payback.",
    workDe: "Validierte Nachfrage in Investition, Cashflow, NPV, ROI und Amortisation übersetzen.",
    resultEn: "Decision-ready economics",
    resultDe: "Entscheidungsreife Wirtschaftlichkeit",
  },
  {
    number: 6,
    titleEn: "Implementation & GTM",
    titleDe: "Umsetzung & GTM",
    workEn: "Define target segments, channels, pilots, owners and milestones.",
    workDe: "Zielsegmente, Kanäle, Piloten, Verantwortliche und Meilensteine definieren.",
    resultEn: "Executable launch plan",
    resultDe: "Umsetzbarer Markteintrittsplan",
  },
  {
    number: 7,
    titleEn: "Implement & Review",
    titleDe: "Umsetzung & Review",
    workEn: "Track delivery, learn from results and update the portfolio decision.",
    workDe: "Umsetzung verfolgen, aus Ergebnissen lernen und die Portfolioentscheidung aktualisieren.",
    resultEn: "Measured learning loop",
    resultDe: "Messbarer Lernkreislauf",
  },
];

const gateAfter = new Map([[1, "G1"], [2, "G2"], [3, "G3"], [4, "G4"], [5, "G5"]]);

export function NoviValueFlow({ bp, variant = "detailed" }: NoviValueFlowProps) {
  const detailed = variant === "detailed";

  const inputs = [
    { icon: Files, label: bp("Idea & documents", "Idee & Dokumente") },
    { icon: ScanSearch, label: bp("Scans & market data", "Scans & Marktdaten") },
    { icon: MessageSquareText, label: bp("Interviews & pilots", "Interviews & Piloten") },
  ];

  const outputs = [
    { icon: CheckCircle2, label: bp("Go · Hold · Stop", "Go · Hold · Stop") },
    { icon: BarChart3, label: bp("Market & financial model", "Markt- & Finanzmodell") },
    { icon: FileCheck2, label: bp("Board-ready PDF", "Board-fertiges PDF") },
  ];

  return (
    <section className="novi-flow overflow-hidden rounded-lg border border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-7 sm:px-8 sm:py-9">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase text-sidebar-primary">
            {bp("From evidence to decision", "Von Evidenz zur Entscheidung")}
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {bp("How NOVI turns ideas into investable decisions", "Wie NOVI Ideen in investierbare Entscheidungen überführt")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-sidebar-foreground/75 sm:text-base">
            {bp(
              "NOVI connects fragmented inputs, challenges assumptions at five gates and produces one traceable, board-ready business case.",
              "NOVI verbindet fragmentierte Eingangsdaten, prüft Annahmen an fünf Gates und erzeugt einen nachvollziehbaren, board-fertigen Business Case."
            )}
          </p>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {inputs.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-h-14 items-center gap-3 rounded-md border border-sidebar-border bg-sidebar-accent/60 px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-sidebar-primary" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>

        <div className="relative my-5 h-8" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-full w-px bg-sidebar-border" />
          <div className="novi-flow-drop absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-sidebar-primary" />
        </div>

        <div className="flex justify-center">
          <div className="novi-flow-core relative flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 border-sidebar-primary bg-sidebar-accent text-center shadow-lg sm:h-32 sm:w-32">
            <span className="text-2xl font-bold">NOVI</span>
            <span className="mt-1 text-[10px] font-bold uppercase text-sidebar-primary">
              {bp("Decision engine", "Decision Engine")}
            </span>
          </div>
        </div>

        <div className="relative my-5 h-8" aria-hidden="true">
          <div className="absolute left-1/2 top-0 h-full w-px bg-sidebar-border" />
          <div className="novi-flow-drop novi-flow-delay absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-sidebar-primary" />
        </div>

        <div className="relative">
          <div className="novi-flow-track absolute left-0 right-0 top-6 hidden h-px bg-sidebar-border lg:block" aria-hidden="true">
            <div className="novi-flow-signal absolute top-0 h-px w-24 bg-gradient-to-r from-transparent via-sidebar-primary to-transparent" />
          </div>
          <div className="grid gap-3 lg:grid-cols-7 lg:gap-2">
            {phases.map((phase) => {
              const gate = gateAfter.get(phase.number);
              return (
                <div key={phase.number} className="relative flex gap-4 lg:block">
                  <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-sidebar-primary bg-sidebar text-lg font-bold text-sidebar-primary lg:mx-auto">
                    {phase.number}
                  </div>
                  <div className="min-w-0 flex-1 lg:text-center">
                    <h3 className="mt-1 text-sm font-bold lg:mt-3">{bp(phase.titleEn, phase.titleDe)}</h3>
                    {detailed && (
                      <>
                        <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/65">{bp(phase.workEn, phase.workDe)}</p>
                        <p className="mt-2 text-xs font-semibold text-sidebar-primary">{bp(phase.resultEn, phase.resultDe)}</p>
                      </>
                    )}
                  </div>
                  {gate && (
                    <div className="absolute left-6 top-[3.35rem] z-20 -translate-x-1/2 lg:-right-3 lg:left-auto lg:top-4 lg:translate-x-1/2">
                      <span className="novi-gate-pulse inline-flex h-7 min-w-9 items-center justify-center rounded-md border border-warning bg-sidebar px-2 text-[10px] font-bold text-warning">
                        {gate}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-[-0.75rem] left-6 top-12 w-px bg-sidebar-border lg:hidden" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-3 rounded-md border border-sidebar-primary/40 bg-sidebar-accent/70 px-4 py-3 text-center text-xs sm:text-sm">
          <span className="font-bold text-sidebar-primary">IDA</span>
          <span>
            {bp(
              "detects gaps, recommends adjustments and recalibrates TAM, SAM and SOM from verification evidence.",
              "erkennt Lücken, empfiehlt Anpassungen und kalibriert TAM, SAM und SOM anhand der Verifizierung neu."
            )}
          </span>
          <span className="novi-loop-arrow text-lg text-sidebar-primary" aria-hidden="true">↺</span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {outputs.map(({ icon: Icon, label }) => (
            <div key={label} className="flex min-h-14 items-center gap-3 rounded-md border border-success/40 bg-sidebar-accent/60 px-4 py-3">
              <Icon className="h-5 w-5 shrink-0 text-success" />
              <span className="text-sm font-semibold">{label}</span>
            </div>
          ))}
        </div>

        {detailed && (
          <div className="mt-7 grid gap-5 border-t border-sidebar-border pt-6 text-sm md:grid-cols-3">
            <div>
              <h4 className="font-bold">{bp("One source of truth", "Eine gemeinsame Datenbasis")}</h4>
              <p className="mt-1 text-sidebar-foreground/65">{bp("Evidence, assumptions and decisions remain linked instead of living in separate files.", "Evidenz, Annahmen und Entscheidungen bleiben verbunden, statt in einzelnen Dateien zu liegen.")}</p>
            </div>
            <div>
              <h4 className="font-bold">{bp("Decisions with discipline", "Entscheidungen mit Disziplin")}</h4>
              <p className="mt-1 text-sidebar-foreground/65">{bp("Five gates stop weak ideas early and focus resources on opportunities that earn the next step.", "Fünf Gates stoppen schwache Ideen früh und fokussieren Ressourcen auf Chancen, die den nächsten Schritt verdienen.")}</p>
            </div>
            <div>
              <h4 className="font-bold">{bp("Ready for the board", "Bereit für das Board")}</h4>
              <p className="mt-1 text-sidebar-foreground/65">{bp("The complete evidence trail, market logic and economics are exported as one coherent report.", "Die vollständige Evidenz, Marktlogik und Wirtschaftlichkeit werden als ein konsistenter Bericht exportiert.")}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}