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
                      "When you revert to a previous phase, all gate records at or beyond the target phase are automatically deleted to maintain data integrity. For example, reverting from Market Verification back to TAM SAM SOM removes the G3 gate decision. Your data in each section (scoring, scans, business plan, interviews, business case) is preserved — only the gate decisions are affected.",
                      "Wenn Sie zu einer früheren Phase zurückkehren, werden alle Gate-Einträge ab der Zielphase automatisch gelöscht, um die Datenintegrität zu gewährleisten. Beispiel: Ein Rückschritt von der Marktverifizierung zur TAM-SAM-SOM-Analyse entfernt die G3-Gate-Entscheidung. Ihre Daten in den einzelnen Bereichen (Scoring, Scans, Business Plan, Interviews, Business Case) bleiben erhalten — nur die Gate-Entscheidungen sind betroffen."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="phases">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("Which phases and gates does an idea go through?", "Welche Phasen und Gates durchläuft eine Idee?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "Seven phases with five gates: 1) Idea & Idea Scoring → G1, 2) AI-assisted Market Intelligence (Hypothesis & Scan Pack) → G2, 3) TAM SAM SOM Analysis → G3, 4) Market Verification → G4, 5) Business Case → G5, 6) Implementation & GTM Plan, 7) Implementation & Review.",
                      "Sieben Phasen mit fünf Gates: 1) Idee & Ideen-Scoring → G1, 2) KI-gestützte Market Intelligence (Hypothese & Scan Pack) → G2, 3) TAM SAM SOM Analyse → G3, 4) Marktverifizierung → G4, 5) Business Case → G5, 6) Umsetzung & GTM-Plan, 7) Umsetzung & Review."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="market-verification">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("Where do I find Market Verification?", "Wo finde ich die Marktverifizierung?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "Market Verification is its own section (Phase 4) in the sidebar — it is no longer part of the TAM/SAM/SOM analysis. It contains four tabs: Customer Interviews, Affiliate Interviews, BU Interviews, and Pilot & Leads. Clicking any of the four sidebar entries opens the page with that tab selected. All previously entered interview and pilot data is preserved.",
                      "Die Marktverifizierung ist ein eigener Bereich (Phase 4) in der Sidebar — sie ist nicht mehr Teil der TAM/SAM/SOM-Analyse. Sie enthält vier Tabs: Kundeninterviews, Affiliate-Interviews, BU-Interviews und Pilot & Leads. Ein Klick auf einen der vier Sidebar-Einträge öffnet die Seite mit dem jeweiligen Tab. Alle bisher erfassten Interview- und Pilotdaten bleiben erhalten."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="scan-order">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("In which order should the scans be run?", "In welcher Reihenfolge sollten die Scans laufen?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "The scans build on each other: the Industry Scan feeds the Customer Scan, the Customer Scan feeds the Buying Center Scan, and the Industry, Customer and Competitor scans are prerequisites for the Market Potential Scan. The Scan Pack shows a warning when a scan is started before its predecessors are done — you can still proceed, but the results will be weaker.",
                      "Die Scans bauen aufeinander auf: Der Industrie-Scan speist den Kunden-Scan, der Kunden-Scan den Buying-Center-Scan, und Industrie-, Kunden- und Wettbewerbs-Scan sind Voraussetzung für den Marktpotenzial-Scan. Das Scan Pack zeigt eine Warnung, wenn ein Scan vor seinen Vorgängern gestartet wird — Sie können fortfahren, die Ergebnisse werden aber schwächer."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="export">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("How do I export an idea?", "Wie exportiere ich eine Idee?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "There is one single download per idea. It generates a complete PDF containing idea data, scoring, business plan with TAM/SAM/SOM and all supporting models, all charts, market verification, and the business case.",
                      "Es gibt genau einen Download pro Idee. Er erzeugt ein vollständiges PDF mit Ideendaten, Scoring, Business Plan inkl. TAM/SAM/SOM und allen unterstützenden Modellen, allen Charts, Marktverifizierung und Business Case."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delete-confirm">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("Can I accidentally delete data?", "Kann ich versehentlich Daten löschen?")}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground">
                    {bp(
                      "No. Every delete action in the tool opens a confirmation dialog first, naming what will be removed.",
                      "Nein. Jede Löschaktion im Tool öffnet zuerst einen Bestätigungsdialog, der benennt, was entfernt wird."
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
                      "No, stages must be completed in order. Each gate decision (G1–G5) is only available when the idea is at the corresponding gate stage. However, you can fill in data for later sections at any time — the stage only controls which gate decisions are available.",
                      "Nein, die Phasen müssen in der Reihenfolge durchlaufen werden. Jede Gate-Entscheidung (G1–G5) ist nur verfügbar, wenn sich die Idee in der entsprechenden Gate-Phase befindet. Sie können jedoch jederzeit Daten für spätere Bereiche eintragen — die Phase steuert nur, welche Gate-Entscheidungen verfügbar sind."
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
                      "Use 'Import from TAM SAM SOM' in the Business Case to transfer SOM revenue projections and market assumptions (Portfolio Coverage, Visibility, Visibility Growth, Hitrate). If verification changes the model, update TAM/SAM/SOM and run the import again.",
                      "Nutzen Sie im Business Case „Aus TAM SAM SOM übernehmen“, um SOM-Umsatzprojektionen und Marktannahmen (Portfolioabdeckung, Sichtbarkeit, Sichtbarkeitswachstum, Hitrate) zu übertragen. Verändert die Verifizierung das Modell, aktualisieren Sie TAM/SAM/SOM und führen die Übernahme erneut aus."
                    )}
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="ida-fill-market">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("How does 'Fill TAM/SAM/SOM with IDA' work?", "Wie funktioniert „TAM/SAM/SOM mit IDA ausfüllen“?")}
                </AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{bp(
                  "Open the relevant TAM, SAM or SOM overview, select attachments and Scan Pack results, and start IDA. IDA proposes values field by field; review, edit and select them before applying. Existing data is not silently overwritten.",
                  "Öffnen Sie die jeweilige TAM-, SAM- oder SOM-Übersicht, wählen Sie Anhänge und Scan-Pack-Ergebnisse und starten Sie IDA. IDA schlägt Werte feldweise vor; prüfen, bearbeiten und markieren Sie diese vor der Übernahme. Bestehende Daten werden nicht still überschrieben."
                )}</p></AccordionContent>
              </AccordionItem>

              <AccordionItem value="long-pdf">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("Can IDA read long PDF documents?", "Kann IDA lange PDF-Dokumente lesen?")}
                </AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{bp(
                  "Yes. Text PDFs are extracted page by page in the browser, divided into sections and condensed with page references before fields are proposed. This can take several minutes and consumes more AI credits. Image-only scans without selectable text cannot use this route and remain subject to the file-size limit.",
                  "Ja. Text-PDFs werden im Browser seitenweise ausgelesen, in Abschnitte geteilt und mit Seitenhinweisen verdichtet, bevor Feldvorschläge entstehen. Das kann mehrere Minuten dauern und mehr KI-Credits verbrauchen. Reine Bildscans ohne auswählbaren Text können diesen Weg nicht nutzen und unterliegen weiterhin der Dateigrößengrenze."
                )}</p></AccordionContent>
              </AccordionItem>

              <AccordionItem value="verification-calibration">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("How do verification findings update TAM/SAM/SOM?", "Wie wirken Verifizierungsergebnisse auf TAM/SAM/SOM?")}
                </AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{bp(
                  "In Market Verification, ask IDA for adjustments. IDA compares customer, affiliate and BU interviews plus Pilot & Leads with the current SAM/SOM model. Each recommendation shows the current and proposed value with a rationale. Apply only selected changes, then re-import the updated market assumptions into the Business Case.",
                  "Lassen Sie IDA in der Marktverifizierung Anpassungen empfehlen. IDA vergleicht Kunden-, Affiliate- und BU-Interviews sowie Pilot & Leads mit dem aktuellen SAM-/SOM-Modell. Jede Empfehlung zeigt aktuellen und vorgeschlagenen Wert samt Begründung. Übernehmen Sie nur ausgewählte Änderungen und importieren Sie anschließend die aktualisierten Marktannahmen erneut in den Business Case."
                )}</p></AccordionContent>
              </AccordionItem>

              <AccordionItem value="ida-verdict">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("What do IDA's Go, Hold and Stop verdicts mean?", "Was bedeuten IDAs Urteile Go, Hold und Stop?")}
                </AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{bp(
                  "Go means score ≥3.5, the current phase is at least 80% complete and no stop gate is open. Hold applies when the score is 2.5–3.5, more than two mandatory steps are open, or TAM/SAM/SOM is empty. Stop applies when the score is below 2.5, a gate was rejected, or NPV/ROI is negative. The summary supports a decision; it does not replace the documented gate decision.",
                  "Go bedeutet: Score ≥3,5, aktuelle Phase zu mindestens 80 % abgeschlossen und kein offenes Stop-Gate. Hold gilt bei Score 2,5–3,5, mehr als zwei offenen Pflichtschritten oder leerem TAM/SAM/SOM. Stop gilt bei Score unter 2,5, abgelehntem Gate oder negativem NPV/ROI. Die Zusammenfassung unterstützt die Entscheidung, ersetzt aber nicht die dokumentierte Gate-Entscheidung."
                )}</p></AccordionContent>
              </AccordionItem>

              <AccordionItem value="mobile-navigation">
                <AccordionTrigger className="text-sm font-medium">
                  {bp("How do I open TAM/SAM/SOM subpages on mobile?", "Wie öffne ich TAM-/SAM-/SOM-Unterseiten mobil?")}
                </AccordionTrigger>
                <AccordionContent><p className="text-sm text-muted-foreground">{bp(
                  "Tap TAM, SAM or SOM to keep the expandable sidebar group open, then select the desired child page. Choosing a child closes the sidebar and opens only that page rather than scrolling within a combined overview.",
                  "Tippen Sie auf TAM, SAM oder SOM; die aufklappbare Gruppe bleibt geöffnet. Wählen Sie dann die gewünschte Unterseite. Erst die Auswahl der Unterseite schließt die Sidebar und öffnet ausschließlich diese Seite, statt innerhalb einer Gesamtansicht zu scrollen."
                )}</p></AccordionContent>
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
                      "IDA is active: she analyzes entered data, selected attachments and Scan Pack results, creates assessments and status summaries, fills market fields and calibrates the model after verification. Mark is the planned external research agent; his future prompts are documented, but he is not currently active in TAM/SAM/SOM.",
                      "IDA ist aktiv: Sie analysiert eingegebene Daten, ausgewählte Anhänge und Scan-Pack-Ergebnisse, erstellt Assessments und Statuszusammenfassungen, befüllt Marktfelder und kalibriert das Modell nach der Verifizierung. Mark ist der geplante Agent für externe Recherche; seine künftigen Prompts sind dokumentiert, in TAM/SAM/SOM ist er derzeit aber nicht aktiv."
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
                      "A No-Go decision is recorded but does not automatically archive or delete the idea. The idea remains accessible and can be revisited. The decision serves as documentation that the idea was evaluated and rejected at that gate, with the rationale preserved for future reference.",
                      "Eine No-Go-Entscheidung wird dokumentiert, archiviert oder löscht die Idee aber nicht automatisch. Die Idee bleibt zugänglich und kann erneut besucht werden. Die Entscheidung dient als Dokumentation, dass die Idee an diesem Gate bewertet und abgelehnt wurde, wobei die Begründung für zukünftige Referenz erhalten bleibt."
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
