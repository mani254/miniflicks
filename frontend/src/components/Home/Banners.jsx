import React, { useState, useEffect, useRef } from "react";
import "./Banners.css";
import { connect } from "react-redux";
import Loader from "../Loader/Loader";
import { gsap } from "gsap";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCoverflow } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import "swiper/css/effect-coverflow";

function Banners({ bannersData }) {
	const [banner, setBanner] = useState({
		image: "",
		title: "",
		description: "",
		link: "",
	});

	const bannerRef = useRef(null);
	const titleRef = useRef(null);
	const descriptionRef = useRef(null);
	const buttonRef = useRef(null);

	const [activeIndex, setActiveIndex] = useState(0);

	useEffect(() => {
		if (banner.image) {
			const timeline = gsap.timeline();

			timeline.to(bannerRef.current, { opacity: 0, duration: 0 }).to(bannerRef.current, { opacity: 1, duration: 0.5 }).fromTo(titleRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 }).fromTo(descriptionRef.current, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3").fromTo(buttonRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3");
		}
	}, [banner]);

	return (
		<section className="banner">
			<div className="swiper-3">
				{bannersData.loading ? (
					<div className="h-96 relative">
						<Loader />
					</div>
				) : (
					bannersData.banners.length > 0 && (
						<div className="h-screen max-h-[760px] relative">
							<div className="h-screen max-h-[760px] w-full container pt-[100px]">
								<div className="banner-image-wrapper absolute w-full h-full inset-0">
									<img className="w-full h-full object-cover" src={banner.image} ref={bannerRef} alt="miniflicks banner image" />
								</div>
								<div className=" w-full max-w-[500px] relative z-[2] space-y-6">
									<h2 className="text-white text-center md:text-start text-xl md:text-2xl" ref={titleRef}>
										{banner.title}
									</h2>
									<p className="text-white text-md md:text-lg text-center md:text-start" ref={descriptionRef}>
										{banner.description}
									</p>
									<button className="btn-4 btn-white block m-auto md:m-0" ref={buttonRef}>
										Book Now
									</button>
								</div>
							</div>

							{/* Thumbs Swiper */}
							<div className="absolute w-full md:max-w-3xl bottom-0 lg:bottom-5 xl:bottom-12 right-0 py-4 px-2  bg-black bg-opacity-10  backdrop-blur-xs rounded-2xl overflow-hidden">
								<Swiper
									effect="coverflow"
									grabCursor={true}
									centeredSlides={true}
									initialSlide={2}
									speed={600}
									slidesPerView={window.innerWidth > 600 ? 4 : "auto"}
									spaceBetween={20}
									coverflowEffect={{
										rotate: 0,
										stretch: 20,
										depth: 80,
										modifier: 1,
										slideShadows: true,
									}}
									loop={true}
									autoplay={{ delay: 4000 }}
									onSlideChange={(swiper) => {
										setActiveIndex(swiper.activeIndex);
										setBanner(bannersData.banners[swiper.realIndex]);
									}}
									modules={[EffectCoverflow, Autoplay]}>
									{bannersData.banners.map((banner, index) => (
										<SwiperSlide key={index}>
											<div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden">
												<img src={banner.image} alt={`Thumbnail ${index + 1}`} className="absolute inset-0 w-full h-full object-cover z-[1]" />
												<h2 className="absolute py-3 w-full text-sm z-[2] text-white font-ks left-1/2 bottom-0 text-center  -translate-x-1/2 bg-gradient-to-t from-black to-transparent">{banner.title}</h2>
											</div>
										</SwiperSlide>
									))}
								</Swiper>
							</div>
						</div>
					)
				)}
			</div>
		</section>
	);
}

const mapStateToProps = (state) => {
	return {
		bannersData: state.banners,
	};
};

export default connect(mapStateToProps, null)(Banners);
