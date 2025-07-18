import { UserProfile } from "../services/userService";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface SignUpFormData extends AuthFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phone?: string;
  company?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthContextType extends AuthState {
  userProfile: UserProfile | null;
  profileLoading: boolean;
  userPlan: "free" | "pro" | "team";
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      displayName: string;
      phone?: string;
      company?: string;
    }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  clearError: () => void;
}
