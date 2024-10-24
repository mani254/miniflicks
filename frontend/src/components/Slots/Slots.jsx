import React from "react";

import { fingerImage } from "../../utils";

const slots = [
	{ from: "10:15 AM", to: "11:30 AM" },
	{ from: "12:15 AM", to: "1:30 AM" },
	{ from: "1:15 PM", to: "2:30 M" },
	{ from: "3:15 PM", to: ":30 PM" },
	{ from: "6:15 PM", to: "9:30 PM" },
];

function Slots() {
	return (
		<div className="mt-5">
			<div className="flex items-center gap-3">
				<div className="h-[2px] w-full bg-bright rounded-full"></div>
				<div className="min-w-[130px] flex flex-col items-center">
					<h5 className="text-center"> Select Your Slot</h5>
					<img className="rotate-180 w-9 floating" src={fingerImage} alt="finger 3d icon"></img>
				</div>
				<div className="h-[2px] w-full bg-bright rounded-full"></div>
			</div>
			<div className="flex gap-2 md:gap-4 flex-wrap items-center mt-4 justify-evenly md:justify-center ">
				{slots.map((slot, index) => {
					return (
						//add the class avialbe if available or add class unavailable
						<div className={`slot px-3 py-1 sm:px-5 sm:py-1 border border-gray-700 rounded-full border-opacity-80 cursor-pointer ${index == 1 && "selected"}`} key={index}>
							<p className="whitespace-nowrap relative z-10 text-xs sm:text-sm ">
								{slot.from} - {slot.to}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default Slots;
