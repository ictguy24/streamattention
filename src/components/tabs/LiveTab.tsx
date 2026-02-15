import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Users, Gift, MessageSquare, Heart, Share2, Play, Sparkles, Flame, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import Avatar from "@/features/avatar/Avatar";
import { useAttention } from "@/contexts/AttentionContext";

const LIVE_STREAMS = [
  {
    id: "l1",
    user: "AlphaDesign",
    viewers: "12.4K",
    title: "Designing the future of AC 💎",
    thumbnail: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=400&h=600&fit=crop",
    category: "Creative",
    isHot: true,
  },
  {
    id: "l2",
    user: "CryptoQueen",
    viewers: "8.2K",
    title: "AC Market Analysis & Alpha 🚀",
    thumbnail: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=600&fit=crop",
    category: "Finance",
    isHot: false,
  },
  {
    id: "l3",
    user: "ZenMaster",
    viewers: "5.1K",
    title: "Meditative beats for focused work",
    thumbnail: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&h=600&fit=crop",
    category: "Music",
    isHot: false,
  },
];

const CATEGORIES = [
  { name: "Gaming", icon: Flame, color: "text-orange-500" },
  { name: "Talk", icon: MessageSquare, color: "text-blue-500" },
  { name: "Music", icon: Play, color: "text-purple-500" },
  { name: "Design", icon: Sparkles, color: "text-cyan-500" },
  { name: "Esports", icon: Trophy, color: "text-yellow-500" },
];

const LiveTab = () => {
  const { balance } = useAttention();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeRoom, setActiveRoom] = useState<typeof LIVE_STREAMS[0] | null>(null);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <AnimatePresence mode="wait">
        {!activeRoom ? (
          <motion.div
            key="discovery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-y-auto no-scrollbar pb-32"
          >
            {/* Live Hero Header */}
            <div className="px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">LIVE HUB</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Discover Attention Streams</p>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                  <span className="text-[10px] font-bold text-destructive uppercase">1.2M LIVE</span>
                </div>
              </div>

              {/* Category Chips */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 -mx-4 px-4">
                {["All", ...CATEGORIES.map(c => c.name)].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-5 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border",
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                        : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Featured Streams Grid */}
              <div className="grid grid-cols-2 gap-3">
                {LIVE_STREAMS.map((stream, i) => (
                  <motion.div
                    key={stream.id}
                    className="relative aspect-[3/4] rounded-3xl overflow-hidden group cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveRoom(stream)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {/* Thumbnail */}
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-destructive text-white text-[9px] font-bold uppercase tracking-tighter shadow-lg">
                      <Radio className="w-2.5 h-2.5" />
                      LIVE
                    </div>

                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-white text-[9px] font-bold">
                      <Users className="w-2.5 h-2.5" />
                      {stream.viewers}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white text-xs font-bold line-clamp-2 leading-tight mb-1 drop-shadow-md">
                        {stream.title}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full border border-white/20 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stream.user}`} alt="" />
                        </div>
                        <span className="text-white/80 text-[10px] font-bold truncate">@{stream.user}</span>
                      </div>
                    </div>

                    {/* AC Interaction Glow */}
                    {stream.isHot && (
                      <div className="absolute inset-0 border-2 border-primary/30 rounded-3xl pointer-events-none">
                        <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Create Live Card */}
                <motion.div
                  className="relative aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed border-primary/30 bg-primary/5 flex flex-col items-center justify-center p-6 text-center group cursor-pointer"
                  whileHover={{ backgroundColor: "rgba(var(--primary), 0.1)" }}
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Radio className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-sm font-bold text-primary uppercase tracking-tight">GO LIVE</h3>
                  <p className="text-[10px] text-primary/60 font-medium">Broadcast & Earn AC</p>
                </motion.div>
              </div>
            </div>

            {/* Trending Sections */}
            <div className="mt-4 px-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold uppercase tracking-tight">Categories</h2>
                <button className="text-xs text-primary font-bold">View All</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORIES.map((cat) => (
                  <div key={cat.name} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center border border-white/5 hover:border-primary/30 transition-colors">
                      <cat.icon className={cn("w-5 h-5", cat.color)} />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <LiveRoom key="room" room={activeRoom} onExit={() => setActiveRoom(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Simulated Live Room Component
const LiveRoom = ({ room, onExit }: { room: typeof LIVE_STREAMS[0], onExit: () => void }) => {
  const [messages, setMessages] = useState([
    { user: "Stormy", text: "Yo, this design is fire! 🔥", id: 1 },
    { user: "NeonX", text: "How much AC did you earn today?", id: 2 },
    { user: "DevKing", text: "Look at that UI transition... insane.", id: 3 },
  ]);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const users = ["User123", "CryptoPro", "Ace", "Luna"];
      const texts = ["LFG!!!", "Nice one", "💎💎💎", "Sending support!", "Wow"];
      const newMessage = {
        user: users[Math.floor(Math.random() * users.length)],
        text: texts[Math.floor(Math.random() * texts.length)],
        id: Date.now(),
      };
      setMessages(prev => [...prev.slice(-10), newMessage]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Background Simulation */}
      <div className="absolute inset-0">
        <img src={room.thumbnail} className="w-full h-full object-cover blur-[2px] opacity-60" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      </div>

      {/* Header Overlay */}
      <div className="relative z-10 p-4 safe-area-top flex items-start justify-between">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10">
          <div className="w-8 h-8 rounded-full border-2 border-primary overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${room.user}`} alt="" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white leading-none">@{room.user}</p>
            <div className="flex items-center gap-1">
              <Users className="w-2 h-2 text-white/60" />
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-tighter">{room.viewers} VIEWERS</span>
            </div>
          </div>
          <div className="ml-2 px-3 py-1 rounded-full bg-primary text-[10px] font-bold text-primary-foreground">FOLLOW</div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-xl border border-white/10 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] font-bold text-white">LIVE</span>
          </div>
          <button onClick={onExit} className="p-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/10">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Interaction Area (Center-Right) */}
      <div className="flex-1 relative">
        {/* Floating Hearts Simulation */}
        <AnimatePresence>
           {Array.from({ length: Math.min(likes, 5) }).map((_, i) => (
             <motion.div
               key={Date.now() + i}
               initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
               animate={{ opacity: 0, y: -200, x: (Math.random() - 0.5) * 100, scale: 1.5 }}
               transition={{ duration: 2 }}
               className="absolute bottom-10 right-10 pointer-events-none"
             >
               <Heart className="w-8 h-8 text-primary fill-primary" />
             </motion.div>
           ))}
        </AnimatePresence>
      </div>

      {/* Chat & Footer Overlay */}
      <div className="relative z-10 p-4 safe-area-bottom pb-10">
        {/* Chat Stream */}
        <div className="max-h-[30vh] overflow-y-auto no-scrollbar mb-4 space-y-2 flex flex-col justify-end">
          {messages.map((m) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-2 max-w-[80%]"
            >
              <div className="px-3 py-1.5 rounded-2xl bg-black/20 backdrop-blur-md border border-white/5">
                <span className="text-[10px] font-bold text-primary mr-1.5">@{m.user}</span>
                <span className="text-xs text-white/90 font-medium">{m.text}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Say something nice..."
              className="w-full h-12 px-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
            onClick={() => setLikes(l => l + 1)}
          >
            <Heart className="w-6 h-6 text-white" />
          </button>
          
          <button className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-primary/30">
            <Gift className="w-6 h-6 text-primary-foreground" />
          </button>
          
          <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default LiveTab;
