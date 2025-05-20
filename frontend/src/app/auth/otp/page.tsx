"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FiLock } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";

export default function OtpPage() {
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const { verifyOtp } = useAuth();

  useEffect(() => {
    const pendingEmail = sessionStorage.getItem("pendingEmail");
    if (!pendingEmail) {
      toast.error("No pending login. Please login again.");
      router.replace("/auth/login");
    } else {
      setEmail(pendingEmail);
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubmitting(true);
    try {
      const success = await verifyOtp(email, otp);
      if (success) {
        toast.success("OTP verified! Redirecting...");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("OTP verification failed", {
        description: error instanceof Error ? error.message : "Invalid OTP or email.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md space-y-8 border"
      >
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-gray-900">OTP Verification</h1>
          <p className="text-gray-600">Enter the OTP sent to your email</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                required
                maxLength={6}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full hover:shadow-md transition-shadow"
          disabled={submitting}
        >
          {submitting ? "Verifying..." : "Verify OTP"}
        </Button>
      </form>
    </div>
  );
} 