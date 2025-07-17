"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { AuthContextType } from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = useAuth();

  // Memoizar el valor del contexto para evitar re-renderizados innecesarios
  const contextValue = useMemo<AuthContextType>(
    () => ({
      user: auth.user,
      userProfile: auth.userProfile,
      loading: auth.loading,
      profileLoading: auth.profileLoading,
      error: auth.error,
      signIn: auth.signIn,
      signInWithGoogle: auth.signInWithGoogle,
      signUp: auth.signUp,
      signOut: auth.signOut,
      resetPassword: auth.resetPassword,
      refreshUserProfile: auth.refreshUserProfile,
      clearError: auth.clearError,
    }),
    [
      auth.user,
      auth.userProfile,
      auth.loading,
      auth.profileLoading,
      auth.error,
      auth.signIn,
      auth.signInWithGoogle,
      auth.signUp,
      auth.signOut,
      auth.resetPassword,
      auth.refreshUserProfile,
      auth.clearError,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
