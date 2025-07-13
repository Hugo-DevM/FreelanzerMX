"use client";

import React from "react";
import { AuthProvider } from "../../contexts/AuthContext";

interface ClientAuthProviderProps {
  children: React.ReactNode;
}

const ClientAuthProvider: React.FC<ClientAuthProviderProps> = ({
  children,
}) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export default ClientAuthProvider;
