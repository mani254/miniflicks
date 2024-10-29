import React, { useState, useEffect } from "react";
import OtherDetailsNav from "./OtherDetailsNav";
import PackagesSection from "./PackagesSection";
// import OccasionsSection from "./OccasionsSection";
// import AddonsSection from "./AddonsSection";
// import CakesSection from "./CakesSection";
// import GiftsSection from "./GiftsSection";

import OrderSummary from "./OrderSummary";

function OtherDetails() {
	const [selectedOption, setSelectedOption] = useState("Packages");
	const [CurrentComponent, setCurrentComponent] = useState(() => PackagesSection);

	// Map each option to its corresponding component
	const componentMap = {
		Packages: PackagesSection,
		//  Occasions: OccasionsSection,
		//  Addons: AddonsSection,
		//  Cakes: CakesSection,
		//  Gifts: GiftsSection,
	};

	useEffect(() => {
		// Set the current component based on selectedOption
		if (componentMap[selectedOption]) {
			setCurrentComponent(() => componentMap[selectedOption]);
		}
	}, [selectedOption]);

	return (
		<section className="flex flex-col md:flex-row w-full gap-4 lg:gap-10 py-6">
			<div className="w-full md:w-2/3">
				<OtherDetailsNav includeCake={true} setSelectedOption={setSelectedOption} />
				{CurrentComponent && <CurrentComponent />}
			</div>
			<div className="w-full md:w-1/3 ">
				<OrderSummary />
			</div>
		</section>
	);
}

export default OtherDetails;
