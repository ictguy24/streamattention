import type { AttentionEventType } from "@/core/attention/eventMapper";

export function sendGift(registerAttention: (type: AttentionEventType, duration?: number, risk?: number) => void) {
  registerAttention("gift", 2, 0);
}
