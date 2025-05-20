"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";

interface ParkingSlot {
  id: string;
  code: string;
  name: string;
  available_spaces: number;
  location: string;
  fee_per_hour: number;
}

export default function ParkingSlotsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    available_spaces: 1,
    location: "",
    fee_per_hour: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const {
    page,
    pageSize,
    search,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
  } = usePagination({ defaultPageSize: 10 });

  // Fetch parking slots with pagination and search
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: pageSize.toString(),
    });
    if (search) params.set("search", search);
    fetch(`http://localhost:5000/api/slots?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setSlots(Array.isArray(data.data) ? data.data : data);
        setTotal(data.total || data.length || 0);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load parking slots");
        setSlots([]);
        setLoading(false);
      });
  }, [user, page, pageSize, search]);

  // Handle form input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value =
      e.target.name === "available_spaces" || e.target.name === "fee_per_hour"
        ? Number(e.target.value)
        : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  // Add or update parking slot
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editingSlot
        ? `http://localhost:5000/api/slots/${editingSlot.id}`
        : "http://localhost:5000/api/slots";
      const method = editingSlot ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to save parking slot");
      }
      const savedSlot = await res.json();
      if (editingSlot) {
        setSlots((prev) =>
          prev.map((slot) => (slot.id === editingSlot.id ? savedSlot : slot))
        );
        toast.success("Parking slot updated");
      } else {
        setSlots((prev) => [...prev, savedSlot]);
        toast.success("Parking slot added");
      }
      setForm({
        code: "",
        name: "",
        available_spaces: 1,
        location: "",
        fee_per_hour: 0,
      });
      setEditingSlot(null);
      setShowModal(false);
    } catch (error) {
      console.error("Error saving parking slot:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save parking slot"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete parking slot
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this parking slot?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/slots/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      if (!res.ok) throw new Error();
      setSlots((prev) => prev.filter((slot) => slot.id !== id));
      toast.success("Parking slot deleted");
    } catch {
      toast.error("Failed to delete parking slot");
    }
  };

  // Edit parking slot
  const handleEdit = (slot: ParkingSlot) => {
    setEditingSlot(slot);
    setForm({
      code: slot.code,
      name: slot.name,
      available_spaces: slot.available_spaces,
      location: slot.location,
      fee_per_hour: slot.fee_per_hour,
    });
    setShowModal(true);
  };

  if (!user) return null;

  // Admin: CRUD
  if (user.role === "admin") {
    return (
      <div className="space-y-8 relative">
        {/* Add Parking Slot Button */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setEditingSlot(null);
              setForm({
                code: "",
                name: "",
                available_spaces: 1,
                location: "",
                fee_per_hour: 0,
              });
              setShowModal(true);
            }}
            className="bg-primary text-white"
          >
            + Add Parking Slot
          </Button>
        </div>
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-xs">
            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => {
                  setShowModal(false);
                  setEditingSlot(null);
                }}
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">
                {editingSlot ? "Edit Parking Slot" : "Add Parking Slot"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code</label>
                  <Input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Available Spaces</label>
                  <Input
                    type="number"
                    name="available_spaces"
                    value={form.available_spaces}
                    onChange={handleChange}
                    min={0}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <Input
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Fee Per Hour</label>
                  <Input
                    type="number"
                    name="fee_per_hour"
                    value={form.fee_per_hour}
                    onChange={handleChange}
                    min={0}
                    step={0.01}
                    required
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting
                    ? editingSlot
                      ? "Updating..."
                      : "Adding..."
                    : editingSlot
                    ? "Update Parking Slot"
                    : "Add Parking Slot"}
                </Button>
              </form>
            </div>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">Parking Slots</h2>
          <div className="mb-4">
            <Input
              placeholder="Search by code, name, or location..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          {loading ? (
            <div>Loading parking slots...</div>
          ) : !Array.isArray(slots) || slots.length === 0 ? (
            <div className="text-gray-500">No parking slots found.</div>
          ) : (
            <div className="grid gap-4">
              {slots.map((slot) => (
                <Card
                  key={slot.id}
                  className="flex flex-row items-center justify-between p-4"
                >
                  <div>
                    <div className="font-bold">{slot.name} ({slot.code})</div>
                    <div className="text-sm text-gray-500">
                      {slot.location} | Available: {slot.available_spaces} | Fee/hr: {slot.fee_per_hour} rwf
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleEdit(slot)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(slot.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              totalItems={total}
            />
          </div>
        </div>
      </div>
    );
  }

  // User/Attendant: view only
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold mb-4">Available Parking Slots</h2>
      {loading ? (
        <div>Loading parking slots...</div>
      ) : !Array.isArray(slots) || slots.length === 0 ? (
        <div className="text-gray-500">No parking slots found.</div>
      ) : (
        <div className="grid gap-4">
          {slots.map((slot) => (
            <Card key={slot.id} className="p-4">
              <div className="font-bold">{slot.name} ({slot.code})</div>
              <div className="text-sm text-gray-500">
                {slot.location} | Available: {slot.available_spaces} | Fee/hr: {slot.fee_per_hour} rwf
              </div>
            </Card>
          ))}
        </div>
      )}
      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          totalItems={total}
        />
      </div>
    </div>
  );
}
