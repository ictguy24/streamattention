// GLOBAL UPS STATE (simple + stable)
let UPS = 1
let lastTick = Date.now()

export function getUPS() {
  const now = Date.now()
  const decay = Math.max(0, (now - lastTick) / 60000) * 0.02
  UPS = Math.max(0.3, UPS - decay)
  lastTick = now
  return Number(UPS.toFixed(2))
}

export function mutateUPS(delta: number) {
  UPS = Math.min(100, Math.max(0.3, UPS + delta))
  lastTick = Date.now()
  return getUPS()
}
