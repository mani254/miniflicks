import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import { connect, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setBookingCakes } from "../../redux/customerBooking/customerBookingActions";

function OtherDetailsNav({ customerBooking }) {
	const [navOptions, setNavOptions] = useState(["Packages", "Occasions", "Addons", "Cakes", "Gifts"]);
	const [activeIndex, setActiveIndex] = useState(0); // Initialize as null
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	// Update navOptions based on the selected package
	useEffect(() => {
		if (!customerBooking.package) return;
		const initialOptions = ["Packages", "Occasions", "Addons", "Cakes", "Gifts"];
		if (!customerBooking.package?.addons.includes("Cake")) {
			dispatch(setBookingCakes([]));
		}
		let newOptions = customerBooking.package?.addons.includes("Cake") ? initialOptions : initialOptions.filter((opt) => opt !== "Cakes");
		setNavOptions(newOptions);
	}, [customerBooking.package]);

	// Set the active index based on the current URL path
	useEffect(() => {
		const pathSegments = location.pathname.split("/");
		const lastSegment = pathSegments[pathSegments.length - 1];

		const initialActiveIndex = navOptions.findIndex((option) => option.toLowerCase() === lastSegment);
		if (initialActiveIndex !== -1) {
			if (activeIndex !== initialActiveIndex) {
				setActiveIndex(initialActiveIndex);
			}
		}
	}, [location.pathname, navOptions]);

	// Navigate only when activeIndex changes due to user interaction
	// useEffect(() => {
	// 	const pathSegments = location.pathname.split("/");
	// 	const lastSegment = pathSegments[pathSegments.length - 1];

	// 	if (!navOptions[activeIndex]) return;

	// 	if (activeIndex !== null) {
	// 		if (lastSegment.toLocaleLowerCase === navOptions[activeIndex]) {
	// 			// navigate(`${navOptions[activeIndex].toLowerCase()}`, { replace: true });
	// 			return;
	// 		} else {
	// 			navigate(`${navOptions[activeIndex].toLowerCase()}`);
	// 		}
	// 	}
	// }, [activeIndex, navOptions]);

	function handleNext() {
		if (activeIndex < navOptions.length - 1) {
			setActiveIndex((prev) => prev + 1);
			navigate(`${navOptions[activeIndex + 1].toLowerCase()}`);
		} else {
			navigate("/booking/payment");
		}
	}

	function handleOptionClick(index) {
		setActiveIndex(index);
		navigate(`${navOptions[index].toLowerCase()}`);
	}

	return (
		<div className="flex items-center gap-2 flex-wrap justify-center md:justify-start md:gap-5">
			{navOptions.map((option, index) => (
				<div key={index} className={`px-4 py-[3px] border border-primary rounded-full cursor-pointer option transition-all ${index === activeIndex ? "active bg-primary text-white" : "hover:bg-primary hover:bg-opacity-15"}`} onClick={() => handleOptionClick(index)}>
					{option}
				</div>
			))}
			<div className="book-now-btn">
				<button className="btn-3 text-center flex w-[100px] items-center gap-2 m-auto" onClick={handleNext}>
					Next <FaArrowRight className="text-xs" />
				</button>
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(OtherDetailsNav);
