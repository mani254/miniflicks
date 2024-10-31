import React, { useEffect, useState } from "react";
import { connect, useDispatch } from "react-redux";
import { setBookingAddons, setBookingGifts } from "../../redux/customerBooking/customerBookingActions";
import { getAllAddons } from "../../redux/addon/addonActions";
import { getAllGifts } from "../../redux/gift/giftActions";

function UserItems({ customerBooking, type, addonsData, giftsData }) {
	const [selected, setSelected] = useState([]);
	const dispatch = useDispatch();

	// Configuration for different item types
	const config = {
		addons: {
			fetchAction: getAllAddons,
			stateData: addonsData.addons,
			setBookingAction: setBookingAddons,
			selectedItems: customerBooking.addons,
		},
		gifts: {
			fetchAction: getAllGifts,
			stateData: giftsData.gifts,
			setBookingAction: setBookingGifts,
			selectedItems: customerBooking.gifts,
		},
	};

	const { fetchAction, stateData, setBookingAction, selectedItems } = config[type] || {};

	// Fetch items based on type
	useEffect(() => {
		if (fetchAction) {
			dispatch(fetchAction());
		}
	}, [fetchAction, dispatch]);

	// Sync with customerBooking
	useEffect(() => {
		if (selectedItems) {
			setSelected(selectedItems);
		}
	}, [selectedItems]);

	// Handle item selection
	function handleSelect(item) {
		const existed = selected.find((current) => item._id === current._id);
		const updatedSelected = existed ? selected.filter((current) => item._id !== current._id) : [...selected, { ...item, count: 1 }];

		setSelected(updatedSelected);
		dispatch(setBookingAction(updatedSelected));
	}

	// Handle count changes
	function handleCountChange(item, value) {
		const selectedItem = selected.find((current) => item._id === current._id);

		if (selectedItem) {
			if (value === -1 && selectedItem.count === 1) {
				handleSelect(item);
			} else {
				const updatedSelected = selected.map((current) => (current._id === item._id ? { ...current, count: current.count + value } : current));
				setSelected(updatedSelected);
				dispatch(setBookingAction(updatedSelected));
			}
		} else {
			handleSelect(item);
		}
	}

	return (
		<section className="option-section pt-6 mt-4 border-t border-white">
			<div className="w-full">
				{stateData?.length > 0 ? (
					<div className="flex w-full flex-wrap gap-5">
						{stateData.map((item) => {
							let isSelected = selected.find((current) => current._id === item._id);
							return (
								<div className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${isSelected ? "selected" : ""} min-w-[170px]`} key={item._id} onClick={() => handleSelect(item)}>
									<div className="p-2 rounded-lg bg-bright">
										<div className="w-full aspect-[16/12] relative overflow-hidden rounded-md">
											<img className="absolute object-cover w-full h-full" src={item.image} alt={item.name} />
										</div>
										<h5 className="text-center mt-2">{item.name}</h5>
										<div className="flex justify-between mt-1 items-center gap-3">
											<p className="font-medium text-primary text-md whitespace-nowrap">₹ {item.price}</p>
											<div onClick={(e) => e.stopPropagation()} className="flex w-full items-center justify-between gap-[2px]">
												<button className="min-w-5 h-5 bg-gradient-primary rounded-sm flex items-center justify-center text-lg text-bright font-medium" onClick={() => handleCountChange(item, -1)}>
													-
												</button>
												<div className="w-full h-5 flex items-center justify-center border border-gray-400 rounded-sm">{isSelected ? isSelected.count : 0}</div>
												<button className="min-w-5 h-5 bg-gradient-primary rounded-sm flex items-center justify-center text-lg text-bright font-medium" onClick={() => handleCountChange(item, 1)}>
													+
												</button>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="w-full flex items-center justify-center min-h-sm">
						<h3 className="text-gray-500 text-center">No Items Available</h3>
					</div>
				)}
			</div>
		</section>
	);
}

const mapStateToProps = (state) => ({
	customerBooking: state.customerBooking,
	addonsData: state.addons,
	giftsData: state.gifts,
});

export default connect(mapStateToProps)(UserItems);
