import React, { useState, useEffect, useCallback, useMemo } from "react";
import { addonAvailable, addonUnavailable } from "../../utils";
import { useNavigate } from "react-router-dom";
import RoseTable from "../popupts/RoseTable";
import SmokeEntry from "../popupts/SmokeEntry";
import CandlePath from "../popupts/CandlePath";

import { showModal } from "../../store/modalStore";
import { useBookingStore } from "../../store/bookingStore";
import { useScreen } from "../../hooks/useCatalog";
import toast from "react-hot-toast";

import smokeEntry from "../../assets/gallery/smoke/image-1.jpg";
import rosePath from "../../assets/gallery/rose-path/image-6.webp";
import roseHeart from "../../assets/gallery/rose-path/image-9.webp";

const packageAddons = ["4k Dolby Theater", "Decoration", "Cake", "Smoke Entry", "Rose Heart On Table", "Rose With Candle Path"];

function PackagesSection() {
	const navigate = useNavigate();
	const {
		screen: selectedScreenId,
		date: bookingDate,
		slot: bookingSlot,
		package: currentPackage,
		isEditing,
		setBookingPackage,
	} = useBookingStore();

	const { data: rawScreen } = useScreen(selectedScreenId);
	const [selectedPackage, setSelectedPackage] = useState({});
	const [changedPackage, setChangedPackage] = useState(null);

	// Calculate prices based on customPrice and date
	const getPackagePrice = useCallback((pack) => {
		if (!pack) return 0;
		const selectedDate = new Date(bookingDate).toISOString().split("T")[0];
		const todayPrice = pack.customPrice?.find((custom) => {
			const customDate = new Date(new Date(custom.date).setHours(0, 0, 0, 0)).toISOString().split("T")[0];
			return customDate === selectedDate;
		});
		return todayPrice ? todayPrice.price : pack.price;
	}, [bookingDate]);

	const screen = useMemo(() => {
		if (!rawScreen) return null;
		return {
			...rawScreen,
			packages: rawScreen.packages?.map((pack) => ({
				...pack,
				price: getPackagePrice(pack),
			})) || [],
		};
	}, [rawScreen, getPackagePrice]);

	useEffect(() => {
		if (!screen?.packages?.length) return;

		if (currentPackage) {
			const isPackageAvailable = screen.packages.find((pack) => pack.price === currentPackage.price);
			setSelectedPackage(currentPackage);
			if (!isPackageAvailable) {
				setChangedPackage(currentPackage);
			}
		} else if (!isEditing) {
			setSelectedPackage(screen.packages[0]);
			setBookingPackage(screen.packages[0]);
		}
	}, [screen, currentPackage, isEditing, setBookingPackage]);

	const handlePackageSelect = useCallback(
		(pack) => {
			const now = new Date();
			now.setHours(0, 0, 0, 0);

			const bDate = new Date(bookingDate);
			bDate.setHours(0, 0, 0, 0);

			if (now.getTime() === bDate.getTime() && bookingSlot?.from) {
				const currentTime = new Date();
				const [slotHour, slotMinute] = bookingSlot.from.split(":").map(Number);

				const selectedSlotTime = new Date();
				selectedSlotTime.setHours(slotHour, slotMinute, 0, 0);

				const timeDifference = selectedSlotTime - currentTime;

				if (timeDifference <= 3600000 && timeDifference > 0) {
					toast.error("Only Basic Package is allowed before 1 hour");
					return;
				}
			}

			setSelectedPackage(pack);
			setBookingPackage(pack);
			navigate("/booking/otherdetails/occasions");
		},
		[bookingDate, bookingSlot, setBookingPackage, navigate]
	);

	function handlePopUp(type) {
		if (type === "smoke-entry") {
			showModal({}, SmokeEntry);
		} else if (type === "rose-table") {
			showModal({}, RoseTable);
		} else if (type === "candle-path") {
			showModal({}, CandlePath);
		}
	}

	return (
		<section className="option-section pt-6 mt-4 border-t border-white">
			<div className="flex items-center justify-center mb-5 gap-5 ">
				<div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handlePopUp("smoke-entry")}>
					<div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary">
						<div className=" w-[92%] h-[92%] rounded-full relative bg-white overflow-hidden hover:scale-105 transition-all">
							<img className="w-full h-full absolute object-cover object-center" src={smokeEntry} alt="smoke-entry miniflicks" />
						</div>
					</div>
					<p className="text-xs font-medium mt-1">Smoke Entry</p>
				</div>

				<div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handlePopUp("candle-path")}>
					<div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary">
						<div className=" w-[92%] h-[92%] rounded-full relative bg-white overflow-hidden hover:scale-105 transition-all">
							<img className="w-full h-full absolute object-cover object-center" src={rosePath} alt="candle path miniflicks" />
						</div>
					</div>
					<p className="text-xs font-medium mt-1">Candle Path</p>
				</div>

				<div className="flex flex-col items-center justify-center cursor-pointer" onClick={() => handlePopUp("rose-table")}>
					<div className="w-16 h-16 rounded-full flex items-center justify-center bg-gradient-primary">
						<div className=" w-[92%] h-[92%] rounded-full relative bg-white overflow-hidden hover:scale-105 transition-all">
							<img className="w-full h-full absolute object-cover object-center" src={roseHeart} alt="rose heart miniflicks" />
						</div>
					</div>
					<p className="text-xs font-medium mt-1">Rose Table</p>
				</div>
			</div>

			<div className="grid grid-cols-1 sm:grid-cold-2 md:grid-cols-3 gap-2 md:gap-4">
				{screen?.packages &&
					screen.packages.map((pack, index) => {
						const selected = pack.name === selectedPackage.name;
						return (
							<div key={index} className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${selected ? "selected" : ""}`} onClick={() => handlePackageSelect(pack)}>
								<div className="p-3 py-4 rounded-lg bg-bright">
									<h3 className="text-primary">{pack.name}</h3>
									<h4 className="border-b border-slate-400 border-opacity-50 pb-1">₹ {pack.price}</h4>
									<ul className="mt-2">
										{packageAddons.map((addon, idx) => {
											const available = pack.addons?.includes(addon);
											return (
												<li key={idx} className="flex gap-2 mt-1">
													<img src={available ? addonAvailable : addonUnavailable} alt={available ? "available tick-mark" : "unavailable tick-mark"} />
													{addon}
												</li>
											);
										})}
									</ul>
								</div>
							</div>
						);
					})}

				{changedPackage && isEditing && (
					<div className={`p-[1.5px] rounded-lg cursor-pointer selected-1 selected`} onClick={() => handlePackageSelect(changedPackage)}>
						<div className="p-3 py-4 rounded-lg bg-bright">
							<h3 className="text-primary">{changedPackage.name}</h3>
							<h4 className="border-b border-slate-400 border-opacity-50 pb-1">₹ {changedPackage.price}</h4>
							<ul className="mt-2">
								{packageAddons.map((addon, idx) => {
									const available = changedPackage.addons?.includes(addon);
									return (
										<li key={idx} className="flex gap-2 mt-1">
											<img src={available ? addonAvailable : addonUnavailable} alt={available ? "available tick-mark" : "unavailable tick-mark"} />
											{addon}
										</li>
									);
								})}
							</ul>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}

export default PackagesSection;