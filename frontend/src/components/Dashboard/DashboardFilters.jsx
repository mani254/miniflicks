import React, { useState } from "react";
import LocationOptions from "../Locations/LocationOptions";

function DashboardFilters({ filters, setFilters }) {
	const [clearFlag, setClearFlag] = useState(false);

	const clearFilters = () => {
		setFilters({
			fromDate: "",
			toDate: "",
			location: "",
		});
		setClearFlag(!clearFlag);
	};

	function handleFiltersChange(event) {
		const { name, value } = event.target;
		setFilters((prevFilters) => ({
			...prevFilters,
			[name]: value,
		}));
	}

	function handleChange(event) {
		const { name, value } = event.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	}

	return (
		<div className="flex filters">
			<div className="mr-6">
				<LocationOptions value={filters.location} changeHandler={handleChange} all={true} />
			</div>
			<div className="mr-6">
				<div className="input-wrapper">
					<label htmlFor="fromDate">From:</label>
					<input type="date" id="fromDate" name="fromDate" value={filters.fromDate || ""} onChange={handleFiltersChange} />
				</div>
			</div>
			<div className="mr-6">
				<div className="input-wrapper">
					<label htmlFor="toDate">To:</label>
					<input type="date" id="toDate" name="toDate" value={filters.toDate || ""} onChange={handleFiltersChange} />
				</div>
			</div>
			<div className="mr-6">
				<button className="px-3 py-[2px] bg-gray-300 text-sm rounded-md" onClick={clearFilters}>
					Clear
				</button>
			</div>
		</div>
	);
}

export default DashboardFilters;
