import React, { useState, useEffect } from "react";
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import galleryImages from "../utils/gallery";

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
	);
}

export default GalleryPage;
