import React, { useEffect, useRef } from "react";
import { aboutBreadcrumb } from "../utils";
import gsap from "gsap";
import About from "../components/About/About";
import FAQ from "../components/About/Faq";
import BrandStory from "../components/About/BrandStory";
// import Services from "../components/Home/Services";

function AboutPage() {
	const breadcrumbRef = useRef(null);
	useEffect(() => {
		gsap.fromTo(
			breadcrumbRef.current.children,
			{ y: 20, opacity: 0 },
			{
				y: 0,
				opacity: 1,
				duration: 0.8,
				stagger: 0.1,
				ease: "power3.out",
			}
		);
	}, []);

	return (
		<div>
			<div className="relative overflow-hidden">
				<section ref={breadcrumbRef} className="breadcrumb overflow-hidden relative">
					<div className="absolute w-full h-full inset-0 bg-gradient-to-r from-black/70 to-transparent z-[2]"></div>
					<img className="absolute w-full h-full top-0 right-0 object-center object-cover" src={aboutBreadcrumb} alt="Contact breadcrumb" />

					<div className="container relative z-[3] flex flex-col gap-5 min-h-[350px] pt-10">
						<h2 className="text-white text-center">About Us</h2>
						<p className="text-md text-white text-center max-w-xl mx-auto">We are the Best Private theatre in the Bangalore providing Best celbration Esperiences</p>
						<div className="flex gap-5 justify-center">
							<button className="btn-4 btn-white">Home</button>
							<button className="btn-4 btn-white">Book slot</button>
						</div>
					</div>
				</section>

				<svg width="1896" height="75" viewBox="0 0 1896 75" className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-[3]" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M1896 71.0298L0 74.5301C500.5 -69.4708 1896 39.5297 1896 39.5297V71.0298Z" className="fill-gray-100" />
				</svg>
			</div>
			<About></About>
			<BrandStory></BrandStory>
			{/* <Services /> */}
			<FAQ></FAQ>
		</div>
	);
}

export default AboutPage;
