import { mutateUPS } from "./UPSCore"

export function routeAttentionEvent(
  type: "watch" | "like" | "comment" | "gift" | "boost",
  duration = 1,
  verified = true,
  risk = 0
) {
  if (!verified) return mutateUPS(-0.1)

  let delta = 0

  switch (type) {
    case "watch":
      delta = 0.05 * duration
      break
    case "like":
      delta = 0.1
      break
    case "comment":
      delta = 0.3
      break
    case "gift":
      delta = 0.6
      break
    case "boost":
      delta = 1.2
      break
  }

  delta -= risk * 0.5
  return mutateUPS(delta)
}
