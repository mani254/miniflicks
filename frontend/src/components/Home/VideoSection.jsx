import React from "react";

function VideoSection() {
	return (
		<section className="py-14">
			<div className="container flex">
				<div className="w-1/4"></div>
				<div className=" w-2/4 max-w-[600px] aspect-video bg-green-300 rounded-xl"></div>
				<div className="w-1/4"></div>
			</div>
		</section>
	);
}

export default VideoSection;
