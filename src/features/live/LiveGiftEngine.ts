import { routeAttentionEvent } from "@/core/ups/UPSRouter";

export function sendGift() {
  routeAttentionEvent("gift", 2, true);
}
