import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import noviLogo from "@/assets/novi-logo-v4.png";

export default function FAQ() {
  const navigate = useNavigate();
  const { language } = useI18n();
  const bp = (en: string, de: string) => language === "de" ? de : en;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={noviLogo} alt="NOVI" className="h-12 shrink-0" />
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-bold text-card-foreground">
                {bp("Frequently Asked Questions", "Häufig gestellte Fragen")}
              </h1>
            </div>
          </div>
          <LanguageSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Card>
          <CardContent className="pt-6">
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="revert-gate">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("What happens when I revert a gate decision?", "Was passiert, wenn ich eine Gate-Entscheidung rückgängig mache?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "When you revert to a previous stage, all gate records at or beyond the target stage are automatically deleted to maintain data integrity. For example, reverting from Business Case back to Business Plan will remove the G2 gate decision. Your data in each section (scoring, business plan, etc.) is preserved — only the gate decisions are affected.",
                      "Wenn Sie zu einer früheren Phase zurückkehren, werden alle Gate-Einträge ab der Zielphase automatisch gelöscht, um die Datenintegrität zu gewährleisten. Beispiel: Ein Rückschritt vom Business Case zum Business Plan entfernt die G2-Gate-Entscheidung. Ihre Daten in den einzelnen Bereichen (Scoring, Business Plan etc.) bleiben erhalten — nur die Gate-Entscheidungen sind betroffen."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="skip-stages">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("Can I skip stages?", "Kann ich Stages überspringen?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "No, stages must be completed in order. Each gate decision (G1, G2, G3) is only available when the opportunity is at the corresponding gate stage. However, you can fill in data for later sections at any time — the stage only controls which gate decisions are available.",
                      "Nein, die Phasen müssen in der Reihenfolge durchlaufen werden. Jede Gate-Entscheidung (G1, G2, G3) ist nur verfügbar, wenn sich die Opportunity in der entsprechenden Gate-Phase befindet. Sie können jedoch jederzeit Daten für spätere Bereiche eintragen — die Phase steuert nur, welche Gate-Entscheidungen verfügbar sind."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="edit-gate">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("Can I edit a gate decision after it was made?", "Kann ich eine Gate-Entscheidung nachträglich bearbeiten?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "Yes, past gate decisions can be edited (change decision, decider, or comment) or deleted entirely. Hover over a gate record to see the edit and delete buttons. Deleting a gate record does not automatically change the current stage.",
                      "Ja, vergangene Gate-Entscheidungen können bearbeitet (Entscheidung, Entscheider oder Kommentar ändern) oder komplett gelöscht werden. Fahren Sie mit der Maus über einen Gate-Eintrag, um die Bearbeitungs- und Lösch-Buttons zu sehen. Das Löschen eines Gate-Eintrags ändert nicht automatisch die aktuelle Phase."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="data-bridge">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("How does data flow from Business Plan to Business Case?", "Wie fließen Daten vom Business Plan zum Business Case?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "The Data Bridge automatically transfers SOM revenue projections and market assumptions (Portfolio Coverage, Visibility, Visibility Growth, Hitrate) from the Business Plan into the Business Case. These values appear as read-only references in the Business Case to ensure consistency. To change them, update the SOM section in the Business Plan.",
                      "Die Datenbrücke überträgt automatisch SOM-Umsatzprojektionen und Marktannahmen (Portfolioabdeckung, Sichtbarkeit, Sichtbarkeitswachstum, Hitrate) vom Business Plan in den Business Case. Diese Werte erscheinen als Nur-Lese-Referenzen im Business Case, um Konsistenz zu gewährleisten. Um sie zu ändern, aktualisieren Sie den SOM-Bereich im Business Plan."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scoring-formula">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("How is the Idea Score calculated?", "Wie wird der Ideen-Score berechnet?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "The score is a weighted average of 5 categories: Market Attractiveness (×3), Strategic Fit (×1), Feasibility (×2), Commercial Viability (×2), and Risk (×1, inverted). Risk is subtracted from 6 so higher risk lowers the score. The formula is: (MA×3 + SF×1 + FE×2 + CV×2 + (6−RI)×1) / 9.",
                      "Der Score ist ein gewichteter Durchschnitt aus 5 Kategorien: Marktattraktivität (×3), Strategischer Fit (×1), Machbarkeit (×2), Kommerzielle Tragfähigkeit (×2) und Risiko (×1, invertiert). Risiko wird von 6 subtrahiert, sodass höheres Risiko den Score senkt. Die Formel lautet: (MA×3 + SF×1 + FE×2 + CV×2 + (6−RI)×1) / 9."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="market-units">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("What units are used for market values?", "Welche Einheiten werden für Marktwerte verwendet?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "All market values (TAM, SAM, SOM) are in M€ (millions of euros). Values above 1,000 M€ are displayed as B€ (billions) in charts. The Business Case uses the same unit system for its 11-year financial projections.",
                      "Alle Marktwerte (TAM, SAM, SOM) sind in M€ (Millionen Euro). Werte über 1.000 M€ werden in Charts als B€ (Milliarden) angezeigt. Der Business Case verwendet dasselbe Einheitensystem für seine 11-Jahres-Finanzprojektionen."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ai-agents">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("What is the difference between IDA and Mark?", "Was ist der Unterschied zwischen IDA und Mark?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "IDA (Internal Data Analyst) works exclusively with the data you've entered in the tool — she finds connections, identifies gaps, and gives recommendations based on your inputs. Mark (Market Researcher) focuses on external market context — he suggests improvements based on industry best practices, trends, and benchmarks.",
                      "IDA (Interne Datenanalystin) arbeitet ausschließlich mit den Daten, die Sie im Tool eingegeben haben — sie findet Verbindungen, identifiziert Lücken und gibt Empfehlungen basierend auf Ihren Eingaben. Mark (Marktforscher) konzentriert sich auf externen Marktkontext — er schlägt Verbesserungen basierend auf Branchenstandards, Trends und Benchmarks vor."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="no-go">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("What happens if a gate decision is 'No-Go'?", "Was passiert bei einer 'No-Go'-Gate-Entscheidung?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "A No-Go decision is recorded but does not automatically archive or delete the opportunity. The idea remains accessible and can be revisited. The decision serves as documentation that the idea was evaluated and rejected at that gate, with the rationale preserved for future reference.",
                      "Eine No-Go-Entscheidung wird dokumentiert, archiviert oder löscht die Opportunity aber nicht automatisch. Die Idee bleibt zugänglich und kann erneut besucht werden. Die Entscheidung dient als Dokumentation, dass die Idee an diesem Gate bewertet und abgelehnt wurde, wobei die Begründung für zukünftige Referenz erhalten bleibt."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
