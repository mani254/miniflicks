import React from "react";

import Services from "../components/Home/Services";
import About from "../components/Home/About";
import Cta from "../components/Home/Cta-1";
import Banners from "../components/Home/Banners";
import Amenities from "../components/Home/Aminities";
import { Helmet } from "react-helmet-async";

function Home() {
	return (
		<>
			<Helmet>
				<meta name="description" content="Miniflicks is a private theatre where you can watch your favorite content with your loved ones. Enjoy a luxurious experience with a 150-inch screen, Dolby Atmos, and plush seating. Celebrate birthdays, anniversaries, and parties with customized decor." />
				<meta name="keywords" content="Miniflicks, private theatre, movie night, luxurious theatre, birthday party venue, Dolby Atmos, customized celebrations" />
				<meta property="og:title" content="Miniflicks | Your Private Theatre Experience" />
				<meta property="og:description" content="Experience Miniflicks, a luxurious private theatre with Dolby Atmos, a 150-inch screen, and customized celebrations." />
				<meta property="og:image" content="https://miniflicks.in/decoration.webp" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://miniflicks.in" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Miniflicks | Your Private Theatre Experience" />
				<meta name="twitter:description" content="Enjoy a private theatre experience with Miniflicks, perfect for movies and special occasions." />
				<meta name="twitter:image" content="https://miniflicks.in/assets/decoration.webp" />
			</Helmet>
			<div className="home">
				<Banners />
				<About />
				<Cta />
				<Amenities />
				<Services />
			</div>
		</>
	);
}

export default Home;
