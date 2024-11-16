import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { aboutEdited } from "../../utils";

function BrandStory() {
	// Refs for the elements to animate
	const headingRef = useRef(null);
	const paragraphsRef = useRef([]);
	const imageRef = useRef(null);

	// Adding each paragraph ref to the array
	const addToParagraphsRef = (el) => {
		if (el && !paragraphsRef.current.includes(el)) {
			paragraphsRef.current.push(el);
		}
	};

	useEffect(() => {
		// GSAP animations on mount
		gsap.from(headingRef.current, {
			opacity: 0,
			y: 50,
			duration: 1,
			ease: "power4.out",
		});

		gsap.from(imageRef.current, {
			opacity: 0,
			y: 50,
			duration: 1,
			ease: "power4.out",
			scrollTrigger: {
				trigger: imageRef.current,
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});

		// GSAP stagger animation for paragraphs
		gsap.from(paragraphsRef.current, {
			opacity: 0,
			y: 30,
			stagger: 0.1,
			duration: 1,
			ease: "power4.out",
			scrollTrigger: {
				trigger: paragraphsRef.current[0],
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});
	}, []);

	return (
		<section className="faq-section px-4 py-14 bg-dark bg-opacity-85">
			<div className="max-w-5xl m-auto flex flex-col md:flex-row items-center justify-center gap-6 ">
				<div className="w-full md:w-1/2">
					<h2 ref={headingRef} className="mb-6 text-gray-200 text-center md:text-left">
						Our Brand Story
					</h2>
					<div className="space-y-1">
						<p ref={addToParagraphsRef} className="text-gray-300">
							In the heart of Bangalore, Chandra Mouli Reddy Vangumalla, Veeranjaneya Reddy Yagnam, Thej Kumar Manchi, and M Kailash, a group of passionate movie enthusiasts, created MiniFlicks Private Theater, a place to celebrate life’s special moments with cinematic magic.
						</p>
						<p ref={addToParagraphsRef} className="text-gray-300">
							MiniFlicks offers an intimate, luxurious setting for birthdays, anniversaries, and more, designed for unforgettable memories. The brand quickly became a favorite for those seeking a personalized cinematic experience.
						</p>
						<p ref={addToParagraphsRef} className="text-gray-300">
							With a focus on customer satisfaction, each theater combines comfort and style, offering a unique space for gatherings of any size. Whether it’s a small family event or a grand celebration, MiniFlicks sets the perfect stage.
						</p>
						<p ref={addToParagraphsRef} className="text-gray-300">
							Join us at MiniFlicks Private Theater, where movies and memories come together to create unforgettable experiences.
						</p>
					</div>
				</div>
				<div className="w-full md:w-1/2 flex items-center justify-center" ref={imageRef}>
					<img className="max-w-[400px] md:max-w-[450px] w-full" src={aboutEdited} alt="miniflicks images with ui" />
				</div>
			</div>
		</section>
	);
}

export default BrandStory;
