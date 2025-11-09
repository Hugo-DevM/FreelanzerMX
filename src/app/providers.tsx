"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AppProvider>{children}</AppProvider>
        </AuthProvider>
    );
}
