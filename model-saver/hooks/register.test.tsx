import { expect, test } from 'claude-code/testing'

const PANE = {
  plugin: 'model-saver',
  component: 'Pane',
  requestId: 'model-saver',
  props: {
    title: 'Sparmodus',
    isFocused: false,
    bodyColumns: 40,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 20 },
    view: {},
  },
} as const

function stubState(on: any, initial: Record<string, unknown>) {
  const store: Record<string, unknown> = { ...initial }
  on('state.get', (_: any, e: any) => ({
    value: { value: store[e.key], version: e.key in store ? 1 : 0 },
  }))
  on('state.set', (_: any, e: any) => {
    store[e.key] = e.value
    return { value: { isSet: true, version: 1 } }
  })
  return store
}

test('Sparmodus an: einfache Frage geht an Haiku', async ($, on) => {
  const sets: unknown[] = []
  stubState(on, {})
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('tool.call', { tool: 'AskUserQuestion' }, (_: any, e: any) => ({
    result: { answers: { [e.questions[0].question]: 'Ja' } },
  }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('model.classify', () => ({ value: 'simple' }))
  on('config.set', (_, e) => {
    sets.push(e)
    return { value: e.value }
  })
  on('prompt.submit', (_, e) => ({ text: e.text }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await new Promise(r => setTimeout(r, 50))
  await $.prompt.submit({ text: 'Wie spät ist es in Tokio?' })

  expect(JSON.stringify(sets)).toContain('haiku')
})

test('Sparmodus aus (Antwort Nein): nichts wird umgeschaltet', async ($, on) => {
  const sets: unknown[] = []
  stubState(on, {})
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('tool.call', { tool: 'AskUserQuestion' }, (_: any, e: any) => ({
    result: { answers: { [e.questions[0].question]: 'Nein' } },
  }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('model.classify', () => ({ value: 'simple' }))
  on('config.set', (_, e) => {
    sets.push(e)
    return { value: e.value }
  })
  on('prompt.submit', (_, e) => ({ text: e.text }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await new Promise(r => setTimeout(r, 50))
  await $.prompt.submit({ text: 'Wie spät ist es in Tokio?' })

  expect(sets.length).toBe(0)
})

test('das Pane zeigt Schalter und noch keine Antwort', async ($, on) => {
  stubState(on, {})
  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })

  expect((await ui.find({ type: 'Text', text: /Noch keine Antwort/ }))?.text).toBe('Noch keine Antwort.')
  expect(await ui.find({ key: 'toggle' })).toBeTruthy()
  await ui.unmount()
})
