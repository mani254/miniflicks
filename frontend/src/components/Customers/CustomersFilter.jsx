import React from "react";
import { Search, X, RotateCcw, Building2 } from "lucide-react";
import { Button } from "../ui/button.jsx";
import LocationOptions from "../Locations/LocationOptions";

function CustomersFilter({ params, setParams, isSuperAdmin }) {
  const searchTerm = params.get("search") || "";

  const handleSearchChange = (e) => {
    const value = e.target.value;
    const newParams = new URLSearchParams(params);
    if (value) {
      newParams.set("search", value);
    } else {
      newParams.delete("search");
    }
    newParams.set("page", "1");
    setParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams();
    setParams(newParams);
  };

  const hasActiveFilters = Boolean(params.get("search") || params.get("location"));

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search Input */}
      <div className="relative min-w-[240px] sm:min-w-[280px]">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search name, phone, or email..."
          className="w-full pl-9 pr-8 h-[34px] text-xs rounded-lg border border-gray-300 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              const newParams = new URLSearchParams(params);
              newParams.delete("search");
              setParams(newParams);
            }}
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* SuperAdmin Branch Location Filter */}
      {isSuperAdmin && (
        <div className="min-w-[170px] flex items-center">
          <LocationOptions
            params={params}
            setParams={setParams}
            all={true}
            label=""
            selectClassName="h-[34px] border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full"
          />
        </div>
      )}

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="h-[34px] px-3 flex items-center justify-center text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 bg-white shadow-sm"
          title="Reset all filters"
        >
          Reset
        </button>
      )}
    </div>
  );
}

export default CustomersFilter;
