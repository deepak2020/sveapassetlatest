import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase, base44 } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const loadProfile = async () => {
    const profile = await base44.auth.me();
    setUser(profile);
    setIsAuthenticated(!!profile);
  };

  useEffect(() => {
    // Hydrate from existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        loadProfile().finally(() => setIsLoadingAuth(false));
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Keep in sync with Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = (shouldRedirect = true) => {
    base44.auth.logout(shouldRedirect ? '/' : undefined);
  };

  const navigateToLogin = () => {
    base44.auth.redirectToLogin(window.location.href);
  };

  const checkUserAuth = async () => {
    await loadProfile();
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      appPublicSettings: {},
      authChecked: !isLoadingAuth,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
