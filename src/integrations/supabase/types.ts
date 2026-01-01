export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attention_ledger: {
        Row: {
          created_at: string
          id: string
          interaction_id: string | null
          quality_factor: number
          raw_ac: number
          user_id: string
          verification_ratio: number
          verified_ac: number
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_id?: string | null
          quality_factor: number
          raw_ac: number
          user_id: string
          verification_ratio: number
          verified_ac: number
        }
        Update: {
          created_at?: string
          id?: string
          interaction_id?: string | null
          quality_factor?: number
          raw_ac?: number
          user_id?: string
          verification_ratio?: number
          verified_ac?: number
        }
        Relationships: [
          {
            foreignKeyName: "attention_ledger_interaction_id_fkey"
            columns: ["interaction_id"]
            isOneToOne: false
            referencedRelation: "interactions"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          content_hash: string | null
          context_hash: string | null
          created_at: string
          duration_ms: number | null
          id: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          metadata: Json | null
          session_id: string | null
          target_id: string | null
          user_id: string
        }
        Insert: {
          content_hash?: string | null
          context_hash?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          interaction_type: Database["public"]["Enums"]["interaction_type"]
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          user_id: string
        }
        Update: {
          content_hash?: string | null
          context_hash?: string | null
          created_at?: string
          duration_ms?: number | null
          id?: string
          interaction_type?: Database["public"]["Enums"]["interaction_type"]
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          amount_ac: number
          amount_fiat: number | null
          created_at: string
          cycle_id: string | null
          id: string
          processed_at: string | null
          status: Database["public"]["Enums"]["payout_status"] | null
          user_id: string
        }
        Insert: {
          amount_ac: number
          amount_fiat?: number | null
          created_at?: string
          cycle_id?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"] | null
          user_id: string
        }
        Update: {
          amount_ac?: number
          amount_fiat?: number | null
          created_at?: string
          cycle_id?: string | null
          id?: string
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payout_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ac_balance: number
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          last_active_at: string | null
          tier: string
          trust_state: Database["public"]["Enums"]["trust_state"] | null
          updated_at: string
          ups: number | null
          username: string | null
        }
        Insert: {
          ac_balance?: number
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          last_active_at?: string | null
          tier?: string
          trust_state?: Database["public"]["Enums"]["trust_state"] | null
          updated_at?: string
          ups?: number | null
          username?: string | null
        }
        Update: {
          ac_balance?: number
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          tier?: string
          trust_state?: Database["public"]["Enums"]["trust_state"] | null
          updated_at?: string
          ups?: number | null
          username?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          abnormal_flag: boolean | null
          created_at: string | null
          device_fingerprint_hash: string
          end_time: string | null
          id: string
          metadata: Json | null
          start_time: string
          user_id: string
        }
        Insert: {
          abnormal_flag?: boolean | null
          created_at?: string | null
          device_fingerprint_hash: string
          end_time?: string | null
          id?: string
          metadata?: Json | null
          start_time?: string
          user_id: string
        }
        Update: {
          abnormal_flag?: boolean | null
          created_at?: string | null
          device_fingerprint_hash?: string
          end_time?: string | null
          id?: string
          metadata?: Json | null
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_deductions: {
        Row: {
          amount_deducted: number
          amount_due: number
          balance_after: number
          balance_before: number
          created_at: string | null
          id: string
          notes: string | null
          status: string
          subscription_id: string
          tier_name: string
          user_id: string
        }
        Insert: {
          amount_deducted: number
          amount_due: number
          balance_after: number
          balance_before: number
          created_at?: string | null
          id?: string
          notes?: string | null
          status: string
          subscription_id: string
          tier_name: string
          user_id: string
        }
        Update: {
          amount_deducted?: number
          amount_due?: number
          balance_after?: number
          balance_before?: number
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: string
          subscription_id?: string
          tier_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_deductions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          consecutive_failed_deductions: number | null
          created_at: string | null
          id: string
          last_deduction_amount: number | null
          last_deduction_at: string | null
          next_deduction_at: string | null
          started_at: string | null
          status: string | null
          tier_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consecutive_failed_deductions?: number | null
          created_at?: string | null
          id?: string
          last_deduction_amount?: number | null
          last_deduction_at?: string | null
          next_deduction_at?: string | null
          started_at?: string | null
          status?: string | null
          tier_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consecutive_failed_deductions?: number | null
          created_at?: string | null
          id?: string
          last_deduction_amount?: number | null
          last_deduction_at?: string | null
          next_deduction_at?: string | null
          started_at?: string | null
          status?: string | null
          tier_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      tiers: {
        Row: {
          base_multiplier: number | null
          created_at: string | null
          display_name: string
          features: Json | null
          id: string
          min_withdrawal_ac: number | null
          monthly_fee_ac: number | null
          name: string
          withdrawal_fee_percent: number | null
        }
        Insert: {
          base_multiplier?: number | null
          created_at?: string | null
          display_name: string
          features?: Json | null
          id?: string
          min_withdrawal_ac?: number | null
          monthly_fee_ac?: number | null
          name: string
          withdrawal_fee_percent?: number | null
        }
        Update: {
          base_multiplier?: number | null
          created_at?: string | null
          display_name?: string
          features?: Json | null
          id?: string
          min_withdrawal_ac?: number | null
          monthly_fee_ac?: number | null
          name?: string
          withdrawal_fee_percent?: number | null
        }
        Relationships: []
      }
      ups_history: {
        Row: {
          created_at: string
          delta: number
          id: string
          new_ups: number
          previous_ups: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string
          delta: number
          id?: string
          new_ups: number
          previous_ups: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string
          delta?: number
          id?: string
          new_ups?: number
          previous_ups?: number
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          ac_balance: number | null
          created_at: string | null
          freeze_reason: string | null
          id: string
          last_earning_at: string | null
          lifetime_earned: number | null
          lifetime_withdrawn: number | null
          updated_at: string | null
          user_id: string
          withdrawable_balance: number | null
          withdrawal_frozen: boolean | null
        }
        Insert: {
          ac_balance?: number | null
          created_at?: string | null
          freeze_reason?: string | null
          id?: string
          last_earning_at?: string | null
          lifetime_earned?: number | null
          lifetime_withdrawn?: number | null
          updated_at?: string | null
          user_id: string
          withdrawable_balance?: number | null
          withdrawal_frozen?: boolean | null
        }
        Update: {
          ac_balance?: number | null
          created_at?: string | null
          freeze_reason?: string | null
          id?: string
          last_earning_at?: string | null
          lifetime_earned?: number | null
          lifetime_withdrawn?: number | null
          updated_at?: string | null
          user_id?: string
          withdrawable_balance?: number | null
          withdrawal_frozen?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_quality_factor: {
        Args: {
          p_duration_ms: number
          p_metadata: Json
          p_type: Database["public"]["Enums"]["interaction_type"]
        }
        Returns: number
      }
      calculate_raw_ac: {
        Args: { p_type: Database["public"]["Enums"]["interaction_type"] }
        Returns: number
      }
      calculate_trust_state: {
        Args: { p_ups: number }
        Returns: Database["public"]["Enums"]["trust_state"]
      }
      calculate_withdrawable_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      change_subscription_tier: {
        Args: { p_new_tier_name: string; p_user_id: string }
        Returns: boolean
      }
      create_session: {
        Args: { p_device_hash: string; p_metadata?: Json; p_user_id: string }
        Returns: string
      }
      end_session: {
        Args: { p_abnormal?: boolean; p_session_id: string }
        Returns: boolean
      }
      get_interaction_band: {
        Args: { p_type: Database["public"]["Enums"]["interaction_type"] }
        Returns: string
      }
      get_subscriptions_due: {
        Args: never
        Returns: {
          fee_amount: number
          tier_name: string
          user_id: string
        }[]
      }
      get_verification_ratio: { Args: { p_user_id: string }; Returns: number }
      get_verified_balance: { Args: { p_user_id: string }; Returns: number }
      mint_verified_ac: {
        Args: {
          p_content_hash?: string
          p_context_hash?: string
          p_duration_ms?: number
          p_interaction_type: Database["public"]["Enums"]["interaction_type"]
          p_metadata?: Json
          p_session_id: string
          p_target_id: string
          p_user_id: string
        }
        Returns: {
          interaction_id: string
          verified_ac: number
        }[]
      }
      process_subscription_deduction: {
        Args: { p_user_id: string }
        Returns: {
          deducted: number
          message: string
          success: boolean
        }[]
      }
      process_withdrawal: {
        Args: { p_amount: number; p_user_id: string }
        Returns: {
          message: string
          success: boolean
        }[]
      }
      update_ups: {
        Args: { p_delta: number; p_reason: string; p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      account_type: "user" | "creator" | "both"
      interaction_type:
        | "like"
        | "emoji_comment"
        | "sentence_comment"
        | "insightful_comment"
        | "thread_read"
        | "video_watch"
        | "save"
        | "post"
        | "voice_message"
        | "video_message"
      payout_status: "pending" | "processing" | "completed" | "failed"
      trust_state: "cold" | "warm" | "active" | "trusted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["user", "creator", "both"],
      interaction_type: [
        "like",
        "emoji_comment",
        "sentence_comment",
        "insightful_comment",
        "thread_read",
        "video_watch",
        "save",
        "post",
        "voice_message",
        "video_message",
      ],
      payout_status: ["pending", "processing", "completed", "failed"],
      trust_state: ["cold", "warm", "active", "trusted"],
    },
  },
} as const
