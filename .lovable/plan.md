
# Comprehensive Fix Plan: Follow Flow, Notifications, @ Symbol, and Environment Sync

## Issues Identified

### 1. **Critical: Environment Configuration Mismatch**
The user's `.env` file points to their **own Supabase project** (`lnxeddfgqcpozqvgqili`), NOT the Lovable Cloud project (`jxqjelbhahoognmrbgjx`). 

**Your instruction**: Keep your environment as-is. The code will use whatever Supabase project is defined in the `.env` file. The migrations and triggers need to be applied to YOUR Supabase project.

### 2. **FollowButton in VideoCard Doesn't Actually Follow**
The `FollowButton` component in `VideoCard.tsx` only updates local UI state - it never calls the Supabase API to create a follow record.

**Root Cause** (line 16-21 in FollowButton.tsx):
```typescript
const handleClick = (e: React.MouseEvent) => {
  e.stopPropagation();
  setIsAnimating(true);
  setIsFollowing(!isFollowing);  // Only updates local state!
  onFollow?.(!isFollowing);       // Callback is never connected
  setTimeout(() => setIsAnimating(false), 300);
};
```

In `VideoCard.tsx`, the button is used without the `onFollow` prop connected to any real API call.

### 3. **Notification Triggers May Not Exist in User's Supabase**
Since the user is using their own Supabase project, the triggers created in migration `20260205001708...` may not be applied there.

### 4. **@ Symbol on Usernames in Video Cards**
The user wants to remove the `@` prefix from usernames displayed on video content. Found in 10+ locations across the codebase.

---

## Implementation Plan

### Phase 1: Fix FollowButton to Actually Follow

**File: `src/components/stream/FollowButton.tsx`**

Transform from local-only state to actual API calls:

```typescript
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;  // Changed from username to userId
  username?: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
}

const FollowButton = ({ userId, username, initialFollowing = false, size = "sm" }: FollowButtonProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  // Check if already following on mount
  useEffect(() => {
    if (!user?.id || !userId || user.id === userId) return;
    
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle()
      .then(({ data }) => setIsFollowing(!!data));
  }, [user?.id, userId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id || !userId || user.id === userId || isLoading) return;
    
    setIsLoading(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);
      } else {
        await supabase.from("follows").insert({
          follower_id: user.id,
          following_id: userId,
        });
      }
      setIsFollowing(!isFollowing);
      queryClient.invalidateQueries({ queryKey: ["follows"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    } finally {
      setIsLoading(false);
    }
  };

  // Don't show button for own profile or unauthenticated users
  if (!user || user.id === userId) return null;

  return (
    <motion.button
      className={cn(
        "font-medium rounded-full transition-all",
        size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
        isFollowing
          ? "bg-muted/50 text-muted-foreground border border-border/50"
          : "bg-primary text-primary-foreground"
      )}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      disabled={isLoading}
    >
      {isFollowing ? "Following" : "Follow"}
    </motion.button>
  );
};
```

### Phase 2: Update VideoCard to Pass User ID

**File: `src/components/stream/VideoCard.tsx`**

Add `userId` to the video interface and pass it to FollowButton:

```typescript
interface VideoCardProps {
  video: {
    id: string;
    userId: string;  // ADD THIS
    url: string;
    // ... rest unchanged
  };
}

// In the component:
<FollowButton userId={video.userId} username={video.username} />
```

**File: `src/components/stream/VideoFeed.tsx`**

Pass `user_id` from post data:

```typescript
<VideoCard
  video={{
    id: currentPost.id,
    userId: currentPost.user_id,  // ADD THIS
    url: currentPost.media_url || "",
    // ... rest unchanged
  }}
/>
```

### Phase 3: Remove @ Symbol from Video Usernames

**File: `src/components/stream/VideoCard.tsx`** (line 289)

```typescript
// FROM:
<p className="font-semibold text-sm text-foreground">@{video.username}</p>

// TO:
<p className="font-semibold text-sm text-foreground">{video.username}</p>
```

**File: `src/components/social/containers/FeedContainer.tsx`** (lines 455, 522, 589)

