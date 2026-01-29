// src/pages/Reports.tsx

import { useState, useEffect } from "react";
import {
  FaChartBar,
  FaCalendarDay,
  FaSearch,
  FaPrint,
  FaDownload,
  FaCar,
  FaMoneyBillWave,
  FaSpinner,
} from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api/axios";

interface DailyReport {
  RecordNumber: number;
  PlateNumber: string;
  CarModel: string;
  ServiceName: string;
  ServicePrice: number;
  AmountPaid: number;
  PaymentDate: string;
  MechanicName: string;
}

interface ReportSummary {
  totalServices: number;
  totalServicePrice: number;
  totalAmountPaid: number;
}

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch reports when date changes
  useEffect(() => {
    fetchReports();
  }, [selectedDate]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/reports/daily?date=${selectedDate}`);
      if (response.data.success) {
        setReports(response.data.data.reports);
        setSummary(response.data.data.summary);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <FaChartBar className="text-gray-900" />
              Daily Reports
            </h1>
            <p className="text-gray-500 mt-1">View daily service and payment reports</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="btn-secondary">
              <FaPrint />
              <span>Print</span>
            </button>
            <button className="btn-primary">
              <FaDownload />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="card p-6 mb-6 no-print">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <FaCalendarDay className="text-gray-400" />
              <label className="font-medium text-gray-700">Select Date:</label>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field max-w-xs"
            />
            <button onClick={fetchReports} className="btn-primary">
              <FaSearch />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Services</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summary?.totalServices || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center">
                <FaCar className="text-2xl text-white" />
              </div>
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(summary?.totalAmountPaid || 0)}
                </p>
              </div>
              <div className="w-14 h-14 bg-gray-700 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-2xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Report Header (for print) */}
        <div className="hidden print:block mb-8 text-center">
          <h1 className="text-2xl font-bold">SmartPark - Daily Report</h1>
          <p className="text-gray-600">Rubavu District, Western Province, Rwanda</p>
          <p className="text-gray-500 mt-2">
            Date: {new Date(selectedDate).toLocaleDateString("en-RW", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Report Table */}
        <div className="card">
          <div className="p-6 border-b border-gray-200 no-print">
            <h2 className="text-lg font-semibold text-gray-900">
              Services & Payments for{" "}
              {new Date(selectedDate).toLocaleDateString("en-RW", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-12 text-center">
              <FaSpinner className="text-3xl text-gray-400 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center">
              <FaChartBar className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No records found for this date</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="table-header">
                    <th className="px-6 py-4">#</th>
                    <th className="px-6 py-4">Plate Number</th>
                    <th className="px-6 py-4">Car Model</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Mechanic</th>
                    <th className="px-6 py-4 text-right">Service Price</th>
                    <th className="px-6 py-4 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {report.PlateNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.CarModel}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                          {report.ServiceName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{report.MechanicName}</td>
                      <td className="px-6 py-4 text-right text-gray-800">
                        {formatCurrency(report.ServicePrice)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(report.AmountPaid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100 font-bold">
                    <td colSpan={5} className="px-6 py-4 text-right text-gray-900">
                      TOTAL:
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(summary?.totalServicePrice || 0)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(summary?.totalAmountPaid || 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 pt-8 border-t border-gray-200">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Generated by: Chief Mechanic</p>
              <p className="text-sm text-gray-500">
                Printed on: {new Date().toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Signature: __________________</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}