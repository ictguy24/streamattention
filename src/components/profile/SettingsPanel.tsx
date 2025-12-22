import { useState } from "react";
import { 
  ChevronRight, 
  User, 
  Shield, 
  Wallet, 
  Crown, 
  Lock, 
  Bell, 
  Database,
  Sun,
  Moon,
  Palette,
  Type,
  Check
} from "lucide-react";
import { useTheme, ColorScheme, FontOption } from "@/hooks/useTheme";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type SettingsSection = "main" | "account" | "security" | "wallet" | "tier" | "privacy" | "notifications" | "data" | "appearance";

const COLOR_SCHEMES: { id: ColorScheme; name: string; colors: string[] }[] = [
  { id: "neon", name: "Neon Cyber", colors: ["#00d4ff", "#8b5cf6", "#ff0080"] },
  { id: "sunset", name: "Sunset Glow", colors: ["#ff8c00", "#ff3366", "#ffd700"] },
  { id: "ocean", name: "Ocean Breeze", colors: ["#0099ff", "#4169e1", "#00b3b3"] },
  { id: "forest", name: "Forest Zen", colors: ["#22c55e", "#2dd4bf", "#84cc16"] },
  { id: "royal", name: "Royal Purple", colors: ["#9333ea", "#d946ef", "#3b82f6"] },
  { id: "minimal", name: "Minimal Gray", colors: ["#808080", "#666666", "#999999"] },
];

const FONT_OPTIONS: { id: FontOption; name: string }[] = [
  { id: "inter", name: "Inter" },
  { id: "poppins", name: "Poppins" },
  { id: "space", name: "Space Grotesk" },
  { id: "mono", name: "JetBrains Mono" },
  { id: "serif", name: "Playfair" },
];

