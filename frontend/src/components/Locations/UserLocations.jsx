import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { setBookingLocation } from "../../redux/customerBooking/customerBookingActions";
import Loader from "../Loader/Loader";

function UserLocations({ locationsData, customerBooking }) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const cardRefs = useRef([]);

	// if there is only one location move to the next screen instead of staying in that screen when ever locations change
	useEffect(() => {
		if (locationsData.locations.length === 1) {
			dispatch(setBookingLocation(locationsData.locations[0]._id));
			return navigate("/booking/screens", { replace: true });
		}
	}, [locationsData.locations]);

	// function that will set the lcoation when click on any location and moving to next phase
	const handleCardClick = (locationId) => {
		dispatch(setBookingLocation(locationId));
		navigate(`/booking/screens`);
	};
	// function that handles click on location but not on card
	const handleClick = (event, locationId, index) => {
		if (cardRefs.current[index] && cardRefs.current[index].contains(event.target) && !event.target.closest(".map-link")) {
			handleCardClick(locationId);
		}
	};

	return (
		<section className="py-8 md:py-14 w-full">
			<h2 className="text-xl font-medium mb-6 text-center">Choose Your Location</h2>
			{locationsData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="flex w-full justify-center gap-6 flex-wrap">
					{locationsData.locations.map((location, index) => {
						let selected = customerBooking.location == location._id;
						return (
							<div key={index} ref={(el) => (cardRefs.current[index] = el)} className={`location-card w-full max-w-[300px] p-3 bg-bright rounded-xl  space-y-4 cursor-pointer ${selected ? "border-2 border-primary shadow-md shadow-primary-400" : ""}`} onClick={(event) => handleClick(event, location._id, index)}>
								<div className="relative h-[170px] overflow-hidden rounded-lg">
									<img className="w-full h-full object-cover object-center" src={location.image} alt={location.name} />
								</div>
								<h3 className="text-center text-lg font-medium">{location.name}</h3>
								<div className="map-link text-center px-3 py-1 border rounded-lg bg-gray-300">
									<a href={`${import.meta.env.VITE_APP_FRONTENDURI}/${location.addressLink}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
										<IoLocationSharp /> See Location
									</a>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</section>
	);
}

const mapStateToProps = (state) => ({
	locationsData: state.locations,
	customerBooking: state.customerBooking,
});

export default connect(mapStateToProps, null)(UserLocations);
