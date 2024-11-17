import React from "react";
import { cta } from "../../utils";
import { NavLink } from "react-router-dom";

function Cta() {
	return (
		<section className="py-14 my-5 flex items-center justify-center relative">
			<img src={cta} alt="cta image alt" className="absolute w-full h-full object-cover object-center" />
			<div className="absolute w-full h-full circular-gradient z-[2]"></div>
			<div className="space-y-6 py-14 relative z-[3]">
				<h2 className="text-center text-white">Create Your Moments</h2>
				<p className="text-lg text-white text-center">We will Help you to trun your clebrations into moments</p>
				<div className="text-center">
					<NavLink to="/booking/locations">
						<button className="btn-4 btn-white">Book Now</button>
					</NavLink>
				</div>
			</div>
		</section>
	);
}

export default Cta;
