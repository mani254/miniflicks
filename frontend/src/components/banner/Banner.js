import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';
import './Banner.css'
import { Navigation, Pagination, A11y } from 'swiper/modules';


const banners=[{
   heading:'This is the Headding',
   description:'This is the Description',
   image:'assets/private'
}]

function Banner() {
   return (
      <section className='banner-section'>
         <Swiper
            modules={[Navigation, Pagination, A11y]}
            spaceBetween={50}
            slidesPerView={1} // One slide per view
            effect="fade" // Fade effect
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }} // Auto-scroll
            loop={true}
            navigation={{
               nextEl: '.slider-button-next',
               prevEl: '.slider-button-prev',
            }}
         >
            <SwiperSlide><div className='banner-1 banner background-cover'></div></SwiperSlide>
            <SwiperSlide>Slide 2</SwiperSlide>
            <SwiperSlide>Slide 3</SwiperSlide>
            <SwiperSlide>Slide 4</SwiperSlide>
         </Swiper>
         {/* Custom navigation buttons */}
         <div className="swiper-button-prev">Previous</div>
         <div className="swiper-button-next">Next</div>
      </section>
   )
}

export default Banner;
