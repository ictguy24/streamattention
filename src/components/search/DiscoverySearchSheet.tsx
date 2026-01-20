import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Hash, User, Film, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDiscoverySearch } from "@/hooks/useDiscoverySearch";
import { usePresence } from "@/hooks/usePresence";
import { cn } from "@/lib/utils";

interface DiscoverySearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToProfile?: (userId: string) => void;
  onNavigateToPost?: (postId: string) => void;
  onNavigateToHashtag?: (hashtag: string) => void;
}

type TabType = "all" | "users" | "hashtags" | "posts";

const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All", icon: Search },
  { id: "users", label: "Users", icon: User },
  { id: "hashtags", label: "Tags", icon: Hash },
  { id: "posts", label: "Posts", icon: Film },
];

const DiscoverySearchSheet = ({
  isOpen,
  onClose,
  onNavigateToProfile,
  onNavigateToPost,
  onNavigateToHashtag,
}: DiscoverySearchSheetProps) => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const { query, setQuery, users, hashtags, posts, isSearching, search, clearResults } = useDiscoverySearch();
  const { isUserOnline } = usePresence();

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        search(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const handleClose = useCallback(() => {
    clearResults();
    onClose();
  }, [clearResults, onClose]);

  const showUsers = activeTab === "all" || activeTab === "users";
  const showHashtags = activeTab === "all" || activeTab === "hashtags";
  const showPosts = activeTab === "all" || activeTab === "posts";

  const hasResults = users.length > 0 || hashtags.length > 0 || posts.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 top-0 z-50 bg-card rounded-b-3xl max-h-[85vh] flex flex-col safe-area-top"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Search Input */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users, hashtags, posts..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted/30 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {query && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setQuery("")}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
                <button
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={handleClose}
                >
                  Cancel
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors shrink-0",
                      activeTab === tab.id
                        ? "bg-foreground text-background"
                        : "bg-muted/30 text-muted-foreground"
                    )}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !query ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Search className="w-10 h-10 text-muted-foreground/50 mb-3" />
                  <p className="text-sm text-muted-foreground">Search for users, hashtags, or posts</p>
                </div>
              ) : !hasResults ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
                </div>
              ) : (
                <div className="py-2">
                  {/* Users */}
                  {showUsers && users.length > 0 && (
                    <div className="mb-4">
                      {activeTab === "all" && (
                        <p className="px-4 py-2 text-xs text-muted-foreground font-medium">Users</p>
                      )}
                      {users.map((user) => (
                        <button
                          key={user.id}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
                          onClick={() => {
                            onNavigateToProfile?.(user.id);
                            handleClose();
                          }}
                        >
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-muted/30">
                                {user.username?.[0]?.toUpperCase() || "U"}
                              </AvatarFallback>
                            </Avatar>
                            {isUserOnline(user.id) && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-foreground">
                              {user.display_name || user.username || "User"}
                            </p>
                            {user.username && (
                              <p className="text-xs text-muted-foreground">@{user.username}</p>
                            )}
                          </div>
                          {isUserOnline(user.id) && (
                            <span className="text-[10px] text-green-500 font-medium">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hashtags */}
                  {showHashtags && hashtags.length > 0 && (
                    <div className="mb-4">
                      {activeTab === "all" && (
                        <p className="px-4 py-2 text-xs text-muted-foreground font-medium">Hashtags</p>
                      )}
                      {hashtags.map((tag) => (
                        <button
                          key={tag.id}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
                          onClick={() => {
                            onNavigateToHashtag?.(tag.name);
                            handleClose();
                          }}
                        >
                          <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center">
                            <Hash className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-foreground">#{tag.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tag.use_count?.toLocaleString() || 0} posts
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Posts */}
                  {showPosts && posts.length > 0 && (
                    <div className="mb-4">
                      {activeTab === "all" && (
                        <p className="px-4 py-2 text-xs text-muted-foreground font-medium">Posts</p>
                      )}
                      {posts.map((post) => (
                        <button
                          key={post.id}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/30 active:bg-muted/50 transition-colors"
                          onClick={() => {
                            onNavigateToPost?.(post.id);
                            handleClose();
                          }}
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                            {post.thumbnail_url ? (
                              <img src={post.thumbnail_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Film className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {post.title || post.description || "Untitled"}
                            </p>
                            {post.username && (
                              <p className="text-xs text-muted-foreground">@{post.username}</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Handle */}
            <div className="flex justify-center py-2">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DiscoverySearchSheet;
