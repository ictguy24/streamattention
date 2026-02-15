// GLOBAL UPS STATE (simple + stable)
// Initialize from localStorage to persist across reloads
let UPS = Number(localStorage.getItem('ups_score')) || 1
let lastTick = Number(localStorage.getItem('ups_last_tick')) || Date.now()

export function getUPS() {
  const now = Date.now()
  const decay = Math.max(0, (now - lastTick) / 60000) * 0.02
  UPS = Math.max(0.3, UPS - decay)
  lastTick = now

  // Persist
  localStorage.setItem('ups_score', UPS.toString())
  localStorage.setItem('ups_last_tick', lastTick.toString())

  return Number(UPS.toFixed(2))
}

export function mutateUPS(delta: number) {
  UPS = Math.min(100, Math.max(0.3, UPS + delta))
  lastTick = Date.now()

  // Persist
  localStorage.setItem('ups_score', UPS.toString())
  localStorage.setItem('ups_last_tick', lastTick.toString())

  return getUPS()
}
