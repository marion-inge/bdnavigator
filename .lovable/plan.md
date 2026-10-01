# Funktionen aus „NOVI – Testkopie Rechenkern“ übernehmen

## Ziel
Alle Zusatzfunktionen der Kopie hierher holen, ohne die Verbesserungen dieses Projekts zu verlieren (Einlesen von Excel/Word/PowerPoint, große Dokumente in Teilen, Hypothese aus Excel, Outreach-Übergabe, Go/Hold/Stop, IDA-Kalibrierung).

## Was übernommen wird
1. Rechenkern für TAM/SAM/SOM mit Annahmen-Register, Herleitung je Zahl und Belegen
2. Marktdaten-Import und Markt-Analyseseiten / Ergebnis-Panel
3. Regelbasierter Rückweg aus der Marktverifizierung (Interviews → Annahmen), G4-Kennzahlen, Warnsignale, Änderungen seit dem letzten Gate – zusätzlich zur bestehenden IDA-Kalibrierung
4. Idea Scoring als Gespräch inkl. IDA-Bewertungsvorschlägen
5. Vollständigkeitsanzeige der Hypothese
6. Demo-Beispiel mit Ein/Aus-Schalter (Standard hier: AUS, damit das leere Tool leer bleibt)
7. Zahlenerkennung in Freitext (DE/EN) und alle zugehörigen Tests

## Vorgehen
- Neue Dateien unverändert aus der Kopie kopieren.
- Gemeinsam genutzte Dateien (Datentypen, Speicher, Ideen-Detailseite, TAM/SAM/SOM-Seiten, Scoring, Marktverifizierung, Fragenkatalog, Hypothese) Stück für Stück zusammenführen: Ergänzungen der Kopie einbauen, eigene neuere Logik dieses Projekts behalten.
- IDA-Ausfüllen-Dialog und IDA-Auslese-Funktion bleiben die Version dieses Projekts; nur neue Felder der Kopie werden ergänzt.
- Neue Server-Funktion für IDA-Bewertungsvorschläge übernehmen und veröffentlichen.
- Datenbank bleibt unverändert (Marktmodell wird im bestehenden Business-Plan-Feld gespeichert).

## Prüfung
- Alle Tests laufen, Vorschau fehlerfrei.
- Neue Idee anlegen, Gesprächs-Scoring, Annahmen-Register, Herleitung, Verifizierung und IDA-Ausfüllen in der Vorschau durchklicken (DE/EN, Desktop/Mobil).

## Technische Details
Neue Dateien: `src/lib/{marketEngine,marketModelTypes,verification,scoringConversation,numberParse,demoSettings,demoFull,demoScanOutputs,marketDemo}.ts` + Tests, `src/components/market/*`, `src/components/verification/VerificationPanels.tsx`, `src/components/ScoringConversation.tsx`, `src/components/hypothesis/IntakeCompleteness.tsx`, `src/components/business-plan/MarketAnalyticsPages.tsx`, `supabase/functions/ida-score-suggest`, `_shared/cron-auth.ts`. Merge per 3-Wege-Vergleich in `types.ts`, `store.tsx`, `OpportunityDetail.tsx`, `BusinessPlanSection.tsx`, `Tam/Sam/SomOverview`, `embedded/*Models`, `ScoringSection`, `RoughScoringWizard`, `roughScoringQuestions.ts`, `MarketVerificationSection.tsx`, `hypothesisTypes.ts`, `HypothesisSection/Form`, `Index.tsx`, `businessPlanIdaFields.ts`. `client.ts`/`config.toml` werden nicht angefasst.
