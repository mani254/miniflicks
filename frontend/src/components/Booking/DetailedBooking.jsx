import React from "react";

const DetailedBooking = ({ bookingData }) => {
	let packagePrice = () => {
		return bookingData.package?.price || 0;
	};

	const occasionPrice = () => {
		return bookingData.occasion?.price || 0;
	};

	const addonsPrice = () => {
		if (bookingData.addons.length === 0) return 0;
		return bookingData.addons.reduce((sum, addon) => sum + addon.price * addon.count, 0);
	};

	const giftsPrice = () => {
		if (bookingData.gifts.length === 0) return 0;
		return bookingData.gifts.reduce((sum, gift) => sum + gift.price * gift.count, 0);
	};

	const cakesPrice = () => {
		if (bookingData.cakes.length === 0) return 0;
		return bookingData.cakes.reduce((sum, cake) => sum + cake.price, 0);
	};

	const peoplePrice = () => {
		if (bookingData?.numberOfPeople > bookingData?.screen?.minPeople) {
			const extraPeople = bookingData.numberOfPeople - bookingData.screen.minPeople;
			return bookingData.screen.extraPersonPrice * extraPeople;
		}
		return 0;
	};

	if (!bookingData) return <h2 className="text-center mt-5">Invalid booking Id</h2>;

	return (
		<div className="bg-gray-100 p-8 invoice w-[800px] mx-auto">
			<div className="bg-white shadow-md rounded-lg p-6">
				<h2 className="text-center mb-6">Invoice</h2>

				<div className="grid grid-cols-2 gap-2 mb-3">
					<div>
						<h5 className="">Location</h5>
						<p className="text-gray-600">{bookingData.location.name}</p>
					</div>
					<div>
						<h5 className="">Screen</h5>
						<p className="text-gray-600">{bookingData.screen.name}</p>
					</div>
					<div>
						<h5 className="">Date</h5>
						<p className="text-gray-600">{new Date(bookingData.date).toLocaleDateString()}</p>
					</div>
					<div>
						<h5 className="">Slot</h5>
						<p className="text-gray-600">
							{bookingData.slot.from} - {bookingData.slot.to}
						</p>
					</div>
				</div>

				<div className="mb-4">
					<h4 style={{ fontSize: "18px" }} className="mb-2">
						Package Details
					</h4>
					<table className="w-full text-left border border-gray-200">
						<tbody>
							<tr className="border-b border-gray-200">
								<td className="p-[2px]  text-gray-700">Package Name</td>
								<td className="p-[2px] text-gray-600">{bookingData.package.name}</td>
								<td className="p-[2px]  text-gray-700">Price</td>
								<td className="p-[2px] text-gray-600">₹{bookingData.package.price}</td>
							</tr>
						</tbody>
					</table>
				</div>

				{bookingData?.occasion?.name && (
					<div className="mb-4">
						<h4 style={{ fontSize: "18px" }} className="mb-2">
							Occasion Details
						</h4>
						<table className="w-full text-left border border-gray-200">
							<tbody>
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Occasion</td>
									<td className="p-[2px] text-gray-600">{bookingData.occasion.name}</td>
									<td className="p-[2px]  text-gray-700">Price</td>
									<td className="p-[2px] text-gray-600">₹{bookingData.occasion.price}</td>
								</tr>
							</tbody>
						</table>
					</div>
				)}

				{bookingData?.addons.length > 0 && (
					<div className="mb-4">
						<h4 style={{ fontSize: "18px" }} className="mb-2">
							Add-ons
						</h4>
						<table className="w-full text-left border border-gray-200">
							<thead>
								<tr className="bg-gray-100">
									<th className="p-[2px]  text-gray-700">Name</th>
									<th className="p-[2px]  text-gray-700">Count</th>
									<th className="p-[2px]  text-gray-700">Price</th>
									<th className="p-[2px]  text-gray-700">Total Price</th>
								</tr>
							</thead>
							<tbody>
								{bookingData.addons.map((addon, index) => (
									<tr key={index} className="border-b border-gray-200">
										<td className="p-[2px] text-gray-600">{addon.name}</td>
										<td className="p-[2px] text-gray-600">{addon.count}</td>
										<td className="p-[2px] text-gray-600">₹{addon.price}</td>
										<td className="p-[2px] text-gray-600">₹{addon.price * addon.count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{bookingData?.gifts.length > 0 && (
					<div className="mb-4">
						<h4 style={{ fontSize: "18px" }} className="mb-2">
							Gifts
						</h4>
						<table className="w-full text-left border border-gray-200">
							<thead>
								<tr className="bg-gray-100">
									<th className="p-[2px]  text-gray-700">Name</th>
									<th className="p-[2px]  text-gray-700">Count</th>
									<th className="p-[2px]  text-gray-700">Price</th>
									<th className="p-[2px]  text-gray-700">Total Price</th>
								</tr>
							</thead>
							<tbody>
								{bookingData.gifts.map((gift, index) => (
									<tr key={index} className="border-b border-gray-200">
										<td className="p-3 text-gray-600">{gift.name}</td>
										<td className="p-3 text-gray-600">{gift.count}</td>
										<td className="p-3 text-gray-600">₹{gift.price}</td>
										<td className="p-3 text-gray-600">₹{gift.price * gift.count}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				{bookingData?.cakes.length > 0 && (
					<div className="mb-4">
						<h4 style={{ fontSize: "18px" }} className="mb-2">
							Cakes
						</h4>
						<table className="w-full text-left border border-gray-200">
							<thead>
								<tr className="bg-gray-100">
									<th className="p-[2px]  text-gray-700">Name</th>
									<th className="p-[2px]  text-gray-700">Count</th>
									<th className="p-[2px]  text-gray-700">Price</th>
								</tr>
							</thead>
							<tbody>
								{bookingData.cakes.map((cake, index) => (
									<tr key={index} className="border-b border-gray-200">
										<td className="p-[2px] text-gray-600">{cake.name}</td>
										<td className="p-[2px] text-gray-600">{1}</td>
										<td className="p-[2px] text-gray-600">₹{cake.price}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}

				<div className="mb-6">
					<h4 style={{ fontSize: "18px" }} className="mb-2">
						Summary
					</h4>
					<table className="w-full text-left border border-gray-200">
						<tbody>
							{packagePrice() > 0 && (
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Package</td>
									<td className="p-[2px] text-gray-600">₹{packagePrice()}</td>
								</tr>
							)}

							{peoplePrice() > 0 && (
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Extra Persons Price</td>
									<td className="p-[2px] text-gray-600">₹{peoplePrice()}</td>
								</tr>
							)}

							{occasionPrice() > 0 && (
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Occasion</td>
									<td className="p-[2px] text-gray-600">₹{occasionPrice()}</td>
								</tr>
							)}

							{addonsPrice() > 0 && (
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Addons</td>
									<td className="p-[2px] text-gray-600">₹{addonsPrice()}</td>
								</tr>
							)}

							{giftsPrice() > 0 && (
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Gifts</td>
									<td className="p-[2px] text-gray-600">₹{giftsPrice()}</td>
								</tr>
							)}

							{cakesPrice() > 0 && (
								<tr className="border-b border-gray-200">
									<td className="p-[2px]  text-gray-700">Cakes</td>
									<td className="p-[2px] text-gray-600">₹{cakesPrice()}</td>
								</tr>
							)}
						</tbody>
					</table>
					<div className="flex w-full justify-around mt-4">
						<div className=" flex gap-2 border-b border-gray-200">
							<div className="p-[2px] font-medium  text-gray-700">Advance:</div>
							<div className="p-[2px] text-gray-600">₹999</div>
						</div>
						<div className=" flex gap-2 border-b border-gray-200">
							<div className="p-[2px] font-medium  text-gray-700">Total:</div>
							<div className="p-[2px] text-gray-600">₹{bookingData.totalPrice}</div>
						</div>
						<div className="flex gap-2 border-b border-gray-200">
							<div className="p-[2px] font-medium  text-gray-700">Remaining:</div>
							<div className="p-[2px] text-gray-600">₹{bookingData.remainingAmount}</div>
						</div>
					</div>
				</div>

				<div className="mb-6">
					<h4 style={{ fontSize: "18px" }} className="mb-2">
						Other Details
					</h4>
					<div className="flex flex-wrap justify-around"></div>
					{bookingData?.nameOnCake && (
						<div className="flex gap-2 w-auto">
							<div className="font-medium">Name On Cake:</div>
							<div>{bookingData.nameOnCake}</div>
						</div>
					)}

					{bookingData?.ledInfo && (
						<div className="flex gap-2 w-auto">
							<div className="font-medium">Led Info:</div>
							<div>{bookingData.ledInfo}</div>
						</div>
					)}

					{bookingData?.occasion?.celebrantName && (
						<div className="flex gap-2 w-auto">
							<div className="font-medium">Celebrant Name:</div>
							<div>{bookingData.occasion.celebrantName}</div>
						</div>
					)}

					{bookingData?.numberOfPeople && (
						<div className="flex gap-2 w-auto">
							<div className="font-medium">Number Of People:</div>
							<div>{bookingData.numberOfPeople}</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default DetailedBooking;
