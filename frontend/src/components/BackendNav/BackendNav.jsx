import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const todayDateStr = new Date().toISOString().split("T")[0];

const navlinks = [
	{ title: "Dashboard", to: "/admin/dashboard", image: "https://cdn-icons-png.flaticon.com/512/25/25694.png" },
	{
		title: "Bookings",
		to: "/admin/bookings",
		image: "https://img.icons8.com/m_rounded/512w/purchase-order.png",
		children: [
			{ title: "New Booking", to: "/booking/locations" },
			{ title: "Bookings Today", to: `/admin/bookings?page=1&limit=20&toDate=${todayDateStr}&fromDate=${todayDateStr}` },
		],
	},
	{ title: "Screens", image: "https://cdn-icons-png.flaticon.com/512/126/126422.png", to: "/admin/screens" },
	{ title: "Customers", to: "/admin/customers", image: "https://cdn-icons-png.flaticon.com/256/666/666201.png" },
	{ title: "Occasions", to: "/admin/occasions", image: "https://cdn-icons-png.flaticon.com/256/666/666201.png" },
	{ title: "Addons", to: "/admin/addons", image: "https://cdn-icons-png.flaticon.com/256/666/666201.png" },
	{ title: "Gifts", to: "/admin/gifts", image: "https://cdn-icons-png.flaticon.com/256/666/666201.png" },
	{ title: "Cakes", to: "/admin/cakes", image: "https://cdn-icons-png.flaticon.com/256/666/666201.png" },
];

const superAdminLinks = [
	{ title: "Cities", image: "https://cdn-icons-png.flaticon.com/512/126/126422.png", to: "/admin/cities" },
	{ title: "Locations", image: "https://cdn-icons-png.flaticon.com/512/126/126422.png", to: "/admin/locations" },
	{ title: "Banners", to: "/admin/banners", image: "https://cdn-icons-png.flaticon.com/256/666/666201.png" },
	{ title: "Coupons", image: "https://cdn-icons-png.freepik.com/512/6977/6977692.png", to: "/admin/coupons" },
];

function BackendNav() {
	const { admin } = useAuth();
	const location = useLocation();

	const combinedLinks = admin?.superAdmin ? [...navlinks, ...superAdminLinks] : navlinks;

	const orderedNavLinks = ["Dashboard", "Bookings", "Cities", "Locations", "Screens", "Customers", "Banners", "Coupons", "Cakes", "Occasions", "Addons", "Gifts"];

	// Sort combinedLinks based on the predefined order
	const finalNavLinks = orderedNavLinks.map((title) => combinedLinks.find((link) => link.title === title)).filter(Boolean);

	return (
		<nav className="px-2">
			<ul>
				{finalNavLinks.map((link, index) => (
					<li key={index} className="mt-1">
						<div className={`px-4 flex gap-3 items-center hover:bg-zinc-200 rounded-md cursor-pointer py-[2px] ${location.pathname.startsWith(link.to) && "active bg-zinc-200 text-logo"}`}>
							<img className="w-4 h-4" src={link.image} alt={`${link.title} icon`} />
							<NavLink className="block w-full h-full" to={link.to}>
								{link.title}
							</NavLink>
						</div>
						{link.children && link.children.length > 0 && (
							<ul className="ml-12">
								{link.children.map((child, childIndex) => (
									<li className={`text-opacity-70 hover:text-opacity-90 cursor-pointer ${location.pathname.startsWith(child.to) && "active text-opacity-100 text-logo"}`} key={childIndex}>
										<NavLink className="block w-full h-full" to={child.to}>
											{child.title}
										</NavLink>
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</nav>
	);
}

export default BackendNav;
