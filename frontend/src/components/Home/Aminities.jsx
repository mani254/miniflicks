import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import amenities from "../../utils/amenities";

gsap.registerPlugin(ScrollTrigger);

function Amenities() {
	const cardRefs = useRef([]);

	useEffect(() => {
		if (cardRefs.length <= 0) return;

		const ctx = gsap.context(() => {
			cardRefs.current.forEach((card) => {
				if (!card) return;

				gsap.fromTo(
					card,
					{ opacity: 0, y: 30 },
					{
						opacity: 1,
						y: 0,
						duration: 0.6,
						scrollTrigger: {
							trigger: card,
							start: "top 85%",
							toggleActions: "play none none reverse",
						},
					}
				);
			});
		});

		// Cleanup on unmount
		return () => ctx.revert();
	}, [cardRefs]);

	return (
		<section className="py-14 px-4 bg-secondary bg-opacity-10">
			<div className="container">
				<h2 className="text-center mb-8 font-semibold">Why Choose Us !</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{amenities.map((amenity, index) => (
						<div
							key={index}
							ref={(el) => {
								if (el && !cardRefs.current.includes(el)) {
									cardRefs.current.push(el);
								}
							}}
							className="rounded-2xl relative px-7 py-10 bg-white overflow-hidden">
							<img src={amenity.image} alt={`${amenity.title} icon`} className="w-12 mb-1" />
							<h3 className="font-author mb-2">{amenity.title}</h3>
							<p className="text-gray-500">{amenity.description}</p>
							<div className="flex justify-end">{amenity.number && <p className="text-gray-800 mt-2 text-end px-3 py-[1px] border inline-block rounded-full bg-gray-100">{amenity.number}</p>}</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export default Amenities;
