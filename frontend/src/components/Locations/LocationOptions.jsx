import React, { useRef, useEffect } from "react";
import { useLocations } from "../../hooks/useCatalog";

function LocationOptions({
	value,
	changeHandler,
	params = false,
	setParams,
	all = false,
	label = "Location",
	className = "",
	selectClassName = "",
}) {
	const { data: locations = [] } = useLocations();
	const initializedRef = useRef(false);

	// Determine current value: URL params take priority if provided, else prop value
	const currentValue = params ? params.get("location") || "" : value ?? "";

	// One-time auto-select of first location if all is false and no initial value is present
	useEffect(() => {
		if (initializedRef.current || locations.length === 0 || all || params) return;

		if (!currentValue && typeof changeHandler === "function") {
			initializedRef.current = true;
			changeHandler({ target: { name: "location", value: locations[0]._id } });
		}
	}, [locations, all, params, currentValue]);

	function handleLocationChange(event) {
		const selectedVal = event.target.value;

		if (params && typeof setParams === "function") {
			const newParams = new URLSearchParams(params);
			if (selectedVal) {
				newParams.set("location", selectedVal);
			} else {
				newParams.delete("location");
			}
			newParams.set("page", "1"); // Reset pagination on filter change
			setParams(newParams);
		}

		if (typeof changeHandler === "function") {
			changeHandler(event);
		}
	}

	const defaultSelectClass =
		"h-[34px] border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all cursor-pointer w-full";

	return (
		<div className={`${label ? "input-wrapper" : "flex items-center"} ${className}`}>
			{label && (
				<label htmlFor="location" className="text-xs font-semibold text-gray-700 block mb-1">
					{label}
				</label>
			)}
			<select
				id="location"
				name="location"
				value={currentValue}
				onChange={handleLocationChange}
				className={selectClassName || defaultSelectClass}
			>
				{(params || all) && <option value="">All Locations</option>}
				{locations.map((loc) => (
					<option key={loc._id} value={loc._id}>
						{loc.name}
					</option>
				))}
			</select>
		</div>
	);
}

export default LocationOptions;
