// Notification.js
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { IoIosCloseCircleOutline } from "react-icons/io";

import { hideNotification } from "../../redux/notification/notificationActions";

function Notification({ notifications, hideNotification }) {
	useEffect(() => {
		const timeoutIds = notifications.map((notification) => setTimeout(() => hideNotification(notification.id), 3500));
		return () => {
			timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
		};
	}, [notifications, hideNotification]);

	const handleHide = (id) => {
		hideNotification(id);
	};

	return (
		<>
			{notifications.length > 0 && (
				<>
					{notifications.map((notification, index) => (
						<div key={notification.id} className="fixed left-1/2 bottom-10 -translate-x-1/2 inlinpx-4 py-[6px] px-3 z-50 bg-gray-800 rounded-md">
							<div className="flex items-center justify-center">
								<p className="mr-2 text-xs text-white whitespace-nowrap">{notification.message}</p>
								<span className="cursor-pointer mt-[1px]" onClick={() => handleHide(notification.id)}>
									<IoIosCloseCircleOutline className="fill-white" />
								</span>
							</div>
						</div>
					))}
				</>
			)}
		</>
	);
}

const mapStateToProps = (state) => ({
	notifications: state.notification.notifications,
});

const mapDispatchToProps = (dispatch) => ({
	hideNotification: (id) => dispatch(hideNotification(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Notification);
