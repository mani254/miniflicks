import React, { useState } from "react";
import { FaAngleDoubleLeft, FaAngleLeft, FaAngleRight, FaAngleDoubleRight } from "react-icons/fa";
import CalendarLogic from "./CalendarUtils";
import "./calendar.css";

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

function Calendar() {
	const [selectedDate, setSelectedDate] = useState(null);
	const unavailableDates = [new Date("2024-10-30T12:00:00.000+00:00").setHours(0, 0, 0, 0), new Date("2024-10-28T12:00:00.000+00:00").setHours(0, 0, 0, 0)];
	const [calendarLogic, setCalendarLogic] = useState(() => new CalendarLogic(new Date().getFullYear(), new Date().getMonth(), unavailableDates, selectedDate));

	const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	const handleDateClick = (date) => {
		setSelectedDate(date);
		setCalendarLogic(new CalendarLogic(calendarLogic.year, calendarLogic.month, unavailableDates, date));
		// console.log("Selected date:", date);
	};

	const handleMonthChange = (increment) => {
		const newLogic = new CalendarLogic(calendarLogic.year, calendarLogic.month, unavailableDates, selectedDate);
		newLogic.handleMonthChange(increment);
		setCalendarLogic(newLogic);
		setSelectedDate(null);
	};

	const handleYearChange = (increment) => {
		const newLogic = new CalendarLogic(calendarLogic.year, calendarLogic.month, unavailableDates, selectedDate);
		newLogic.handleYearChange(increment);
		setCalendarLogic(newLogic);
		setSelectedDate(null);
	};

	const calendar = calendarLogic.generateCalendar();

	// console.log(calendar);

	return (
		<div className="w-full max-w-[700px] m-auto calendar">
			<div className="flex items-center justify-between py-2 px-4">
				<div className="flex items-center gap-5">
					<span className="cursor-pointer" onClick={() => handleMonthChange(-1)}>
						{<FaAngleLeft />}
					</span>
					<span className="w-100 text-center">
						<h4>{months[calendarLogic.month]} </h4>
					</span>
					<span className="cursor-pointer" onClick={() => handleMonthChange(1)}>
						{<FaAngleRight />}
					</span>
				</div>

				{/* <span className="navigation-icon" onClick={() => handleYearChange(-1)}>
					{<FaAngleDoubleLeft />}
				</span> */}
				<h4 className="text-primary">{calendarLogic.year}</h4>
				{/* <span className="navigation-icon" onClick={() => handleYearChange(1)}>
					{<FaAngleDoubleRight />}
				</span> */}
			</div>
			<table className="w-full border-separate border-spacing-[5px] sm:border-spacing-3 table-fixed">
				<thead>
					<tr>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Sun</th>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Mon</th>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Tue</th>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Wed</th>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Thu</th>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Fri</th>
						<th className="rounded-md text-white font-semibold p-1 bg-opacity-50 bg-secondary">Sat</th>
					</tr>
				</thead>
				<tbody>
					{calendar.map((week, index) => (
						<tr key={index}>
							{week.map((day, index) =>
								day ? (
									<td key={index} onClick={() => !day.unavailable && handleDateClick(day.date)} className={`text-center bg-white shadow-sm p-1 rounded-md ${day.date ? "" : "isEmphty"} ${day.unavailable ? "unavailable" : "available"} ${day.selected ? "selected" : ""}`}>
										{day.date.getDate()}
									</td>
								) : (
									<td key={index} className="calendar-cell-empty"></td>
								)
							)}
						</tr>
					))}
				</tbody>
			</table>

			<div className="flex items-center justify-center gap-4 mt-3">
				{cInfo.map((info, index) => {
					return (
						<div className="flex gap-2 items-center" key={index}>
							<div className="w-3 h-3 rounded-sm border border-gray-500 border-opacity-50" style={{ background: info.color }}></div>
							<p>{info.title}</p>
						</div>
					);
				})}
			</div>
			{/* <div>{selectedDate && <p>Selected Date: {selectedDate.toLocaleDateString()}</p>}</div> */}
		</div>
	);
}

export default Calendar;
