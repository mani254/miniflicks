import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { connect } from "react-redux";
import { addGift, updateGift } from "../../redux/gift/giftActions";
import { showNotification } from "../../redux/notification/notificationActions";
import Loader from "../Loader/Loader";
import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";

function AddGift({ addGift, update = false, updateGift, showNotification }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const { giftsData } = useOutletContext();
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
			const currentGift = giftsData.gifts.find((gift) => gift._id === id);
			if (!currentGift) return;
			setDetails(currentGift);
			setLoadedImages([currentGift.image]);
		}
	}, [giftsData.gifts, update, id]);

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

		const giftsData = new FormData();
		giftsData.append("name", details.name);
		giftsData.append("description", details.description);
		giftsData.append("price", details.price);
		giftsData.append("status", details.status);
		giftsData.append("image", details.image);
		giftsData.append("position", details.position);

		if (update) {
			try {
				await updateGift(id, giftsData);
				navigate("/admin/gifts");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addGift(giftsData);
				navigate("/admin/gifts");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<>
		{giftsData.loading&&<div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-10">
			<Loader></Loader>
		</div>}
		
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Gift" : "Add Gift"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="outer-box w-full">
						<h4 className="mb-3">Gift Info</h4>
						<div className="input-wrapper">
							<label htmlFor="name">Name</label>
							<input type="text" id="name" name="name" placeholder="Gift Name" value={details.name} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="description">Description</label>
							<textarea id="description" name="description" placeholder="Gift Description" value={details.description} onChange={handleChange} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="price">Price</label>
							<input type="number" id="price" name="price" placeholder="Gift Price" value={details.price} onChange={handleChange} required min={0} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="position">Position</label>
							<input type="number" id="position" name="position" placeholder="Gift Position" value={details.position} onChange={handleChange} required min={0} />
						</div>
					</div>
					<div className="outer-box w-1/3 min-w-[320px]">
						<h4 className="mb-3">Image</h4>
						<div className="mb-3">
							<p className="mb-2">Gift Image</p>
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
							{update ? "Update Gift" : "Add Gift"}
						</button>
					</div>
				</div>
			</form>
		</div>
		</>
		
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addGift: (details) => dispatch(addGift(details)),
		updateGift: (giftId, giftsData) => dispatch(updateGift(giftId, giftsData)),
		showNotification: (message) => dispatch(showNotification(message)),
	};
};

export default connect(null, mapDispatchToProps)(AddGift);
