import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Grid3X3, List, Play, Image as ImageIcon, Plus, Trash2, Video, MessageSquare, Music, Images } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ContentSection = "all" | "stream" | "threads" | "fuzz" | "gallery";

interface Post {
  id: string;
  user_id: string;
  content_type: string;
  title: string | null;
  description: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  cover_image_url: string | null;
  like_count: number | null;
  comment_count: number | null;
  view_count: number | null;
  created_at: string | null;
  destinations: string[] | null;
}

const MediaGrid = () => {
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [activeSection, setActiveSection] = useState<ContentSection>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's own content directly
  const { data: userContent = [], isLoading } = useQuery({
    queryKey: ['user_content', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Post[];
    },
    enabled: !!user,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_content'] });
      toast.success('Content deleted');
    },
    onError: () => {
      toast.error('Failed to delete content');
    },
  });

  const handleDelete = async (postId: string) => {
    setDeletingId(postId);
    await deleteMutation.mutateAsync(postId);
    setDeletingId(null);
  };

  // Filter content by section/destination
  const filteredContent = userContent.filter(post => {
    if (activeSection === "all") return true;
    if (activeSection === "stream") return post.content_type === "video";
    if (activeSection === "threads") return post.content_type === "text" || post.destinations?.includes("threads");
    if (activeSection === "fuzz") return post.content_type === "audio" || post.destinations?.includes("fuzz");
    if (activeSection === "gallery") return post.content_type === "image" || post.destinations?.includes("gallery");
    return true;
  });

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const sections: { id: ContentSection; label: string; icon: React.ReactNode }[] = [
    { id: "all", label: "All", icon: <Grid3X3 className="w-3 h-3" /> },
    { id: "stream", label: "Stream", icon: <Video className="w-3 h-3" /> },
    { id: "threads", label: "Threads", icon: <MessageSquare className="w-3 h-3" /> },
    { id: "fuzz", label: "Fuzz", icon: <Music className="w-3 h-3" /> },
    { id: "gallery", label: "Gallery", icon: <Images className="w-3 h-3" /> },
  ];

  return (
    <motion.div
      className="px-4 py-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground">Your Content</h3>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
          <button
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "grid" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            className={cn(
              "p-1.5 rounded-md transition-colors",
              viewMode === "timeline" ? "bg-background text-foreground" : "text-muted-foreground"
            )}
            onClick={() => setViewMode("timeline")}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto no-scrollbar">
        {sections.map((section) => (
          <button
            key={section.id}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[10px] font-medium transition-colors whitespace-nowrap",
              activeSection === section.id
                ? "bg-foreground text-background"
                : "bg-muted/30 text-muted-foreground"
            )}
            onClick={() => setActiveSection(section.id)}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredContent.length === 0 && (
        <div className="py-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/30 flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No content yet</p>
          <p className="text-xs text-muted-foreground mt-1">Start creating to see your posts here</p>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && filteredContent.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-3 gap-1">
          <AnimatePresence>
            {filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                className="relative aspect-square rounded-lg bg-muted/30 overflow-hidden cursor-pointer group"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Thumbnail */}
                {item.thumbnail_url || item.cover_image_url ? (
                  <img 
                    src={item.thumbnail_url || item.cover_image_url || ""} 
                    alt={item.title || "Content"}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    {item.content_type === "video" ? (
                      <Play className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                )}
                
                {/* Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-background/80 to-transparent">
                  <div className="flex items-center gap-2 text-[10px] text-foreground/80">
                    <span>▶ {(item.view_count || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Video Badge */}
                {item.content_type === "video" && (
                  <div className="absolute top-1.5 right-1.5">
                    <Play className="w-3 h-3 text-foreground fill-foreground" />
                  </div>
                )}

                {/* Delete Button - Shows on hover */}
                <button
                  className={cn(
                    "absolute top-1.5 left-1.5 p-1.5 rounded-full bg-destructive/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity",
                    deletingId === item.id && "opacity-100"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                  disabled={deletingId === item.id}
                >
                  <Trash2 className={cn(
                    "w-3 h-3 text-destructive-foreground",
                    deletingId === item.id && "animate-spin"
                  )} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Timeline View */}
      {!isLoading && filteredContent.length > 0 && viewMode === "timeline" && (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/40 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.thumbnail_url || item.cover_image_url ? (
                    <img 
                      src={item.thumbnail_url || item.cover_image_url || ""} 
                      alt={item.title || "Content"}
                      className="w-full h-full object-cover"
                    />
                  ) : item.content_type === "video" ? (
                    <Play className="w-6 h-6 text-muted-foreground" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.title || item.description?.slice(0, 30) || "Untitled"}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTimeAgo(item.created_at || "")}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>▶ {(item.view_count || 0).toLocaleString()}</span>
                    <span>♥ {item.like_count || 0}</span>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  className="p-2 rounded-full hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(item.id)}
                  disabled={deletingId === item.id}
                >
                  <Trash2 className={cn(
                    "w-4 h-4 text-destructive",
                    deletingId === item.id && "animate-spin"
                  )} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default MediaGrid;
