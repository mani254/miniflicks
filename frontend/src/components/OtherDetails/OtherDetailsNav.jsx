import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useBookingStore } from "../../store/bookingStore";
import OtherDetailsButton from "../Booking/OtherDetailsButton";

function OtherDetailsNav({ activeIndex, navOptions, setNavOptions, setActiveIndex }) {
	const navigate = useNavigate();
	const location = useLocation();
	const { package: currentPackage, setBookingCakes } = useBookingStore();

	// Update navOptions based on the selected package
	useEffect(() => {
		if (!currentPackage) return;
		const initialOptions = ["Packages", "Occasions", "Cakes", "Addons", "Gifts"];
		if (!currentPackage.addons?.includes("Cake")) {
			setBookingCakes([]);
		}
		let newOptions = currentPackage.addons?.includes("Cake") ? initialOptions : initialOptions.filter((opt) => opt !== "Cakes");
		setNavOptions(newOptions);
	}, [currentPackage, setNavOptions, setBookingCakes]);

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
	}, [location.pathname, navOptions, activeIndex, setActiveIndex]);

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
				<OtherDetailsButton navOptions={navOptions} setActiveIndex={setActiveIndex} activeIndex={activeIndex} />
			</div>
		</div>
	);
}

export default OtherDetailsNav;
