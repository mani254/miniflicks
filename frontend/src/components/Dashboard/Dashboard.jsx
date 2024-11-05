import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import PiChart from "./PIChart";
import Loader from "../Loader/Loader";
import { getBookings } from "../../redux/booking/bookingActions";
import { FaEdit } from "react-icons/fa";
import axios from "axios";
import { showNotification } from "../../redux/notification/notificationActions";
import DashboardFilters from "./DashboardFilters";
import { getLocation } from "../../redux/location/locationActions";
import { useNavigate } from "react-router-dom";

function Dashboard({ bookingData, getBookings, showNotification, auth, getLocation, locationData }) {
	const [locations, setLocations] = useState([]);

	const [numsInfo, setNumsInfo] = useState([
		{ count: 0, title: "Total Income" },
		{ count: 0, title: "Current Amount" },
		{ count: 0, title: "Pending Amount" },
		{ count: 0, title: "Total Bookings" },
		{ count: 0, title: "Today Bookings" },
		{ count: 0, title: "Total Cities" },
		{ count: 0, title: "Total Locations" },
		{ count: 0, title: "Total Screens" },
	]);

	const [filters, setFilters] = useState({
		fromDate: "",
		toDate: "",
		location: "",
	});

	const [graphLoading, setGraphLoading] = useState(false);
	const [countLoading, setCountLoading] = useState(false);

	const navigate = useNavigate();

	// useeffect to fetch the upcomming bookings when filter location changed
	useEffect(() => {
		const fromDate = new Date();
		const toDate = new Date();
		toDate.setDate(fromDate.getDate() + 2);
		(async () => {
			try {
				await getBookings({ fromDate, toDate, location: filters.location });
			} catch (err) {
				console.log(err);
			}
		})();
	}, [filters.location]);

	// useEffect to fetch the dashboard info when the filters changed
	useEffect(() => {
		async function fetchDashboardCount() {
			setCountLoading(true);
			try {
				const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/getDashboardInfo`, { params: filters });

				const newInfo = [
					{ count: response.data.totalIncome, title: "Total Income" },
					{ count: response.data.totalIncome - response.data.pendingAmount, title: "Current Amount" },
					{ count: response.data.pendingAmount, title: "Pending Amount" },
					{ count: response.data.totalBookings, title: "Total Bookings" },
					{ count: response.data.todayBookings, title: "Today Bookings" },
					{ count: response.data.totalScreens, title: "Total Screens" },
				];

				if (response.data.totalCities && response.data.totalLocations) {
					newInfo.push({ count: response.data.totalCities, title: "Total Cities" });
					newInfo.push({ count: response.data.totalLocations, title: "Total Locations" });
				}

				setNumsInfo(newInfo);

				setCountLoading(false);
			} catch (error) {
				let errMessage = error.response ? error.response.data.error : "Something went wrong";
				showNotification(errMessage);
				setCountLoading(false);
			}
		}
		fetchDashboardCount();
	}, [filters]);

	// useefeect to fetch the graphdata when the date changed only for super admin
	useEffect(() => {
		if (!auth.admin?.superAdmin) return;
		async function fetchGraphData() {
			setGraphLoading(true);
			const colors = ["#9061F9", "#3F83F8", "#F05252", "#6875F5", "#C27803", "#E74694", "#0E9F6E"];

			try {
				const response = await axios.get(`${import.meta.env.VITE_APP_BACKENDURI}/api/bookings/getGraphData`, { params: filters });
				let coloredLocations = response.data.map((location, index) => ({
					...location,
					color: index < colors.length ? colors[index] : getRandomColor(),
				}));
				setLocations(coloredLocations);
				setGraphLoading(false);
			} catch (error) {
				let errMessage = error.response ? error.response.data.error : "Something went wrong";
				showNotification(errMessage);
				setGraphLoading(false);
			}
		}
		fetchGraphData();
	}, [filters.fromDate, filters.toDate, auth.admin]);

	// useEffect to fetch the single lcoation for
	useEffect(() => {
		if (auth.admin?.superAdmin) return;
		async function fetchSingleLocation() {
			try {
				await getLocation(auth.admin.location);
			} catch (err) {
				console.log(err);
			}
		}
		fetchSingleLocation();
	}, [auth.admin?.location]);

	const getRandomColor = () => {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	return (
		<div className="px-2">
			<div className="flex w-full items-center justify-between rounded-md border-b border-gray-400">
				<h3>Dashboard</h3>
				<DashboardFilters filters={filters} setFilters={setFilters} />
			</div>
			<div className="mt-4 flex space-x-3">
				{auth.admin?.superAdmin ? (
					graphLoading ? (
						<div className="min-w-60 border-gray-200 bg-white shadow-sm">
							<Loader />
						</div>
					) : (
						<div className="graph w-[350px] flex flex-col items-center rounded-2xl border-2 border-gray-200 bg-white p-5 pr-4 shadow-sm">
							<PiChart locationInfo={locations} />
							<div>
								<h5 className="text-center mb-2">Locations & Bookings</h5>
								<ul className="flex flex-wrap gap-x-3 gap-y-1 justify-between">
									{locations.map((location, index) => {
										return (
											<li key={index} className="flex items-center">
												<span className="mr-1 block h-3 w-3 rounded-full" style={{ background: location.color }}></span>
												{location.name}
												<span className="inline-block text-xs">
													{location.location}
													{" ("}
													{location.percentage}%{") "}
												</span>
											</li>
										);
									})}
								</ul>
							</div>
						</div>
					)
				) : (
					<div className="w-[350px] flex flex-col items-center rounded-2xl border-2 border-gray-200 bg-white p-5 pr-4 shadow-sm relative overflow-hidden">
						<img className="absolute inset-0 w-full h-full object-cover object-center" src={locationData.location.image} alt={locationData.location?.name} />
						<div className="absolute inset-0 w-ful h-full bg-gray-900 bg-opacity-30 flex items-end justify-center z-10">
							<h3 className="text-white pb-4">{locationData.location?.name}</h3>
						</div>
					</div>
				)}

				<div className="grid flex-1 grid-cols-3 gap-3">
					{numsInfo.map((item, index) => (
						<IncomeDisplay title={item.title} value={item.count} key={index} countLoading={countLoading} index={index} />
					))}
				</div>
			</div>

			<div className="flex justify-between pb-2 border-b border-gray-400 pt-4">
				<h3>Up Comming Bookings</h3>
				{/* <BookingsFilter params={params} setParams={setParams} /> */}
			</div>
			{bookingData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="relative">
					<table className="main-table">
						<thead>
							<tr>
								<th>S.NO</th>
								<th>Name</th>
								<th>Phone no</th>
								<th>Screen</th>
								<th>Location</th>
								<th>Date</th>
								<th>Slot</th>
								<th>Total</th>
								<th>Advance</th>
								<th>Remaining</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{bookingData.bookings.length > 0 ? (
								bookingData.bookings.map((booking, index) => (
									<tr key={booking._id} className="cursor-pointer hover:bg-slate-200" onClick={() => navigate(`/admin/bookings/view/${booking._id}`)}>
										<td>{index + 1}</td>
										<td>{booking.customer?.name}</td>
										<td>{booking.customer?.number}</td>
										<td className={booking.screen?.name ? "" : "text-gray-500"}>{booking.screen?.name || "undefined"}</td>
										<td className={booking.location?.name ? "" : "text-gray-500"}>{booking.location?.name || "undefined"}</td>
										<td>{new Date(booking.date).toLocaleString().split(",")[0]}</td>
										<td>{`${booking.slot.from}-${booking.slot.to}`}</td>
										<td>{booking.totalPrice}</td>
										<td>{booking.advancePrice}</td>
										<td>{booking.remainingAmount}</td>
										<td>{booking.status}</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/locations/edit/${booking.location._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
											</div>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td colSpan={12} className="text-center">
										No bookings available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function IncomeDisplay({ title, value, countLoading, index }) {
	const isAmount = (index) => {
		if (index == 0 || index == 1 || index == 2) {
			return true;
		} else {
			return false;
		}
	};

	return (
		<div className="w-full rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
			<p className="text-md mb-2 text-gray-500">{title}</p>
			{countLoading ? (
				<div role="status">
					<svg aria-hidden="true" className="inline h-5 w-5 animate-spin fill-logo text-gray-200 dark:text-gray-500" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
					{/* <span className="sr-only">Loading...</span> */}
				</div>
			) : (
				<>
					{isAmount(index) && <span className="text-lg font-semibold text-gray-500">₹</span>} <span className="text-lg font-semibold text-gray-500">{value}</span>
				</>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		bookingData: state.bookings,
		auth: state.auth,
		locationData: state.locations,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getBookings: (params) => dispatch(getBookings(params)),
		showNotification: (message) => dispatch(showNotification(message)),
		getLocation: (id) => dispatch(getLocation(id)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
