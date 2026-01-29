// src/pages/Payment.tsx

import { useState, useEffect } from "react";
import { FaMoneyBillWave, FaPlus, FaCheck, FaReceipt, FaSpinner } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api/axios";

interface ServiceRecord {
  RecordNumber: number;
  PlateNumber: string;
  ServiceName: string;
  ServicePrice: number;
  CarModel?: string;
}

interface PaymentForm {
  RecordNumber: string;
  AmountPaid: string;
  PaymentDate: string;
}

export default function Payment() {
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [formData, setFormData] = useState<PaymentForm>({
    RecordNumber: "",
    AmountPaid: "",
    PaymentDate: new Date().toISOString().split("T")[0],
  });
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch unpaid service records
  useEffect(() => {
    fetchUnpaidRecords();
  }, []);

  const fetchUnpaidRecords = async () => {
    try {
      setIsFetching(true);
      const response = await api.get('/service-records/unpaid');
      if (response.data.success) {
        setServiceRecords(response.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch records:", err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRecordChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const recordNum = e.target.value;
    setFormData((prev) => ({ ...prev, RecordNumber: recordNum }));

    const record = serviceRecords.find((r) => r.RecordNumber === parseInt(recordNum));
    setSelectedRecord(record || null);

    if (record) {
      setFormData((prev) => ({
        ...prev,
        AmountPaid: String(record.ServicePrice),
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post('/payments', {
        RecordNumber: parseInt(formData.RecordNumber),
        AmountPaid: parseFloat(formData.AmountPaid),
        PaymentDate: formData.PaymentDate,
      });

      if (response.data.success) {
        setSuccess("Payment recorded successfully!");
        setFormData({
          RecordNumber: "",
          AmountPaid: "",
          PaymentDate: new Date().toISOString().split("T")[0],
        });
        setSelectedRecord(null);
        fetchUnpaidRecords(); // Refresh the list
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to process payment");
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

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title flex items-center gap-3">
            <FaMoneyBillWave className="text-gray-900" />
            Record Payment
          </h1>
          <p className="text-gray-500 mt-1">Process payments for completed services</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="card p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Details</h2>

            {success && (
              <div className="mb-6 p-4 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-3">
                <FaCheck className="text-gray-900" />
                <span className="text-gray-800">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            {isFetching ? (
              <div className="text-center py-8">
                <FaSpinner className="text-3xl text-gray-400 animate-spin mx-auto" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label">
                    Select Service Record <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="RecordNumber"
                    value={formData.RecordNumber}
                    onChange={handleRecordChange}
                    required
                    className="input-field"
                  >
                    <option value="">Choose a service record...</option>
                    {serviceRecords.map((record) => (
                      <option key={record.RecordNumber} value={record.RecordNumber}>
                        #{record.RecordNumber} - {record.PlateNumber} - {record.ServiceName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">
                    Amount Paid (RWF) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="AmountPaid"
                    value={formData.AmountPaid}
                    onChange={handleChange}
                    placeholder="Enter amount"
                    min="0"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="PaymentDate"
                    value={formData.PaymentDate}
                    onChange={handleChange}
                    required
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.RecordNumber}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaPlus />
                      <span>Record Payment</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Selected Record Summary */}
          <div>
            {selectedRecord ? (
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                    <FaReceipt className="text-2xl text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Service Summary</h2>
                    <p className="text-sm text-gray-500">Record #{selectedRecord.RecordNumber}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Plate Number</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRecord.PlateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Service</span>
                    <span className="font-semibold text-gray-900">
                      {selectedRecord.ServiceName}
                    </span>
                  </div>
                  <div className="flex justify-between py-3">
                    <span className="text-gray-500">Service Price</span>
                    <span className="font-bold text-2xl text-gray-900">
                      {formatCurrency(selectedRecord.ServicePrice)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-8 flex flex-col items-center justify-center min-h-[300px] text-center">
                <FaReceipt className="text-5xl text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-400">No Record Selected</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Select a service record to view details
                </p>
              </div>
            )}

            {/* Pending Payments Count */}
            <div className="card p-6 mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Payments</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {serviceRecords.length}
                  </p>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="text-2xl text-gray-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}