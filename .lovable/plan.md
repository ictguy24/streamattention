
# Comprehensive Fix Plan

## Issue Summary

Based on my investigation, I found these critical issues:

### 1. Critical: Logged-in Users Cannot See Content
**Root Cause**: The `get_personalized_feed` RPC function has an ambiguous column reference error:
```
"column reference \"user_id\" is ambiguous"
```
The RPC function uses `p.user_id = p_user_id` but `p_user_id` is both a parameter name and ambiguous in the context. When authenticated users call this function, it errors out, returning no content.

**Solution**: Fix the RPC function to use unambiguous column references with proper table aliases.

### 2. Caption Cross-Posting Bug
**Root Cause**: In `CreateTab.tsx`, the `handlePublish` function receives `destination: string[]` from PublishFlow but **never passes it** to `createPost()`. The posts table has a `destinations` column but it's never being set.

**Solution**: 
- Update `CreatePostData` interface to include `destinations: string[]`
- Pass destinations through from PublishFlow to createPost
- Update usePosts and FeedContainer to filter by destinations

### 3. Fuzz Mode Design
**Current State**: Fuzz shows a basic grid layout. User wants a "futuristic Instagram" with advanced features.

**Solution**: Redesign Fuzz as a cinematic, immersive grid with:
- Varied aspect ratios (Instagram-inspired staggered layout)
- Smooth animations and hover effects
- Quick-view modal on tap
- Swipe navigation between items

### 4. Follow Notification System
**Current State**: Basic follow triggers exist but may not be working correctly.

**Solution**:
- Verify/fix the follow trigger for notifications
- Add notification when follow is accepted
- Add "pending follow" state if needed for private accounts

### 5. Chat Feature Gating
**Requirement**: Video call and audio call should only activate when users mutually follow each other.

**Solution**:
- Check mutual follow status in ConversationView
- Enable/disable call buttons based on mutual follow
- Text and audio/video messages remain always available

### 6. Message Button on User Profile
**Current State**: Message button exists but user wants clearer link to chat zone.

**Solution**: Already implemented in UserProfile.tsx - verify the `get_or_create_conversation` RPC works and navigates correctly.

---

## Implementation Plan

### Phase 1: Fix Content Visibility (Critical)

#### 1.1 Database Migration - Fix RPC Function
```sql
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  user_id UUID,
  username TEXT,
  display_name TEXT,
  avatar_url TEXT,
  content_type TEXT,
  title TEXT,
  description TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  cover_image_url TEXT,
  music_url TEXT,
  music_volume DOUBLE PRECISION,
  original_volume DOUBLE PRECISION,
  music_title TEXT,
  like_count INTEGER,
  comment_count INTEGER,
  view_count INTEGER,
  created_at TIMESTAMPTZ,
  relevance_score DOUBLE PRECISION
) AS $$
DECLARE
  v_total_posts INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_total_posts FROM posts WHERE is_public = true;
  
  RETURN QUERY
  WITH user_hashtag_interests AS (
    SELECT ui.hashtag_id, ui.interest_score 
    FROM user_interests ui 
    WHERE ui.user_id = p_user_id
  ),
  followed_users AS (
    SELECT f.following_id FROM follows f WHERE f.follower_id = p_user_id
  ),
  scored_posts AS (
    SELECT 
      posts.id as post_id,
      posts.user_id,
      pp.username,
      pp.display_name,
      pp.avatar_url,
      posts.content_type,
      posts.title,
      posts.description,
      posts.media_url,
      posts.thumbnail_url,
      posts.cover_image_url,
      posts.music_url,
      posts.music_volume,
      posts.original_volume,
      posts.music_title,
      posts.like_count,
      posts.comment_count,
      posts.view_count,
      posts.created_at,
      (
        COALESCE((
          SELECT SUM(uhi.interest_score) 
          FROM post_hashtags ph 
          JOIN user_hashtag_interests uhi ON ph.hashtag_id = uhi.hashtag_id 
          WHERE ph.post_id = posts.id
        ), 0) * 2 +
        CASE WHEN posts.user_id IN (SELECT fu.following_id FROM followed_users fu) THEN 5 ELSE 0 END +
        CASE WHEN posts.user_id = p_user_id AND v_total_posts < 50 THEN 3 ELSE 0 END +
        (1.0 / GREATEST(1, EXTRACT(EPOCH FROM (now() - posts.created_at)) / 3600)) * 3 +
        (LOG(GREATEST(1, posts.view_count)) + LOG(GREATEST(1, posts.like_count * 2)))
      ) as relevance_score
    FROM posts
    JOIN profiles_public pp ON posts.user_id = pp.id
    WHERE posts.is_public = true
      AND (v_total_posts < 50 OR posts.user_id != p_user_id)
  )
  SELECT * FROM scored_posts
  ORDER BY relevance_score DESC, created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

The key fix is using explicit table aliases (`posts.user_id`, `f.follower_id`, `ui.user_id`) instead of ambiguous column references.

### Phase 2: Fix Caption Cross-Posting

#### 2.1 Update CreatePostData Interface
**File**: `src/hooks/usePosts.tsx`
```typescript
export interface CreatePostData {
  contentType: 'video' | 'image' | 'audio' | 'text';
  title?: string;
  description?: string;
  mediaFile?: File | Blob;
  coverImageFile?: File;
  musicFile?: File;
  musicLibraryId?: string;
  musicVolume?: number;
  originalVolume?: number;
  hashtags?: string[];
  isPublic?: boolean;
  destinations?: string[];  // ADD THIS
}
```

#### 2.2 Update createPost Function
**File**: `src/hooks/usePosts.tsx`
```typescript
// In createPost, include destinations:
const { data: post, error: postError } = await supabase
  .from('posts')
  .insert({
    user_id: userId,
    content_type: data.contentType,
    // ... other fields
    destinations: data.destinations || ['stream'],  // ADD THIS
  })
