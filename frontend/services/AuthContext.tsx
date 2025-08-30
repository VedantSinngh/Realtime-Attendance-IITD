import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "./supabase";
import { User, Session, AuthError } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    role: "admin" | "user" | null;
    error: AuthError | null;
    initialized: boolean;
    signOut: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"admin" | "user" | null>(null);
    const [error, setError] = useState<AuthError | null>(null);
    const [initialized, setInitialized] = useState(false);

    const updateUserState = (session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email === "admin@gmail.com") {
            setRole("admin");
        } else if (session?.user) {
            setRole("user");
        } else {
            setRole(null);
        }
    };

    useEffect(() => {
        let isMounted = true;

        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Error getting session:", error);
                    setError(error);
                } else if (isMounted) {
                    updateUserState(session);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setInitialized(true);
                }
            }
        };

        getInitialSession();

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state changed:", event, session?.user?.email);
            
            if (isMounted) {
                updateUserState(session);
                setLoading(false);
                setInitialized(true);
                setError(null); // Clear any previous errors on state change
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
                setError(error);
                throw error;
            }
            setError(null);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => {
        setError(null);
    };

    const value: AuthContextType = {
        user,
        session,
        loading,
        role,
        error,
        initialized,
        signOut,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}