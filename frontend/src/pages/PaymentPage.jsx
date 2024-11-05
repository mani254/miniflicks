import React from "react";
import { connect } from "react-redux";
import { createBooking } from "../redux/booking/bookingActions";
import BookingDetails from "../components/Booking/DetailedBooking";

const bookingData = {
	slot: {
		from: "14:00",
		to: "17:00",
	},
	package: {
		name: "Standard",
		price: 2597,
		addons: ["4k Dolby Theater", "Decoration", "Cake"],
	},
	occasion: {
		_id: "67270a56928651118f670466",
		name: "Birthday",
		price: 1,
		celebrantName: "prasad",
	},
	_id: "6729a737f59cef82b7763a03",
	city: "672634271792c3cd2fd97e29",
	location: {
		_id: "672635a31792c3cd2fd97e33",
		name: "Marathahalli",
	},
	screen: {
		_id: "672670231792c3cd2fd97ea3",
		name: "Family Theatre",
		minPeople: 4,
		extraPersonPrice: 200,
	},
	date: "2024-11-08T18:30:00.000Z",
	addons: [
		{
			_id: "6727199b2ff1a10080e8f40e",
			name: "Popcorn",
			price: 50,
			count: 1,
		},
		{
			_id: "672717f22ff1a10080e8f3b2",
			name: "LED NAME",
			price: 150,
			count: 1,
		},
	],
	gifts: [
		{
			_id: "67271af22ff1a10080e8f45e",
			name: "Roses - bouquet",
			price: 699,
			count: 1,
		},
	],
	cakes: [
		{
			_id: "672704b7928651118f67038d",
			name: "Black Forest",
			price: 0,
		},
		{
			_id: "672702a5928651118f670350",
			name: "Fresh Fruit",
			price: 499,
		},
	],
	customer: "6729226e9b8e105824422025",
	numberOfPeople: 8,
	nameOnCake: "hbd prasad",
	ledInfo: "hbd",
	status: "pending",
	note: "",
	advancePrice: 999,
	totalPrice: 4796,
	remainingAmount: 3797,
	createdAt: "2024-11-05T05:03:51.167Z",
	updatedAt: "2024-11-05T05:03:51.167Z",
	__v: 0,
};

function paymentPage({ customerBooking, createBooking }) {
	async function handleBooking() {
		try {
			const res = await createBooking(customerBooking);
			if (res) {
				console.log(res);
			}
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div>
			<p>{JSON.stringify(customerBooking, null, 2)}</p>
			<button className="btn btn-1" onClick={handleBooking}>
				check backend
			</button>

			<div className="mt-10">
				<BookingDetails bookingData={bookingData} />
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		createBooking: (booking) => dispatch(createBooking(booking)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(paymentPage);
