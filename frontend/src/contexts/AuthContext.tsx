"use client";

import { createContext, ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressStreet: string;
  addressCity: string;
  addressState: string;
  addressPostalCode: string;
  addressCountry: string;
  role: "user" | "admin"; // Update with your actual roles
  isVerified: boolean;
  lastLogin: string; // ISO date string
  profileImage?: string; // Optional profile image URL
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: unknown) => Promise<boolean>;
  verifyOtp: (otp: string, token: string) => Promise<boolean>;
  logout: () => void;
  updateUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => false,
  register: async () => false,
  verifyOtp: async () => false,
  logout: () => {},
  updateUser: async () => {},
});

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = !!user;

  const updateUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("authToken");
        setUser(null);
        setLoading(false);
        router.replace("/");
        return;
      }
      fetch("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setUser(data);
          setLoading(false);
        })
        .catch(() => {
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg
          className="animate-spin h-6 w-6 mr-2 text-current"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    );
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        sessionStorage.setItem("pendingEmail", email);
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: unknown) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      if (response.ok) {
        const { token, user: userData } = await response.json();
        localStorage.setItem("authToken", token);
        
        // Fetch complete user data
        const userResponse = await fetch("http://localhost:5000/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(userResponse);
        
        if (userResponse.ok) {
          const completeUserData = await userResponse.json();
          setUser(completeUserData);
        } else {
          setUser({ ...userData, isVerified: true });
        }
        
        sessionStorage.removeItem("pendingEmail");
        return true;
      }

      const errorData = await response.json();
      throw new Error(errorData.message || "OTP verification failed");
    } catch (error) {
      sessionStorage.removeItem("pendingEmail");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        logout,
        verifyOtp,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
