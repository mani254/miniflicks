import React, { useEffect, useState, useRef, useMemo } from "react";
import { useCities } from "../../hooks/useCatalog";

function CityOptions({ value, changeHandler, params = false, setParams, hideLabel = false }) {
  const { data } = useCities();
  const cities = useMemo(() => data?.cities || [], [data?.cities]);
  const [cityValue, setCityValue] = useState("");
  const initializedRef = useRef(false);

  useEffect(() => {
    if (params && params.get("city")) {
      setCityValue(params.get("city"));
    } else if (params) {
      setCityValue("");
    }
  }, [params]);

  useEffect(() => {
    if (value !== undefined && value !== null) {
      setCityValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (cities.length === 0 || params || initializedRef.current) return;

    if (value) {
      setCityValue(value);
      initializedRef.current = true;
    } else if (cities[0]?._id && changeHandler) {
      initializedRef.current = true;
      setCityValue(cities[0]._id);
      changeHandler({ target: { name: "cityId", value: cities[0]._id } });
    }
  }, [cities, value, params]);

  function handleCityChange(event) {
    const { value: selectedVal } = event.target;
    setCityValue(selectedVal);

    if (params) {
      const newParams = new URLSearchParams(params);
      selectedVal ? newParams.set("city", selectedVal) : newParams.delete("city");
      setParams(newParams);
    } else if (changeHandler) {
      changeHandler(event);
    }
  }

  const selectElement = (
    <select
      id="cityId"
      name="cityId"
      value={cityValue}
      onChange={handleCityChange}
      required
      className={
        hideLabel
          ? "bg-transparent text-sm font-medium text-gray-800 outline-none cursor-pointer py-1 px-1 border-none focus:ring-0"
          : "w-full px-3 py-2 text-sm rounded-md border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
      }
    >
      {params && <option value="">All Cities</option>}
      {cities.length === 0 && (
        <option value="" disabled>
          No cities available
        </option>
      )}
      {cities.map((c) => (
        <option key={c._id} value={c._id}>
          {c.name}
        </option>
      ))}
    </select>
  );

  if (hideLabel) {
    return selectElement;
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor="cityId" className="text-sm font-medium text-gray-700">
        City <span className="text-red-500">*</span>
      </label>
      {selectElement}
    </div>
  );
}

export default CityOptions;
