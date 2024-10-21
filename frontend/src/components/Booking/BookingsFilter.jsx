import React, { useState } from "react";
import LocationOptions from "../Locations/LocationOptions";
import SearchComponent from "../SearchComponent/SearchComponent";

import { connect } from "react-redux";

function BookingsFilter({ params, setParams, auth }) {
	const [clearFlag, setClearFlag] = useState(false);

	const clearFilters = () => {
		const newParams = new URLSearchParams();
		setParams(newParams);
		setClearFlag(!clearFlag);
	};

	function handleFiltersChange(event) {
		const { name, value } = event.target;
		const newParams = new URLSearchParams(params);

		if (value) {
			newParams.set(name, value);
		} else {
			newParams.delete(name);
		}

		setParams(newParams);
	}

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
				<div className="input-wrapper">
					<label htmlFor="fromDate">From:</label>
					<input type="date" id="fromDate" name="fromDate" value={params?.get("fromDate") || ""} onChange={handleFiltersChange} />
				</div>
			</div>
			<div className="mr-6">
				<div className="input-wrapper">
					<label htmlFor="toDate">To:</label>
					<input type="date" id="toDate" name="toDate" value={params?.get("toDate") || ""} onChange={handleFiltersChange} />
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

const mapStateToProps = (state) => {
	return {
		auth: state.auth,
	};
};

export default connect(mapStateToProps, null)(BookingsFilter);
