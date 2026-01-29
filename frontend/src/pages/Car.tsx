// src/pages/Car.tsx

import { useState } from "react";
import { FaCar, FaPlus, FaCheck, FaPhone, FaUser, FaCalendar } from "react-icons/fa";
import Layout from "../components/Layout";
import api from "../api/axios";

interface CarForm {
  PlateNumber: string;
  type: string;
  Model: string;
  ManufacturingYear: string;
  DriverPhone: string;
  MechanicName: string;
}

// Car Types
const carTypes = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Pickup",
  "Truck",
  "Van",
  "Minivan",
  "Coupe",
  "Convertible",
  "Wagon",
  "Crossover",
  "Sports Car",
  "Motorcycle",
  "Bus",
  "Electric",
  "Hybrid",
];

// Popular Car Brands and Models
const carBrands: { [key: string]: string[] } = {
  Toyota: [
    "Corolla",
    "Camry",
    "RAV4",
    "Hilux",
    "Land Cruiser",
    "Prado",
    "Yaris",
    "Avalon",
    "Fortuner",
    "Hiace",
  ],
  Honda: [
    "Civic",
    "Accord",
    "CR-V",
    "HR-V",
    "Fit",
    "Pilot",
    "Odyssey",
    "City",
  ],
  Nissan: [
    "Sentra",
    "Altima",
    "X-Trail",
    "Patrol",
    "Navara",
    "Note",
    "Sunny",
    "Pathfinder",
  ],
  Mazda: [
    "Mazda3",
    "Mazda6",
    "CX-5",
    "CX-3",
    "CX-9",
    "BT-50",
    "Demio",
  ],
  Hyundai: [
    "Elantra",
    "Sonata",
    "Tucson",
    "Santa Fe",
    "Accent",
    "Creta",
    "i10",
    "i20",
  ],
  Kia: [
    "Rio",
    "Cerato",
    "Sportage",
    "Sorento",
    "Picanto",
    "Seltos",
    "Carnival",
  ],
  Mercedes: [
    "C-Class",
    "E-Class",
    "S-Class",
    "GLE",
    "GLC",
    "A-Class",
    "G-Wagon",
  ],
  BMW: [
    "3 Series",
    "5 Series",
    "7 Series",
    "X1",
    "X3",
    "X5",
    "X7",
  ],
  Volkswagen: [
    "Golf",
    "Passat",
    "Tiguan",
    "Polo",
    "Jetta",
    "Touareg",
    "T-Roc",
  ],
  Ford: [
    "Focus",
    "Fusion",
    "Escape",
    "Explorer",
    "Ranger",
    "F-150",
    "Mustang",
  ],
  Suzuki: [
    "Swift",
    "Vitara",
    "Jimny",
    "Alto",
    "Baleno",
    "Ertiga",
    "Ciaz",
  ],
  Mitsubishi: [
    "Lancer",
    "Outlander",
    "Pajero",
    "L200",
    "ASX",
    "Eclipse Cross",
  ],
  Isuzu: [
    "D-Max",
    "MU-X",
    "Trooper",
    "NPR",
    "NQR",
  ],
  Subaru: [
    "Impreza",
    "Outback",
    "Forester",
    "XV",
    "Legacy",
    "WRX",
  ],
  Lexus: [
    "ES",
    "RX",
    "LX",
    "NX",
    "IS",
    "GX",
  ],
  Audi: [
    "A3",
    "A4",
    "A6",
    "Q3",
    "Q5",
    "Q7",
    "Q8",
  ],
  Peugeot: [
    "208",
    "308",
    "508",
    "2008",
    "3008",
    "5008",
  ],
  Renault: [
    "Clio",
    "Megane",
    "Duster",
    "Kadjar",
    "Koleos",
    "Kwid",
  ],
  Chevrolet: [
    "Cruze",
    "Malibu",
    "Equinox",
    "Traverse",
    "Silverado",
    "Spark",
  ],
  Jeep: [
    "Wrangler",
    "Cherokee",
    "Grand Cherokee",
    "Compass",
    "Renegade",
  ],
  "Land Rover": [
    "Range Rover",
    "Discovery",
    "Defender",
    "Evoque",
    "Velar",
  ],
  Volvo: [
    "S60",
    "S90",
    "XC40",
    "XC60",
    "XC90",
    "V60",
  ],
  Other: [
    "Custom Model",
  ],
};

// Mechanics list (you can customize this)
const mechanics = [
  "Jean Baptiste",
  "Emmanuel Habimana",
  "Patrick Mugabo",
  "Claude Niyonzima",
  "Eric Ndayisaba",
  "Other",
];

