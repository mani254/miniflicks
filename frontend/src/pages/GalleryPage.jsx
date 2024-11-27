import React, { useState, useEffect } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import galleryImages from "../utils/gallery";
import { Helmet } from "react-helmet-async";

function GalleryPage() {
	const [activeType, setActiveType] = useState("All");

	// Image Array
	const images = galleryImages;

	// Extract unique types
	const types = ["All", ...new Set(images.map((img) => img.type))];

	// Filter images by type
	const filteredImages = activeType === "All" ? images : images.filter((img) => img.type === activeType);

	// Re-initialize Fancybox on image change
	useEffect(() => {
		Fancybox.bind("[data-fancybox='gallery']", {});
		return () => {
			Fancybox.destroy();
		};
	}, [filteredImages]);

	return (
		<>
			<Helmet>
				<title>Miniflicks Gallery | Explore Our Private Theatre</title>
				<meta name="description" content="Browse our gallery to see the luxury and ambiance of Miniflicks. A perfect venue for private movie nights, birthdays, and celebrations." />
				<meta name="keywords" content="Miniflicks gallery, private theatre pictures, party venue gallery, luxury theatre images" />
				<meta property="og:title" content="Miniflicks Gallery | Explore Our Private Theatre" />
				<meta property="og:description" content="See images of our private theatre and party setups." />
				<meta property="og:image" content="https://miniflicks.in/description.webp" />
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://miniflicks.in/gallery" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:title" content="Miniflicks Gallery | Explore Our Private Theatre" />
				<meta name="twitter:description" content="Check out images of Miniflicks, a private theatre perfect for celebrations and movie nights." />
				<meta name="twitter:image" content="https://miniflicks.in/description.webp" />
			</Helmet>
			<div className="p-4 container">
				<h1 className="text-center text-xl font-medium font-ks mb-5">CheckOut Our Gallery</h1>

				{/* Tabs */}
				<div className="flex justify-center gap-4 mb-6 flex-wrap">
					{types.map((type) => (
						<button key={type} onClick={() => setActiveType(type)} className={`px-4 py-1 rounded-2xl ${activeType === type ? "bg-gradient-primary text-white" : " border border-dark"}`}>
							{type}
						</button>
					))}
				</div>

				{/* Gallery */}
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
					{filteredImages.map((img, index) => (
						<a key={index} data-fancybox="gallery" data-src={img.image} href={img.image} className="block bg-gray-100 p-1 rounded-lg shadow hover:shadow-lg">
							<img src={img.image} alt={`Gallery Miniflicks ${img.type}`} className="w-full h-full object-cover object-center rounded aspect-square" loading="lazy" />
						</a>
					))}
				</div>
			</div>
		</>
	);
}

export default GalleryPage;
