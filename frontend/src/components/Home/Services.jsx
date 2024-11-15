import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Navigation, Autoplay } from "swiper/modules";
import { cake, candlePath, coolDrink, decoration, gift, ledName, boquet } from "../../utils";
import { FaArrowRightLong, FaArrowLeftLong } from "react-icons/fa6";

// Array of services
const services = [
	{
		img: cake,
		title: "Customized Cake",
		// description: "Order a personalized cake to add a special touch to your celebration.",
	},
	{
		img: candlePath,
		title: "Candlelight Pathway",
		// description: "Enhance the ambiance with a beautiful candle-lit pathway to your venue.",
	},
	{
		img: coolDrink,
		title: "Beverage Service",
		// description: "A selection of refreshing drinks tailored to suit any event.",
	},
	{
		img: decoration,
		title: "Venue Decoration",
		// description: "Elegant and customizable decorations to match the theme of your celebration.",
	},
	{
		img: gift,
		title: "Personalized Gift",
		// description: "Create a memorable experience with a thoughtfully selected, customized gift.",
	},
	{
		img: ledName,
		title: "LED Name Display",
		// description: "Light up the event with a custom LED display of names or messages.",
	},
	{
		img: boquet,
		title: "Floral Bouquet",
		// description: "Handcrafted floral arrangements perfect for any occasion.",
	},
];

const Services = () => {
	return (
		<section className="services-section bg-gray-100 py-14">
			<div className="container mx-auto">
				<h2 className="text-xl font-semibold text-center mb-8">Services We Provide</h2>
				{/* Swiper Component */}
				<Swiper
					slidesPerView={1}
					spaceBetween={20}
					breakpoints={{
						480: {
							slidesPerView: 2,
							spaceBetween: 20,
						},
						768: {
							slidesPerView: 3,
							spaceBetween: 25,
						},
						1024: {
							slidesPerView: 4,
							spaceBetween: 30,
						},
						1280: {
							slidesPerView: 5,
							spaceBetween: 35,
						},
					}}
					loop={true}
					navigation={{
						nextEl: ".swiper-button-n",
						prevEl: ".swiper-button-p",
					}}
					modules={[Navigation, Autoplay]}
					autoplay={{
						delay: 3000,
						disableOnInteraction: false,
					}}
					className="mySwiper">
					{services.map((service, index) => (
						<SwiperSlide key={index} className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ">
							<img src={service.img} alt={service.title} className="w-full h-52 rounded-2xl  object-cover transform  transition-all duration-300" />
							<h4 className="font-medium text-center py-3 font-author">{service.title}</h4>
						</SwiperSlide>
					))}
				</Swiper>

				{/* Custom Navigation Buttons */}
				<div className="flex justify-between mt-4">
					<button className="swiper-button-p px-4 py-2 bg-dark text-white rounded-full  cursor-pointer">
						<FaArrowLeftLong className="fill-white" />
					</button>
					<button className="swiper-button-n px-4 py-2 bg-dark text-white rounded-full  cursor-pointer">
						<FaArrowRightLong className="fill-white" />
					</button>
				</div>
			</div>
		</section>
	);
};

export default Services;
