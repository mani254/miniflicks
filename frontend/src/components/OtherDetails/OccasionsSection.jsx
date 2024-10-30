import React, { useEffect, useState } from "react";
import { getAllOccasions } from "../../redux/occasion/occasionActions";
import { connect, useDispatch } from "react-redux";
import { setBookingOccasion } from "../../redux/customerBooking/customerBookingActions";
import { showModal } from "../../redux/modal/modalActions";
import KnowMore from "../KnowMore/KnowMore";

function OccasionsSection({ OccasionsData, getAllOccasions, customerBooking }) {
	const [selected, setSelected] = useState(null);
	const [celebrantName, setCelebrantName] = useState("");
	const dispatch = useDispatch();

	useEffect(() => {
		(async () => {
			try {
				await getAllOccasions();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	useEffect(() => {
		if (!customerBooking.occasion) return;
		setSelected(customerBooking.occasion);
		if (customerBooking.occasion.celebrantName) {
			setCelebrantName(customerBooking.occasion.celebrantName);
		}
	}, [customerBooking.occasion]);

	function handleSelect(occasion) {
		if (selected?._id === occasion._id) {
			setSelected(null);
			dispatch(setBookingOccasion(null));
		} else {
			const updatedOccasion = {
				...occasion,
				celebrantName: celebrantName || "",
			};
			setSelected(updatedOccasion);
			dispatch(setBookingOccasion(updatedOccasion));
		}
	}

	function handleCelebrantName(e) {
		setCelebrantName(e.target.value);
	}

	function handleBlur() {
		if (selected) {
			const updatedOccasion = {
				...selected,
				celebrantName: celebrantName,
			};
			dispatch(setBookingOccasion(updatedOccasion));
		}
	}

	function handleKeyPress(e) {
		if (e.key === "Enter") {
			handleBlur();
		}
	}

	function handleKnowMore({ title, info }) {
		dispatch(showModal({ title, info }, KnowMore));
	}

	return (
		<section className="option-section pt-6 mt-4 border-t border-white">
			<div className="w-full">
				{OccasionsData.occasions.length > 0 ? (
					<div className="flex w-full flex-wrap gap-5">
						{OccasionsData.occasions.map((occasion, index) => {
							let isSelected = selected?._id === occasion._id;
							return (
								<div className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${isSelected ? "selected" : ""} min-w-[170px]`} key={index} onClick={() => handleSelect(occasion)}>
									<div className="p-2 rounded-lg bg-bright">
										<div className="w-full aspect-[16/12] relative overflow-hidden rounded-md">
											<img className="absolute object-cover w-full h-full" src={occasion.image} alt={occasion.name} />
										</div>
										<h5 className="text-center mt-2">{occasion.name}</h5>
										<div className="flex justify-between mt-1 items-center">
											<p className="font-medium text-primary text-md">₹ {occasion.price}</p>
											<div onClick={(e) => e.stopPropagation()}>
												<button className="faq-button" onClick={() => handleKnowMore({ title: "Occasion", info: occasion.description })}>
													<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
														<path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path>
													</svg>
													<span className="tooltip">Know More</span>
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
						<h3 className="text-gray-500 text-center">No Occasions Available</h3>
					</div>
				)}
			</div>
			<div className="w-auto max-w-[300px] mt-3  m-auto">
				<div className="input-wrapper ">
					<label htmlFor="celebrantName" className="whitespace-nowrap font-medium">
						Celebrant's Name:
					</label>
					<input type="text" placeholder="Celebrant's Name" id="celebrantName" name="celebrantName" value={celebrantName} onChange={handleCelebrantName} onBlur={handleBlur} onKeyPress={handleKeyPress} />
				</div>
			</div>
		</section>
	);
}

const mapStateToProps = (state) => ({
	OccasionsData: state.occasions,
	customerBooking: state.customerBooking,
});

const mapDispatchToProps = (dispatch) => ({
	getAllOccasions: () => dispatch(getAllOccasions()),
});

export default connect(mapStateToProps, mapDispatchToProps)(OccasionsSection);
