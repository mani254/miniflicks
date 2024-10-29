import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { connect } from "react-redux";
import { addOccasion, updateOccasion } from "../../redux/occasion/occasionActions"; // Adjust import for occasion actions
import { showNotification } from "../../redux/notification/notificationActions";

import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";

function AddOccasion({ addOccasion, update = false, updateOccasion, showNotification }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const { occasionData } = useOutletContext();
	const [loadedImages, setLoadedImages] = useState();

	const [details, setDetails] = useState({
		name: "",
		description: "",
		price: "",
		position: 0,
		image: "",
	});

	useEffect(() => {
		if (update) {
			const currentOccasion = occasionData.occasions.find((occasion) => occasion._id === id);
			if (!currentOccasion) return;
			setDetails(currentOccasion);
			setLoadedImages([currentOccasion.image]);
		}
	}, [occasionData.occasions, update, id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDetails((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (details.image === "" || details.image === undefined) {
			showNotification("Image is required.");
			return;
		}

		const occasionData = new FormData();
		occasionData.append("name", details.name);
		occasionData.append("description", details.description);
		occasionData.append("price", details.price);
		occasionData.append("image", details.image);
		occasionData.append("position", details.position);

		if (update) {
			try {
				await updateOccasion(id, occasionData);
				navigate("/admin/occasions");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addOccasion(occasionData);
				navigate("/admin/occasions");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Occasion" : "Add Occasion"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="outer-box w-full">
						<h4 className="mb-3">Occasion Info</h4>
						<div className="input-wrapper">
							<label htmlFor="name">Name</label>
							<input type="text" id="name" name="name" placeholder="Occasion Name" value={details.name} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="description">Description</label>
							<textarea id="description" name="description" placeholder="Occasion Description" value={details.description} onChange={handleChange} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="price">Price</label>
							<input type="number" id="price" name="price" placeholder="Occasion Price" value={details.price} onChange={handleChange} required min={0} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="position">Position</label>
							<input type="number" id="position" name="position" placeholder="Occasion position" value={details.position} onChange={handleChange} required min={0} />
						</div>
					</div>
					<div className="outer-box w-1/3 min-w-[320px]">
						<h4 className="mb-3">Image</h4>
						<div className="mb-3">
							<p className="mb-2">Occasion Image</p>
							{update ? (
								<ImageUploaderComponent
									id="occasion-image"
									maxImages={1}
									onImagesChange={(images) => {
										setDetails((prev) => ({ ...prev, image: images[0] }));
									}}
									loadedImages={loadedImages ? loadedImages : []}
								/>
							) : (
								<ImageUploaderComponent
									id="occasion-image"
									maxImages={1}
									onImagesChange={(images) => {
										setDetails((prev) => ({ ...prev, image: images[0] }));
									}}
								/>
							)}
						</div>

						<button className="btn btn-1" type="submit">
							{update ? "Update Occasion" : "Add Occasion"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addOccasion: (details) => dispatch(addOccasion(details)), // Adjust based on your action creator
		updateOccasion: (occasionId, occasionData) => dispatch(updateOccasion(occasionId, occasionData)), // Adjust based on your action creator
		showNotification: (message) => dispatch(showNotification(message)),
	};
};

export default connect(null, mapDispatchToProps)(AddOccasion);
