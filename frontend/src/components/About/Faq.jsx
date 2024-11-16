import React, { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger with GSAP
// gsap.registerPlugin(ScrollTrigger);

const faqs = [
	{
		question: "What is your policy on illegal or prohibited content?",
		answer: "Customers must not stream any content which is illegal/prohibited as per Indian laws. We will not be liable for any consequences that arise out of violation of this condition, and we will not allow such customers to book with us again.",
	},
	{
		question: "Can customers make changes to the technical equipment setup?",
		answer: "Customers should not make adjustments or modifications to the setup of projector, screen, laptop, and sound system. If any changes are required, we will do it from our end.",
	},
	{
		question: "Are minors allowed to book the theater?",
		answer: "Individuals below 18 years of age cannot book the theater. Legal guardians can book the theater and bring their minor ward(s) along with them.",
	},
	{
		question: "What is your refund policy for cancellations?",
		answer: "Full Refund of the Amount will be given if the booking is cancelled at least 72 hours before the booking time.",
	},
	{
		question: "What happens in case of a technical interruption from your end?",
		answer: "If there is any failure in working of the projector, laptop, internet access or sound system - we will reimburse the paid amount after deducting the rent for the period of time before interruption.",
	},
	{
		question: "Who is responsible for damages caused to the theater?",
		answer: "If there is any damage to any of the technical or non-technical items in the theater including the walls, lights, seating, etc., the customers will have to pay for it.",
	},
	{
		question: "What happens if I lose my belongings in the theater?",
		answer: "We will not be responsible in case of loss of personal belongings of any nature. Customers must take care of their belongings.",
	},
	{
		question: "Does the booking period include setup and check-out time?",
		answer: "Customers must vacate the theater along with all their belongings on or before the end time.",
	},
	{
		question: "Is there a cleaning fee if the theater is left messy?",
		answer: "In cases where cleaners would be required to clean the garbage, leftovers, and other wastes after the customers check out, the customers will have to pay an appropriate cleaning fee.",
	},
	{
		question: "What are the restrictions on smoking or alcohol consumption?",
		answer: "Customers are not allowed to smoke, consume alcoholic beverages, or any illegal substance inside the theater. Appropriate action would be taken against such customers.",
	},
];

function FAQPage() {
	const [activeIndex, setActiveIndex] = useState(null);
	const faqSectionRef = useRef(null);
	const faqItemsRef = useRef([]);

	// Add each FAQ item to the ref array for staggered animation
	const addToFaqItemsRef = (el) => {
		if (el && !faqItemsRef.current.includes(el)) {
			faqItemsRef.current.push(el);
		}
	};

	const toggleFAQ = (index) => {
		setActiveIndex(activeIndex === index ? null : index);
	};

	useEffect(() => {
		// GSAP animation for FAQ items when the section comes into view
		gsap.from(faqItemsRef.current, {
			opacity: 0,
			y: 30,
			stagger: 0.1,
			duration: 1,
			ease: "power4.out",
			scrollTrigger: {
				trigger: faqSectionRef.current,
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
		});
	}, []);

	return (
		<section ref={faqSectionRef} className="faq-section bg-gray-100  py-14">
			<div className="max-w-4xl mx-auto">
				<div className="container">
					<h2 className="text-center mb-6">Frequently Asked Questions</h2>
					<div className="space-y-4">
						{faqs.map((faq, index) => (
							<div key={index} className="faq-item border border-gray-300 rounded-lg overflow-hidden" ref={addToFaqItemsRef}>
								<button className="w-full flex justify-between items-center px-4 py-3 text-left bg-white text-gray-800 font-medium" onClick={() => toggleFAQ(index)}>
									<span>{faq.question}</span>
									<span className="text-xl">{activeIndex === index ? <AiOutlineMinus /> : <AiOutlinePlus />}</span>
								</button>
								<div className={`faq-answer transition-max-height duration-300 ease-in-out ${activeIndex === index ? "max-h-screen py-3 px-4" : "max-h-0"} overflow-hidden`}>
									<p className="text-gray-600">{faq.answer}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

export default FAQPage;
