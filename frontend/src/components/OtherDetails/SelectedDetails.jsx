import React, { useState, useEffect } from "react";
import { connect } from "react-redux";

function SelectedDetails({ customerBooking, addonData }) {
	const [selectedItems, setSelectedItems] = useState([]);

	useEffect(() => {
		const { addons, gifts, cakes } = customerBooking;

		// Combine and map addons and gifts
		const selectedAddons = addons
			.filter((addon) => addon.count > 0)
			.map((addon) => ({
				title: addon.name,
				count: addon.count,
				amount: addon.price,
			}));

		const selectedGifts = gifts
			.filter((gift) => gift.count > 0)
			.map((gift) => ({
				title: gift.name,
				count: gift.count,
				amount: gift.price,
			}));

		const selectedCakes = cakes
			.filter((cake) => cake.count > 0)
			.map((gift) => ({
				title: gift.name,
				count: gift.count,
				amount: gift.price,
			}));

		// Combine both lists
		setSelectedItems([...selectedAddons, ...selectedGifts, ...selectedCakes]);
	}, [customerBooking.addons, customerBooking.gifts, customerBooking.cakes]);

	// console.log(selectedItems);

	useEffect(() => {
		if (!addonData) return;

		// Find LED Name addon
		const ledData = addonData.find((item) => item.name === "LED Name");
		if (!ledData) return;

		let ledName = customerBooking.otherInfo.ledName;

		// Update selected items based on LED name length
		setSelectedItems((prev) =>
			prev.map((item) =>
				item.title === "LED Name"
					? {
							...item,
							amount: ledName.length > 8 ? ledData.price + (ledName.length - 8) * 30 : ledData.price,
					  }
					: item
			)
		);
	}, [customerBooking.otherInfo.ledName, customerBooking.addons, addonData]);

	if (selectedItems.length === 0) {
		return null;
	}

	return (
		<div className="bg-white p-5 rounded-lg">
			<h3 className="pb-2 border-b border-gray-400">Selected Items</h3>

			<div className="mt-5">
				{selectedItems.map((item, index) => (
					<div key={index} className="flex justify-between items-center mt-[6px]">
						<p className="w-2/3">{item.title}</p>
						<div className="w-1/2 flex items-center justify-between">
							<p className="">{item.count}</p>
							<p>{item.count * item.amount}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

const mapStateToProps = (state) => ({
	customerBooking: state.customerBooking,
	addonData: state.addons.addons,
});

export default connect(mapStateToProps, null)(SelectedDetails);
