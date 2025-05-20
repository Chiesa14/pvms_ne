"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const { user } = useAuth();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [outgoing, setOutgoing] = useState<any>(null);
  const [entered, setEntered] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user || user.role !== "admin") {
    return <div className="text-red-500">Access denied. Admins only.</div>;
  }

  // Fetch outgoing cars report
  const fetchOutgoing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/reports/outgoing?start=${start}&end=${end}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch outgoing report");
      setOutgoing(await res.json());
    } catch {
      setError("Failed to fetch outgoing report");
    } finally {
      setLoading(false);
    }
  };

  // Fetch entered cars report
  const fetchEntered = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `http://localhost:5000/api/reports/entries?start=${start}&end=${end}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch entered report");
      setEntered(await res.json());
    } catch {
      setError("Failed to fetch entered report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Outgoing Cars Report */}
        <Card className="p-4">
          <h3 className="font-bold mb-2">Outgoing Cars Report</h3>
          <div className="flex gap-2 mb-2">
            <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
            <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
            <Button onClick={fetchOutgoing} disabled={loading || !start || !end}>Fetch</Button>
          </div>
          {outgoing && (
            <>
              <div className="mb-2 font-semibold">Total Amount: ${outgoing.totalAmount}</div>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Ticket</th>
                      <th className="p-2">Plate</th>
                      <th className="p-2">Parking</th>
                      <th className="p-2">Entry</th>
                      <th className="p-2">Exit</th>
                      <th className="p-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outgoing.cars.map((car: any) => (
                      <tr key={car.id} className="border-b">
                        <td className="p-2 font-mono">{car.ticket_number}</td>
                        <td className="p-2">{car.plate_number}</td>
                        <td className="p-2">{car.parking_code}</td>
                        <td className="p-2">{car.entry_time ? new Date(car.entry_time).toLocaleString() : "-"}</td>
                        <td className="p-2">{car.exit_time ? new Date(car.exit_time).toLocaleString() : "-"}</td>
                        <td className="p-2">${car.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>
        {/* Entered Cars Report */}
        <Card className="p-4">
          <h3 className="font-bold mb-2">Entered Cars Report</h3>
          <div className="flex gap-2 mb-2">
            <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} />
            <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
            <Button onClick={fetchEntered} disabled={loading || !start || !end}>Fetch</Button>
          </div>
          {entered && (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Ticket</th>
                    <th className="p-2">Plate</th>
                    <th className="p-2">Parking</th>
                    <th className="p-2">Entry</th>
                  </tr>
                </thead>
                <tbody>
                  {entered.cars.map((car: any) => (
                    <tr key={car.id} className="border-b">
                      <td className="p-2 font-mono">{car.ticket_number}</td>
                      <td className="p-2">{car.plate_number}</td>
                      <td className="p-2">{car.parking_code}</td>
                      <td className="p-2">{car.entry_time ? new Date(car.entry_time).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
} 