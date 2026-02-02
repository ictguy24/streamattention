# Supabase Database Schema Summary

## Tables

### Core User Tables
- **profiles**: User profiles with username, display name, avatar, AC balance, tier, etc.
- **wallets**: User wallet balances and withdrawal information
- **subscriptions**: User subscription information and tier status
- **tiers**: Subscription tier definitions with benefits and fees

### Social Features
- **follows**: Follower/following relationships
- **posts**: Content posts with media URLs, engagement metrics, destinations
- **comments**: Post comments with threading support
- **likes**: Post likes
- **saves**: Saved/bookmarked posts
- **hashtags**: Hashtag definitions
- **post_hashtags**: Junction table linking posts to hashtags
- **user_interests**: User interest scores for content personalization

### Messaging
- **conversations**: Direct message conversations
- **conversation_participants**: Users participating in conversations
- **messages**: Individual messages within conversations

### Content & Media
- **stories**: 24-hour ephemeral content
- **story_views**: Tracking who viewed stories
- **watch_history**: User content consumption history
- **music_library**: Built-in music tracks for content creators

### Attention Economy System
- **sessions**: User sessions for activity tracking
- **interactions**: Immutable log of user interactions
- **attention_ledger**: Append-only AC records with verification
- **ups_history**: UPS change tracking
- **payouts**: Withdrawal records

### Gamification
- **achievements**: Achievement definitions
- **user_achievements**: User progress toward achievements
- **user_streaks**: User activity streak tracking

### Utility
- **notifications**: User notifications
- **user_blocks**: Mute/block functionality
- **subscription_deductions**: Historical record of subscription deductions

## Functions & Procedures

### Core Business Logic
- `handle_new_user()`: Auto-create profile on signup
- `update_updated_at_column()`: Auto-update timestamps
- `handle_new_user_wallet_subscription()`: Auto-create wallet and subscription
- `process_subscription_deduction()`: Handle monthly subscription fees
- `calculate_withdrawable_balance()`: Calculate withdrawable balance
- `change_subscription_tier()`: Change user subscription tier
- `get_subscriptions_due()`: Get subscriptions due for deduction
- `process_withdrawal()`: Process user withdrawals

### Attention Economy Functions
- `get_interaction_band()`: Get AC band based on interaction type
- `calculate_raw_ac()`: Calculate raw AC based on interaction type
- `calculate_quality_factor()`: Calculate quality factor based on metadata
- `get_verification_ratio()`: Get verification ratio based on trust state
- `calculate_trust_state()`: Calculate trust state from UPS
- `update_ups()`: Update user's UPS with history logging
- `get_verified_balance()`: Get user's verified AC balance
- `mint_verified_ac()`: Main AC minting function
- `create_session()`: Create user session
- `end_session()`: End user session

### Content & Feed Functions
- `get_daily_ac_ceiling()`: Get daily AC earning limits by trust state
- `check_daily_ac_reset()`: Check/reset daily AC tracking
- `get_personalized_feed()`: Algorithmically curated feed
- `get_followed_posts()`: Posts from followed users only
- `get_or_create_conversation()`: Start or get existing conversation

### Decay System Functions
- `get_decay_eligible_users()`: Get users eligible for AC decay
- `apply_ac_decay()`: Apply AC decay to inactive users
- `apply_ups_forgiveness()`: Apply UPS forgiveness to returning users

## Triggers

- `on_auth_user_created`: Auto-create profile on signup
- `update_profiles_updated_at`: Update profile timestamps
- `on_profile_created_wallet_subscription`: Auto-create wallet/subscription
- `on_follow_create_notification`: Create follow notifications
- `on_like_create_notification`: Create like notifications
- `on_comment_create_notification`: Create comment notifications
- `notify_on_follow`: Additional follow notification trigger

## Views

- `profiles_public`: Safe-to-share profile fields for public consumption

## Enums

- `account_type`: user, creator, both
- `trust_state`: cold, warm, active, trusted
- `interaction_type`: Various interaction types like like, comment, video_watch, etc.
- `payout_status`: pending, processing, completed, failed

## Security & Access Control

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only access their own sensitive data
- Public read access for content and profiles where appropriate
- Authenticated-only access for private data
- Proper policies for social features (following, messaging, etc.)

## Storage Buckets

- `avatars`: User profile pictures
- `posts`: User-generated content media

## Realtime Subscriptions

Tables enabled for real-time updates:
- wallets
- subscriptions
- attention_ledger
- posts
- notifications