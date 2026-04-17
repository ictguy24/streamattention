import type { AttentionEventType } from "@/core/attention/eventMapper";

export function activateBooster(registerAttention: (type: AttentionEventType, duration?: number, risk?: number) => void) {
  registerAttention("boost", 5, 0);
}
