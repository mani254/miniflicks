import React, { useState, useEffect } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import CalendarLogic from "./CalendarUtils";
import { useDispatch } from "react-redux";
import { setBookingDate } from "../../redux/customerBooking/customerBookingActions";
import "./calendar.css";

import { connect } from "react-redux";

const cInfo = [
	{
		color: "rgba(226, 226, 226)",
		title: "Unavailable",
	},
	{
		color: "rgb(100, 97, 174)",
		title: "Selected",
	},
	{
		color: "#faf8fc",
		title: "Available",
	},
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function Calendar({ customerBooking }) {
	const initialDate = new Date();
	const [selectedDate, setSelectedDate] = useState();
	const [unavailableDates] = useState([]);
	const [calendarLogic, setCalendarLogic] = useState(() => new CalendarLogic(initialDate.getFullYear(), initialDate.getMonth(), unavailableDates, selectedDate));

	const dispatch = useDispatch();

	// function that will handle when clicked on certain date
	const handleDateClick = (date) => {
		setSelectedDate(date);
		dispatch(setBookingDate(date));
		setCalendarLogic((prevLogic) => new CalendarLogic(prevLogic.year, prevLogic.month, unavailableDates, date));
	};

	const handleMonthChange = (increment) => {
		setCalendarLogic((prevLogic) => {
			const newLogic = new CalendarLogic(prevLogic.year, prevLogic.month, unavailableDates, selectedDate);
			newLogic.handleMonthChange(increment);
			return newLogic;
		});
	};

	//useeffect that wil initially set the current date based on the selected date
	useEffect(() => {
		const initialDate = new Date();
		let date = null;
		// console.log(customerBooking.date);

		if (customerBooking.date) {
			date = customerBooking.date instanceof Date ? customerBooking.date : new Date(customerBooking.date);
		} else {
			date = new Date(initialDate.setHours(0, 0, 0, 0));
		}

		setSelectedDate(date);
		setCalendarLogic(() => new CalendarLogic(date.getFullYear(), date.getMonth(), unavailableDates, date));
	}, [customerBooking.date]);

	// console.log(selectedDate, "--selected date which is currently selected-----");

	let calendar = calendarLogic.generateCalendar();

	return (
		<div className="w-full max-w-[700px] m-auto calendar">
			<div className="flex items-center justify-between py-2 px-4">
				<div className="flex items-center gap-5">
					<button className="cursor-pointer" onClick={() => handleMonthChange(-1)}>
						<FaAngleLeft />
					</button>
					<h4 className="w-100 text-center">{months[calendarLogic.month]}</h4>
					<button className="cursor-pointer" onClick={() => handleMonthChange(1)}>
						<FaAngleRight />
					</button>
				</div>
				<h4 className="text-primary">{calendarLogic.year}</h4>
			</div>
			<table className="w-full border-separate border-spacing-[5px] sm:border-spacing-3 table-fixed">
				<thead>
					<tr>
						{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
							<th key={index} className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">
								{day}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{calendar.map((week, weekIndex) => (
						<tr key={weekIndex}>
							{week.map((day, dayIndex) =>
								day ? (
									<td key={dayIndex} onClick={() => !day.unavailable && handleDateClick(day.date)} className={`text-center bg-white shadow-sm p-1 rounded-md ${day.unavailable ? "unavailable" : "available"} ${day.selected ? "selected" : ""}`}>
										{day.date.getDate()}
									</td>
								) : (
									<td key={dayIndex} className="calendar-cell-empty"></td>
								)
							)}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-center gap-4 mt-3">
				{cInfo.map((info, index) => (
					<div className="flex gap-2 items-center" key={index}>
						<div className="w-3 h-3 rounded-sm border border-gray-500 border-opacity-50" style={{ background: info.color }}></div>
						<p>{info.title}</p>
					</div>
				))}
			</div>
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerBooking: state.customerBooking,
	};
};
export default connect(mapStateToProps, null)(Calendar);
