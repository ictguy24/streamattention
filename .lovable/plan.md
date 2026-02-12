

# Comprehensive UI/UX and Functionality Fix Plan

This is a large set of interconnected fixes. Here's the breakdown organized by priority.

---

## 1. Stream Tab -- Redesign Right-Side Action Icons

**Current**: Like (bolt), Comment (bubble), Share (broadcast), Save (square). No repost.

**Changes to `VideoCard.tsx`**:
- **Like**: Replace bolt/energy icon with a **Heart** SVG. Fills red when liked.
- **Comment**: Keep speech bubble SVG but refine design.
- **Save**: Add a **bookmark fold animation** -- when saved, the icon folds inward (3D rotateY flip).
- **Repost**: Add the existing `AnimatedAmplifyIcon` (rotate arrows) -- rotates 360 degrees when reposted.
- **Remove**: Mute button is already removed; also remove any leftover speed/mute state references.

**Changes to `AnimatedIcons.tsx`**:
- Replace `AnimatedEnergyIcon` with a new `AnimatedHeartIcon` using a heart SVG path, filling red on active with a pulse scale animation.
- Update `AnimatedCollectIcon` to use a **bookmark** shape with fold animation (rotateY 0->180->0).
- `AnimatedAmplifyIcon` already rotates -- ensure it's wired into VideoCard.

**Changes to `InteractionIcons.tsx`**:
- Add a static `HeartIcon` for the double-tap overlay (replacing `EnergyIcon` in that context).

---

## 2. Move Follow Button Below Username

**In `VideoCard.tsx`**:
- Currently: Avatar + Username + FollowButton are on the same row.
- Change: Avatar + Username on one row, FollowButton on a new row below.
- Add **"Buddy"** label when mutual follow is detected (both users follow each other).

**In `FollowButton.tsx`**:
- Add a check for mutual follow status (query if the other user also follows you).
- If mutual, show "Buddy" instead of "Following".

---

## 3. Followers/Following List -- View Who Follows You

**Issue**: Users can see counts but can't view the actual list.

**In `ProfileTab.tsx`**: The FollowersList component already exists and works. Need to verify the followers/following counts are clickable and open FollowersList. This is likely already wired -- will confirm and fix if needed.

---

## 4. Search Must Search Everything (Users, Hashtags, Sounds)

**In `useDiscoverySearch.tsx`**:
- Add **sound/music search** against `music_library` table (search `title` and `artist` columns).
- Return sound results alongside users, hashtags, and posts.

**In `DiscoverySearchSheet.tsx`**:
- Add a "Sounds" tab with music note icon.
- Display sound results with title, artist, and use count.

---

## 5. Fix Feed Algorithm -- Don't Show Own Posts First

**Database migration** to update `get_personalized_feed`:
- Remove the cold-start boost that gives user's own posts +3 score when posts < 50.
- Filter to only posts with `'stream'` in `destinations` array.
- Add `random()` factor to the relevance score to shuffle posts of similar relevance.
- Always exclude the current user's own posts from the Stream feed (they belong in Companions/Profile).

---

## 6. Remove Side Scrollbar Dots

**In `VideoFeed.tsx`** (lines 138-154):
- Remove the entire "Video position indicator" div with the dot indicators on the right side.

---

## 7. Comments Actually Working

**Issue**: `useComments` joins against `profiles` table which is RLS-restricted, so comments show but without usernames/avatars for other users.

**Fix `useComments.tsx`**:
- Change from foreign key join (`profiles:user_id`) to a two-step query: fetch comments, then fetch usernames from `profiles_public` view separately (same pattern as `usePosts`).

---

## 8. Transparent Navigation (Top and Bottom)

**In `AppLayout.tsx`** header:
- Remove any solid background. Use fully transparent header (no `bg-background`, no backdrop).

**In `BottomNav.tsx`** (line 24):
- Change `bg-background/90 backdrop-blur-xl border-t border-border/30` to fully transparent: remove background and border.

---

## 9. Live Tab -- Move to Top Nav, Remove Background

**In `AppLayout.tsx`**:
- Move Live indicator/icon to next to the search bar on the left side of the right icon group.
- Make it a simple SVG icon (no background, no colored pill) -- just the broadcast icon that opens LiveTab.
- Remove the LiveIndicator from the left side of the header.

**In `LiveTab.tsx`**:
- Remove the colored background/pill styling on the tab content.

---

## 10. Comment Notifications

**Already handled**: The `on_comment_notification` trigger exists and fires on comment INSERT. Comments posted via `useComments.addComment` will trigger notifications automatically. Just need to ensure the comment submission actually works (fix #7 above).

---

## 11. Engagement Milestone Notifications

**Database migration**: Create a trigger function that fires on `likes` table changes. After each like, check the post's total `like_count`:
- At 10 likes: insert a milestone notification for the post owner ("Your post hit 10 likes!")
- At 50, 100, 500, 1000: same pattern.
- This is a new `handle_milestone_notification` trigger on `posts` table `UPDATE` (when `like_count` changes).

---

## 12. Gallery Tab -- Make Functional

**Current**: Just renders `StoriesContainer` with `destination="gallery"`. The StoriesContainer is already functional with camera, story viewing, etc. The issue is likely that no content has the `gallery` destination. This is working as designed -- it will populate when users create gallery content. No code change needed unless the user wants a different UX.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/icons/AnimatedIcons.tsx` | Replace EnergyIcon with HeartIcon, update CollectIcon to bookmark, ensure AmplifyIcon exported |
| `src/components/social/InteractionIcons.tsx` | Add HeartIcon for double-tap overlay |
| `src/components/stream/VideoCard.tsx` | New icon layout, move FollowButton below username, add Repost action, buddy detection |
| `src/components/stream/VideoFeed.tsx` | Remove side dot indicators |
| `src/components/stream/FollowButton.tsx` | Add mutual follow (buddy) check |
| `src/components/AppLayout.tsx` | Transparent header, move Live icon to right side near search |
| `src/components/BottomNav.tsx` | Transparent background |
| `src/components/LiveIndicator.tsx` | Add a minimal icon-only variant for top nav |
| `src/hooks/useComments.tsx` | Fix profile join to use profiles_public |
| `src/hooks/useDiscoverySearch.tsx` | Add music/sound search |
| `src/components/search/DiscoverySearchSheet.tsx` | Add Sounds tab |
| `src/components/stream/NotificationSheet.tsx` | Follow back button fix (already partially done) |
| **Database migration** | Update `get_personalized_feed`, add milestone notification trigger |

---

## Technical Details

### Heart Icon SVG Path
```
M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z
```

### Bookmark SVG Path (for Save)
```
M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z
```

### Feed Algorithm Fix (SQL)
- Add `AND 'stream' = ANY(p.destinations)` to the WHERE clause
- Remove `CASE WHEN p.user_id = p_user_id` cold start boost
- Add `+ (random() * 2)` to relevance_score for randomization
- Add `AND p.user_id != p_user_id` to always exclude own posts

### Comments Fix
Replace the foreign key join with a two-step approach:
1. Fetch comments from `comments` table
2. Collect unique `user_id`s
3. Fetch profiles from `profiles_public` view
4. Map usernames/avatars back to comments

