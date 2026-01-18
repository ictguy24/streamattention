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
      achievements: {
        Row: {
          ac_reward: number | null
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          rarity: string
          requirement_count: number
          requirement_type: string
        }
        Insert: {
          ac_reward?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name: string
          rarity?: string
          requirement_count?: number
          requirement_type: string
        }
        Update: {
          ac_reward?: number | null
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          rarity?: string
          requirement_count?: number
          requirement_type?: string
        }
        Relationships: []
      }
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
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
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
      hashtags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          use_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          use_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          use_count?: number | null
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
      likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          id: string
          media_type: string | null
          media_url: string | null
          read_at: string | null
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          media_type?: string | null
          media_url?: string | null
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      music_library: {
        Row: {
          artist: string | null
          audio_url: string
          created_at: string | null
          duration_ms: number | null
          genre: string | null
          id: string
          is_active: boolean | null
          preview_url: string | null
          title: string
          use_count: number | null
        }
        Insert: {
          artist?: string | null
          audio_url: string
          created_at?: string | null
          duration_ms?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          preview_url?: string | null
          title: string
          use_count?: number | null
        }
        Update: {
          artist?: string | null
          audio_url?: string
          created_at?: string | null
          duration_ms?: number | null
          genre?: string | null
          id?: string
          is_active?: boolean | null
          preview_url?: string | null
          title?: string
          use_count?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          content_id: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          content_id?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
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
      post_hashtags: {
        Row: {
          hashtag_id: string
          post_id: string
        }
        Insert: {
          hashtag_id: string
          post_id: string
        }
        Update: {
          hashtag_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_hashtags_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_hashtags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comment_count: number | null
          content_type: string
          cover_image_url: string | null
          created_at: string | null
          description: string | null
          destinations: string[] | null
          duration_ms: number | null
          id: string
          is_public: boolean | null
          like_count: number | null
          media_url: string | null
          music_source: string | null
          music_title: string | null
          music_url: string | null
          music_volume: number | null
          original_volume: number | null
          share_count: number | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          comment_count?: number | null
          content_type: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          destinations?: string[] | null
          duration_ms?: number | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          media_url?: string | null
          music_source?: string | null
          music_title?: string | null
          music_url?: string | null
          music_volume?: number | null
          original_volume?: number | null
          share_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          comment_count?: number | null
          content_type?: string
          cover_image_url?: string | null
          created_at?: string | null
          description?: string | null
          destinations?: string[] | null
          duration_ms?: number | null
          id?: string
          is_public?: boolean | null
          like_count?: number | null
          media_url?: string | null
          music_source?: string | null
          music_title?: string | null
          music_url?: string | null
          music_volume?: number | null
          original_volume?: number | null
          share_count?: number | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ac_balance: number
          account_type: Database["public"]["Enums"]["account_type"] | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_ac_earned: number | null
          daily_ac_reset_at: string | null
          display_name: string | null
          id: string
          last_active_at: string | null
          social_links: Json | null
          tier: string
          trust_state: Database["public"]["Enums"]["trust_state"] | null
          updated_at: string
          ups: number | null
          username: string | null
          website_url: string | null
        }
        Insert: {
          ac_balance?: number
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_ac_earned?: number | null
          daily_ac_reset_at?: string | null
          display_name?: string | null
          id: string
          last_active_at?: string | null
          social_links?: Json | null
          tier?: string
          trust_state?: Database["public"]["Enums"]["trust_state"] | null
          updated_at?: string
          ups?: number | null
          username?: string | null
          website_url?: string | null
        }
        Update: {
          ac_balance?: number
          account_type?: Database["public"]["Enums"]["account_type"] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_ac_earned?: number | null
          daily_ac_reset_at?: string | null
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          social_links?: Json | null
          tier?: string
          trust_state?: Database["public"]["Enums"]["trust_state"] | null
          updated_at?: string
          ups?: number | null
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      saves: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saves_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_type: string
          media_url: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: string
          media_url?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      story_views: {
        Row: {
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
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
      user_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          progress: number | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          progress?: number | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_blocks: {
        Row: {
          block_type: string
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          block_type?: string
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          block_type?: string
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string | null
          hashtag_id: string
          interest_score: number | null
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          hashtag_id: string
          interest_score?: number | null
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          hashtag_id?: string
          interest_score?: number | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_hashtag_id_fkey"
            columns: ["hashtag_id"]
            isOneToOne: false
            referencedRelation: "hashtags"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          current_streak: number | null
          last_active_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          last_active_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
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
      watch_history: {
        Row: {
          completed: boolean | null
          id: string
          post_id: string
          user_id: string
          watch_duration_ms: number | null
          watched_at: string
        }
        Insert: {
          completed?: boolean | null
          id?: string
          post_id: string
          user_id: string
          watch_duration_ms?: number | null
          watched_at?: string
        }
        Update: {
          completed?: boolean | null
          id?: string
          post_id?: string
          user_id?: string
          watch_duration_ms?: number | null
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_ac_decay: {
        Args: { p_user_id: string }
        Returns: {
          decayed_amount: number
          message: string
          success: boolean
        }[]
      }
      apply_ups_forgiveness: {
        Args: { p_user_id: string }
        Returns: {
          message: string
          success: boolean
          ups_boost: number
        }[]
      }
      calculate_ac_decay: {
        Args: { p_user_id: string }
        Returns: {
          days_inactive: number
          decay_amount: number
          decay_percent: number
        }[]
      }
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
      check_daily_ac_reset: { Args: { p_user_id: string }; Returns: undefined }
      create_session: {
        Args: { p_device_hash: string; p_metadata?: Json; p_user_id: string }
        Returns: string
      }
      end_session: {
        Args: { p_abnormal?: boolean; p_session_id: string }
        Returns: boolean
      }
      get_daily_ac_ceiling: {
        Args: { p_trust_state: Database["public"]["Enums"]["trust_state"] }
        Returns: {
          max_ac: number
          min_ac: number
        }[]
      }
      get_decay_eligible_users: {
        Args: never
        Returns: {
          balance: number
          days_inactive: number
          user_id: string
        }[]
      }
      get_followed_posts: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          avatar_url: string
          comment_count: number
          content_type: string
          cover_image_url: string
          created_at: string
          description: string
          display_name: string
          like_count: number
          media_url: string
          music_title: string
          music_url: string
          music_volume: number
          original_volume: number
          post_id: string
          thumbnail_url: string
          title: string
          user_id: string
          username: string
          view_count: number
        }[]
      }
      get_interaction_band: {
        Args: { p_type: Database["public"]["Enums"]["interaction_type"] }
        Returns: string
      }
      get_or_create_conversation: {
        Args: { p_other_user_id: string; p_user_id: string }
        Returns: string
      }
      get_personalized_feed: {
        Args: { p_limit?: number; p_offset?: number; p_user_id: string }
        Returns: {
          avatar_url: string
          comment_count: number
          content_type: string
          cover_image_url: string
          created_at: string
          description: string
          display_name: string
          like_count: number
          media_url: string
          music_title: string
          music_url: string
          music_volume: number
          original_volume: number
          post_id: string
          relevance_score: number
          thumbnail_url: string
          title: string
          user_id: string
          username: string
          view_count: number
        }[]
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
