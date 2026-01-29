// src/pages/ServiceRecord.tsx

import { useState, useEffect } from "react";
import {
  FaClipboardList,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaTimes,
  FaCheck,
  FaFileInvoice,
  FaSpinner,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

interface Car {
  _id?: string;
  PlateNumber: string;
  type: string;
  Model: string;
}

interface Service {
  _id?: string;
  ServiceCode: string;
  ServiceName: string;
  ServicePrice: number;
}

interface ServiceRecordType {
  RecordNumber: number;
  PlateNumber: string;
  ServiceCode: string;
  ServiceDate: string;
  ServiceName?: string;
  ServicePrice?: number;
  CarModel?: string;
  PaymentStatus?: string;
}

export default function ServiceRecord() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<ServiceRecordType[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    RecordNumber: 0,
    PlateNumber: "",
    ServiceCode: "",
    ServiceDate: new Date().toISOString().split("T")[0],
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsFetching(true);
      setError("");
      
      const [recordsRes, carsRes, servicesRes] = await Promise.all([
        api.get('/service-records'),
        api.get('/cars'),
        api.get('/services'),
      ]);

      console.log('Records:', recordsRes.data);
      console.log('Cars:', carsRes.data);
      console.log('Services:', servicesRes.data);

      if (recordsRes.data.success) setRecords(recordsRes.data.data);
      if (carsRes.data.success) setCars(carsRes.data.data);
      if (servicesRes.data.success) setServices(servicesRes.data.data);
    } catch (err: any) {
      setError("Failed to load data: " + (err.response?.data?.message || err.message));
      console.error(err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setFormData({
      RecordNumber: 0,
      PlateNumber: "",
      ServiceCode: "",
      ServiceDate: new Date().toISOString().split("T")[0],
    });
    setIsEditing(false);
    setIsModalOpen(true);
    setError("");
  };

  const openEditModal = (record: ServiceRecordType) => {
    setFormData({
      RecordNumber: record.RecordNumber,
      PlateNumber: record.PlateNumber,
      ServiceCode: record.ServiceCode,
      ServiceDate: record.ServiceDate.split("T")[0],
    });
    setIsEditing(true);
    setIsModalOpen(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // ✅ Keep ServiceCode as string - don't use parseInt!
      const payload = {
        PlateNumber: formData.PlateNumber,
        ServiceCode: formData.ServiceCode,
        ServiceDate: formData.ServiceDate,
      };

      console.log('Sending payload:', payload);

      if (isEditing) {
        await api.put(`/service-records/${formData.RecordNumber}`, payload);
      } else {
        await api.post('/service-records', payload);
      }

      setIsModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      console.error('Submit error:', err.response?.data);
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (recordNumber: number) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await api.delete(`/service-records/${recordNumber}`);
      fetchAllData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.PlateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.ServiceName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-RW").format(amount) + " RWF";
  };

  if (isFetching) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="text-4xl text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading records...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <FaClipboardList className="text-gray-900" />
              Service Records
            </h1>
            <p className="text-gray-500 mt-1">Manage car service records</p>
          </div>
          <button onClick={openAddModal} className="btn-primary">
            <FaPlus />
            <span>New Record</span>
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            {error}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Cars</p>
            <p className="text-2xl font-bold text-blue-800">{cars.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Total Services</p>
            <p className="text-2xl font-bold text-green-800">{services.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600">Total Records</p>
            <p className="text-2xl font-bold text-purple-800">{records.length}</p>
          </div>
        </div>

        {/* Search & Table */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="relative max-w-md">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by plate or service..."
                className="input-field pl-12"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-6 py-4">Record #</th>
                  <th className="px-6 py-4">Plate Number</th>
                  <th className="px-6 py-4">Car Model</th>
                  <th className="px-6 py-4">Service</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No records found. {cars.length === 0 && "Please add a car first."}
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((record) => (
                    <tr
                      key={record.RecordNumber}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">
                          #{String(record.RecordNumber).padStart(4, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {record.PlateNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{record.CarModel || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm">
                          {record.ServiceName || record.ServiceCode}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(record.ServiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-gray-900">
                        {formatCurrency(record.ServicePrice || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.PaymentStatus === "Paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {record.PaymentStatus || "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/bill/${record.RecordNumber}`)}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="Generate Bill"
                          >
                            <FaFileInvoice />
                          </button>
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(record.RecordNumber)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Record" : "New Service Record"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="label">Select Car *</label>
                {cars.length === 0 ? (
                  <p className="text-red-500 text-sm">No cars available. Please add a car first.</p>
                ) : (
                  <select
                    name="PlateNumber"
                    value={formData.PlateNumber}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Choose a car...</option>
                    {cars.map((car) => (
                      <option key={car.PlateNumber} value={car.PlateNumber}>
                        {car.PlateNumber} - {car.Model}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="label">Select Service *</label>
                {services.length === 0 ? (
                  <p className="text-red-500 text-sm">No services available.</p>
                ) : (
                  <select
                    name="ServiceCode"
                    value={formData.ServiceCode}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="">Choose a service...</option>
                    {services.map((service) => (
                      <option key={service.ServiceCode} value={service.ServiceCode}>
                        {service.ServiceName} - {formatCurrency(service.ServicePrice)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="label">Service Date *</label>
                <input
                  type="date"
                  name="ServiceDate"
                  value={formData.ServiceDate}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading || cars.length === 0 || services.length === 0} 
                  className="flex-1 btn-primary"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaCheck />
                      <span>{isEditing ? "Update" : "Create"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}