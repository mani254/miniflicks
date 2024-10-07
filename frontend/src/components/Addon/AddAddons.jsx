import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { connect } from "react-redux";
import { addAddon, updateAddon } from "../../redux/addon/addonActions";
import { showNotification } from "../../redux/notification/notificationActions";

import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";

function AddAddon({ addAddon, update = false, updateAddon, showNotification }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const addonsData = useOutletContext();
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
			const currentAddon = addonsData.addons.find((addon) => addon._id === id);
			if (!currentAddon) return;
			setDetails(currentAddon);
			setLoadedImages([currentAddon.image]);
		}
	}, [addonsData.addons, update, id]);

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

		const addonData = new FormData();
		addonData.append("name", details.name);
		addonData.append("description", details.description);
		addonData.append("price", details.price);
		addonData.append("image", details.image);
		addonData.append("position", details.position);

		if (update) {
			try {
				await updateAddon(id, addonData);
				navigate("/admin/addons");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addAddon(addonData);
				navigate("/admin/addons");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Addon" : "Add Addon"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="outer-box w-full">
						<h4 className="mb-3">Addon Info</h4>
						<div className="input-wrapper">
							<label htmlFor="name">Name</label>
							<input type="text" id="name" name="name" placeholder="Addon Name" value={details.name} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="description">Description</label>
							<textarea id="description" name="description" placeholder="Addon Description" value={details.description} onChange={handleChange} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="price">Price</label>
							<input type="number" id="price" name="price" placeholder="Addon Price" value={details.price} onChange={handleChange} required min={0} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="position">Position</label>
							<input type="number" id="position" name="position" placeholder="Addon position" value={details.position} onChange={handleChange} required min={0} />
						</div>
					</div>
					<div className="outer-box w-1/3 min-w-[320px]">
						<h4 className="mb-3">Image</h4>
						<div className="mb-3">
							<p className="mb-2">Addon Image</p>
							{update ? (
								<ImageUploaderComponent
									id="location-image"
									maxImages={1}
									onImagesChange={(images) => {
										setDetails((prev) => ({ ...prev, image: images[0] }));
									}}
									loadedImages={loadedImages ? loadedImages : []}
								/>
							) : (
								<ImageUploaderComponent
									id="location-image"
									maxImages={1}
									onImagesChange={(images) => {
										setDetails((prev) => ({ ...prev, image: images[0] }));
									}}
								/>
							)}
						</div>

						<button className="btn btn-1" type="submit">
							{update ? "Update Addon" : "Add Addon"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addAddon: (details) => dispatch(addAddon(details)), // Adjust based on your action creator
		updateAddon: (addonId, addonData) => dispatch(updateAddon(addonId, addonData)), // Adjust based on your action creator
		showNotification: (message) => dispatch(showNotification(message)),
	};
};

export default connect(null, mapDispatchToProps)(AddAddon);
