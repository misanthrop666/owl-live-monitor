import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const PANE = 'model-saver'
const SMALL = 'haiku'

// Sparmodus an/aus
const savings = atom({ plugin: 'model-saver', key: 'savings' } as const, false, { shape: 'v1' })
// Das grosse Modell – wird nach jeder Antwort ohne Sparmodus aktualisiert
const big = atom({ plugin: 'model-saver', key: 'big' } as const, 'sonnet', { shape: 'v1' })
// Modell der letzten Antwort (volle ID)
const last = atom({ plugin: 'model-saver', key: 'last' } as const, '', { shape: 'v1' })

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    void $.ui.open({ id: PANE, title: 'Sparmodus' })

    // Jede Session startet aus; eingeschaltet wird nur nach Rueckfrage.
    await update($, savings, () => false)
    void (async () => {
      try {
        const answer = await $.ui.ask('Sparmodus einschalten? Einfache Fragen laufen dann über Haiku.', ['Ja', 'Nein'])
        await update($, savings, () => answer === 'Ja')
      } catch {
        // abgelehnt oder keine Rückfrage möglich: bleibt aus
      }
    })()

    return next(e)
  })

  // Vor dem Turn: Modell je nach Komplexitaet waehlen
  on('prompt.submit', async ($, e, next) => {
    const isSavings = await read($, savings)

    if (isSavings && e.text && !e.command) {
      const kind = await $.model.classify(e.text, ['simple', 'complex'])
      const bigModel = await read($, big)

      if (kind === 'simple') {
        await $.config.set({ key: 'model', value: SMALL })
      } else {
        await $.config.set({ key: 'model', value: bigModel })
      }
    }

    return next(e)
  }).catch(($, e, next) => next(e))

  // Nach dem Turn: Statuszeile setzen, Modell protokollieren, grosses Modell wiederherstellen
  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    const model = e.usage?.model ?? ''

    if (model) {
      await update($, last, () => model)
      $.ui.status(label(model))

      const isSavings = await read($, savings)
      if (isSavings) {
        // Grosses Modell fuer naechsten Turn wiederherstellen
        const bigModel = await read($, big)
        void $.config.set({ key: 'model', value: bigModel })
      } else if (!model.toLowerCase().includes('haiku')) {
        // Kalibrierung: grosses Modell merken
        await update($, big, () => model)
      }
    }

    return result
  })

  // Seiten-Pane: Toggle + letztes Modell
  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const isSavings = await read($, savings)
    const lastModel = await read($, last)
    const bigModel = await read($, big)

    return (
      <Box flexDirection="column" gap={1} paddingX={1} paddingY={1}>
        <Text bold>Sparmodus</Text>

        <Box gap={1}>
          <Text>{isSavings ? '[AN] ' : '[AUS]'}</Text>
          <Button
            key="toggle"
            label={isSavings ? 'Ausschalten' : 'Einschalten'}
            onPress={() => {
              void update($, savings, v => !v)
            }}
          />
        </Box>

        <Box flexDirection="column" marginTop={1}>
          <Text dimColor>Klein: {label(SMALL)}</Text>
          <Text dimColor>Gross: {label(bigModel)}</Text>
        </Box>

        <Box marginTop={1}>
          {lastModel ? (
            <Text>Letzte Antwort: {label(lastModel)}</Text>
          ) : (
            <Text dimColor>Noch keine Antwort.</Text>
          )}
        </Box>
      </Box>
    )
  })
}

function label(model: string): string {
  const m = model.toLowerCase()
  if (m === 'haiku' || m.includes('haiku')) return 'Haiku [klein]'
  if (m === 'sonnet' || m.includes('sonnet')) return 'Sonnet [gross]'
  if (m === 'opus' || m.includes('opus')) return 'Opus [gross]'
  return model
}
