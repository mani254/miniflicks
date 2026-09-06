import React from "react";
import { Outlet } from "react-router-dom";
import { Helmet } from "react-helmet-async";

function BookingLayout() {
	return (
		<>
			<Helmet>
				<title>Book Miniflicks | Your Private Theatre Awaits</title>
				<meta name="description" content="Reserve Miniflicks for an exclusive private theatre experience. Check availability and book for movie nights, parties, birthdays, and customized celebrations with ease." />
				<meta name="keywords" content="book Miniflicks, private theatre booking, movie night reservations, luxury theatre rental, party venue booking, customized celebrations" />
				<meta property="og:title" content="Book Miniflicks | Your Private Theatre Awaits" />
				<meta property="og:description" content="Secure your private theatre experience at Miniflicks. Book for birthdays, parties, or movie nights with personalized themes and luxury amenities." />
				<meta property="og:image" content="https://miniflicks.in/decoration.webp" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://miniflicks.in/booking/locations" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Book Miniflicks | Your Private Theatre Awaits" />
				<meta name="twitter:description" content="Reserve Miniflicks for an unforgettable private theatre experience. Perfect for celebrations and movie nights with Dolby Atmos and luxurious seating." />
				<meta name="twitter:image" content="https://miniflicks.in/decoration.webp" />
			</Helmet>
			<div className="container m-auto max-w-[1350px]">
				<Outlet />
			</div>
		</>
	);
}

export default BookingLayout;
