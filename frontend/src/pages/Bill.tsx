// src/pages/Bill.tsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaPrint,
  FaArrowLeft,
  FaCar,
  FaTools,
  FaMoneyBillWave,
  FaUser,
  FaSpinner,
} from "react-icons/fa";
import api from "../api/axios";

interface BillData {
  serviceRecord: {
    RecordNumber: number;
    ServiceDate: string;
  };
  car: {
    PlateNumber: string;
    type: string;
    Model: string;
    ManufacturingYear: number;
    DriverPhone: string;
    MechanicName: string;
  };
  service: {
    ServiceCode: number;
    ServiceName: string;
    ServicePrice: number;
  };
  payment: {
    PaymentNumber: number;
    AmountPaid: number;
    PaymentDate: string;
    ReceivedBy: string;
  } | null;
}

export default function Bill() {
  const { recordNumber } = useParams<{ recordNumber: string }>();
  const navigate = useNavigate();

  const [billData, setBillData] = useState<BillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch bill data
  useEffect(() => {
    const fetchBillData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/bill/${recordNumber}`);
        if (response.data.success) {
          setBillData(response.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load bill data");
      } finally {
        setLoading(false);
      }
    };

    if (recordNumber) {
      fetchBillData();
    }
  }, [recordNumber]);

  // Print bill
  const handlePrint = () => {
    window.print();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW", {
      style: "currency",
      currency: "RWF",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-RW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Generate bill number
  const generateBillNumber = () => {
    const date = new Date();
    return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${recordNumber}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-4xl text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (error || !billData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error || "Bill not found"}</p>
          <button
            onClick={() => navigate("/service-records")}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { car, service, serviceRecord, payment } = billData;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Action Buttons */}
      <div className="max-w-4xl mx-auto px-4 mb-6 no-print">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            <FaPrint />
            <span>Print Bill</span>
          </button>
        </div>
      </div>

      {/* Bill Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden print:shadow-none">
        // In src/pages/Bill.tsx - Update the header section

{/* Header */}
<div className="bg-gray-900 text-white p-8">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      {/* Custom Logo SVG */}
      <svg
        width="60"
        height="60"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="50" cy="50" r="48" fill="#374151" stroke="#4B5563" strokeWidth="2" />
        <path
          d="M50 20 L54 28 L62 26 L60 34 L68 38 L62 44 L66 52 L58 52 L58 60 L50 56 L42 60 L42 52 L34 52 L38 44 L32 38 L40 34 L38 26 L46 28 Z"
          fill="#6B7280"
        />
        <circle cx="50" cy="42" r="10" fill="#374151" />
        <path
          d="M30 65 L32 58 L40 56 L45 52 L55 52 L60 56 L68 58 L70 65 L72 68 L72 72 L28 72 L28 68 Z"
          fill="#FFFFFF"
        />
        <circle cx="36" cy="72" r="5" fill="#374151" />
        <circle cx="64" cy="72" r="5" fill="#374151" />
      </svg>
      
      <div>
        <h1 className="text-3xl font-bold mb-1">SmartPark</h1>
        <p className="text-gray-300">Car Repair & Maintenance Services</p>
        <div className="mt-3 text-sm text-gray-400">
          <p>Rubavu District, Western Province</p>
          <p>Rwanda | Tel: +250 788 000 000</p>
        </div>
      </div>
    </div>

    <div className="text-right">
      <div className="bg-white/10 rounded-lg px-6 py-4">
        <p className="text-sm text-gray-300 mb-1">INVOICE</p>
        <p className="text-2xl font-bold">{generateBillNumber()}</p>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>Date: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  </div>
</div>

        {/* Bill Body */}
        <div className="p-8">
          {/* Customer & Car Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Car Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <FaCar className="text-gray-900" />
                Vehicle Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Plate Number:</span>
                  <span className="font-semibold text-gray-800">{car.PlateNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-semibold text-gray-800">{car.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Model:</span>
                  <span className="font-semibold text-gray-800">{car.Model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Year:</span>
                  <span className="font-semibold text-gray-800">{car.ManufacturingYear}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <FaUser className="text-gray-900" />
                Customer Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Driver Phone:</span>
                  <span className="font-semibold text-gray-800">{car.DriverPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Mechanic:</span>
                  <span className="font-semibold text-gray-800">{car.MechanicName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Service Date:</span>
                  <span className="font-semibold text-gray-800">
                    {formatDate(serviceRecord.ServiceDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Record #:</span>
                  <span className="font-semibold text-gray-800">{serviceRecord.RecordNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <FaTools className="text-gray-900" />
              Service Rendered
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service Code</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Service Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-4 text-gray-600">1</td>
                    <td className="py-3 px-4 text-gray-600">
                      SRV-{String(service.ServiceCode).padStart(3, "0")}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{service.ServiceName}</td>
                    <td className="py-3 px-4 text-right text-gray-800">
                      {formatCurrency(service.ServicePrice)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-gray-100">
                    <td colSpan={3} className="py-4 px-4 text-right font-bold text-gray-800">
                      Total Amount:
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-xl text-gray-900">
                      {formatCurrency(service.ServicePrice)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Info */}
          {payment ? (
            <div className="bg-gray-100 rounded-lg p-6 mb-8">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <FaMoneyBillWave className="text-gray-900" />
                Payment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Payment Number</p>
                  <p className="text-xl font-bold text-gray-800">
                    PAY-{String(payment.PaymentNumber).padStart(5, "0")}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(payment.AmountPaid)}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Payment Date</p>
                  <p className="text-xl font-bold text-gray-800">
                    {formatDate(payment.PaymentDate)}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-900 text-white rounded-lg text-center">
                <span className="font-bold text-lg">✓ FULLY PAID</span>
              </div>

              {/* Received By */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">Payment Received By:</p>
                <p className="font-semibold text-gray-800">{payment.ReceivedBy || "Chief Mechanic"}</p>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8 text-center">
              <p className="text-yellow-700 font-semibold">⚠ Payment Pending</p>
              <p className="text-sm text-yellow-600 mt-1">This service has not been paid yet</p>
            </div>
          )}

          {/* Signature Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="h-16 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-sm text-gray-600">Customer Signature</p>
              </div>
              <div className="text-center">
                <div className="h-16 border-b-2 border-gray-300 mb-2"></div>
                <p className="text-sm text-gray-600">Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bill Footer */}
        <div className="bg-gray-100 p-6 text-center">
          <p className="text-gray-600 text-sm">Thank you for choosing SmartPark!</p>
          <p className="text-gray-400 text-xs mt-2">
            © 2025 SmartPark - Rubavu District, Rwanda
          </p>
        </div>
      </div>
    </div>
  );
}