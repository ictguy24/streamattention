import { useState } from "react";
import { ChevronLeft, UserMinus, Ban, VolumeX, Volume2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  username: string;
  displayName: string;
  isFollowing: boolean;
  isMuted?: boolean;
  isBlocked?: boolean;
}

const DEMO_FOLLOWERS: User[] = [
  { id: "1", username: "alex_rivera", displayName: "Alex Rivera", isFollowing: true },
  { id: "2", username: "sarah_chen", displayName: "Sarah Chen", isFollowing: false },
  { id: "3", username: "mike_j", displayName: "Mike Johnson", isFollowing: true },
  { id: "4", username: "emma_wilson", displayName: "Emma Wilson", isFollowing: false },
];

const DEMO_FOLLOWING: User[] = [
  { id: "1", username: "creator_vibes", displayName: "Luna Stars", isFollowing: true },
  { id: "2", username: "tech_insights", displayName: "Dev Patel", isFollowing: true },
  { id: "3", username: "foodie_delights", displayName: "Food Creator", isFollowing: true },
];

const DEMO_BLOCKED: User[] = [
  { id: "1", username: "spam_account", displayName: "Spam User", isFollowing: false, isBlocked: true },
];

const DEMO_MUTED: User[] = [
  { id: "1", username: "loud_poster", displayName: "Frequent Poster", isFollowing: true, isMuted: true },
];

type ListType = "followers" | "following" | "blocked" | "muted";

interface SocialControlProps {
  initialList?: ListType;
  onNavigateToProfile?: (username: string) => void;
}

const SocialControl = ({ initialList = "followers", onNavigateToProfile }: SocialControlProps) => {
  const [activeList, setActiveList] = useState<ListType>(initialList);
  const [followers, setFollowers] = useState(DEMO_FOLLOWERS);
  const [following, setFollowing] = useState(DEMO_FOLLOWING);
  const [blocked, setBlocked] = useState(DEMO_BLOCKED);
  const [muted, setMuted] = useState(DEMO_MUTED);

  const handleFollow = (userId: string) => {
    setFollowers(prev =>
      prev.map(u => u.id === userId ? { ...u, isFollowing: true } : u)
    );
  };

  const handleUnfollow = (userId: string, list: "followers" | "following") => {
    if (list === "followers") {
      setFollowers(prev =>
        prev.map(u => u.id === userId ? { ...u, isFollowing: false } : u)
      );
    } else {
      setFollowing(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleUnblock = (userId: string) => {
    setBlocked(prev => prev.filter(u => u.id !== userId));
  };

  const handleUnmute = (userId: string) => {
    setMuted(prev => prev.filter(u => u.id !== userId));
  };

  const lists: { id: ListType; label: string; count: number }[] = [
    { id: "followers", label: "Followers", count: followers.length },
    { id: "following", label: "Following", count: following.length },
    { id: "blocked", label: "Blocked", count: blocked.length },
    { id: "muted", label: "Muted", count: muted.length },
  ];

  const renderUserList = (users: User[], listType: ListType) => (
    <div className="space-y-1">
      {users.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No users in this list
        </p>
      ) : (
        users.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/10 transition-colors"
          >
            <button
              className="shrink-0 active:scale-95 transition-transform"
              onClick={() => onNavigateToProfile?.(user.username)}
            >
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-muted/30 text-foreground">
                  {user.displayName[0]}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="flex-1 min-w-0">
              <button
                className="font-medium text-foreground text-sm hover:underline text-left"
                onClick={() => onNavigateToProfile?.(user.username)}
              >
                {user.displayName}
              </button>
              <p className="text-xs text-muted-foreground">@{user.username}</p>
            </div>

            {/* Actions based on list type */}
            {listType === "followers" && (
              <button
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95 transition-all",
                  user.isFollowing
                    ? "bg-muted/20 text-muted-foreground"
                    : "bg-foreground text-background"
                )}
                onClick={() => user.isFollowing 
                  ? handleUnfollow(user.id, "followers") 
                  : handleFollow(user.id)
                }
              >
                {user.isFollowing ? "Following" : "Follow Back"}
              </button>
            )}

            {listType === "following" && (
              <button
                className="p-2 rounded-lg bg-muted/20 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
                onClick={() => handleUnfollow(user.id, "following")}
              >
                <UserMinus className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}

            {listType === "blocked" && (
              <button
                className="px-3 py-1.5 rounded-lg bg-muted/20 text-muted-foreground text-xs font-medium active:scale-95 transition-all"
                onClick={() => handleUnblock(user.id)}
              >
                Unblock
              </button>
            )}

            {listType === "muted" && (
              <button
                className="p-2 rounded-lg bg-muted/20 text-muted-foreground active:scale-95 transition-all"
                onClick={() => handleUnmute(user.id)}
              >
                <Volume2 className="w-4 h-4" strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="px-4">
      {/* List Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-4">
        {lists.map(list => (
          <button
            key={list.id}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1",
              activeList === list.id
                ? "bg-foreground text-background"
                : "bg-muted/30 text-muted-foreground"
            )}
            onClick={() => setActiveList(list.id)}
          >
            {list.label}
            <span className="opacity-70">({list.count})</span>
          </button>
        ))}
      </div>

      {/* User Lists */}
      {activeList === "followers" && renderUserList(followers, "followers")}
      {activeList === "following" && renderUserList(following, "following")}
      {activeList === "blocked" && renderUserList(blocked, "blocked")}
      {activeList === "muted" && renderUserList(muted, "muted")}
    </div>
  );
};

export default SocialControl;