```typescript
// Line 455 - Grid item:
<p className="text-[10px] text-foreground font-medium truncate">{post.username || 'user'}</p>

// Line 522 - Masonry item:
<span className="text-xs font-medium text-foreground">{post.username || 'user'}</span>

// Line 589 - Vertical item (keep @ here as it's Twitter-style layout):
<span className="text-muted-foreground text-sm">{post.username || 'user'}</span>
```

**File: `src/components/social/containers/StoriesContainer.tsx`** (line 223)

```typescript
<p className="font-medium text-foreground text-sm">{story.username || 'user'}</p>
```

### Phase 4: Ensure Notification Triggers Exist

**Database Migration** - Create the notification triggers in your Supabase project:

```sql
-- Enable realtime on additional tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.follows;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Create notification trigger function for follows
CREATE OR REPLACE FUNCTION public.handle_follow_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, actor_id, message)
  VALUES (
    NEW.following_id,
    'follow',
    NEW.follower_id,
    'started following you'
  );
  RETURN NEW;
END;
$$;

-- Create trigger on follows table
DROP TRIGGER IF EXISTS on_follow_notification ON public.follows;
CREATE TRIGGER on_follow_notification
  AFTER INSERT ON public.follows
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_follow_notification();

-- Create notification trigger function for likes  
CREATE OR REPLACE FUNCTION public.handle_like_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, content_id, message)
    VALUES (post_owner_id, 'like', NEW.user_id, NEW.post_id, 'liked your post');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_like_notification ON public.likes;
CREATE TRIGGER on_like_notification
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_like_notification();

-- Create notification trigger function for comments
CREATE OR REPLACE FUNCTION public.handle_comment_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  post_owner_id uuid;
  parent_author_id uuid;
BEGIN
  SELECT user_id INTO post_owner_id FROM public.posts WHERE id = NEW.post_id;
  
  IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
    INSERT INTO public.notifications (user_id, type, actor_id, content_id, message)
    VALUES (post_owner_id, 'comment', NEW.user_id, NEW.post_id, 'commented on your post');
  END IF;
  
  IF NEW.parent_id IS NOT NULL THEN
    SELECT user_id INTO parent_author_id FROM public.comments WHERE id = NEW.parent_id;
    
    IF parent_author_id IS NOT NULL AND parent_author_id != NEW.user_id AND parent_author_id != post_owner_id THEN
      INSERT INTO public.notifications (user_id, type, actor_id, content_id, message)
      VALUES (parent_author_id, 'comment', NEW.user_id, NEW.post_id, 'replied to your comment');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_comment_notification ON public.comments;
CREATE TRIGGER on_comment_notification
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_notification();
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/stream/FollowButton.tsx` | Complete rewrite to use Supabase API |
| `src/components/stream/VideoCard.tsx` | Add `userId` to props; remove `@` from username display |
| `src/components/stream/VideoFeed.tsx` | Pass `user_id` from posts to VideoCard |
| `src/components/social/containers/FeedContainer.tsx` | Remove `@` from usernames in grid/masonry layouts |
| `src/components/social/containers/StoriesContainer.tsx` | Remove `@` from username display |
| **Database Migration** | Create notification triggers for follows/likes/comments |

---

## Expected Outcomes

1. **Follow button works** - Clicking Follow on a video actually creates a follow record
2. **Notifications sent** - When User A follows User B, User B gets a notification
3. **@ symbol removed** - Usernames on video content display without the @ prefix
4. **Environment sync** - Using your Supabase project as specified in `.env`
5. **Chat works after follow** - Follow relationship enables messaging features

---

## Technical Notes

### Why FollowButton Wasn't Working
The original component was purely presentational - it toggled local React state but never called any API. The `onFollow` callback was defined but never connected to actual database operations.

### Environment Clarification  
Your `.env` file points to project `lnxeddfgqcpozqvgqili` (your personal Supabase). This is intentional per your instructions. All code changes will work with whichever Supabase URL is configured in the environment variables.

### Keeping @ in Specific Contexts
The @ symbol is preserved in:
- Notification sheet (social convention for mentions)
- Comment sections (replying context)
- User profile pages (handle display)
- Search results (to distinguish handles)

Only video overlays and feed cards will show plain usernames.
