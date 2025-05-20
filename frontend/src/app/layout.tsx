// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import ProtectedRoute from "@/components/ProtectedRoute";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PVMS",
  description: "Vehicle Parking Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="bottom-right" richColors />
        <AuthProvider>
          <ProtectedRoute>{children}</ProtectedRoute>
        </AuthProvider>
      </body>
    </html>
  );
}
