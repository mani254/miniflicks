import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { connect } from "react-redux";
import { addCake, updateCake } from "../../redux/cake/cakeActions";
import { showNotification } from "../../redux/notification/notificationActions";

import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";

function AddCake({ addCake, update = false, updateCake, showNotification }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const { cakeData } = useOutletContext();
	const [loadedImages, setLoadedImages] = useState();

	const [details, setDetails] = useState({
		name: "",
		price: "",
		position: 0,
		image: "",
		special: false,
		specialPrice: "",
	});

	useEffect(() => {
		if (update) {
			const currentCake = cakeData.cakes.find((cake) => cake._id === id);
			if (!currentCake) return;
			setDetails(currentCake);
			setLoadedImages([currentCake.image]);
		}
	}, [cakeData.cakes, update, id]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setDetails((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!details.image) {
			showNotification("Image is required.");
			return;
		}

		const cakeData = new FormData();
		cakeData.append("name", details.name);
		cakeData.append("price", details.price);
		cakeData.append("image", details.image);
		cakeData.append("position", details.position);
		cakeData.append("special", details.special);
		if (details.special) {
			cakeData.append("specialPrice", details.specialPrice);
		}

		if (update) {
			try {
				await updateCake(id, cakeData);
				navigate("/admin/cakes");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addCake(cakeData);
				navigate("/admin/cakes");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Cake" : "Add Cake"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="outer-box w-full">
						<h4 className="mb-3">Cake Info</h4>
						<div className="input-wrapper">
							<label htmlFor="name">Name</label>
							<input type="text" id="name" name="name" placeholder="Cake Name" value={details.name} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="price">Price</label>
							<input type="number" id="price" name="price" placeholder="Cake Price" value={details.price} onChange={handleChange} required min={0} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="position">Position</label>
							<input type="number" id="position" name="position" placeholder="Cake Position" value={details.position} onChange={handleChange} required min={0} />
						</div>
						<div className="input-wrapper checkbox flex items-center gap-2">
							<input type="checkbox" id="special" name="special" checked={details.special} onChange={handleChange} />
							<label htmlFor="special">Special Cake</label>
							<p className="text-gray-400">(* select if it is a special cake)</p>
						</div>
						{details.special && (
							<div className="input-wrapper">
								<label htmlFor="specialPrice">Special Price</label>
								<input type="number" id="specialPrice" name="specialPrice" placeholder="Special Cake Price" value={details.specialPrice} onChange={handleChange} required min={0} />
							</div>
						)}
					</div>
					<div className="outer-box w-1/3 min-w-[320px]">
						<h4 className="mb-3">Image</h4>
						<div className="mb-3">
							<p className="mb-2">Cake Image</p>
							{update ? (
								<ImageUploaderComponent
									id="cake-image"
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
							{update ? "Update Cake" : "Add Cake"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => ({
	addCake: (details) => dispatch(addCake(details)),
	updateCake: (cakeId, cakeData) => dispatch(updateCake(cakeId, cakeData)),
	showNotification: (message) => dispatch(showNotification(message)),
});

export default connect(null, mapDispatchToProps)(AddCake);
