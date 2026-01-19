import { useEffect } from "react"
import { useAttention } from "@/contexts/AttentionContext"

export default function VideoFeed() {
  const { registerAttention } = useAttention()

  useEffect(() => {
    const interval = setInterval(() => {
      registerAttention("watch", 3)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return <div className="h-full w-full" />
}
