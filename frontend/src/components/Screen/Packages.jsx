import React from "react";
import { MdDelete } from "react-icons/md";

const PackageForm = ({ packages, setPackages }) => {
	const availableAddons = ["4k Dolby Theater", "Decoration", "Cake", "Smoke Entry", "Rose Heart On Table", "Rose With Candle Path"];

	const handleInputChange = (index, field, value) => {
		const newPackages = [...packages];
		newPackages[index][field] = value;
		setPackages(newPackages);
	};

	const addCustomPrice = (index) => {
		const newPackages = [...packages];
		newPackages[index].customPrice.push({ date: "", price: 0 });
		setPackages(newPackages);
	};

	const deleteCustomPrice = (packageIndex, customPriceIndex) => {
		const newPackages = [...packages];
		newPackages[packageIndex].customPrice.splice(customPriceIndex, 1);
		setPackages(newPackages);
	};

	const handleAddonChange = (index, addon) => {
		const newPackages = [...packages];
		if (newPackages[index].addons.includes(addon)) {
			newPackages[index].addons = newPackages[index].addons.filter((a) => a !== addon);
		} else {
			newPackages[index].addons.push(addon);
		}
		setPackages(newPackages);
	};

	const addPackage = () => {
		setPackages([
			...packages,
			{
				name: "",
				price: 0,
				customPrice: [],
				addons: [],
			},
		]);
	};

	const deletePackage = (index) => {
		const newPackages = packages.filter((_, i) => i !== index);
		setPackages(newPackages);
	};

	return (
		<div className="outer-box">
			<h3 className="mb-3">Packages</h3>
			{packages.map((pkg, index) => (
				<div key={index} className="border border-dashed border-gray-400 p-5 rounded-md mb-4 relative">
					<div className="flex gap-5">
						<div className="input-wrapper w-4/5">
							<label className="">Package Name</label>
							<input type="text" placeholder="Package Name" value={pkg.name} onChange={(e) => handleInputChange(index, "name", e.target.value)} required />
						</div>
						<div className="input-wrapper w-1/5">
							<label className="">Price</label>
							<input type="number" placeholder="Price" value={pkg.price} onChange={(e) => handleInputChange(index, "price", e.target.value)} required min="0" />
						</div>
					</div>

					<h5 className="text-sm font-medium text-gray-400 mb-2">Select Addons</h5>
					<div className="flex flex-wrap">
						{availableAddons.map((addon) => (
							<div key={addon} className="input-wrapper checkbox flex gap-2 items-center w-1/3">
								<input type="checkbox" checked={pkg.addons.includes(addon)} onChange={() => handleAddonChange(index, addon)} />
								<label htmlFor={addon} className="whitespace-nowrap w-full  peer-checked:text-logo">
									{addon}
								</label>
							</div>
						))}
					</div>

					<h5 className="text-sm font-medium text-gray-400 mb-2">Custom Price</h5>
					{pkg.customPrice.map((cp, cpIndex) => (
						<div key={cpIndex} className="flex  items-center mb-3 gap-5">
							<div className="input-wrapper mb-0">
								<input
									type="date"
									value={cp.date}
									onChange={(e) => {
										const updatedCustomPrices = [...pkg.customPrice];
										updatedCustomPrices[cpIndex].date = e.target.value;
										handleInputChange(index, "customPrice", updatedCustomPrices);
									}}
									required
								/>
							</div>
							<div className="input-wrapper mb-0">
								<input
									type="number"
									placeholder="Custom Price"
									value={cp.price}
									onChange={(e) => {
										const updatedCustomPrices = [...pkg.customPrice];
										updatedCustomPrices[cpIndex].price = e.target.value;
										handleInputChange(index, "customPrice", updatedCustomPrices);
									}}
									required
								/>
							</div>

							<span className="cursor-pointer text-2xl flex items-center" onClick={() => deleteCustomPrice(index, cpIndex)}>
								<MdDelete className="fill-red-400" />
							</span>
						</div>
					))}

					<div className="w-full flex justify-center cursor pointer">
						<div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer" onClick={() => addCustomPrice(index)}>
							<p className="text-md ">+</p>
						</div>
					</div>

					{/* Delete Package Button */}

					<span className="cursor-pointer text-2xl flex items-center p-1 absolute top-1 right-1 bg-gray-100 rounded-full" onClick={() => deletePackage(index)}>
						<MdDelete className="fill-red-400" />
					</span>
				</div>
			))}
			<button type="button" onClick={addPackage} className="text-logo underline">
				Add One More
			</button>
		</div>
	);
};

export default PackageForm;
