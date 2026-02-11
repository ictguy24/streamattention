

# Fix Plan: Follow Messaging, Companions Feed, Stream Actions, Duplicate Notifications, and Social Tab

## Issues Found

### 1. Duplicate Notifications - Root Cause Identified
There are **two separate triggers** on each table firing on the same event:
- `follows` table: `on_follow_create_notification` (calls `create_follow_notification`) AND `on_follow_notification` (calls `handle_follow_notification`) -- both fire on INSERT, creating 2 notifications
- `likes` table: `on_like_create_notification` AND `on_like_notification` -- same problem  
- `comments` table: `on_comment_create_notification` AND `on_comment_notification` -- same problem

**Fix**: Drop the old triggers (`on_follow_create_notification`, `on_like_create_notification`, `on_comment_create_notification`) and the old functions (`create_follow_notification`, `create_like_notification`, `create_comment_notification`).

### 2. Follow Back Button Doesn't Work
The "Follow Back" button in `NotificationSheet.tsx` (line 201) calls `followMutation.mutate(notification.actor_id!)` but the button also sits inside a parent `onClick` that calls `markAsRead`. Both fire, but the follow button click event isn't properly stopped from propagating.

**Fix**: Add `e.stopPropagation()` to the Follow Back button click handler and also check if already following before showing the button.

### 3. Followed Users Can't Message
The messaging system (`get_or_create_conversation` function) already supports creating conversations between any two users. The issue is there's no way to **initiate** a message from a followed user's context -- the "New Message" button in MessagingContainer is non-functional (line 94-100, no onClick handler).

**Fix**: Add a "Message" action to the notification follow-back flow and connect the "New Message" button to a user search/selection flow that creates conversations via the existing `get_or_create_conversation` RPC.

### 4. Companions Feed Not Showing Followed Users' Posts  
The CompanionsTab correctly calls `get_followed_posts` RPC, but the `get_followed_posts` function doesn't filter by `destinations` containing `'stream'`. Posts intended for other surfaces (threads, fuzz, gallery) could appear or stream posts could be missing.

**Fix**: Add destination filtering to the companions feed query.

### 5. Stream Tab Actions - Change Icons
Current right-side actions: Like, Comment, Share, Save, Mute/Unmute toggle, Speed control.
Request: Like, Comment, Share, Repost, Save -- remove Unmute button.

**Fix**: Replace the mute/unmute button with a Repost action and remove the speed control. Keep the existing Like, Comment, Share, Save.

### 6. Social Tab - Remove Pinch to Zoom
The SocialTab itself doesn't use pinch-to-zoom, but the parent `AppLayout` applies `gestureProps` (which includes pinch handlers) to the entire container. This affects all tabs including Social.

**Fix**: Only apply gesture props when on the Stream tab.

### 7. Companions and Stream in Top Navigation
Currently, the Companions/Stream toggle (`FeedToggle`) only appears inside the `StreamTab`. The request is to make these accessible from the top header navigation so they're always visible.

**Fix**: Move the `FeedToggle` into the AppLayout header, visible when the Stream tab is active.

---

## Database Migration

Drop duplicate triggers that cause double notifications:

```sql
-- Remove duplicate triggers (old naming convention)
DROP TRIGGER IF EXISTS on_follow_create_notification ON public.follows;
DROP TRIGGER IF EXISTS on_like_create_notification ON public.likes;
DROP TRIGGER IF EXISTS on_comment_create_notification ON public.comments;

-- Remove duplicate trigger from migration 20260201 (different naming)
DROP TRIGGER IF EXISTS ensure_follow_notification ON public.follows;

-- Clean up old functions no longer needed
DROP FUNCTION IF EXISTS public.create_follow_notification();
DROP FUNCTION IF EXISTS public.create_like_notification();
DROP FUNCTION IF EXISTS public.create_comment_notification();
```

---

## File Changes

### `src/components/stream/VideoCard.tsx`
- Remove mute/unmute button (Volume2/VolumeX) from the right-side action bar
- Remove speed control button
- Add Repost action using `AnimatedBroadcastIcon` (rename current Share to Repost)
- Keep: Like, Comment, Share (new), Repost, Save

### `src/components/stream/NotificationSheet.tsx`
- Add `e.stopPropagation()` to the Follow Back button
- Check if already following before showing the button (query follows table)
- Add a "Message" button next to Follow Back for follow notifications

### `src/components/AppLayout.tsx`
- Move `FeedToggle` into the header when Stream tab is active
- Only apply `gestureProps` when `activeTab === "stream"`
- Pass the feed sub-tab state (companions/stream) down to StreamTab

### `src/components/tabs/StreamTab.tsx`
- Accept `activeSubTab` and `onSubTabChange` props from AppLayout instead of managing its own state
- Remove the internal FeedToggle rendering (now in header)

### `src/components/social/containers/MessagingContainer.tsx`
- Connect "New Message" button to open a user picker that searches `profiles_public`
- Use `get_or_create_conversation` RPC to create/find conversations

### `src/components/tabs/SocialTab.tsx`
- No pinch-to-zoom exists here directly; the fix is in AppLayout

---

## Expected Outcomes

1. Follow notifications only fire once (no duplicates)
2. "Follow Back" button actually creates the follow record
3. Users can message people they follow
4. Companions feed shows posts from followed users
5. Stream action bar shows: Like, Comment, Share, Repost, Save (no mute/speed)
6. Social tab has no pinch-to-zoom interference
7. Companions/Stream toggle is in the top navigation header

