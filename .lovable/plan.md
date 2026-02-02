
# Fix Plan - Content Visibility and Missing Features

## Issues Identified

### 1. Critical: Posts Missing `destinations` Field in Response
**Root Cause**: The `Post` interface in `usePosts.tsx` doesn't include `destinations`. Additionally:
- The fallback query doesn't fetch `destinations` column
- The RPC functions (`get_personalized_feed`, `get_followed_posts`) don't return `destinations`

This means when `FeedContainer` tries to filter by destination (`post.destinations.includes(destination)`), it always falls back to `['stream']` because the field is undefined.

**Fix**:
1. Update the `Post` interface to include `destinations: string[]`
2. Update the fallback query to fetch `destinations`
3. Update both RPC functions to return `destinations`

### 2. PublishFlow Default Destination is Wrong
**Root Cause**: In `PublishFlow.tsx`, the default selected destination is `["moments"]` which is NOT a valid destination (valid ones are: stream, threads, fuzz, gallery).

**Fix**: Change default from `["moments"]` to `["stream"]`

### 3. useConversations Joins on `profiles` Instead of `profiles_public`
**Root Cause**: The `useConversations` hook tries to join with `profiles` table which has restrictive RLS. It should use `profiles_public` view.

**Fix**: Update the query to use `profiles_public` for fetching participant info.

### 4. useMessages Joins on `profiles` (sender info)
**Root Cause**: Same issue - joins with `profiles` which fails due to RLS.

**Fix**: Fetch sender info from `profiles_public` view.

---

## Implementation Plan

### Phase 1: Database Migration - Update RPC Functions

Update both RPC functions to include `destinations` in return:

```sql
-- Update get_personalized_feed to include destinations
CREATE OR REPLACE FUNCTION public.get_personalized_feed(
  p_user_id uuid, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0
)
RETURNS TABLE (
  post_id uuid, user_id uuid, username text, display_name text, avatar_url text,
  content_type text, title text, description text, media_url text, thumbnail_url text,
  cover_image_url text, music_url text, music_volume double precision,
  original_volume double precision, music_title text, like_count integer,
  comment_count integer, view_count integer, created_at timestamptz,
  relevance_score double precision,
  destinations text[]  -- ADD THIS
) ...

-- Update get_followed_posts to include destinations
CREATE OR REPLACE FUNCTION public.get_followed_posts(...)
RETURNS TABLE (
  ...
  destinations text[]  -- ADD THIS
) ...
```

### Phase 2: Update usePosts.tsx

1. Add `destinations` to Post interface:
```typescript
export interface Post {
  // ... existing fields
  destinations: string[];
}
```

2. Update fallback query to fetch destinations:
```typescript
const { data: postsData } = await supabase
  .from('posts')
  .select(`
    id, user_id, content_type, title, description, media_url,
    thumbnail_url, cover_image_url, music_url, music_volume,
    original_volume, music_title, like_count, comment_count,
    view_count, created_at,
    destinations  // ADD THIS
  `)
```

3. Map destinations in result:
```typescript
result = postsData?.map((post) => ({
  ...post,
  destinations: post.destinations || ['stream'],
  // ... other fields
}));
```

### Phase 3: Fix PublishFlow Default Destination

In `src/components/create/PublishFlow.tsx`:
```typescript
// Change from:
const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["moments"]);

// To:
const [selectedDestinations, setSelectedDestinations] = useState<string[]>(["stream"]);
```

### Phase 4: Fix useConversations Profile Fetching

Update `src/hooks/useConversations.tsx` to use `profiles_public`:

```typescript
// In conversation participants query, fetch from profiles_public separately
const { data: participants } = await supabase
  .from("conversation_participants")
  .select("user_id")
  .eq("conversation_id", conv.id);

// Fetch profile info from profiles_public view
const userIds = participants.map(p => p.user_id).filter(id => id !== user.id);
const { data: profiles } = await supabase
  .from("profiles_public")
  .select("id, username, avatar_url")
  .in("id", userIds);
```

### Phase 5: Fix useMessages Sender Info

Update message fetching to use `profiles_public`:

```typescript
// Fetch messages first
const { data: messagesData } = await supabase
  .from("messages")
  .select("*")
  .eq("conversation_id", conversationId)
  .order("created_at", { ascending: true });

// Then fetch sender profiles from profiles_public
const senderIds = [...new Set(messagesData.map(m => m.sender_id))];
const { data: profiles } = await supabase
  .from("profiles_public")
  .select("id, username, avatar_url")
  .in("id", senderIds);

// Map profiles to messages
const profilesMap = new Map(profiles.map(p => [p.id, p]));
return messagesData.map(msg => ({
  ...msg,
  sender: profilesMap.get(msg.sender_id),
}));
```

### Phase 6: Fix FeedContainer Filter

Update `src/components/social/containers/FeedContainer.tsx` to properly type and access destinations:

```typescript
// The filter should work once Post includes destinations:
const posts = destination 
  ? allPosts.filter(post => {
      const postDestinations = post.destinations || ['stream'];
      return postDestinations.includes(destination);
    })
  : allPosts;
```

---

## Files to Modify

| File | Changes |
|------|---------|
| **Database Migration** | Update `get_personalized_feed` and `get_followed_posts` to return `destinations` |
| `src/hooks/usePosts.tsx` | Add `destinations` to Post interface; update fallback query to fetch it |
| `src/components/create/PublishFlow.tsx` | Change default destination from `["moments"]` to `["stream"]` |
| `src/hooks/useConversations.tsx` | Use `profiles_public` view instead of `profiles` join |
| `src/components/social/containers/FeedContainer.tsx` | Remove `as any` cast since Post will include destinations |

---

## Expected Outcomes

1. **Logged-in users see content** - RPC returns proper data with destinations
2. **Posts appear in correct feeds** - Destination filtering works properly
3. **New posts default to Stream** - Instead of invalid "moments" destination
4. **Messaging works** - Conversation and message participant info loads correctly
5. **SocialTab modes show filtered content** - Threads, Fuzz, Gallery each show only their content

---

## Technical Notes

### Why Posts Weren't Appearing
The flow was:
1. User logs in → `usePosts` calls `get_personalized_feed` RPC
2. RPC returns posts WITHOUT `destinations` field
3. `FeedContainer` tries to filter: `post.destinations.includes('threads')`
4. Since `post.destinations` is undefined, it falls back to `['stream']`
5. For modes like ThreadsMode with `destination="threads"`, filter returns empty

### RLS on profiles
The `profiles` table has `USING (auth.uid() = id)` which only allows users to see their own profile. The `profiles_public` view exists specifically for cross-user profile lookups with limited fields.
