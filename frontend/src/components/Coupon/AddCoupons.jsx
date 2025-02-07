import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useOutletContext } from "react-router-dom";
import { connect } from "react-redux";
import { addCoupon, updateCoupon } from "../../redux/coupon/couponActions";
import Loader from "../Loader/Loader";
function AddCoupons({ addCoupon, update = false, updateCoupon }) {
	const navigate = useNavigate();
	const { id } = useParams();
	const couponsData = useOutletContext();
	const [info, setInfo] = useState("Enter the discount in Percentage '%'");

	const [details, setDetails] = useState({
		code: "",
		discount: "",
		type: "percentage",
		expireDate: "",
		status: true,
		scrollCoupon: false, // <-- Add this
		scrollingText: "",
	});

	useEffect(() => {
		if (update) {
			const currentCoupon = couponsData.coupons.find((coupon) => coupon._id === id);
			if (!currentCoupon) return;
			const formattedExpireDate = new Date(currentCoupon.expireDate).toISOString().split("T")[0];

			setDetails({
				...currentCoupon,
				expireDate: formattedExpireDate,
			});
		}
	}, [couponsData.coupons, update, id]);

	const convertToUpperCase = (value) => value.toUpperCase();

	const handleChange = (e) => {
		const { name, value } = e.target;
		const updatedValue = name === "code" ? convertToUpperCase(value) : value;

		setDetails((prev) => ({
			...prev,
			[name]: updatedValue,
		}));
		if (name == "type") {
			if (value === "percentage") {
				setInfo("Enter the discount in Percentage '%'");
			} else {
				setInfo("Enter the discount in Amount '₹'");
			}
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (update) {
			try {
				await updateCoupon(id, details);
				navigate("/admin/coupons");
			} catch (error) {
				console.error(error);
			}
		} else {
			try {
				await addCoupon(details);
				navigate("/admin/coupons");
			} catch (error) {
				console.error(error);
			}
		}
	};

	const today = new Date().toISOString().split("T")[0];

	return (
		<>
			{couponsData.loading && (
				<div className="fixed inset-0 z-50 bg-gray-900 bg-opacity-10">
					<Loader></Loader>
				</div>
			)}

			<div className="w-full container px-6 mt-3">
				<div className="pb-2 border-b border-gray-400">
					<h3>{update ? "Update Coupon" : "Add Coupon"}</h3>
				</div>

				<form className="max-w-xl m-auto" onSubmit={handleSubmit}>
					<div className="outer-box">
						<div className="input-wrapper">
							<label htmlFor="code">Code</label>
							<input type="text" id="code" name="code" placeholder="Coupon Code" value={details.code} onChange={handleChange} required />
						</div>
						<div className="input-wrapper">
							<label htmlFor="type">Type</label>
							<select id="type" name="type" value={details.type} onChange={handleChange} required>
								<option value="percentage">Percentage</option>
								<option value="fixed">Fixed Amount</option>
							</select>
						</div>
						<div className="input-wrapper">
							<label htmlFor="discount">Discount</label>
							<input type="number" id="discount" name="discount" placeholder="Discount Amount/Percentage" value={details.discount} onChange={handleChange} required />
							<p className="text-xs text-gray-400 opacity-60">{info}</p>
						</div>
						<div className="input-wrapper">
							<label htmlFor="expireDate">Expire Date</label>
							<input type="date" id="expireDate" name="expireDate" value={details.expireDate} onChange={handleChange} required min={today} />
						</div>
						<div className="input-wrapper">
							<label htmlFor="status">Status</label>
							<select id="status" name="status" value={details.status} onChange={handleChange} required>
								<option value="true">Active</option>
								<option value="false">Inactive</option>
							</select>
						</div>
						<div className="input-wrapper">
							<label htmlFor="scrollCoupon">Scroll Coupon</label>
							<select id="scrollCoupon" name="scrollCoupon" value={details.scrollCoupon} onChange={handleChange} required>
								<option value="true">Show</option>
								<option value="false">Hide</option>
							</select>
						</div>
						<div className="input-wrapper">
							<label htmlFor="scrollingText">Scrolling Text</label>
							<input type="text" id="scrollingText" name="scrollingText" placeholder="Enter scrolling text" value={details.scrollingText} onChange={handleChange} />
						</div>
						<button className="btn btn-1" type="submit">
							{update ? "Update Coupon" : "Add Coupon"}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		addCoupon: (details) => dispatch(addCoupon(details)),
		updateCoupon: (couponId, couponData) => dispatch(updateCoupon(couponId, couponData)),
	};
};

export default connect(null, mapDispatchToProps)(AddCoupons);