export default function Car() {
  const [formData, setFormData] = useState<CarForm>({
    PlateNumber: "",
    type: "",
    Model: "",
    ManufacturingYear: "",
    DriverPhone: "",
    MechanicName: "",
  });
  const [selectedBrand, setSelectedBrand] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [customMechanic, setCustomMechanic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Generate years from 1990 to current year
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    setFormData((prev) => ({ ...prev, Model: "" }));
    setCustomModel("");
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const model = e.target.value;
    if (model === "Custom Model") {
      setFormData((prev) => ({ ...prev, Model: "" }));
    } else {
      setFormData((prev) => ({ ...prev, Model: `${selectedBrand} ${model}` }));
    }
  };

  const handleMechanicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mechanic = e.target.value;
    if (mechanic === "Other") {
      setFormData((prev) => ({ ...prev, MechanicName: "" }));
    } else {
      setFormData((prev) => ({ ...prev, MechanicName: mechanic }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    // Use custom values if "Other" was selected
    const finalData = {
      ...formData,
      Model: formData.Model || customModel,
      MechanicName: formData.MechanicName || customMechanic,
      ManufacturingYear: parseInt(formData.ManufacturingYear),
    };

    try {
      const response = await api.post("/cars", finalData);

      if (response.data.success) {
        setSuccess("Car registered successfully!");
        setFormData({
          PlateNumber: "",
          type: "",
          Model: "",
          ManufacturingYear: "",
          DriverPhone: "",
          MechanicName: "",
        });
        setSelectedBrand("");
        setCustomModel("");
        setCustomMechanic("");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to register car");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="page-title flex items-center gap-3">
            <FaCar className="text-gray-900" />
            Register Car
          </h1>
          <p className="text-gray-500 mt-1">Add a new car to the system</p>
        </div>

        {/* Form Card */}
        <div className="max-w-2xl">
          <div className="card p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
                <FaCheck className="text-green-600" />
                <span className="text-green-800">{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Plate Number */}
              <div>
                <label className="label">
                  Plate Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="PlateNumber"
                  value={formData.PlateNumber}
                  onChange={handleChange}
                  placeholder="e.g., RAD 123A"
                  required
                  className="input-field uppercase"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rwanda format: RAA 001A to RZZ 999Z
                </p>
              </div>

              {/* Car Type */}
              <div>
                <label className="label">
                  Car Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select car type...</option>
                  {carTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Brand Selection */}
              <div>
                <label className="label">
                  Car Brand <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  required
                  className="input-field"
                >
                  <option value="">Select brand...</option>
                  {Object.keys(carBrands).map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Model Selection (depends on brand) */}
              {selectedBrand && (
                <div>
                  <label className="label">
                    Car Model <span className="text-red-500">*</span>
                  </label>
                  <select
                    onChange={handleModelChange}
                    required
                    className="input-field"
                  >
                    <option value="">Select model...</option>
                    {carBrands[selectedBrand]?.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Custom Model Input (if "Other" brand or "Custom Model" selected) */}
              {(selectedBrand === "Other" || formData.Model === "") && selectedBrand && (
                <div>
                  <label className="label">
                    Enter Custom Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="e.g., BMW X5"
                    required={!formData.Model}
                    className="input-field"
                  />
                </div>
              )}

              {/* Display Selected Model */}
              {formData.Model && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected Model:</strong> {formData.Model}
                  </p>
                </div>
              )}

              {/* Manufacturing Year */}
              <div>
                <label className="label">
                  Manufacturing Year <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    name="ManufacturingYear"
                    value={formData.ManufacturingYear}
                    onChange={handleChange}
                    required
                    className="input-field pl-12"
                  >
                    <option value="">Select year...</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Driver Phone */}
              <div>
                <label className="label">
                  Driver Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    name="DriverPhone"
                    value={formData.DriverPhone}
                    onChange={handleChange}
                    placeholder="e.g., 0788123456"
                    required
                    className="input-field pl-12"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Rwanda format: 078XXXXXXX or 072XXXXXXX
                </p>
              </div>

              {/* Mechanic Name */}
              <div>
                <label className="label">
                  Assigned Mechanic <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    onChange={handleMechanicChange}
                    required
                    className="input-field pl-12"
                  >
                    <option value="">Select mechanic...</option>
                    {mechanics.map((mechanic) => (
                      <option key={mechanic} value={mechanic}>
                        {mechanic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Custom Mechanic Input */}
              {formData.MechanicName === "" && (
                <div>
                  <label className="label">
                    Enter Mechanic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customMechanic}
                    onChange={(e) => setCustomMechanic(e.target.value)}
                    placeholder="e.g., John Doe"
                    required={!formData.MechanicName}
                    className="input-field"
                  />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaPlus />
                    <span>Register Car</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info Card */}
          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Available Car Types</h3>
            <div className="flex flex-wrap gap-2">
              {carTypes.map((type) => (
                <span
                  key={type}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {type}
                </span>
              ))}
            </div>
          </div>

          {/* Brands Info Card */}
          <div className="card p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Supported Brands</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(carBrands).filter(b => b !== "Other").map((brand) => (
                <span
                  key={brand}
                  className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}