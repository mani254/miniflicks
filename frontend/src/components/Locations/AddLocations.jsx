import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { validation } from "../../utils";
import CityOptions from "../Cities/CityOptions";

import { connect } from "react-redux";
import { addLocation, updateLocation } from "../../redux/location/locationActions";
import AddonsList from "../Addon/AddonsList";
import GiftsList from "../Gift/GiftsList";

import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";

function AddLocations({ addLocation, update = false, updateLocation }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const locationsData = useOutletContext();

	const [details, setDetails] = useState({
		name: "",
		address: "",
		addressLink: "",
		cityId: "",
		admin: {
			name: "",
			email: "",
			number: "",
			password: "",
		},
		image: "",
		status: true,
	});

	const [selectedAddons, setSelectedAddons] = useState([]);
	const [selectedGifts, setSelectedGifts] = useState([]);

	const [loadedImages, setLoadedImages] = useState([]);
	const [errors, setErrors] = useState({
		name: "",
		address: "",
		addressLink: "",
		admin: {
			name: "",
			email: "",
			number: "",
			password: "",
		},
	});

	useEffect(() => {
		if (update) {
			const currentLocation = locationsData.locations.find((location) => location._id === id);
			if (!currentLocation) return;
			currentLocation.admin.password = "";
			if (currentLocation.city?._id) {
				currentLocation.cityId = currentLocation.city._id;
			}
			setDetails(currentLocation);
			setLoadedImages([currentLocation.image]);
			setSelectedAddons(currentLocation.addons || []);
			setSelectedGifts(currentLocation.gifts || []);
		}
	}, [update, id, locationsData.locations]);

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		if (name.startsWith("admin.")) {
			const adminField = name.split(".")[1];
			setDetails((prev) => ({
				...prev,
				admin: {
					...prev.admin,
					[adminField]: value,
				},
			}));
		} else {
			setDetails((prev) => ({
				...prev,
				[name]: value,
			}));
		}

		const error = validation(name, value);
		setErrors((prevState) => {
			if (name.startsWith("admin.")) {
				const adminField = name.split(".")[1];
				return {
					...prevState,
					admin: {
						...prevState.admin,
						[adminField]: error,
					},
				};
			} else {
				return {
					...prevState,
					[name]: error,
				};
			}
		});
	}, []);

	const handleAddonsChange = useCallback((addonId, isChecked) => {
		setSelectedAddons((prev) => {
			if (isChecked) {
				return [...prev, addonId];
			} else {
				return prev.filter((id) => id !== addonId);
			}
		});
	}, []);

	const handleGiftsChange = useCallback((addonId, isChecked) => {
		setSelectedGifts((prev) => {
			if (isChecked) {
				return [...prev, addonId];
			} else {
				return prev.filter((id) => id !== addonId);
			}
		});
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!details.cityId) {
			return;
		}

		const hasErrors = Object.values(errors).some((error) => (typeof error === "object" ? Object.values(error).some((fieldError) => fieldError !== "") : error !== ""));
		if (hasErrors) {
			alert("Please fix the errors before submitting.");
			return;
		}

		const locationData = new FormData();
		locationData.append("name", details.name);
		locationData.append("address", details.address);
		locationData.append("addressLink", details.addressLink);
		locationData.append("status", details.status);
		locationData.append("cityId", details.cityId);
		locationData.append("image", details.image);
		locationData.append("admin[name]", details.admin.name);
		locationData.append("admin[email]", details.admin.email);
		locationData.append("admin[number]", details.admin.number);
		locationData.append("admin[password]", details.admin.password);
		locationData.append("addons", JSON.stringify(selectedAddons));
		locationData.append("gifts", JSON.stringify(selectedGifts));

		if (update) {
			try {
				await updateLocation(id, locationData);
				navigate("/admin/locations");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addLocation(locationData);
				navigate("/admin/locations");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Location" : "Add Location"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="w-full">
						<div className="outer-box">
							<h4 className="mb-3">Location Info</h4>
							<div className="input-wrapper">
								<label htmlFor="name">Name</label>
								<input type="text" id="name" name="name" placeholder="Location Name" value={details.name} onChange={handleChange} required />
								{errors.name && <p className="error">{errors.name}</p>}
							</div>
							<div className="input-wrapper">
								<label htmlFor="addressLink">Address</label>
								<input type="text" id="addressLink" name="addressLink" placeholder="Location Address" value={details.addressLink} onChange={handleChange} required />
							</div>
							<div className="input-wrapper">
								<label htmlFor="address">Address map link</label>
								<input type="text" id="address" name="address" placeholder="Address Map Link" value={details.address} onChange={handleChange} />
							</div>
						</div>
						<div className="outer-box">
							<h4 className="mb-3">Admin Info</h4>
							<div className="flex gap-5">
								<div className="input-wrapper w-full">
									<label htmlFor="adminName">Name</label>
									<input type="text" id="adminName" name="admin.name" placeholder="Admin Name" value={details.admin.name} onChange={handleChange} required />
									{errors.admin.name && <p className="error">{errors.admin.name}</p>}
								</div>
								<div className="input-wrapper w-full">
									<label htmlFor="adminEmail">Email</label>
									<input type="email" id="adminEmail" name="admin.email" placeholder="Admin Email" value={details.admin.email} onChange={handleChange} required />
									{errors.admin.email && <p className="error">{errors.admin.email}</p>}
								</div>
							</div>
							<div className="flex gap-5">
								<div className="input-wrapper w-full">
									<label htmlFor="adminNumber">Number</label>
									<input type="number" id="adminNumber" name="admin.number" placeholder="Admin Phone Number" value={details.admin.number} onChange={handleChange} required />
									{errors.admin.number && <p className="error">{errors.admin.number}</p>}
								</div>
								<div className="input-wrapper w-full">
									<label htmlFor="adminPassword">Password</label>
									<input type="password" id="adminPassword" name="admin.password" placeholder="Admin Password" value={details.admin.password} onChange={handleChange} required={update ? false : true} />
									{errors.admin.password && <p className="error">{errors.admin.password}</p>}
								</div>
							</div>
						</div>
						<div className="outer-box">
							<h3 className="mb-3">Add Ons</h3>
							<AddonsList checkedValues={selectedAddons} handleChange={handleAddonsChange} />
						</div>
						<div className="outer-box">
							<h3 className="mb-3">Add Ons</h3>
							<GiftsList checkedValues={selectedGifts} handleChange={handleGiftsChange} />
						</div>
					</div>

					<div className="outer-box w-1/3 min-w-[320px] flex flex-col justify-between">
						<div>
							<h4 className="mb-3">Status & Location Image</h4>

							<CityOptions value={details.cityId} changeHandler={handleChange} />

							<div className="input-wrapper">
								<label htmlFor="status">Status</label>
								<select id="status" name="status" value={details.status} onChange={handleChange}>
									<option value={true}>Active</option>
									<option value={false}>In Active</option>
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
						</div>

						<button type="submit" className="btn btn-1">
							{update ? "Update Location" : "Add Location"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addLocation: (details) => dispatch(addLocation(details)),
		updateLocation: (locationId, locationData) => dispatch(updateLocation(locationId, locationData)),
	};
};

export default connect(null, mapDispatchToProps)(AddLocations);
