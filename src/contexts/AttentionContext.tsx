import { createContext, useContext, useState, useEffect } from "react"
import { routeAttentionEvent } from "@/core/ups/UPSRouter"
import { getUPS } from "@/core/ups/UPSCore"

const AttentionContext = createContext<any>(null)

export function AttentionProvider({ children }: { children: React.ReactNode }) {
  const [ups, setUPS] = useState(getUPS())
  const [balance, setBalance] = useState(0)

  // Periodic decay sync
  useEffect(() => {
    const tick = setInterval(() => {
      setUPS(getUPS())
    }, 3000)
    return () => clearInterval(tick)
  }, [])

  function registerAttention(type: any, duration = 1, risk = 0) {
    const newUPS = routeAttentionEvent(type, duration, true, risk)
    setUPS(newUPS)

    // Reward logic (UPS-gated)
    const reward = Math.max(1, Math.floor(newUPS * 10))
    setBalance(b => b + reward)
  }

  return (
    <AttentionContext.Provider
      value={{
        ups,
        balance,
        registerAttention,
      }}
    >
      {children}
    </AttentionContext.Provider>
  )
}

export const useAttention = () => useContext(AttentionContext)