const SettingsPanel = () => {
  const [activeSection, setActiveSection] = useState<SettingsSection>("main");
  const { colorScheme, setColorScheme, font, setFont, mode, toggleMode } = useTheme();

  const settingsSections = [
    { id: "account" as const, label: "Account", icon: User, description: "Profile, username, email" },
    { id: "security" as const, label: "Security", icon: Shield, description: "Password, 2FA, sessions" },
    { id: "wallet" as const, label: "Wallet", icon: Wallet, description: "Payment methods, history" },
    { id: "tier" as const, label: "Subscription", icon: Crown, description: "Your plan and benefits" },
    { id: "privacy" as const, label: "Privacy", icon: Lock, description: "Who can see your content" },
    { id: "notifications" as const, label: "Notifications", icon: Bell, description: "Push, email, in-app" },
    { id: "data" as const, label: "Data Usage", icon: Database, description: "Storage, downloads, cache" },
    { id: "appearance" as const, label: "Appearance", icon: Palette, description: "Theme, colors, fonts" },
  ];

  if (activeSection !== "main") {
    return (
      <div className="px-4">
        {/* Back button */}
        <button
          className="flex items-center gap-2 text-muted-foreground mb-4 active:scale-95 transition-transform"
          onClick={() => setActiveSection("main")}
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          <span className="text-sm">Back to Settings</span>
        </button>

        {/* Section Content */}
        {activeSection === "appearance" && (
          <div className="space-y-6">
            {/* Dark/Light Mode */}
            <div className="p-4 rounded-xl bg-muted/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {mode === "dark" ? (
                    <Moon className="w-5 h-5 text-foreground" />
                  ) : (
                    <Sun className="w-5 h-5 text-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">Appearance</p>
                    <p className="text-xs text-muted-foreground">
                      {mode === "dark" ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                </div>
                <Switch checked={mode === "light"} onCheckedChange={toggleMode} />
              </div>
            </div>

            {/* Color Schemes */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Color Scheme</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {COLOR_SCHEMES.map((scheme) => (
                  <button
                    key={scheme.id}
                    className={cn(
                      "p-3 rounded-xl bg-muted/10 text-left transition-all relative active:scale-[0.98]",
                      colorScheme === scheme.id && "ring-2 ring-foreground"
                    )}
                    onClick={() => setColorScheme(scheme.id)}
                  >
                    <div className="flex gap-1.5 mb-2">
                      {scheme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-foreground">{scheme.name}</p>
                    {colorScheme === scheme.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Options */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Font Style</span>
              </div>
              <div className="space-y-2">
                {FONT_OPTIONS.map((fontOpt) => (
                  <button
                    key={fontOpt.id}
                    className={cn(
                      "p-3 rounded-xl bg-muted/10 w-full flex items-center justify-between transition-all active:scale-[0.98]",
                      font === fontOpt.id && "ring-2 ring-foreground"
                    )}
                    onClick={() => setFont(fontOpt.id)}
                  >
                    <span className="font-medium text-foreground">{fontOpt.name}</span>
                    {font === fontOpt.id && (
                      <div className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                        <Check className="w-3 h-3 text-background" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "account" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/10">
              <p className="text-sm text-muted-foreground mb-1">Username</p>
              <p className="font-medium text-foreground">@your_username</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/10">
              <p className="text-sm text-muted-foreground mb-1">Email</p>
              <p className="font-medium text-foreground">user@example.com</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/10">
              <p className="text-sm text-muted-foreground mb-1">Display Name</p>
              <p className="font-medium text-foreground">Your Name</p>
            </div>
            <button className="w-full py-3 rounded-xl bg-foreground/10 text-foreground font-medium active:scale-[0.98] transition-transform">
              Edit Profile
            </button>
          </div>
        )}

        {activeSection === "security" && (
          <div className="space-y-4">
            <button className="w-full p-4 rounded-xl bg-muted/10 flex items-center justify-between active:scale-[0.98] transition-transform">
              <span className="text-foreground">Change Password</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">Not enabled</p>
              </div>
              <Switch />
            </div>
            <button className="w-full p-4 rounded-xl bg-muted/10 flex items-center justify-between active:scale-[0.98] transition-transform">
              <span className="text-foreground">Active Sessions</span>
              <span className="text-sm text-muted-foreground">2 devices</span>
            </button>
          </div>
        )}

        {activeSection === "privacy" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Private Account</p>
                <p className="text-xs text-muted-foreground">Only followers can see your content</p>
              </div>
              <Switch />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Show Activity Status</p>
                <p className="text-xs text-muted-foreground">Let others see when you're online</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Allow Messages</p>
                <p className="text-xs text-muted-foreground">Who can send you messages</p>
              </div>
              <span className="text-sm text-muted-foreground">Everyone</span>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Push Notifications</p>
                <p className="text-xs text-muted-foreground">Receive notifications on device</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Get updates via email</p>
              </div>
              <Switch />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">New Followers</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Likes on Posts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Comments</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        )}

        {activeSection === "wallet" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/10">
              <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
              <p className="font-medium text-foreground">Mobile Money •••• 1234</p>
            </div>
            <button className="w-full p-4 rounded-xl bg-muted/10 flex items-center justify-between active:scale-[0.98] transition-transform">
              <span className="text-foreground">Transaction History</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full p-4 rounded-xl bg-muted/10 flex items-center justify-between active:scale-[0.98] transition-transform">
              <span className="text-foreground">Withdrawal Settings</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        )}

        {activeSection === "tier" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/10 text-center">
              <Crown className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="font-medium text-foreground mb-1">Free Plan</p>
              <p className="text-xs text-muted-foreground">Basic features included</p>
            </div>
            <button className="w-full py-3 rounded-xl bg-foreground text-background font-medium active:scale-[0.98] transition-transform">
              Upgrade to Pro
            </button>
            <div className="space-y-2 text-sm">
              <p className="text-foreground font-medium">Pro Benefits:</p>
              <p className="text-muted-foreground">• 2x AC multiplier</p>
              <p className="text-muted-foreground">• Priority support</p>
              <p className="text-muted-foreground">• Custom themes</p>
              <p className="text-muted-foreground">• Analytics dashboard</p>
            </div>
          </div>
        )}

        {activeSection === "data" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/10">
              <p className="text-sm text-muted-foreground mb-1">Storage Used</p>
              <p className="font-medium text-foreground">234 MB / 5 GB</p>
              <div className="mt-2 h-2 rounded-full bg-muted/30 overflow-hidden">
                <div className="h-full w-[5%] bg-foreground/50 rounded-full" />
              </div>
            </div>
            <button className="w-full p-4 rounded-xl bg-muted/10 flex items-center justify-between active:scale-[0.98] transition-transform">
              <span className="text-foreground">Clear Cache</span>
              <span className="text-sm text-muted-foreground">45 MB</span>
            </button>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Data Saver</p>
                <p className="text-xs text-muted-foreground">Reduce data usage</p>
              </div>
              <Switch />
            </div>
            <div className="p-4 rounded-xl bg-muted/10 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Auto-Download Media</p>
                <p className="text-xs text-muted-foreground">Download over WiFi only</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 space-y-2">
      {settingsSections.map(section => (
        <button
          key={section.id}
          className="w-full p-4 rounded-xl bg-muted/10 flex items-center gap-3 active:scale-[0.98] transition-transform"
          onClick={() => setActiveSection(section.id)}
        >
          <section.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <div className="flex-1 text-left">
            <p className="font-medium text-foreground">{section.label}</p>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      ))}
    </div>
  );
};

export default SettingsPanel;