// src/pages/Dashboard.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCar,
  FaTools,
  FaClipboardList,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarDay,
  FaSpinner,
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface DashboardData {
  counts: {
    totalCars: number;
    totalServices: number;
    totalRecords: number;
    pendingPayments: number;
    completedPayments: number;
  };
  revenue: {
    total: number;
    today: number;
    currency: string;
  };
  today: {
    transactions: number;
    revenue: number;
  };
  recentRecords: Array<{
    RecordNumber: number;
    PlateNumber: string;
    CarModel: string;
    ServiceName: string;
    ServicePrice: number;
    ServiceDate: string;
    PaymentStatus: string;
  }>;
  recentPayments: Array<{
    PaymentNumber: number;
    RecordNumber: number;
    PlateNumber: string;
    CarModel: string;
    ServiceName: string;
    AmountPaid: number;
    PaymentDate: string;
  }>;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await api.get("/reports/dashboard");
      
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err: any) {
      console.error("Dashboard error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="text-4xl text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaExclamationCircle className="text-4xl text-red-500 mx-auto mb-4" />
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName || "Chief Mechanic"}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening at SmartPark today
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Cars */}
          <div
            onClick={() => navigate("/cars")}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Cars</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {data?.counts.totalCars || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <FaCar className="text-2xl text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600">
              <span>View all cars</span>
              <FaArrowRight className="ml-2 text-xs" />
            </div>
          </div>

          {/* Total Services */}
          <div
            onClick={() => navigate("/services")}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Services Available</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {data?.counts.totalServices || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                <FaTools className="text-2xl text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <span>Manage services</span>
              <FaArrowRight className="ml-2 text-xs" />
            </div>
          </div>

          {/* Service Records */}
          <div
            onClick={() => navigate("/service-records")}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Service Records</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {data?.counts.totalRecords || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
                <FaClipboardList className="text-2xl text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600">
              <span>View records</span>
              <FaArrowRight className="ml-2 text-xs" />
            </div>
          </div>

          {/* Pending Payments */}
          <div
            onClick={() => navigate("/payments")}
            className="bg-white rounded-2xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Payments</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {data?.counts.pendingPayments || 0}
                </p>
              </div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <FaClock className="text-2xl text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-orange-600">
              <span>Process payments</span>
              <FaArrowRight className="ml-2 text-xs" />
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-300">Total Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(data?.revenue.total || 0)}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {data?.counts.completedPayments || 0} completed payments
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <FaMoneyBillWave className="text-3xl text-green-400" />
              </div>
            </div>
          </div>

          {/* Today's Revenue */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-200">Today's Revenue</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(data?.today.revenue || 0)}
                </p>
                <p className="text-sm text-blue-200 mt-2">
                  {data?.today.transactions || 0} transactions today
                </p>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                <FaCalendarDay className="text-3xl text-blue-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Service Records */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Service Records
              </h2>
              <button
                onClick={() => navigate("/service-records")}
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {data?.recentRecords && data.recentRecords.length > 0 ? (
                data.recentRecords.map((record) => (
                  <div
                    key={record.RecordNumber}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FaCar className="text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.PlateNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {record.ServiceName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(record.ServicePrice)}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                            record.PaymentStatus === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {record.PaymentStatus === "Paid" ? (
                            <FaCheckCircle className="text-xs" />
                          ) : (
                            <FaClock className="text-xs" />
                          )}
                          {record.PaymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FaClipboardList className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p>No service records yet</p>
                  <button
                    onClick={() => navigate("/service-records")}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    Create first record
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Payments
              </h2>
              <button
                onClick={() => navigate("/reports")}
                className="text-sm text-blue-600 hover:underline"
              >
                View Reports
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {data?.recentPayments && data.recentPayments.length > 0 ? (
                data.recentPayments.map((payment) => (
                  <div
                    key={payment.PaymentNumber}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <FaMoneyBillWave className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {payment.PlateNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.ServiceName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          +{formatCurrency(payment.AmountPaid)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(payment.PaymentDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <FaMoneyBillWave className="text-4xl text-gray-300 mx-auto mb-3" />
                  <p>No payments recorded yet</p>
                  <button
                    onClick={() => navigate("/payments")}
                    className="mt-2 text-blue-600 hover:underline text-sm"
                  >
                    Record first payment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/cars")}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaCar className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">Add Car</span>
            </button>

            <button
              onClick={() => navigate("/services")}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-green-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <FaTools className="text-green-600" />
              </div>
              <span className="font-medium text-gray-700">Add Service</span>
            </button>

            <button
              onClick={() => navigate("/service-records")}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FaClipboardList className="text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">New Record</span>
            </button>

            <button
              onClick={() => navigate("/payments")}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FaMoneyBillWave className="text-orange-600" />
              </div>
              <span className="font-medium text-gray-700">Record Payment</span>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl text-center text-sm text-gray-500">
          <p>SmartPark - Car Repair Payment Management System</p>
          <p>Rubavu District, Western Province, Rwanda</p>
        </div>
      </div>
    </Layout>
  );
}