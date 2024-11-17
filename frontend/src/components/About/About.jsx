import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import image1 from "../../assets/gallery/rose-path/image-3.webp";
import image2 from "../../assets/gallery/smoke/image-1.jpg";
import Ripple from "../Loader/Ripple";
import { miniflicksCartoon } from "../../utils";

function About() {
	const imagesRef = useRef([]);
	const videoRef = useRef(null);
	const headingRef = useRef(null);
	const textRef = useRef(null);
	const [videoLoading, setVideoLoading] = useState(true);

	useEffect(() => {
		// Animate heading and text
		gsap.fromTo([headingRef.current, textRef.current], { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1, stagger: 0.2 });

		// Animate images and video on scroll
		imagesRef.current.forEach((el) => {
			gsap.fromTo(
				el,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 1,
					scrollTrigger: {
						trigger: el,
						start: "top 80%",
					},
				}
			);
		});

		if (videoRef.current) {
			gsap.fromTo(
				videoRef.current,
				{ opacity: 0, y: 50 },
				{
					opacity: 1,
					y: 0,
					duration: 1,
					scrollTrigger: {
						trigger: videoRef.current,
						start: "top 80%",
					},
				}
			);
		}
	}, []);

	return (
		<section className="pt-6 pb-20 bg-gray-100">
			<div className="max-w-5xl mx-auto px-3">
				<h2 ref={headingRef} className="text-center">
					Best Private Theatre & <br /> Celebration Space
				</h2>
				<p ref={textRef} className="text-center mt-5">
					We take pride in being the ultimate private theatre and celebration space, beautifully designed to make your special moments truly extraordinary. From cozy movie nights to grand birthday celebrations, romantic proposals, elegant bride-to-be parties, and more, our venue is tailored to suit every occasion. With stunning decorations, luxurious seating, and cutting-edge audio-visual systems, we create an ambiance that blends comfort, style, and exclusivity. Whether you’re celebrating
					with loved ones or hosting an intimate gathering, our space ensures every experience is unforgettable, filled with joy, and designed to leave lasting memories.
				</p>
				<div className="flex gap-6 justify-center mt-6">
					<div ref={(el) => (imagesRef.current[0] = el)} className="relative hidden md:block w-1/4 aspect-[3/4] bg-gray-300 rounded-2xl overflow-hidden">
						<img className="absolute w-full h-full object-cover" src={image1} alt="celebration space image" />
					</div>
					<div ref={videoRef} className="relative w-full md:w-2/4 aspect-[16/9] bg-gray-300 rounded-2xl overflow-hidden md:-mb-8 md:mt-8 flex items-center justify-center">
						{videoLoading && (
							<div className="absolute inset-0 flex items-center justify-center">
								<Ripple />
							</div>
						)}
						<video className="absolute w-full h-full object-cover" src={miniflicksCartoon} controls muted autoPlay loop playsInline onCanPlay={() => setVideoLoading(false)} loading="lazy" />
					</div>
					<div ref={(el) => (imagesRef.current[1] = el)} className="relative hidden md:block w-1/4 aspect-[3/4] bg-gray-300 rounded-2xl overflow-hidden">
						<img className="absolute w-full h-full object-cover" src={image2} alt="private theatre image" />
					</div>
				</div>
			</div>
		</section>
	);
}

export default About;
