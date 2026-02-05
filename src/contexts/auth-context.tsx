import { createContext, useContext, useEffect, useState, useRef, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMountedRef = useRef(true);

  // Fetch user profile from public.users table
  const fetchProfile = async (userId: string, signal?: AbortSignal): Promise<UserProfile | null> => {
    try {
      let query = supabase
        .from("users")
        .select("*")
        .eq("id", userId);

      // Only attach abort signal when provided (avoids edge cases with undefined).
      if (signal) {
        query = query.abortSignal(signal);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        // Ignore AbortError - expected during hot-reload/unmount
        if (error.message?.includes('AbortError') || error.code === 'ABORT_ERR') {
          return null;
        }
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as UserProfile | null;
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  const getSessionWithTimeout = async (timeoutMs: number) => {
    return await Promise.race([
      supabase.auth.getSession(),
      new Promise<{ data: { session: Session | null } }>((_, reject) => {
        setTimeout(() => reject(new Error("getSession timeout")), timeoutMs);
      }),
    ]);
  };

  useEffect(() => {
    isMountedRef.current = true;
    const abortController = new AbortController();

    // Listener for ongoing auth changes (does NOT control isLoading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMountedRef.current) return;
        
        setSession(session);
        setUser(session?.user ?? null);

        // Fire-and-forget: update profile without affecting loading state
        if (session?.user) {
          fetchProfile(session.user.id).then((p) => {
            if (isMountedRef.current) setProfile(p);
          });
          return;
        }

        if (event === "SIGNED_OUT") setProfile(null);
      }
    );

    // Initial load (controls isLoading)
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await getSessionWithTimeout(8000);
        if (!isMountedRef.current) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const p = await fetchProfile(session.user.id, abortController.signal);
          if (!isMountedRef.current) return;
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch {
        // If we can't load session (bad jwt, timeout, etc.), fall back to logged-out state.
        if (!isMountedRef.current) return;
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMountedRef.current = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error: error as Error | null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password,
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
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
