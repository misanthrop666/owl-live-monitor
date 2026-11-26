declare module 'claude-code' {
  interface PluginState {
    'model-saver': {
      savings: Shaped<boolean>
      big: Shaped<string>
      last: Shaped<string>
    }
  }
}
