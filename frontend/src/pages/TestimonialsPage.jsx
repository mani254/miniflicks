import React, { useEffect } from "react";
import { gsap } from "gsap";
import testimonials from "../utils/Testimonials";
import { NavLink } from "react-router-dom";

function TestimonialsPage() {
	useEffect(() => {
		const timeline = gsap.timeline({ defaults: { duration: 0.5 } });
		const testimonialsElements = document.querySelectorAll(".testimonial-item");

		gsap.killTweensOf(testimonialsElements);

		timeline.from(testimonialsElements, {
			opacity: 0,
			y: 20,
			stagger: 0.05,
		});
	}, []);

	return (
		<section className="container testimonials-section py-10">
			<div className="mb-10 md:flex items-center justify-between">
				<h1 className="text-center text-xl font-medium font-ks">Cherished Experiences from Our Guests</h1>

				<div className="book-now-btn mt-3 md:mt-0">
					<NavLink
						target="_blank"
						to="https://www.google.com/search?q=google+reviews+miniflicks+bangalore&sca_esv=68041e448ebf4032&sca_upv=1&rlz=1C5CHFA_enIN966IN967&sxsrf=ADLYWIL02G252tgnDSn1xjqQwlY9ZxUvdg%3A1719863970531&ei=ogqDZsuQIOmY4-EP3Y-x-AY&oq=google+reviews+miniflicks+&gs_lp=Egxnd3Mtd2l6LXNlcnAiGmdvb2dsZSByZXZpZXdzIG1pbmlmbGlja3MgKgIIADIFECEYoAEyBRAhGKABMgUQIRifBUiQClCcAVicAXABeACQAQCYAYYBoAGGAaoBAzAuMbgBAcgBAPgBAZgCAaACiwGYAwCIBgGSBwMwLjGgB74D&sclient=gws-wiz-serp#lrd=0x3bae131e0d1e4479:0xcba4ab3250d34b75,1,,,,"
						className="btn-3 text-center flex w-[200px] items-center gap-2 m-auto">
						See All Google Reviews
					</NavLink>
				</div>
			</div>
			<div className="mx-auto max-w-md columns-1 gap-5 text-sm leading-6 text-gray-900 sm:max-w-2xl sm:columns-2 xl:mx-0 xl:max-w-none xl:columns-3">
				{testimonials.map(({ body, author }, index) => (
					<div key={index} className="mb-5 break-inside-avoid testimonial-item">
						<SingleTestimonial body={body} author={author} />
					</div>
				))}
			</div>
			<div className="book-now-btn mt-3 md:mt-0">
				<NavLink
					target="_blank"
					to="https://www.google.com/search?q=google+reviews+miniflicks+bangalore&sca_esv=68041e448ebf4032&sca_upv=1&rlz=1C5CHFA_enIN966IN967&sxsrf=ADLYWIL02G252tgnDSn1xjqQwlY9ZxUvdg%3A1719863970531&ei=ogqDZsuQIOmY4-EP3Y-x-AY&oq=google+reviews+miniflicks+&gs_lp=Egxnd3Mtd2l6LXNlcnAiGmdvb2dsZSByZXZpZXdzIG1pbmlmbGlja3MgKgIIADIFECEYoAEyBRAhGKABMgUQIRifBUiQClCcAVicAXABeACQAQCYAYYBoAGGAaoBAzAuMbgBAcgBAPgBAZgCAaACiwGYAwCIBgGSBwMwLjGgB74D&sclient=gws-wiz-serp#lrd=0x3bae131e0d1e4479:0xcba4ab3250d34b75,1,,,,"
					className="btn-3 text-center flex w-[200px] items-center gap-2 m-auto">
					See All Google Reviews
				</NavLink>
			</div>
		</section>
	);
}

function SingleTestimonial({ body, author }) {
	return (
		<div className="">
			<figure className="space-y-5 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-900/5 transition">
				<blockquote className="text-gray-900">
					<p>{`"${body}"`}</p>
				</blockquote>
				<figcaption className="flex items-center gap-x-4">
					<img className="h-10 w-10 flex-none rounded-full bg-gray-50" src={author.imageUrl} alt={author.name} />
					<div className="flex-auto">
						<div className="font-semibold">{author.name}</div>
						<div className="text-gray-600">
							<div className="rating flex gap-[1px] mt-[2px]">
								<div className="star w-4 h-4"></div>
								<div className="star w-4 h-4"></div>
								<div className="star w-4 h-4"></div>
								<div className="star w-4 h-4"></div>
								<div className="star w-4 h-4"></div>
							</div>
						</div>
					</div>
				</figcaption>
			</figure>
		</div>
	);
}

export default TestimonialsPage;
