import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { connect } from "react-redux";
import { addBanner, updateBanner } from "../../redux/banner/bannerActions";

import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";

function AddBanner({ addBanner, update = false, updateBanner }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const bannersData = useOutletContext();
	const [loadedImages, setLoadedImages] = useState();

	const [details, setDetails] = useState({
		title: "",
		description: "",
		link: "",
		image: "",
		status: true,
		position: 0,
	});

	useEffect(() => {
		if (update) {
			const currentBanner = bannersData.banners.find((banner) => banner._id === id);
			if (!currentBanner) return;
			setDetails(currentBanner);
			setLoadedImages([currentBanner.image]);
		}
	}, [bannersData.banners, update, id]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setDetails((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const isEmpty = Object.values(details).some((value) => value === "" || value === undefined);

		if (isEmpty) {
			return;
		}

		const bannerData = new FormData();
		bannerData.append("title", details.title);
		bannerData.append("description", details.description);
		bannerData.append("position", details.position);
		bannerData.append("link", details.link);
		bannerData.append("status", details.status);
		bannerData.append("image", details.image);

		if (update) {
			try {
				await updateBanner(id, bannerData);
				navigate("/admin/banners");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addBanner(bannerData);
				navigate("/admin/banners");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Banner" : "Add Banner"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="outer-box w-full">
						<h4 className="mb-3">Banner Info</h4>
						<div className="input-wrapper">
							<label htmlFor="title">Title</label>
							<input type="text" id="title" name="title" placeholder="Banner Title" value={details.title} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="description">Description</label>
							<textarea id="description" name="description" placeholder="Banner Description" value={details.description} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="link">Link</label>
							<input type="url" id="link" name="link" placeholder="Banner Link" value={details.link} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="position">Position</label>
							<input type="number" id="position" name="position" placeholder="Banner Position" value={details.position} onChange={handleChange} required min={0} />
						</div>
					</div>
					<div className="outer-box w-1/3 min-w-[320px] ">
						<h4 className="mb-3">Status & Location Image</h4>

						<div className="input-wrapper">
							<label htmlFor="status">Status</label>
							<select id="status" name="status" value={details.status} onChange={handleChange} required>
								<option value="true">Active</option>
								<option value="false">Inactive</option>
							</select>
						</div>
						<div className="mb-3">
							<p className="mb-2">Location Image</p>
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
							{update ? "Update Banner" : "Add Banner"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addBanner: (details) => dispatch(addBanner(details)),
		updateBanner: (bannerId, bannerData) => dispatch(updateBanner(bannerId, bannerData)),
	};
};

export default connect(null, mapDispatchToProps)(AddBanner);
