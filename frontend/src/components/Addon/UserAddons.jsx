import React, { useEffect, useState } from "react";
import { getAllAddons } from "../../redux/addon/addonActions";
import { connect, useDispatch } from "react-redux";
import { setBookingAddons } from "../../redux/customerBooking/customerBookingActions";
import { showModal } from "../../redux/modal/modalActions";

function UserAddons({ addonsData, getAllAddons, customerBooking }) {
	const [selected, setSelected] = useState([]);
	const [ledInfo, setLedInfo] = useState("");
	const dispatch = useDispatch();

	useEffect(() => {
		(async () => {
			try {
				await getAllAddons();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	useEffect(() => {
		if (!customerBooking.addons) return;
		setSelected(customerBooking.addons);
	}, [customerBooking.addons]);

	function handleSelect(addon) {
		const existed = selected.find((current) => addon._id === current._id);
		if (existed) {
			const updatedSelected = selected.filter((current) => addon._id !== current._id);
			setSelected(updatedSelected);
			dispatch(setBookingAddons(updatedSelected));
		} else {
			const newAddon = { ...addon, count: 1 };
			const updatedSelected = [...selected, newAddon];
			setSelected(updatedSelected);
			dispatch(setBookingAddons(updatedSelected));
		}
	}

	function handleCountChange(addon, value) {
		const selectedItem = selected.find((current) => addon._id === current._id);

		if (selectedItem) {
			if (value == -1 && selectedItem.count === 0) return;
			if (value == -1 && selectedItem.count === 1) {
				const updatedSelected = selected.filter((current) => addon._id !== current._id);
				setSelected(updatedSelected);
				dispatch(setBookingAddons(updatedSelected));
			} else {
				const updatedSelected = selected.map((current) => (current._id === addon._id ? { ...current, count: current.count + value } : current));
				setSelected(updatedSelected);
				dispatch(setBookingAddons(updatedSelected));
			}
		} else {
			console.log("hello thre");
			handleSelect(addon);
		}
	}

	return (
		<section className="option-section pt-6 mt-4 border-t border-white">
			<div className="w-full">
				{addonsData.addons.length > 0 ? (
					<div className="flex w-full flex-wrap gap-5">
						{addonsData.addons.map((addon, index) => {
							let isSelected = selected.find((current) => current._id === addon._id);
							return (
								<div className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${isSelected ? "selected" : ""} min-w-[170px]`} key={index} onClick={() => handleSelect(addon)}>
									<div className="p-2 rounded-lg bg-bright">
										<div className="w-full aspect-[16/12] relative overflow-hidden rounded-md">
											<img className="absolute object-cover w-full h-full" src={addon.image} alt={addon.name} />
										</div>
										<h5 className="text-center mt-2">{addon.name}</h5>
										<div className="flex justify-between mt-1 items-center gap-3">
											<p className="font-medium text-primary text-md whitespace-nowrap">₹ {addon.price}</p>

											<div onClick={(e) => e.stopPropagation()} className="flex w-full items-center justify-between gap-[2px]">
												<button className="min-w-5 h-5 bg-gradient-primary rounded-sm flex items-center justify-center text-lg text-bright font-medium" onClick={() => handleCountChange(addon, -1)}>
													{" "}
													-
												</button>
												<div className="w-full h-5 flex items-center justify-center border border-gray-400 rounded-sm">{isSelected ? isSelected.count : 0}</div>
												<button className="min-w-5 h-5 bg-gradient-primary rounded-sm flex items-center justify-center text-lg text-bright font-medium" onClick={() => handleCountChange(addon, 1)}>
													+
												</button>
											</div>
											{/* <div onClick={(e) => e.stopPropagation()}>
												<button className="faq-button" onClick={() => handleKnowMore({ title: "Occasion", info: occasion.description })}>
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
														<path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path>
													</svg>
													<span className="tooltip">Know More</span>
												</button>
											</div> */}
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="w-full flex items-center justify-center min-h-sm">
						<h3 className="text-gray-500 text-center">No Addons Available</h3>
					</div>
				)}
			</div>
			{/* <div className="w-auto max-w-[300px] mt-3  m-auto">
				<div className="input-wrapper ">
					<label htmlFor="celebrantName" className="whitespace-nowrap font-medium">
						Celebrant's Name:
					</label>
					<input type="text" placeholder="Celebrant's Name" id="celebrantName" name="celebrantName" value={celebrantName} onChange={handleCelebrantName} onBlur={handleBlur} onKeyPress={handleKeyPress} />
				</div>
			</div> */}
		</section>
	);
}

const mapStateToProps = (state) => {
	return {
		addonsData: state.addons,
		customerBooking: state.customerBooking,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getAllAddons: () => dispatch(getAllAddons()),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(UserAddons);
