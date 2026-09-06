import React, { useMemo } from "react";
import { useBookingStore } from "../../store/bookingStore";

function SelectedDetails() {
	const { addons = [], gifts = [], cakes = [], otherInfo } = useBookingStore();

	const selectedItems = useMemo(() => {
		const items = [];

		addons
			.filter((addon) => addon.count > 0)
			.forEach((addon) => {
				let amount = addon.price || 0;
				if (addon.name === "LED Name" && otherInfo?.ledName?.length > 8) {
					amount += (otherInfo.ledName.length - 8) * 30;
				}
				items.push({
					title: addon.name,
					count: addon.count,
					amount,
				});
			});

		gifts
			.filter((gift) => gift.count > 0)
			.forEach((gift) => {
				items.push({
					title: gift.name,
					count: gift.count,
					amount: gift.price || 0,
				});
			});

		cakes
			.filter((cake) => (cake.count > 0 || cake.free))
			.forEach((cake) => {
				let amount = cake.price || 0;
				if (cake.free) {
					amount = cake.special ? (cake.specialPrice || 0) : 0;
				}
				items.push({
					title: cake.name,
					count: cake.count || 1,
					amount,
				});
			});

		return items;
	}, [addons, gifts, cakes, otherInfo]);

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

export default SelectedDetails;
