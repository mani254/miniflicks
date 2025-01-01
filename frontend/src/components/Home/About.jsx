import React, { useEffect, useRef } from "react";
import { paperEffectImage } from "../../utils";
import { googleReview, celebration } from "../../utils";
import gsap from "gsap";
import { NavLink } from "react-router-dom";

function About() {
	const contentRef = useRef(null);
	const floatRef = useRef([]);

	useEffect(() => {
		if (!contentRef.current) return;

		const contentChildren = Array.from(contentRef.current.children);

		const contentAnimation = gsap.from(contentChildren, {
			opacity: 0,
			y: 20,
			stagger: 0.2,
			scrollTrigger: {
				trigger: contentRef.current,
				start: "top 70%",
				toggleActions: "play none none reverse",
			},
		});

		const floatAnimations = floatRef.current.map((el, index) => {
			if (!el) return null;
			return gsap.fromTo(
				el,
				{ y: 0 },
				{
					y: index === 0 ? 30 : -30,
					duration: 1,
					scrollTrigger: {
						trigger: el,
						start: "top bottom",
						end: "bottom top",
						scrub: true,
					},
				}
			);
		});

		return () => {
			contentAnimation?.scrollTrigger?.kill();
			floatAnimations.forEach((anim) => anim?.scrollTrigger?.kill());
		};
	}, [contentRef, floatRef]);

	return (
		<section className="py-14 pb-8 container">
			<div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center  md:px-8 gap-8 py-6">
				{/* Image Section */}
				<div className="w-full md:w-1/2 relative">
					<div className="flex items-center min-w-[150px] absolute -top-3 md:top-10 gap-5 bg-white shadow-lg px-3 py-1 rounded-xl" ref={(el) => (floatRef.current[0] = el)}>
						<img src={googleReview} alt="google reviews" className="w-10 h-10 overflow-hidden" />
						<p className="text-center">
							Over 700 + <br />
							google reviews
						</p>
					</div>
					<div className="flex items-center min-w-[150px] absolute -bottom-3 md:bottom-14 right-0 gap-5 bg-white shadow-lg px-3 py-1 rounded-xl" ref={(el) => (floatRef.current[1] = el)}>
						<img src={celebration} alt="celebration" className="w-10 h-10 overflow-hidden" />
						<p className="text-center text-xs md:text-sm">
							More than 5000 + <br />
							Celebrations
						</p>
					</div>
					<div>
						<img src={paperEffectImage} alt="" />
					</div>
				</div>

				{/* Text Section */}
				<div className="w-full md:w-1/2 space-y-3 py-3" ref={contentRef}>
					<h2 className="font-semibold text-gray-800">Miniflicks Private Theatre</h2>
					<p className="text-md text-gray-700 text-justify">Choose the occasion, give us the requirements and leave it to us. We will deliver the best.</p>
					<p className="text-gray-700 leading-relaxed text-justify">Miniflicks, Private Theater is a unique space where you can watch your favorite content with your favorite people in the comfort of a private theater. With a 150" screen, Dolby Atmos audio, and plush sofas, you're sure to have an unforgettable experience. You can also celebrate special occasions like birthdays, anniversaries, and parties in the theater, with customized decorations to match your theme.</p>
					<p className="text-gray-700 text-md text-justify">You can check available slots and book the theater from this website. For more details you can contact us on +91 9019162002</p>
					<div className="div-1 my-2 h-[1px] bg-gray-100"></div>
					<div>
						<NavLink to="/about">
							<button className="btn-4 btn-dark text-sm"> Know More</button>
						</NavLink>
					</div>
				</div>
			</div>
		</section>
	);
}

export default About;