```

#### 2.3 Update CreateTab to Pass Destinations
**File**: `src/components/tabs/CreateTab.tsx`
```typescript
const handlePublish = async (data: { 
  caption: string; 
  destination: string[];  // This comes from PublishFlow
  visibility: string;
  hashtags: string[];
  coverImageFile?: File;
}) => {
  const result = await createPost({
    contentType: editedMedia?.type || media?.type || 'video',
    description: data.caption,
    // ... other fields
    destinations: data.destination,  // ADD THIS - pass the selected destinations
  });
};
```

#### 2.4 Update FeedContainer to Filter by Destination
**File**: `src/components/social/containers/FeedContainer.tsx`

Add a `destination` prop to filter posts:
```typescript
interface FeedContainerProps {
  contentType: ContentType;
  destination?: string;  // ADD: Filter posts by destination
  // ... other props
}

// Update usePosts call with destination filter
const { posts, isLoading } = usePosts({
  destination: destination,
  feedType: 'latest'
});
```

#### 2.5 Update usePosts to Support Destination Filtering
**File**: `src/hooks/usePosts.tsx`

Add destination filter parameter:
```typescript
interface UsePostsOptions {
  feedType?: 'personalized' | 'latest';
  destination?: string;
}

export const usePosts = (options: UsePostsOptions = {}): UsePostsReturn => {
  const { feedType = 'personalized', destination } = options;
  
  // In the fallback query, add filter:
  let query = supabase.from('posts').select('...');
  
  if (destination) {
    query = query.contains('destinations', [destination]);
  }
};
```

### Phase 3: Redesign Fuzz Mode (Futuristic Instagram)

**File**: `src/components/social/FuzzMode.tsx` (complete rewrite)

Create an immersive, cinematic grid layout:
- Staggered masonry with varied aspect ratios
- Smooth parallax scroll effects
- Quick-view lightbox on tap
- Swipe/drag navigation in lightbox
- Gradient overlays with creator info
- Auto-play video previews on hover/focus

```typescript
const FuzzMode = ({ onACEarned }: FuzzModeProps) => {
  return (
    <FeedContainer
      contentType="fuzz"
      destination="fuzz"  // Filter to only fuzz-destination posts
      layout="immersive-grid"  // New layout type
      features={{ 
        lightbox: true,
        autoPreview: true,
        parallax: true 
      }}
      onACEarned={onACEarned}
    />
  );
};
```

Create new immersive grid component with:
- Variable height cells (2:3, 1:1, 4:5 aspect ratios)
- Smooth intersection observer animations
- Edge-to-edge imagery
- Minimal UI that appears on interaction

### Phase 4: Follow Notifications + Mutual Follow Check

#### 4.1 Verify Follow Notification Trigger
The trigger `notify_on_follow` should already exist. Verify it creates notifications:
```sql
-- Verify trigger exists and works:
SELECT * FROM pg_trigger WHERE tgname = 'notify_on_follow';

