import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  ac_balance: number;
  tier: string;
  bio: string | null;
  website_url: string | null;
  social_links: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data as Profile);
      } else {
        // Profile doesn't exist, try to create it (recovery for failed triggers)
        console.log("Profile missing for user, attempting to create...");
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([
            {
              id: userId,
              username: user?.email?.split('@')[0] + Math.floor(Math.random() * 1000),
              display_name: user?.user_metadata?.display_name || user?.email?.split('@')[0]
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error("Failed to create missing profile:", createError);
        } else {
          setProfile(newProfile as Profile);
        }
      }
    } catch (err) {
      console.error("Exception in fetchProfile:", err);
    }
  };

  // 1️⃣ Listen for auth changes (NO DB CALLS HERE)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2️⃣ Fetch profile ONLY when session is stable
  useEffect(() => {
    if (session?.access_token && user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [session?.access_token, user?.id]);

  const refreshProfile = async () => {
    if (user?.id && session?.access_token) {
      await fetchProfile(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, username?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username: username?.trim() || null,
          display_name: username?.trim() || null,
        },
      },
    });

    if (!error && data?.user) {
      // Proactively create profile to avoid race conditions with trigger
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: data.user.id,
          username: username?.trim() || null,
          display_name: username?.trim() || null,
        }, { onConflict: 'id' });

      if (profileError) {
        console.warn("Manual profile creation failed (might already exist):", profileError);
      }
    }

    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
