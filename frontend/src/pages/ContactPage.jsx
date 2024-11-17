import React, { useEffect, useRef, useState } from "react";
import { contactBalloon, contactBreadcrumb } from "../utils";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { socialMediaLinks } from "../utils";
import { NavLink } from "react-router-dom";
import gsap from "gsap";

function ContactPage() {
	const phoneCardRef = useRef(null);
	const socialMediaCardRef = useRef(null);
	const emailCardRef = useRef(null);
	const balloonRef = useRef(null);
	const breadcrumbRef = useRef(null);
	const formInputsRef = useRef([]);

	const [formData, setFormData] = useState({
		name: "",
		phone: "",
		email: "",
		message: "",
	});

	useEffect(() => {
		// Animate breadcrumb
		if (!breadcrumbRef.current || !socialMediaCardRef.current || !emailCardRef.current || !balloonRef.current || !formInputsRef.current) return;

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

		// Animating cards with fadeInUp effect
		const fadeInUpCards = [phoneCardRef.current, socialMediaCardRef.current, emailCardRef.current];
		fadeInUpCards.forEach((card, index) => {
			gsap.fromTo(
				card,
				{ y: 50, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.8,
					delay: index * 0.2,
					ease: "power3.out",
				}
			);
		});

		// Floating animation for balloon
		gsap.to(balloonRef.current, {
			y: -20,
			duration: 2,
			yoyo: true,
			repeat: -1,
			ease: "sine.inOut",
		});

		// Animate form inputs when they come into view
		formInputsRef.current.forEach((input) => {
			gsap.fromTo(
				input,
				{ y: 20, opacity: 0 },
				{
					y: 0,
					opacity: 1,
					duration: 0.6,
					ease: "power3.out",
					scrollTrigger: {
						trigger: input,
						start: "top 80%",
					},
				}
			);
		});
	}, [breadcrumbRef.current, socialMediaCardRef.current, emailCardRef.current, balloonRef.current, formInputsRef.current]);

	// Handle form input change
	const handleInputChange = (e) => {
		const { id, value } = e.target;
		setFormData((prev) => ({ ...prev, [id]: value }));
	};

	// Form submission handler
	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form Data:", formData);
	};

	return (
		<div>
			<div className="relative overflow-hidden">
				<section ref={breadcrumbRef} className="breadcrumb overflow-hidden relative">
					<div className="absolute w-full h-full inset-0 bg-gradient-to-r from-black/70 to-transparent z-[2]"></div>
					<img className="absolute w-full h-full top-0 right-0 object-center object-cover" src={contactBreadcrumb} alt="Contact breadcrumb" />

					<div className="container relative z-[2] flex flex-col gap-5 min-h-[350px] pt-10">
						<h2 className="text-white text-center">Contact Us</h2>
						<p className="text-md text-white text-center">To Book Slots or for any Queries Please Contact us!</p>
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

			<section className="bg-gray-100 pt-3">
				<div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between gap-5 p-4">
					<div ref={phoneCardRef} className="w-full md:w-1/3 bg-white p-5 rounded-2xl shadow-md min-h-[120px]">
						<h3 className="text-center text-md flex items-center justify-center gap-3 mb-3">
							<FaPhoneAlt /> Phone
						</h3>
						<p className="text-center">
							<a href="tel:+918688014415" className="text-blue-500 hover:underline">
								+91 8688014415
							</a>
						</p>
						<p className="text-center">
							<a href="tel:+918688014415" className="text-blue-500 hover:underline">
								+91 8688014415
							</a>
						</p>
					</div>

					<div ref={socialMediaCardRef} className="w-full md:w-1/3 bg-white p-5 rounded-2xl shadow-md min-h-[120px]">
						<h3 className="text-center text-md mb-3">Social Media</h3>
						<div className="flex justify-center gap-6 mb-8">
							{socialMediaLinks.map((link) => (
								<NavLink key={link.title} to={link.href} title={link.title} target="_blank" rel="noopener noreferrer" className="text-white">
									<img src={link.src} alt={link.alt} className="h-6 w-6 transition-all hover:-translate-y-1" />
								</NavLink>
							))}
						</div>
					</div>

					<div ref={emailCardRef} className="w-full md:w-1/3 bg-white p-5 rounded-2xl shadow-md min-h-[120px]">
						<h3 className="text-center text-md flex items-center justify-center gap-3 mb-3">
							<IoMail /> Email
						</h3>
						<p className="text-center">
							<a href="mailto:miniflicksprivatetheatres@gmail.com" className="text-blue-500 hover:underline">
								miniflicksprivatetheatres@gmail.com
							</a>
						</p>
					</div>
				</div>

				<div className="min-h-[650px] flex justify-center items-center p-4">
					<div className="shadow-md rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-4xl">
						<div className="p-6 md:w-1/3 contact-side">
							<h2 className="mb-2">Contact Us</h2>
							<p className="mb-2">Feel free to get in touch with us for any inquiries or feedback. We are here to assist you!</p>
							<img ref={balloonRef} className="max-w-[200px] block mx-auto" src={contactBalloon} alt="Floating Contact Balloon" />
						</div>

						<div className="p-6 md:w-2/3 bg-white">
							<form className="space-y-6" onSubmit={handleSubmit}>
								<div className="flex flex-col md:flex-row gap-4">
									<div className="flex-1">
										<label className="block text-gray-700 font-medium mb-2" htmlFor="name">
											Name
										</label>
										<input id="name" type="text" placeholder="Your Name" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100" value={formData.name} onChange={handleInputChange} ref={(el) => (formInputsRef.current[0] = el)} />
									</div>
									<div className="flex-1">
										<label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
											Phone Number
										</label>
										<input id="phone" type="tel" placeholder="Your Phone Number" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100" value={formData.phone} onChange={handleInputChange} ref={(el) => (formInputsRef.current[1] = el)} />
									</div>
								</div>

								<div>
									<label className="block text-gray-700 font-medium mb-2" htmlFor="email">
										Email
									</label>
									<input id="email" type="email" placeholder="Your Email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100" value={formData.email} onChange={handleInputChange} ref={(el) => (formInputsRef.current[2] = el)} />
								</div>

								<div>
									<label className="block text-gray-700 font-medium mb-2" htmlFor="message">
										Message
									</label>
									<textarea id="message" rows="4" placeholder="Your Message" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-100" value={formData.message} onChange={handleInputChange} ref={(el) => (formInputsRef.current[3] = el)}></textarea>
								</div>

								<div>
									<button className="btn-3 w-full text-center">Send Message</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

export default ContactPage;
