/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { X, Receipt } from "lucide-react";

interface CarEntry {
  id: string;
  plate_number: string;
  parking_code: string;
  entry_time: string;
  exit_time: string | null;
  amount: number;
  ticket_number: string;
}

interface Vehicle {
  id: string;
  plate_number: string;
  brand: string;
  model: string;
}

interface ParkingSlot {
  code: string;
  available_spaces: number;
  total_spaces: number;
}

interface Bill {
  ticket_number: string;
  plate_number: string;
  parking_code: string;
  entry_time: string;
  exit_time: string;
  duration: string;
  amount: number;
}

export default function CarEntriesPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<CarEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState({
    plate_number: "",
    parking_code: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [parkingCodes, setParkingCodes] = useState<string[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const {
    page,
    pageSize,
    search,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
  } = usePagination({ defaultPageSize: 10 });
  const [showBill, setShowBill] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | null>(null);

  // Fetch car entries
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });
    if (search) params.set("search", search);
    fetch(`http://localhost:5000/api/car-entries?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load car entries");
        setEntries([]);
        setLoading(false);
      });
  }, [user, page, pageSize, search]);

  // Fetch parking codes for form
  useEffect(() => {
    fetch(`http://localhost:5000/api/slots`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const slots = data.data || data;
        setParkingSlots(slots);
        setParkingCodes(slots.map((slot: ParkingSlot) => slot.code));
      });
  }, []);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch("/api/vehicles", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await response.json();
        console.log(data.data);
        setVehicles(data.data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchVehicles();
  }, []);

  // Handle form input
  const handleInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Register car entry
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/car-entries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to register car entry");
      toast.success("Car entry registered");
      setForm({ plate_number: "", parking_code: "" });

      // Refresh entries and parking slots
      const data = await res.json();
      setEntries((prev) => [data.entry, ...prev]);

      // Update parking slots
      setParkingSlots((prev) =>
        prev.map((slot) =>
          slot.code === form.parking_code
            ? { ...slot, available_spaces: slot.available_spaces - 1 }
            : slot
        )
      );
    } catch {
      toast.error("Failed to register car entry");
    } finally {
      setSubmitting(false);
    }
  };

  // Function to calculate duration between two dates
  const calculateDuration = (entry: string, exit: string) => {
    const entryDate = new Date(entry);
    const exitDate = new Date(exit);
    const diffMs = exitDate.getTime() - entryDate.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  // Function to show bill for any entry
  const showEntryBill = (entry: CarEntry) => {
    const bill: Bill = {
      ticket_number: entry.ticket_number,
      plate_number: entry.plate_number,
      parking_code: entry.parking_code,
      entry_time: entry.entry_time,
      exit_time: entry.exit_time || new Date().toISOString(),
      duration: entry.exit_time
        ? calculateDuration(entry.entry_time, entry.exit_time)
        : calculateDuration(entry.entry_time, new Date().toISOString()),
      amount: entry.amount || 0,
    };
    setCurrentBill(bill);
    setShowBill(true);
  };

  // Update handleExit to send email
  const handleExit = async (id: string) => {
    if (!confirm("Register car exit?")) return;
    try {
      const res = await fetch(
        `http://localhost:5000/api/car-entries/${id}/exit`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      const entry = entries.find((e) => e.id === id);

      if (entry) {
        // Update parking slots
        setParkingSlots((prev) =>
          prev.map((slot) =>
            slot.code === entry.parking_code
              ? { ...slot, available_spaces: slot.available_spaces + 1 }
              : slot
          )
        );

        // Prepare bill data
        const bill: Bill = {
          ticket_number: entry.ticket_number,
          plate_number: entry.plate_number,
          parking_code: entry.parking_code,
          entry_time: entry.entry_time,
          exit_time: new Date().toISOString(),
          duration: calculateDuration(
            entry.entry_time,
            new Date().toISOString()
          ),
          amount: data.amount || 0,
        };

        setCurrentBill(bill);
        setShowBill(true);

        // Show email status
        if (data.emailSent) {
          toast.success("Bill sent to your email");
        } else {
          toast.error("Failed to send email, but bill is available here");
        }
      }

      // Refresh entries
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, exit_time: new Date().toISOString() }
            : entry
        )
      );

      toast.success("Car exit registered");
    } catch {
      toast.error("Failed to register car exit");
    }
  };

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Car Entries & Exits</h2>
      </div>

      {/* Register Car Entry Form */}
      {user.role === "user" && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Vehicle</label>
                <select
                  name="plate_number"
                  value={form.plate_number || ""}
                  onChange={handleInput}
                  className="w-full p-2 border rounded-md bg-white"
                  required
                >
                  <option value="">Choose a vehicle...</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.plate_number}>
                      {vehicle.plate_number} - {vehicle.brand} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Parking Code</label>
                <select
                  name="parking_code"
                  value={form.parking_code}
                  onChange={handleInput}
                  className="w-full p-2 border rounded-md bg-white"
                  required
                >
                  <option value="">Select parking code...</option>
                  {parkingSlots.map((slot) => (
                    <option
                      key={slot.code}
                      value={slot.code}
                      disabled={slot.available_spaces === 0}
                    >
                      {slot.code} ({slot.available_spaces} spaces available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  type="submit"
                  disabled={
                    submitting || !form.parking_code || !form.plate_number
                  }
                  className="w-full"
                >
                  {submitting ? "Registering..." : "Register Entry"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* Entries Table */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading car entries...
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No car entries found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 text-left font-medium text-gray-600">
                    Ticket
                  </th>
                  <th className="p-4 text-left font-medium text-gray-600">
                    Plate Number
                  </th>
                  <th className="p-4 text-left font-medium text-gray-600">
                    Parking Code
                  </th>
                  <th className="p-4 text-left font-medium text-gray-600">
                    Entry Time
                  </th>
                  <th className="p-4 text-left font-medium text-gray-600">
                    Exit Time
                  </th>
                  <th className="p-4 text-left font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="p-4 text-left font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono text-sm">
                      {entry.ticket_number}
                    </td>
                    <td className="p-4">{entry.plate_number}</td>
                    <td className="p-4">{entry.parking_code}</td>
                    <td className="p-4">
                      {entry.entry_time
                        ? new Date(entry.entry_time).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-4">
                      {entry.exit_time
                        ? new Date(entry.exit_time).toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-4 font-medium">
                      {entry.amount ? `${entry.amount} rwf` : "-"}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!entry.exit_time &&
                          (user.role === "admin" || user.role === "user") && (
                            <Button
                              size="sm"
                              onClick={() => handleExit(entry.id)}
                              variant="outline"
                              className="hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                            >
                              Register Exit
                            </Button>
                          )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => showEntryBill(entry)}
                          className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                        >
                          <Receipt className="w-4 h-4 mr-1" />
                          View Bill
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={10}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalItems={entries.length}
        />
      </div>

      {/* Bill Modal */}
      {showBill && currentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowBill(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Parking Receipt</h2>
              <p className="text-gray-500">
                Thank you for using our parking service
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Ticket Number:</span>
                <span className="font-mono">{currentBill.ticket_number}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Vehicle:</span>
                <span>{currentBill.plate_number}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Parking Slot:</span>
                <span>{currentBill.parking_code}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Entry Time:</span>
                <span>{new Date(currentBill.entry_time).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Exit Time:</span>
                <span>{new Date(currentBill.exit_time).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">Duration:</span>
                <span>{currentBill.duration}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-bold">Total Amount:</span>
                <span className="text-lg font-bold text-green-600">
                  {currentBill.amount} rwf
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Please keep this receipt for your records</p>
              <p>Thank you for your business!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
