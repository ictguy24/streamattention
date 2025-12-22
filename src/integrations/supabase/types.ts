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
      profiles: {
        Row: {
          ac_balance: number
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          tier: string
          updated_at: string
          username: string | null
        }
        Insert: {
          ac_balance?: number
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          tier?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          ac_balance?: number
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          tier?: string
          updated_at?: string
          username?: string | null
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
      calculate_withdrawable_balance: {
        Args: { p_user_id: string }
        Returns: number
      }
      change_subscription_tier: {
        Args: { p_new_tier_name: string; p_user_id: string }
        Returns: boolean
      }
      get_subscriptions_due: {
        Args: never
        Returns: {
          fee_amount: number
          tier_name: string
          user_id: string
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
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
