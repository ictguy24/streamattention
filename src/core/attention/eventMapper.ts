export type AttentionEventType = "watch" | "like" | "comment" | "gift" | "boost";

export type InteractionType =
  | "like"
  | "emoji_comment"
  | "sentence_comment"
  | "insightful_comment"
  | "video_watch"
  | "save"
  | "post"
  | "voice_message"
  | "video_message";

interface EventMappingInput {
  type: AttentionEventType;
  duration?: number;
}

interface EventMappingOutput {
  interactionType: InteractionType;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Frontend event mapper that translates UI intents into the backend interaction contract.
 * Keeps contract logic in one place so Context/components stay thin.
 */
export function mapAttentionEventToInteraction({
  type,
  duration = 1,
}: EventMappingInput): EventMappingOutput {
  switch (type) {
    case "watch": {
      const durationMs = Math.max(1000, Math.floor(duration * 1000));
      return {
        interactionType: "video_watch",
        durationMs,
        metadata: {
          completed: durationMs >= 30000,
          source: "attention-context",
        },
      };
    }

    case "like":
      return {
        interactionType: "like",
        metadata: { source: "attention-context" },
      };

    case "comment":
      return {
        interactionType: "sentence_comment",
        metadata: { source: "attention-context", quality: "generic" },
      };

    case "gift":
      return {
        interactionType: "post",
        metadata: { source: "attention-context", kind: "gift" },
      };

    case "boost":
      return {
        interactionType: "post",
        metadata: { source: "attention-context", kind: "boost" },
      };
  }
}
