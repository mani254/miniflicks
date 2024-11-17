import React, { useEffect } from "react";

import { NavLink } from "react-router-dom";
import Services from "../components/Home/Services";
import About from "../components/Home/About";
import Cta from "../components/Home/Cta-1";
import VideoSection from "../components/Home/VideoSection";
import Banners from "../components/Home/Banners";
import Amenities from "../components/Home/Aminities";

function Home() {
	return (
		<div className="home">
			<Banners />
			<About />
			<Cta />
			<Amenities />
			{/* <VideoSection /> */}
			<Services />
		</div>
	);
}

export default Home;