-- If missing, create:
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, actor_id, type, message)
  VALUES (
    NEW.following_id, 
    NEW.follower_id, 
    'follow', 
    'started following you'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notify_on_follow
AFTER INSERT ON follows
FOR EACH ROW EXECUTE FUNCTION notify_on_follow();
```

#### 4.2 Add Mutual Follow Check for Calls
**File**: `src/components/social/containers/MessagingContainer.tsx`

Add hook to check mutual follow status:
```typescript
const { data: isMutualFollow } = useQuery({
  queryKey: ['mutual-follow', recipientId],
  queryFn: async () => {
    if (!user?.id || !recipientId) return false;
    
    const { data } = await supabase
      .from('follows')
      .select('id')
      .or(`and(follower_id.eq.${user.id},following_id.eq.${recipientId}),and(follower_id.eq.${recipientId},following_id.eq.${user.id})`);
    
    return data?.length === 2;  // Both directions exist
  }
});

// In ConversationView header:
<button 
  className={cn(
    "p-2 rounded-lg transition-transform",
    isMutualFollow ? "hover:bg-muted/20 active:scale-95" : "opacity-30 cursor-not-allowed"
  )}
  disabled={!isMutualFollow}
  title={!isMutualFollow ? "Follow each other to call" : "Voice call"}
>
  <Phone className="w-5 h-5 text-muted-foreground" />
</button>
```

### Phase 5: Update SocialTab Modes with Proper Destinations

#### 5.1 Update All Mode Components to Pass Destination
**Files**: 
- `src/components/social/ThreadsMode.tsx`
- `src/components/social/FuzzMode.tsx`
- `src/components/social/GalleryMode.tsx`

```typescript
// ThreadsMode.tsx
const ThreadsMode = ({ onACEarned }: ThreadsModeProps) => {
  return (
    <FeedContainer
      contentType="thread"
      destination="threads"  // ADD THIS
      layout="vertical"
      features={{ compose: true, quotes: true, audio: true, media: true }}
      onACEarned={onACEarned}
    />
  );
};

// FuzzMode.tsx
const FuzzMode = ({ onACEarned }: FuzzModeProps) => {
  return (
    <FeedContainer
      contentType="fuzz"
      destination="fuzz"  // ADD THIS
      layout="grid"
      columns={3}
      onACEarned={onACEarned}
    />
  );
};
```

### Phase 6: Update PublishFlow Destinations

**File**: `src/components/create/PublishFlow.tsx`

Update destinations to include Threads and Fuzz:
```typescript
const DESTINATIONS = [
  { id: "stream", name: "Stream", icon: Play, description: "Video feed" },
  { id: "threads", name: "Threads", icon: MessageSquare, description: "Text discussions" },
  { id: "fuzz", name: "Fuzz", icon: Grid, description: "Visual moments" },
  { id: "gallery", name: "Gallery", icon: Camera, description: "24h stories" },
];
```

---

## Files to Modify

| File | Changes |
|------|---------|
| **Database Migration** | Fix `get_personalized_feed` RPC with explicit table aliases |
| `src/hooks/usePosts.tsx` | Add `destinations` to CreatePostData, add destination filter to queries |
| `src/components/tabs/CreateTab.tsx` | Pass `data.destination` to createPost |
| `src/components/create/PublishFlow.tsx` | Add Threads and Fuzz to destinations list |
| `src/components/social/containers/FeedContainer.tsx` | Add `destination` prop and filtering |
| `src/components/social/ThreadsMode.tsx` | Add `destination="threads"` prop |
| `src/components/social/FuzzMode.tsx` | Add `destination="fuzz"` prop, redesign layout |
| `src/components/social/GalleryMode.tsx` | Add `destination="gallery"` prop |
| `src/components/social/containers/MessagingContainer.tsx` | Add mutual follow check for call buttons |
| `src/pages/UserProfile.tsx` | Verify message button works correctly |

---

## Expected Outcomes

1. **Logged-in users can see all public content** - RPC function fixed with unambiguous column references
2. **Posts only appear in selected destinations** - Stream posts stay in Stream, Thread posts stay in Threads
3. **Fuzz becomes an immersive visual experience** - Cinematic grid with smooth animations
4. **Follow notifications work** - Users get notified when someone follows them
5. **Call features require mutual follow** - Phone/video buttons disabled until mutual follow
6. **Message button on profiles works** - Direct link to start/resume conversation

---

## Technical Notes

### RPC Function Column Ambiguity
The original error `"column reference \"user_id\" is ambiguous"` occurred because:
- Parameter `p_user_id` and column `user_id` share similar names
- CTE aliases weren't properly qualified
- PostgreSQL couldn't determine if `user_id` referred to the parameter or a column

Fix: Use explicit `table.column` syntax throughout (e.g., `posts.user_id`, `f.follower_id`, `ui.user_id`).

### Destinations Array Filtering
PostgreSQL arrays can be filtered with the `@>` (contains) operator:
```sql
WHERE destinations @> ARRAY['stream']::text[]
```
In Supabase JS client:
```typescript
.contains('destinations', ['stream'])
```
