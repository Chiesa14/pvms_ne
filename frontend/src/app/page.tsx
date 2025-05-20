"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { FiMapPin, FiShield, FiClock, FiDollarSign } from "react-icons/fi";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiMapPin className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">PVMS</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/auth/login")}>
              Login
            </Button>
            <Button onClick={() => router.push("/auth/register")}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Parking Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl">
            Streamline your parking experience with our intelligent vehicle
            management system. Reserve spots, manage vehicles, and handle
            payments all in one place.
          </p>
          <Button size="lg" onClick={() => router.push("/auth/register")}>
            Start Managing Your Parking
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <FiMapPin className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Smart Parking</h3>
            <p className="text-gray-600">
              Find and reserve parking spots in advance with our intelligent
              system.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <FiShield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure Management</h3>
            <p className="text-gray-600">
              Manage your vehicles and parking history with enhanced security.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <FiClock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
            <p className="text-gray-600">
              Get instant notifications and updates about your parking status.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm">
            <FiDollarSign className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
            <p className="text-gray-600">
              Handle payments seamlessly with our integrated payment system.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <FiMapPin className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold text-gray-900">PVMS</span>
            </div>
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} PVMS. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
