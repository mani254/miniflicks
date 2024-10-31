import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

function SelectedDetails({ customerBooking }) {
	const [selected, setSelected] = useState([]);

	useEffect(() => {
		if (customerBooking.addons.length === 0) return;

		// Map and set the selected addons directly to avoid duplicates
		const selectedAddons = customerBooking.addons.map((addon) => ({
			title: addon.name,
			count: addon.count,
			amount: addon.price,
		}));
		setSelected(selectedAddons);
	}, [customerBooking.addons]);

	if (selected.length === 0) {
		return null;
	}

	return (
		<div className="bg-white p-5 rounded-lg">
			<h3 className="pb-2 border-b border-gray-400">Selected Items</h3>

			<div className="mt-5">
				{selected.map((single, index) => (
					<div key={index} className="flex justify-between items-center mt-[6px]">
						<p className="w-1/2">{single.title}</p>
						<p>{single.count}</p>
						<p>{single.count * single.amount}</p>
					</div>
				))}
			</div>
		</div>
	);
}

const mapStateToProps = (state) => ({
	customerBooking: state.customerBooking,
});

export default connect(mapStateToProps, null)(SelectedDetails);
