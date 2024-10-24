import React from "react";
import Calendar from "../components/Calendar/Calendar";
import Slots from "../components/Slots/Slots";
import ScreenInfo from "../components/ScreenInfo/ScreenInfo";
function SlotBookingPage() {
	return (
		<section className="flex flex-col md:flex-row w-full gap-5 lg:gap-10 py-6">
			<div className="w-full md:w-1/2">
				<ScreenInfo />
			</div>
			<div className="w-full md:w-1/2">
				<Calendar />
				<Slots />
			</div>
		</section>
	);
}

export default SlotBookingPage;
