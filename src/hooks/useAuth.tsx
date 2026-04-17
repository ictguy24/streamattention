import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
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

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error) {
      setProfile(data as Profile);
    }
  }, []);

  // 1️⃣ Listen for auth changes (NO DB CALLS HERE)
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const initAuth = async () => {
      let timeoutId: number | undefined;
      try {
        // Defensive timeout: avoid permanent loading state when auth endpoint is unreachable.
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = window.setTimeout(() => reject(new Error("Auth initialization timeout")), 6000);
        });

        const sessionPromise = supabase.auth.getSession();
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.warn("Auth initialization fallback:", error);
        setSession(null);
        setUser(null);
      } finally {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }
        setIsLoading(false);
      }
    };

    void initAuth();

    return () => subscription.unsubscribe();
  }, []);

  // 2️⃣ Fetch profile ONLY when session is stable
  useEffect(() => {
    if (session?.access_token && user?.id) {
      fetchProfile(user.id);
    } else {
      setProfile(null);
    }
  }, [fetchProfile, session?.access_token, user?.id]);

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

    const { error } = await supabase.auth.signUp({
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
