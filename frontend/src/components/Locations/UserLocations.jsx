import React, { useRef, useEffect } from "react";
import { connect } from "react-redux";
import { useDispatch } from "react-redux";
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { setBookingLocation } from "../../redux/customerBooking/customerBookingActions";

function UserLocations({ locationsData, customerBooking }) {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const cardRefs = useRef([]);

	const handleCardClick = (locationId) => {
		dispatch(setBookingLocation(locationId));
		return navigate(`/booking/screens`);
	};

	useEffect(() => {
		console.log(locationsData.locations.length);
		if (locationsData.locations.length === 1) {
			dispatch(setBookingLocation(locationsData.locations[0]._id));
			return navigate("/booking/screens", { replace: true });
		}
		// dispatch(setBookingLocation(customerBooking.location));
	}, [locationsData.locations]);

	const handleClick = (event, locationId, index) => {
		if (cardRefs.current[index] && cardRefs.current[index].contains(event.target) && !event.target.closest(".map-link")) {
			handleCardClick(locationId);
		}
	};

	return (
		<section className="py-14 w-full">
			<h2 className="text-xl font-medium mb-6 text-center">Choose Your Location</h2>
			<div className="flex w-full justify-center gap-6 flex-wrap">
				{locationsData.locations.map((location, index) => (
					<div key={index} ref={(el) => (cardRefs.current[index] = el)} className="location-card w-full max-w-[300px] p-3 bg-bright rounded-xl shadow-md space-y-4 cursor-pointer" onClick={(event) => handleClick(event, location._id, index)}>
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
				))}
			</div>
		</section>
	);
}

const mapStateToProps = (state) => ({
	locationsData: state.locations,
	customerBooking: state.customerBooking,
});

export default connect(mapStateToProps, null)(UserLocations);
