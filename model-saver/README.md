# model-saver

Spart Kontingent: einfache Fragen beantwortet Haiku, richtige Arbeit das große Modell (Sonnet). Die Statuszeile zeigt nach jeder Antwort, welches Modell geantwortet hat. Ein Seitenpanel "Sparmodus" schaltet das Routing ein und aus und zeigt das zuletzt antwortende Modell.

Bei jedem Sessionstart fragt der Mod, ob der Sparmodus eingeschaltet werden soll. Ohne Ja bleibt er aus und greift nicht ein. Klassifiziert wird jede Eingabe vor dem Turn mit dem kleinen Standardmodell; schlägt das fehl, läuft die Frage normal weiter.

## Installation

Im Terminal-Prompt:

`/plugin install model-saver --marketplace misanthrop666/owl-live-monitor`

Aus der Shell:

`claude plugin install model-saver --marketplace misanthrop666/owl-live-monitor`

In der Desktop-App: + neben dem Prompt, Plugins, Add marketplace mit `misanthrop666/owl-live-monitor`, dann Add plugin.
