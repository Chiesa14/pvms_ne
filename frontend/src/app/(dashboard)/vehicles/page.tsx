"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { useAuth } from "@/hooks/useAuth";
import { X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Vehicle = {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  color?: string;
};

export default function VehiclesPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ id: undefined, plate_number: "", brand: "", model: "", color: "" });
  const [editing, setEditing] = useState(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const fetchVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/vehicles?page=${page}&limit=${pageSize}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();
      if (res.ok) {
        setVehicles(data.data || data.rows || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.total || data.count || 0);
      } else {
        setError(data.error || "Failed to fetch vehicles");
      }
    } catch (e) {
      setError("Failed to fetch vehicles");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicles();
    // eslint-disable-next-line
  }, [page]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    setForm({ id: undefined, plate_number: "", brand: "", model: "", color: "" });
    setEditing(false);
    setShowForm(true);
  };

  const handleEdit = (v: Vehicle) => {
    setForm({ ...v });
    setEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this vehicle?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/vehicles/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      if (res.ok) {
        fetchVehicles();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete vehicle");
      }
    } catch (e) {
      setError("Failed to delete vehicle");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API_URL}/api/vehicles/${form.id}` : `${API_URL}/api/vehicles`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          plate_number: form.plate_number,
          brand: form.brand,
          model: form.model,
          color: form.color,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchVehicles();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to save vehicle");
      }
    } catch (e) {
      setError("Failed to save vehicle");
    }
    setLoading(false);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">All Vehicles</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {user?.role === "user" && (
        <Button onClick={handleAdd} className="mb-4">Add Vehicle</Button>
      )}</div>
      <Card className="overflow-x-auto mb-8">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Plate Number</th>
              <th className="hidden md:table-cell p-2 text-left">Brand</th>
              <th className="hidden lg:table-cell p-2 text-left">Model</th>
              <th className="hidden md:table-cell p-2 text-left">Color</th>
              {user?.role === "user" && <th className="p-2">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} className="border-b">
                <td className="p-2">
                  <div className="flex flex-col">
                    <span className="font-medium">{v.plate_number}</span>
                    <span className="md:hidden text-sm text-gray-500">
                      {v.brand} {v.model}
                    </span>
                  </div>
                </td>
                <td className="hidden md:table-cell p-2">{v.brand}</td>
                <td className="hidden lg:table-cell p-2">{v.model}</td>
                <td className="hidden md:table-cell p-2">{v.color}</td>
                {user?.role === "user" && (
                  <td className="p-2">
                    <div className="flex gap-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(v)}
                        className="hidden sm:inline-flex"
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(v.id)}
                        className="hidden sm:inline-flex"
                      >
                        Delete
                      </Button>
                      <div className="sm:hidden flex gap-1">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => handleEdit(v)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          onClick={() => handleDelete(v.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </Button>
                      </div>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {vehicles.length === 0 && !loading && <div className="p-4 text-center">No vehicles found.</div>}
      </Card>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        totalItems={totalItems}
      />
      {showForm && user?.role === "user" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-xs">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setShowForm(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-semibold mb-4">{editing ? "Edit Vehicle" : "Add Vehicle"}</h2>
            <div className="mb-2">
              <Input name="plate_number" placeholder="Plate Number" value={form.plate_number || ""} onChange={handleInput} required />
            </div>
            <div className="mb-2">
              <Input name="brand" placeholder="Brand" value={form.brand || ""} onChange={handleInput} required />
            </div>
            <div className="mb-2">
              <Input name="model" placeholder="Model" value={form.model || ""} onChange={handleInput} required />
            </div>
            <div className="mb-2">
              <Input name="color" placeholder="Color" value={form.color || ""} onChange={handleInput} />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" className="w-full" disabled={loading}>{editing ? "Update" : "Add"}</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 