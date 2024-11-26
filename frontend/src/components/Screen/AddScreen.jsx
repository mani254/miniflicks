import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import LocationOptions from "../Locations/LocationOptions";
import { MdDelete } from "react-icons/md";

import { connect } from "react-redux";
import { addScreen, updateScreen } from "../../redux/screen/screenActions";
import { ImageUploaderComponent } from "editorify-dev/imageUploader";
import "editorify-dev/css/imageUploader";
import PackageForm from "./Packages";

function AddScreens({ addScreen, update = false, updateScreen }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const screensData = useOutletContext();

	const [specifications, setSpecifications] = useState([""]);
	const [slots, setSlots] = useState([
		{
			from: "",
			to: "",
		},
	]);

	const [details, setDetails] = useState({
		name: "",
		capacity: "",
		minPeople: "",
		extraPersonPrice: "",
		description: "",
		location: "",
		images: "",
		status: true,
	});
	const [loadedImages, setLoadedImages] = useState([]);

	const [packages, setPackages] = useState([
		{
			name: "",
			price: 0,
			customPrice: [],
			addons: [],
		},
	]);

	useEffect(() => {
		if (update) {
			const currentScreen = screensData.screens.find((screen) => screen._id === id);
			console.log(currentScreen);
			if (!currentScreen) return;
			setDetails({
				name: currentScreen.name,
				capacity: currentScreen.capacity,
				minPeople: currentScreen.minPeople,
				extraPersonPrice: currentScreen.extraPersonPrice,
				description: currentScreen.description,
				location: currentScreen.location._id,
				images: currentScreen.images,
				status: currentScreen.status,
			});
			setLoadedImages(currentScreen.images);
			setSpecifications(currentScreen.specifications);
			setPackages(currentScreen.packages);
			setSlots(currentScreen.slots);
		}
	}, [update, id, screensData.screens]);

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setDetails((prev) => ({
			...prev,
			[name]: value,
		}));
	}, []);

	const handleSpecificationChange = useCallback((e, index) => {
		const value = e.target.value;
		setSpecifications((prevSpecs) => {
			const updatedSpecs = [...prevSpecs];
			updatedSpecs[index] = value;
			return updatedSpecs;
		});
	}, []);

	const handleSlotChange = useCallback((e, index) => {
		const { name, value } = e.target;
		setSlots((prevSlots) => {
			const updatedSlots = [...prevSlots];
			updatedSlots[index][name] = value;
			return updatedSlots;
		});
	}, []);
	const handleDeleteSpecification = useCallback((index) => {
		setSpecifications((prevSpecs) => prevSpecs.filter((_, i) => i !== index));
	}, []);

	const handleDeleteSlot = useCallback((index) => {
		setSlots((prevSlots) => prevSlots.filter((_, i) => i !== index));
	}, []);

	const handleAddSlot = useCallback(() => {
		setSlots((prevSlots) => [...prevSlots, { from: "", to: "" }]);
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const screenData = new FormData();
		screenData.append("name", details.name);
		screenData.append("capacity", details.capacity);
		screenData.append("minPeople", details.minPeople);
		screenData.append("specifications", JSON.stringify(specifications));
		screenData.append("description", details.description);
		screenData.append("location", details.location);
		screenData.append("extraPersonPrice", details.extraPersonPrice);
		details.images.forEach((image) => {
			screenData.append("images", image);
		});
		screenData.append("status", details.status);
		screenData.append("slots", JSON.stringify(slots));
		screenData.append("packages", JSON.stringify(packages));

		if (update) {
			try {
				await updateScreen(id, screenData);
				navigate("/admin/screens");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addScreen(screenData);
				navigate("/admin/screens");
			} catch (error) {
				console.error(error);
			}
		}
	};

	return (
		<div className="w-full container px-6 mt-3">
			<div className="pb-2 border-b border-gray-400">
				<h3>{update ? "Update Screen" : "Add Screen"}</h3>
			</div>

			<form className="w-full max-w-4xl m-auto mb-10" onSubmit={handleSubmit}>
				<div className="flex gap-5">
					<div className="w-full">
						<div className="outer-box">
							<h4 className="mb-3">Screen Info</h4>
							<div className="input-wrapper">
								<label htmlFor="name">Name</label>
								<input type="text" id="name" name="name" placeholder="Screen Name" value={details.name} onChange={handleChange} required />
							</div>
							<div className="flex gap-5">
								<div className="input-wrapper">
									<label htmlFor="capacity">Capacity</label>
									<input type="number" id="capacity" name="capacity" placeholder="Screen Capacity" value={details.capacity} onChange={handleChange} required min={0} />
								</div>
								<div className="input-wrapper">
									<label htmlFor="minPeople">Minimum People</label>
									<input type="number" id="minPeople" name="minPeople" placeholder="Minimum People" value={details.minPeople} onChange={handleChange} required min={0} />
								</div>
								<div className="input-wrapper">
									<label htmlFor="extraPersonPrice">Extra Person Price</label>
									<input type="number" id="extraPersonPrice" name="extraPersonPrice" placeholder="Extra Amount" value={details.extraPersonPrice} onChange={handleChange} required min={0} />
								</div>
							</div>

							<div className="input-wrapper">
								<label htmlFor="description">Description</label>
								<textarea id="description" name="description" placeholder="Description" value={details.description} onChange={handleChange} required />
							</div>
						</div>
						<div className="outer-box">
							<h4 className="mb-3">Specifications</h4>
							{specifications.length > 0 &&
								specifications.map((spec, index) => (
									<div className="input-wrapper flex" key={index}>
										<input type="text" placeholder="Specification info" value={spec} onChange={(e) => handleSpecificationChange(e, index)} required />
										<span className="cursor-pointer text-2xl flex items-center px-4" onClick={() => handleDeleteSpecification(index)}>
											<MdDelete className="fill-red-400" />
										</span>
									</div>
								))}
							<div className="w-full flex justify-center cursor pointer">
								<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer" onClick={() => setSpecifications([...specifications, ""])}>
									<p className="-mt-1  text-xl ">+</p>
								</div>
							</div>
						</div>
						<div className="outer-box">
							<h3 className="mb-2">Screen Images</h3>
							{update ? (
								<ImageUploaderComponent
									id="location-image"
									maxImages={5}
									onImagesChange={(images) => {
										setDetails((prev) => ({ ...prev, images: images }));
									}}
									loadedImages={loadedImages ? loadedImages : []}
								/>
							) : (
								<ImageUploaderComponent
									id="screen-image"
									maxImages={5}
									onImagesChange={(images) => {
										setDetails((prev) => ({ ...prev, images: images }));
									}}
								/>
							)}
						</div>
						<PackageForm packages={packages} setPackages={setPackages} />
					</div>

					<div className="w-1/3 min-w-[320px] flex flex-col justify-between">
						<div>
							<div className="outer-box">
								<h4 className="mb-3">Status</h4>

								<LocationOptions value={details.location} changeHandler={handleChange} />

								<div className="input-wrapper">
									<label htmlFor="status">Status</label>
									<select id="status" name="status" value={details.status} onChange={handleChange}>
										<option value={true}>Active</option>
										<option value={false}>Inactive</option>
									</select>
								</div>
							</div>

							<div className="outer-box">
								<h4 className="mb-3">Slots</h4>

								{slots.map((slot, index) => (
									<div className="flex mb-2" key={index}>
										<div className="input-wrapper mr-2">
											<label htmlFor={`from-${index}`}>From</label>
											<input type="time" id={`from-${index}`} name="from" value={slot.from} onChange={(e) => handleSlotChange(e, index)} required />
										</div>
										<div className="input-wrapper mr-2">
											<label htmlFor={`to-${index}`}>To</label>
											<input type="time" id={`to-${index}`} name="to" value={slot.to} onChange={(e) => handleSlotChange(e, index)} required />
										</div>
										<span className="cursor-pointer text-2xl flex items-center px-4" onClick={() => handleDeleteSlot(index)}>
											<MdDelete className="fill-red-400" />
										</span>
									</div>
								))}
								<div className="w-full flex justify-center cursor-pointer">
									<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer" onClick={handleAddSlot}>
										<p className="-mt-1 text-xl">+</p>
									</div>
								</div>
							</div>
						</div>

						<button type="submit" className="btn btn-1">
							{update ? "Update Screen" : "Add Screen"}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addScreen: (details) => dispatch(addScreen(details)),
		updateScreen: (screenId, screenData) => dispatch(updateScreen(screenId, screenData)),
	};
};

export default connect(null, mapDispatchToProps)(AddScreens);
