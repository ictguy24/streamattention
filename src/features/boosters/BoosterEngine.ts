import { routeAttentionEvent } from "@/core/ups/UPSRouter";

export function activateBooster() {
  routeAttentionEvent("boost", 5, true);
}
