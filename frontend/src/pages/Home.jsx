import React from "react";

import { NavLink } from "react-router-dom";
import Services from "../components/Home/Services";
import About from "../components/Home/About";
import Cta from "../components/Home/Cta-1";
import VideoSection from "../components/Home/VideoSection";
import Banners from "../components/Home/Banners";

function Home() {
	return (
		<div className="home">
			<Banners />
			<About />
			<Cta />
			<VideoSection />
			<Services />
		</div>
	);
}

export default Home;
