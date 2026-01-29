// src/pages/Services.tsx

import { useState, useEffect } from "react";
import { FaTools, FaPlus, FaCheck, FaSpinner } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api/axios";

interface Service {
  _id?: string;
  ServiceCode: string;  // ✅ String, not number
  ServiceName: string;
  ServicePrice: number;
}

interface ServiceForm {
  ServiceName: string;
  ServicePrice: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [formData, setFormData] = useState<ServiceForm>({
    ServiceName: "",
    ServicePrice: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch services on mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setIsFetching(true);
      const response = await api.get('/services');
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch services:", err);
    } finally {
      setIsFetching(false);
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
      const response = await api.post('/services', {
        ServiceName: formData.ServiceName,
        ServicePrice: parseFloat(formData.ServicePrice),
      });

      if (response.data.success) {
        setSuccess("Service added successfully!");
        setFormData({ ServiceName: "", ServicePrice: "" });
        fetchServices(); // Refresh the list
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add service");
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
            <FaTools className="text-gray-900" />
            Services
          </h1>
          <p className="text-gray-500 mt-1">Manage repair services and pricing</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Service Form */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Add New Service</h2>

              {success && (
                <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg flex items-center gap-2">
                  <FaCheck className="text-gray-900" />
                  <span className="text-gray-800 text-sm">{success}</span>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Service Name</label>
                  <input
                    type="text"
                    name="ServiceName"
                    value={formData.ServiceName}
                    onChange={handleChange}
                    placeholder="Enter service name"
                    required
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="label">Price (RWF)</label>
                  <input
                    type="number"
                    name="ServicePrice"
                    value={formData.ServicePrice}
                    onChange={handleChange}
                    placeholder="Enter price"
                    min="0"
                    required
                    className="input-field"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaPlus />
                      <span>Add Service</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Services List */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Available Services ({services.length})
                </h2>
              </div>

              {isFetching ? (
                <div className="p-12 text-center">
                  <FaSpinner className="text-3xl text-gray-400 animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">Loading services...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="table-header">
                        <th className="px-6 py-4">Code</th>
                        <th className="px-6 py-4">Service Name</th>
                        <th className="px-6 py-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {services.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                            No services found
                          </td>
                        </tr>
                      ) : (
                        services.map((service) => (
                          <tr
                            key={service.ServiceCode}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm font-medium">
                                SRV-{String(service.ServiceCode).padStart(3, "0")}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-gray-900">
                              {service.ServiceName}
                            </td>
                            <td className="px-6 py-4 text-right text-gray-900 font-semibold">
                              {formatCurrency(service.ServicePrice)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}