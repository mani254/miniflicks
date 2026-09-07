import React from "react";
import { Plus, Trash2, Calendar, IndianRupee, Tag } from "lucide-react";
import { Button } from "../ui/button.jsx";
import { Badge } from "../ui/badge.jsx";

const AVAILABLE_ADDONS = [
  "4k Dolby Theater",
  "Decoration",
  "Cake",
  "Smoke Entry",
  "Rose Heart On Table",
  "Rose With Candle Path",
  "Led Name",
  "Led Number",
];

const PackageForm = ({ packages = [], setPackages }) => {
  const handleInputChange = (index, field, value) => {
    const newPackages = [...packages];
    newPackages[index][field] = value;
    setPackages(newPackages);
  };

  const addCustomPrice = (index) => {
    const newPackages = [...packages];
    if (!Array.isArray(newPackages[index].customPrice)) {
      newPackages[index].customPrice = [];
    }
    newPackages[index].customPrice.push({ date: "", price: 0 });
    setPackages(newPackages);
  };

  const deleteCustomPrice = (packageIndex, customPriceIndex) => {
    const newPackages = [...packages];
    newPackages[packageIndex].customPrice.splice(customPriceIndex, 1);
    setPackages(newPackages);
  };

  const handleAddonChange = (index, addon) => {
    const newPackages = [...packages];
    const currentAddons = newPackages[index].addons || [];
    if (currentAddons.includes(addon)) {
      newPackages[index].addons = currentAddons.filter((a) => a !== addon);
    } else {
      newPackages[index].addons = [...currentAddons, addon];
    }
    setPackages(newPackages);
  };

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        name: "",
        price: 0,
        customPrice: [],
        addons: [],
      },
    ]);
  };

  const deletePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-gray-900">Screen Packages & Pricing</h4>
          <p className="text-xs text-gray-500">Configure base tier pricing, included features, and weekend rates.</p>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addPackage} className="gap-1 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add Package
        </Button>
      </div>

      {packages.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-lg p-6 text-center text-xs text-gray-500">
          No packages added yet. Click "Add Package" above to create at least one package.
        </div>
      ) : (
        packages.map((pkg, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50/40 space-y-4 relative"
          >
            {/* Header: Package Name, Base Price, Delete */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-medium text-gray-700">Package Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Silver Package, Diamond Package"
                    value={pkg.name}
                    onChange={(e) => handleInputChange(index, "name", e.target.value)}
                    required
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="w-full sm:w-36 space-y-1">
                <label className="text-xs font-medium text-gray-700">Base Price (₹)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="number"
                    placeholder="Price"
                    value={pkg.price}
                    onChange={(e) => handleInputChange(index, "price", Number(e.target.value))}
                    required
                    min="0"
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-gray-200 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-600 self-end sm:self-center mt-2 sm:mt-5"
                onClick={() => deletePackage(index)}
                title="Delete package"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Addons Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 block">
                Included Features & Add-ons
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_ADDONS.map((addon) => {
                  const isChecked = (pkg.addons || []).includes(addon);
                  return (
                    <label
                      key={addon}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "border-blue-500 bg-blue-50/60 text-blue-900 font-medium"
                          : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAddonChange(index, addon)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">{addon}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Custom Prices */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">
                  Custom Date Rates (Overrides base price on selected date)
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => addCustomPrice(index)}
                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1"
                >
                  <Plus className="w-3 h-3" /> Add Date Rate
                </Button>
              </div>

              {(pkg.customPrice || []).map((cp, cpIndex) => (
                <div key={cpIndex} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="date"
                      value={cp.date ? new Date(cp.date).toISOString().split("T")[0] : ""}
                      onChange={(e) => {
                        const updated = [...pkg.customPrice];
                        updated[cpIndex].date = e.target.value;
                        handleInputChange(index, "customPrice", updated);
                      }}
                      required
                      className="w-full pl-8 pr-3 py-1 text-xs rounded border border-gray-200 bg-white text-gray-800"
                    />
                  </div>

                  <div className="relative w-32">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                      <IndianRupee className="w-3 h-3" />
                    </div>
                    <input
                      type="number"
                      placeholder="Special Rate"
                      value={cp.price}
                      onChange={(e) => {
                        const updated = [...pkg.customPrice];
                        updated[cpIndex].price = Number(e.target.value);
                        handleInputChange(index, "customPrice", updated);
                      }}
                      required
                      min="0"
                      className="w-full pl-6 pr-2 py-1 text-xs rounded border border-gray-200 bg-white"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-600"
                    onClick={() => deleteCustomPrice(index, cpIndex)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PackageForm;
