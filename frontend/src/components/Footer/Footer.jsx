import React, { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { mfLogo } from "../../utils";
import { socialMediaLinks } from "../../utils";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail, IoLocationSharp } from "react-icons/io5";
import gsap from "gsap";

const quickLinks = [
	{ href: "/", label: "Home" },
	{ href: "/about", label: "About Us" },
	{ href: "/contact", label: "Contact" },
	{ href: "/gallery", label: "Gallery" },
	{ href: "/testimonials", label: "Testimonials" },
	{ href: "/termsandconditions", label: "Terms & Conditions" },
	{ href: "/refundpolicy", label: "Refund Policy" },
];

const Footer = () => {
	const location = useLocation();
	const footerRef = useRef(null);
	const socialLinksRef = useRef([]);
	const logoRef = useRef(null);
	const textRef = useRef(null);
	const quickLinksRef = useRef([]);
	const contactInfoRef = useRef([]);

	useEffect(() => {
		if (!socialLinksRef.current || !logoRef.current || !quickLinksRef.current || !contactInfoRef.current) return;

		const ctx = gsap.context(() => {
			// Social Media Links Animation
			gsap.fromTo(
				socialLinksRef.current,
				{ opacity: 0, y: 20 },
				{
					opacity: 1,
					y: 0,
					stagger: 0.2,
					scrollTrigger: {
						trigger: footerRef.current,
						start: "top 90%",
						toggleActions: "play none none reverse",
					},
				}
			);

			// Logo and Text Animation
			gsap.fromTo(
				[logoRef.current, textRef.current],
				{ opacity: 0, y: 10 },
				{
					opacity: 1,
					y: 0,
					stagger: 0.2,
					scrollTrigger: {
						trigger: footerRef.current,
						start: "top 90%",
						toggleActions: "play none none reverse",
					},
				}
			);

			// Quick Links Animation
			gsap.fromTo(
				quickLinksRef.current,
				{ opacity: 0, y: 10 },
				{
					opacity: 1,
					y: 0,
					stagger: 0.1,
					scrollTrigger: {
						trigger: footerRef.current,
						start: "top 90%",
						toggleActions: "play none none reverse",
					},
				}
			);

			// Contact Information Animation
			gsap.fromTo(
				contactInfoRef.current,
				{ opacity: 0, y: 10 },
				{
					opacity: 1,
					y: 0,
					stagger: 0.1,
					scrollTrigger: {
						trigger: footerRef.current,
						start: "top 90%",
						toggleActions: "play none none reverse",
					},
				}
			);
		}, footerRef);

		return () => ctx.revert();
	}, [socialLinksRef.current, logoRef.current, quickLinksRef.current, contactInfoRef.current, location]);

	return (
		<footer className="bg-dark text-white py-14" ref={footerRef}>
			<div className="container mx-auto px-4">
				{/* Social Media Links */}
				<div className="flex justify-center gap-6 mb-8">
					{socialMediaLinks.map((link, index) => (
						<NavLink key={link.title} to={link.href} title={link.title} target="_blank" rel="noopener noreferrer" className="text-white" ref={(el) => (socialLinksRef.current[index] = el)}>
							<img src={link.src} alt={link.alt} className="h-6 w-6 transition-all hover:-translate-y-1" />
						</NavLink>
					))}
				</div>

				{/* Main Footer Content */}
				<div className="flex flex-col md:flex-row justify-between text-center md:text-left">
					{/* Logo and Description */}

					<div className="mb-6 md:mb-0 md:w-1/3 md:border-r border-gray-500 px-2 md:px-6">
						<NavLink to="/">
							<div className="flex items-center gap-2 justify-center md:justify-start">
								<div ref={logoRef} className="bg-dark w-11 h-11 rounded-full flex items-center justify-center p-1">
									<img src={mfLogo} alt="miniflicks logo" className="w-12" />
								</div>
								<h3 className="font-jokerman text-white">Miniflicks</h3>
							</div>
						</NavLink>

						<p ref={textRef} className="mt-2">
						Experience the joy of exclusive movie nights and unforgettable celebrations at Miniflicks. With a 150-inch screen, Dolby Atmos sound, and personalized decor, we bring your special moments to life in a private, luxurious theatre setting.
						</p>
					</div>

					{/* Quick Links */}
					<div className="mb-6 md:mb-0 md:w-1/3 px-2 md:px-6 md:border-r border-gray-500">
						<h4 className="font-semibold mb-4">Quick Links</h4>
						<ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:grid grid-cols-2 md:gap-2">
							{quickLinks.map((link, index) => (
								<li key={link.label} ref={(el) => (quickLinksRef.current[index] = el)}>
									<NavLink to={link.href} className="hover:text-gray-400 whitespace-nowrap">
										{link.label}
									</NavLink>
								</li>
							))}
						</ul>
					</div>

					{/* Contact Information */}
					<div className="md:w-1/3 px-2 md:px-6 space-y-4">
						<h4 className="font-semibold mb-4">Contact</h4>
						<div
							className="flex justify-center md:justify-start gap-3"
							ref={(el) => {
								if (el && !contactInfoRef.current.includes(el)) {
									contactInfoRef.current.push(el);
								}
							}}>
							<div className="min-w-5">
								<IoMail />
							</div>{" "}
							<a target='_blank' href="mailto:miniflicksprivatetheatres@gmail.com">miniflicksprivatetheatres@gmail.com</a>
						</div>
						<div
							className="flex justify-center md:justify-start gap-3"
							ref={(el) => {
								if (el && !contactInfoRef.current.includes(el)) {
									contactInfoRef.current.push(el);
								}
							}}>
							<div className="min-w-5">
								<FaPhoneAlt />
							</div>{" "}
							<a target="_blank" href="tel:+919019162002">+91 9019162002</a>
						</div>
						<div
							className="flex justify-center md:justify-start gap-3"
							ref={(el) => {
								if (el && !contactInfoRef.current.includes(el)) {
									contactInfoRef.current.push(el);
								}
							}}>
							<div className="min-w-5">
								<IoLocationSharp />
							</div>{" "}
							1st A cross, Anantharama reddy layout, The Summit, #13, Outer Ring Rd, Chinnapanahalli, Marathahalli, Bengaluru, Karnataka 560037
						</div>
					</div>
				</div>

				{/* Footer Bottom Text */}
				<div className="flex flex-col md:flex-row justify-between items-center mt-8 px-2 md:px-6">
					<p className="text-gray-400">© 2024 MiniFlicks. All rights reserved.</p>
					<p className="text-gray-400">
						Developed and maintained by{" "}
						<NavLink to={"https://manidev.in"} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline cursor-pointer">
							ManiKanta
						</NavLink>
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
