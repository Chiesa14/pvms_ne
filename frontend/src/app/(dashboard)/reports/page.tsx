"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface CarEntry {
  id: number;
  plate_number: string;
  ticket_number: string;
  entry_time: string;
  exit_time: string | null;
  amount: number;
  ParkingSlot: {
    name: string;
    location: string;
  };
}

interface ReportSummary {
  totalCars: number;
  totalAmount?: string;
  activeCars?: number;
  exitedCars?: number;
  totalRevenue?: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ReportResponse {
  success: boolean;
  data: {
    outgoingCars?: CarEntry[];
    enteredCars?: CarEntry[];
    summary: ReportSummary;
    pagination: Pagination;
  };
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("outgoing");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchReport = async (type: "outgoing" | "entered") => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(
        `http://localhost:5000/api/reports/${type}?startDate=${startDate}&endDate=${endDate}&page=${currentPage}&limit=${itemsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      toast.error("Failed to fetch report data");
      console.error("Report fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setReportData(null);
    setCurrentPage(1);
  };

  const handleDateChange = () => {
    setCurrentPage(1);
    fetchReport(activeTab as "outgoing" | "entered");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchReport(activeTab as "outgoing" | "entered");
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Parking Reports</h1>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full sm:w-48"
          />
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full sm:w-48"
          />
          <Button onClick={handleDateChange} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Loading..." : "Generate Report"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="outgoing" className="flex-1 sm:flex-none">Outgoing Cars</TabsTrigger>
          <TabsTrigger value="entered" className="flex-1 sm:flex-none">Entered Cars</TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing">
          <Card className="p-6">
            {reportData?.data.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Total Cars</h3>
                  <p className="text-2xl font-bold">{reportData.data.summary.totalCars}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Total Amount</h3>
                  <p className="text-2xl font-bold">
                    {formatAmount(parseFloat(reportData.data.summary.totalAmount || "0"))}
                  </p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Date Range</h3>
                  <p className="text-sm">
                    {formatDate(reportData.data.summary.dateRange.start)} -{" "}
                    {formatDate(reportData.data.summary.dateRange.end)}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead className="hidden md:table-cell">Parking Slot</TableHead>
                    <TableHead className="hidden lg:table-cell">Entry Time</TableHead>
                    <TableHead className="hidden lg:table-cell">Exit Time</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.data.outgoingCars?.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>{car.ticket_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{car.plate_number}</span>
                          <span className="md:hidden text-sm text-gray-500">
                            {car.ParkingSlot.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {car.ParkingSlot.name} ({car.ParkingSlot.location})
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(car.entry_time)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(car.exit_time!)}</TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        {formatAmount(car.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {reportData?.data.pagination && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, reportData.data.pagination.total)} of{" "}
                  {reportData.data.pagination.total} entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === reportData.data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="entered">
          <Card className="p-6">
            {reportData?.data.summary && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Total Cars</h3>
                  <p className="text-2xl font-bold">{reportData.data.summary.totalCars}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Active Cars</h3>
                  <p className="text-2xl font-bold">{reportData.data.summary.activeCars}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Exited Cars</h3>
                  <p className="text-2xl font-bold">{reportData.data.summary.exitedCars}</p>
                </div>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-primary">Total Revenue</h3>
                  <p className="text-2xl font-bold">
                    {formatAmount(parseFloat(reportData.data.summary.totalRevenue || "0"))}
                  </p>
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Plate Number</TableHead>
                    <TableHead className="hidden md:table-cell">Parking Slot</TableHead>
                    <TableHead className="hidden lg:table-cell">Entry Time</TableHead>
                    <TableHead className="hidden lg:table-cell">Exit Time</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData?.data.enteredCars?.map((car) => (
                    <TableRow key={car.id}>
                      <TableCell>{car.ticket_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{car.plate_number}</span>
                          <span className="md:hidden text-sm text-gray-500">
                            {car.ParkingSlot.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {car.ParkingSlot.name} ({car.ParkingSlot.location})
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(car.entry_time)}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {car.exit_time ? formatDate(car.exit_time) : "Active"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-right">
                        {car.amount ? formatAmount(car.amount) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {reportData?.data.pagination && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
                <p className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, reportData.data.pagination.total)} of{" "}
                  {reportData.data.pagination.total} entries
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === reportData.data.pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 