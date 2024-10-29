import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Autoplay } from "swiper/modules";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

import { connect } from "react-redux";
import { BsFillPeopleFill } from "react-icons/bs";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import "swiper/css/autoplay";

import { star } from "../../utils";

function ScreenInfo({ customerBooking, screensData }) {
	const [thumbsSwiper, setThumbsSwiper] = useState(null);
	const [screen, setScreen] = useState("");

	useEffect(() => {
		const currentScreen = screensData.screens.find((screen) => screen._id == customerBooking.screen);
		setScreen(currentScreen);
	}, [customerBooking.screen, screensData.screens]);

	return (
		<div>
			{screen && (
				<>
					<div className="swiper-1 mt-3 w-full m-auto relative">
						<Swiper
							spaceBetween={10}
							slidesPerView={1}
							navigation={{
								nextEl: ".custom-next",
								prevEl: ".custom-prev",
							}}
							thumbs={{ swiper: thumbsSwiper }}
							autoplay={{ delay: 3000, disableOnInteraction: false }}
							modules={[Navigation, Thumbs, Autoplay]}
							loop={true}>
							{screen.images.map((img, index) => (
								<SwiperSlide key={index}>
									<img src={img} alt={`Slide ${index + 1}`} className="w-full object-cover" />
								</SwiperSlide>
							))}
						</Swiper>
						<div className="absolute top-1/2 left-4 transform -translate-y-1/2 z-10">
							<button className="custom-prev w-9 h-9 bg-bright flex items-center justify-center rounded-full">
								<div className="icon">
									<FaAngleLeft className="text-lg" />
								</div>
							</button>
						</div>
						<div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10">
							<button className="custom-next w-9 h-9 bg-bright flex items-center justify-center rounded-full">
								<div className="icon">
									<FaAngleRight className="text-lg" />
								</div>
							</button>
						</div>
					</div>

					<div className="swiper-thumbs mt-[10px]  w-full max-w-[95%] m-auto relative">
						<Swiper onSwiper={setThumbsSwiper} spaceBetween={10} slidesPerView={4} freeMode={true} watchSlidesProgress={true} modules={[Thumbs]}>
							{screen.images.map((img, index) => (
								<SwiperSlide key={index}>
									<img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover cursor-pointer aspect-[16/9]" />
								</SwiperSlide>
							))}
						</Swiper>
					</div>

					<div className="screen-content mt-4">
						<div className="flex items-center gap-5">
							<div className="w-full h-[2px] bg-bright"></div>
							<h2 className="whitespace-nowrap">{screen.name}</h2>
							<div className="w-full h-[2px] bg-bright"></div>
						</div>
						<div className="flex gap-x-3 items-center mt-3 flex-wrap">
							<BsFillPeopleFill />
							<p className="whitespace-nowrap">Capacity: {screen.capacity} people</p>
							{screen.minPeople != screen.capacity && (
								<p className="font-light">
									( * Additional charge of {screen.extraPersonPrice} per person for any number exceeding {screen.minPeople} people)
								</p>
							)}
						</div>
						<p className="mt-3">{screen.description}</p>

						<div className="mt-3">
							<h4>Features</h4>
							<ul className="">
								{screen.specifications.map((spec, index) => {
									return (
										<li key={index} className="flex gap-3 mt-1">
											<img className="w-6 h-6" src={star} alt="Star Image 3d" />
											{spec}
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		screensData: state.screens,
		customerBooking: state.customerBooking,
	};
};

export default connect(mapStateToProps, null)(ScreenInfo);
