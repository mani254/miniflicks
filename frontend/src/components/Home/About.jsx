import React from "react";

function About() {
	return (
		<section className="py-14 container">
			<div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center px-4 md:px-8 gap-8 py-6">
				{/* Image Section */}
				<div className=" w-full self-stretch  md:w-1/2  flex items-center justify-center">
					<div className="relative w-full  max-w-[300px] aspect-square bg-green-100 rounded-2xl">
						<img src="" alt="" />
						<div className="absolute w-[45%] h-[65%] rounded-full border-5 border-white -left-[23%] -bottom-16 bg-yellow-300">hello</div>
						<div className="absolute w-[45%] h-[65%] rounded-full border-5 border-white -right-[23%] -top-16 bg-yellow-300">hello</div>
					</div>
				</div>

				{/* Text Section */}
				<div className="w-full md:w-1/2 space-y-3 py-3">
					<h2 className="font-semibold text-gray-800">Miniflicks Private Theatre</h2>
					<p className="text-md text-gray-700 text-justify">Choose the occasion, give us the requirements and leave it to us. We will deliver the best.</p>
					<p className="text-gray-700 leading-relaxed text-justify">Miniflicks, Private Theater is a unique space where you can watch your favorite content with your favorite people in the comfort of a private theater. With a 150" screen, Dolby Atmos audio, and plush sofas, you're sure to have an unforgettable experience. You can also celebrate special occasions like birthdays, anniversaries, and parties in the theater, with customized decorations to match your theme.</p>
					<p className="text-gray-700 text-md text-justify">You can check available slots and book the theater from this website. For more details you can contact us on +91 8688014415</p>
					<div className="div-1 my-2 h-[1px] bg-gray-100"></div>
					<button className="btn-4 btn-dark text-sm"> Know More</button>
				</div>
			</div>
		</section>
	);
}

export default About;
