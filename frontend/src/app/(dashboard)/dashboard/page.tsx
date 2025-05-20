/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Page() {
  const { user } = useAuth();

  if (!user) return <div>Loading...</div>;

  if (user.role === "admin") {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, Admin {user.firstName}!</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/parking-slots">
            <Card className="hover:shadow-lg cursor-pointer">
              <CardHeader>
                <CardTitle>Parking Slot Management</CardTitle>
              </CardHeader>
              <CardContent>
                Add, edit, or remove parking slots.
              </CardContent>
            </Card>
          </Link>
          <Link href="/car-entries">
            <Card className="hover:shadow-lg cursor-pointer">
              <CardHeader>
                <CardTitle>Car Entries/Exits</CardTitle>
              </CardHeader>
              <CardContent>
                View and manage car entries and exits.
              </CardContent>
            </Card>
          </Link>
          <Link href="/reports">
            <Card className="hover:shadow-lg cursor-pointer">
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                Generate and view parking reports.
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    );
  }

  // User/Attendant 
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user.firstName}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/car-entries">
          <Card className="hover:shadow-lg cursor-pointer">
          <CardHeader>
              <CardTitle>Register Car Entry/Exit</CardTitle>
          </CardHeader>
          <CardContent>
              Register incoming and outgoing cars in the parking.
          </CardContent>
        </Card>
        </Link>
        <Link href="/parking-slots">
          <Card className="hover:shadow-lg cursor-pointer">
          <CardHeader>
              <CardTitle>View Parking Slots</CardTitle>
          </CardHeader>
          <CardContent>
              View available parking slots and fees.
          </CardContent>
        </Card>
        </Link>
      </div>
    </div>
  );
}
