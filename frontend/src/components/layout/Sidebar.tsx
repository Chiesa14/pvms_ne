"use client";
import React, { useState, useEffect } from "react";
import {
  FiHome,
  FiMapPin,
  FiClipboard,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
  FiTruck,
} from "react-icons/fi";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsOpen]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [pathname, setIsOpen]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/");
  };

  type SidebarItem = { icon: any; title: string; href: string };
  let sidebarItems: SidebarItem[] = [];
  if (user?.role === "admin") {
    sidebarItems = [
    {
      icon: FiHome,
      title: "Dashboard",
      href: "/dashboard",
    },
          {
            icon: FiMapPin,
        title: "Parking Slot Management",
            href: "/parking-slots",
          },
          {
            icon: FiTruck,
            title: "Vehicles",
            href: "/vehicles",
          },
    {
        icon: FiClipboard,
        title: "Car Entries/Exits",
        href: "/car-entries",
      },
      {
        icon: FiBarChart2,
        title: "Reports",
        href: "/reports",
      },
    ];
  } else if (user) {
    sidebarItems = [
      {
        icon: FiHome,
        title: "Dashboard",
        href: "/dashboard",
    },
    {
        icon: FiClipboard,
        title: "Register Car Entry/Exit",
        href: "/car-entries",
      },
      {
        icon: FiMapPin,
        title: "View Parking Slots",
        href: "/parking-slots",
    },
    {
        icon: FiTruck,
        title: "Vehicles",
        href: "/vehicles",
    },
  ];
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed lg:relative z-50 transition-all duration-300 ease-in-out",
          "h-screen bg-white backdrop-blur-md p-4 flex flex-col border-r border-gray-200",
          isOpen ? "w-64" : "w-0 lg:w-20",
          "transform lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "overflow-hidden lg:overflow-visible",
          "shadow-lg lg:shadow-none"
        )}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors max-w-fit cursor-pointer text-gray-600"
        >
          {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {/* Navigation Items */}
        <nav className="mt-8 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link key={item.title} href={item.href}>
                <div
                  className={cn(
                    "flex items-center p-3 my-4 text-sm font-medium rounded-lg",
                    "hover:bg-gray-100 transition-colors text-gray-700",
                    isActive && "bg-gray-100 font-medium"
                  )}
                >
                  <Icon
                    size={20}
                    className={cn(
                      "flex-shrink-0 text-gray-500",
                      isActive && "text-gray-900"
                    )}
                  />
                  {isOpen && (
                    <span className="ml-3 whitespace-nowrap">
                      {item.title}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button pinned to bottom */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center p-3 text-sm font-medium rounded-lg",
              "hover:bg-red-50 transition-colors text-red-600 w-full"
            )}
          >
            <FiLogOut size={20} className="flex-shrink-0" />
            {isOpen && (
              <span className="ml-3 whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
