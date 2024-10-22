import React from "react";
import SearchComponent from "../SearchComponent/SearchComponent";
import LocationOptions from "../Locations/LocationOptions";

function GiftsFilter({ params, setParams, auth }) {
	const clearFilters = () => {
		const newParams = new URLSearchParams();
		setParams(newParams);
	};

	return (
		<div className="flex filters">
			<div className="mr-6">
				<SearchComponent debounce={2000} params={params} setParams={setParams} />
			</div>
			{auth.admin?.superAdmin && (
				<div className="mr-6">
					<LocationOptions params={params} setParams={setParams} />
				</div>
			)}
			<div className="mr-6">
				<button className="px-3 py-[2px] bg-gray-300 text-sm rounded-md" onClick={clearFilters}>
					Clear
				</button>
			</div>
		</div>
	);
}

export default GiftsFilter;
