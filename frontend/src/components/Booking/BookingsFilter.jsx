import React from "react";
import LocationOptions from "../Locations/LocationOptions";
import CityOptions from "../Cities/CityOptions";
import SearchComponent from "../SearchComponent/SearchComponent";
function BookingsFilter({ params, setParams }) {
	return (
		<div className="flex filters">
			<div className="mr-6">
				<SearchComponent debounce={2000} params={params} setParams={setParams} />
			</div>
			<div className="mr-6">
				<LocationOptions params={params} setParams={setParams} />
			</div>
			<div>
				<CityOptions params={params} setParams={setParams} />
			</div>
		</div>
	);
}

export default BookingsFilter;
