import React from "react";
import testimonials from "../utils/Testimonials";

function TestimonialsPage() {
	return (
		<section className="testimonials-section mt-10">
			<h1 className="text-center  mb-8 text-xl font-medium">Listen From Our Customers</h1>
			<div className="mx-auto max-w-md columns-1 gap-5 text-sm leading-6 text-gray-900  sm:max-w-2xl sm:columns-2 xl:mx-0 xl:max-w-none xl:columns-3">
				{testimonials.map(({ body, author }, index) => (
					<div key={index} className=" mb-5 break-inside-avoid">
						<SingleTestimonial body={body} author={author} />
					</div>
				))}
			</div>
		</section>
	);
}

function SingleTestimonial({ body, author }) {
	return (
		<div className="">
			<figure className=" space-y-5 rounded-2xl bg-white p-6  shadow-lg ring-1 ring-gray-900/5 transition">
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
