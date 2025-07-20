"use client";

import React, { useCallback, useMemo } from "react";
import { ProfileProvider } from "./ProfileContext";
import { DashboardProvider } from "./DashboardContext";
import { FinanceProvider } from "./FinanceContext";
import { ContractProvider } from "./ContractContext";
import { QuoteProvider } from "./QuoteContext";
import { ProjectProvider } from "./ProjectContext";
import { useAuthContext } from "./AuthContext";
import { AuthContext } from "./AuthContext";

const CacheCleaner: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, signOut, ...rest } = useAuthContext();

  const customSignOut = useCallback(async () => {
    if (user) {
      localStorage.removeItem(`${user.uid}-projects`);
      localStorage.removeItem(`${user.uid}-quotes`);
      localStorage.removeItem(`${user.uid}-contracts`);
      localStorage.removeItem(`${user.uid}-finances`);
      localStorage.removeItem(`${user.uid}-dashboard`);
      localStorage.removeItem(`${user.uid}-profile`);
    }
    await signOut();
  }, [user, signOut]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(
    () => ({ ...rest, user, signOut: customSignOut }),
    [...Object.values(rest), user, customSignOut]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProfileProvider>
    <DashboardProvider>
      <FinanceProvider>
        <ContractProvider>
          <QuoteProvider>
            <ProjectProvider>
              <CacheCleaner>{children}</CacheCleaner>
            </ProjectProvider>
          </QuoteProvider>
        </ContractProvider>
      </FinanceProvider>
    </DashboardProvider>
  </ProfileProvider>
);
