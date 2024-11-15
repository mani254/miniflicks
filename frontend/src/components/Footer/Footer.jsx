import React, { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { mfLogo, instagramColoured, facebookColoured, twitterColoured, youtbeColoured, whatsappColoured } from "../../utils";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail, IoLocationSharp } from "react-icons/io5";
import gsap from "gsap";

const socialMediaLinks = [
	{ href: "https://instagram.com/miniflicks", title: "Instagram", src: instagramColoured, alt: "Instagram" },
	{ href: "https://youtube.com/miniflicks", title: "YouTube", src: youtbeColoured, alt: "YouTube" },
	{ href: "https://facebook.com/miniflicks", title: "Facebook", src: facebookColoured, alt: "Facebook" },
	{ href: "https://wa.me/miniflicks", title: "WhatsApp", src: whatsappColoured, alt: "WhatsApp" },
];

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
	// Refs for each section
	const socialLinksRef = useRef([]);
	const logoRef = useRef(null);
	const textRef = useRef(null);
	const quickLinksRef = useRef([]);
	const contactInfoRef = useRef([]);

	useEffect(() => {
		const timelines = [];

		// Social Media hover animation with ScrollTrigger
		gsap.fromTo(
			socialLinksRef.current,
			{ opacity: 0, y: 20 },
			{
				opacity: 1,
				y: 0,
				stagger: 0.2,
				scrollTrigger: {
					trigger: socialLinksRef.current,
					start: "top 98%",
					toggleActions: "play none none reverse",
				},
			}
		);

		// Logo and text fade-up animation with ScrollTrigger
		const logoTextTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: logoRef.current,
				start: "top 98%",
				toggleActions: "play none none reverse",
			},
		});
		logoTextTimeline.from(logoRef.current, { opacity: 0, y: 10, duration: 0.5 });
		logoTextTimeline.from(textRef.current, { opacity: 0, y: 10, duration: 0.5 }, "-=0.3");
		timelines.push(logoTextTimeline);

		// Quick links fade-up animation with stagger and ScrollTrigger
		const quickLinksTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: quickLinksRef.current,
				start: "top 98%",
				toggleActions: "play none none reverse",
			},
		});
		quickLinksTimeline.from(quickLinksRef.current, { opacity: 0, y: 10, duration: 0.4, stagger: 0.1 });
		timelines.push(quickLinksTimeline);

		// Contact info fade-up animation with stagger and ScrollTrigger
		const contactTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: contactInfoRef.current,
				start: "top 98%",
				toggleActions: "play none none reverse",
			},
		});
		contactTimeline.from(contactInfoRef.current, { opacity: 0, y: 10, duration: 0.4, stagger: 0.1 });
		timelines.push(contactTimeline);

		// Cleanup animations and ScrollTriggers on unmount
		return () => {
			timelines.forEach((timeline) => timeline.kill());
			// ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
		};
	}, []);

	return (
		<footer className="bg-dark text-white py-14">
			<div className="container mx-auto px-4">
				{/* Social Media Links */}
				<div className="flex justify-center gap-6 mb-8 ">
					{socialMediaLinks.map((link, index) => (
						<NavLink
							key={link.title}
							to={link.href}
							title={link.title}
							target="_blank"
							rel="noopener noreferrer"
							className="text-white "
							ref={(el) => {
								if (el && !socialLinksRef.current.includes(el)) socialLinksRef.current.push(el);
							}}>
							<img src={link.src} alt={link.alt} className="h-6 w-6  transition-all hover:-translate-y-1" />
						</NavLink>
					))}
				</div>

				{/* Main Footer Content */}
				<div className="flex flex-col md:flex-row justify-between text-center md:text-left">
					{/* Logo and Description */}
					<div className="mb-6 md:mb-0 md:w-1/3 md:border-r border-gray-500 px-2 md:px-6">
						<div className="flex items-center gap-2 justify-center md:justify-start" ref={logoRef}>
							<div className="bg-dark w-11 h-11 rounded-full flex items-center justify-center p-1">
								<img src={mfLogo} alt="miniflicks logo" className="w-12" />
							</div>
							<h3 className="font-jokerman text-white">Miniflicks</h3>
						</div>
						<p ref={textRef} className="mt-2">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Quam quod aliquid sint possimus quidem. Minus, sit voluptatum aut dolorem mollitia commodi voluptates hic dolor facere, facilis quo voluptate nisi pariatur?
						</p>
					</div>

					{/* Quick Links */}
					<div className="mb-6 md:mb-0 md:w-1/3 px-2 md:px-6 md:border-r border-gray-500">
						<h4 className="font-semibold mb-4">Quick Links</h4>
						<ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:grid grid-cols-2 md:gap-2">
							{quickLinks.map((link, index) => (
								<li
									key={link.label}
									ref={(el) => {
										if (el && !quickLinksRef.current.includes(el)) quickLinksRef.current.push(el);
									}}>
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
								if (el && !contactInfoRef.current.includes(el)) contactInfoRef.current.push(el);
							}}>
							<IoMail /> support@miniflicks.com
						</div>
						<div
							className="flex justify-center md:justify-start gap-3"
							ref={(el) => {
								if (el && !contactInfoRef.current.includes(el)) contactInfoRef.current.push(el);
							}}>
							<FaPhoneAlt /> +1 234 567 890
						</div>
						<div
							className="flex justify-center md:justify-start gap-3"
							ref={(el) => {
								if (el && !contactInfoRef.current.includes(el)) contactInfoRef.current.push(el);
							}}>
							<IoLocationSharp /> 123 MiniFlicks St., Cinema City
						</div>
					</div>
				</div>

				{/* Footer Bottom Text */}
				<div className="flex flex-col md:flex-row justify-between items-center mt-8 px-2 md:px-6">
					<p className="text-gray-400">© 2024 MiniFlicks. All rights reserved.</p>
					<p className="text-gray-400">
						Developed and maintained by{" "}
						<NavLink to={"https://manidev.com"} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline cursor-pointer">
							ManiKanta
						</NavLink>
					</p>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
