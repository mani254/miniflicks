import React, { useEffect, useRef } from "react";
import { cta } from "../../utils";
import { NavLink } from "react-router-dom";
import gsap from "gsap";

function Cta() {
	const contentRef = useRef(null);
	const imageRef = useRef(null);
	const backRef = useRef(null);

	useEffect(() => {
		if (!contentRef.current || !imageRef.current || !backRef.current) return;

		const animations = [];

		const contentChildren = Array.from(contentRef.current.children);
		const contentAnimation = gsap.from(contentChildren, {
			opacity: 0,
			y: 20,
			stagger: 0.1,
			scrollTrigger: {
				trigger: contentRef.current,
				start: "top 75%",
				toggleActions: "play none none reverse",
			},
		});
		animations.push(contentAnimation);

		const imageAnimation = gsap.fromTo(
			imageRef.current,
			{ y: 90 },
			{
				y: 0,
				scrollTrigger: {
					trigger: imageRef.current,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			}
		);
		animations.push(imageAnimation);

		const contentMove = gsap.fromTo(
			contentRef.current,
			{ y: 0 },
			{
				y: 50,
				scrollTrigger: {
					trigger: imageRef.current,
					start: "top bottom",
					end: "bottom top",
					scrub: 0.5,
				},
			}
		);
		animations.push(contentMove);

		const backAnimation = gsap.fromTo(
			backRef.current,
			{ y: 90 },
			{
				y: 0,
				scrollTrigger: {
					trigger: backRef.current,
					start: "top bottom",
					end: "bottom top",
					scrub: true,
				},
			}
		);
		animations.push(backAnimation);

		return () => {
			animations.forEach((anim) => anim?.kill());
		};
	}, [contentRef, imageRef, backRef]);

	return (
		<section className="py-14 my-5 flex items-center justify-center relative">
			<img src={cta} alt="cta image alt" className="absolute w-full h-full object-cover object-center" ref={imageRef} />
			<div className="absolute w-full h-full circular-gradient z-[2]" ref={backRef}></div>

			<div className="space-y-6 py-14 relative z-[3]" ref={contentRef}>
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
