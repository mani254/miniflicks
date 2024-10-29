import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";

function OtherDetailsNav({ includeCake, setSelectedOption }) {
	const initialOptions = ["Packages", "Occasions", "Addons", "Cakes", "Gifts"];
	const navOptions = includeCake ? initialOptions : initialOptions.filter((opt) => opt !== "Cakes");
	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		// Set the initially selected option on load
		setSelectedOption(navOptions[activeIndex]);
	}, [navOptions, activeIndex, setSelectedOption]);

	function handleNext() {
		if (activeIndex < navOptions.length - 1) {
			setActiveIndex((prev) => prev + 1);
			setSelectedOption(navOptions[activeIndex + 1]);
		}
	}

	function handleOptionClick(index) {
		setActiveIndex(index);
		setSelectedOption(navOptions[index]);
	}

	return (
		<div className="flex items-center gap-5">
			{navOptions.map((option, index) => (
				<div key={index} className={`px-4 py-[3px] border border-primary rounded-full cursor-pointer option transition-all ${index === activeIndex ? "active bg-primary text-white" : " hover:bg-primary hover:bg-opacity-15 "}`} onClick={() => handleOptionClick(index)}>
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

export default OtherDetailsNav;
