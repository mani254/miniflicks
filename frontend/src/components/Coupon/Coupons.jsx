import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import Loader from "../Loader/Loader.jsx";
import Switch from "../Switch/Switch.jsx";

import { connect } from "react-redux";
import { showModal } from "../../redux/modal/modalActions";
import { deleteCoupon, updateCouponStatus } from "../../redux/coupon/couponActions.js";
import ConfirmationAlert from "../ConfirmationAlert/ConfirmationAlert.jsx";

function Coupons({ showModal, deleteCoupon, updateCouponStatus }) {
	const navigate = useNavigate();
	const couponsData = useOutletContext();

	const alertData = {
		title: "Are You sure?",
		info: "Deleting this coupon cannot be undone.",
		confirmFunction: (couponId) => {
			deleteCoupon(couponId);
		},
	};

	async function handleStatusChange(coupon) {
		coupon.status = !coupon.status;
		try {
			await updateCouponStatus(coupon._id, coupon);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Coupons</h3>
				<button className="btn" onClick={() => navigate("/admin/coupons/add")}>
					Add Coupon
				</button>
			</div>
			{couponsData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="h-96 relative">
					<table className="main-table">
						<thead>
							<tr>
								<th>S.NO</th>
								<th>Code</th>
								<th>Discount</th>
								<th>Type</th>
								<th>Expire Date</th>
								<th>Scroll</th>
								<th>Status</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{couponsData.coupons.length >= 1 &&
								couponsData.coupons.map((coupon, index) => (
									<tr key={coupon._id}>
										{console.log(coupon)}
										<td>{index + 1}</td>
										<td>{coupon.code}</td>
										<td>
											{coupon.discount} {coupon.type == "percentage" ? "%" : "₹"}
										</td>
										<td>{coupon.type}</td>
										<td>{new Date(coupon.expireDate).toLocaleDateString()}</td>
										<td>{coupon.scrollCoupon ? "true" : "false"}</td>
										<td>
											<Switch status={coupon.status} id={coupon._id} changeHandler={() => handleStatusChange(coupon)} />
										</td>
										<td>
											<div className="flex">
												<span className="mr-3 cursor-pointer text-2xl" onClick={() => navigate(`/admin/coupons/edit/${coupon._id}`)}>
													<FaEdit className="fill-blue-500" />
												</span>
												<span className="cursor-pointer text-2xl" onClick={() => showModal({ ...alertData, id: coupon._id }, ConfirmationAlert)}>
													<MdDelete className="fill-red-500" />
												</span>
											</div>
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

const mapDispatchToProps = (dispatch) => {
	return {
		showModal: (props, component) => dispatch(showModal(props, component)),
		deleteCoupon: (couponId) => dispatch(deleteCoupon(couponId)),
		updateCouponStatus: (id, details) => dispatch(updateCouponStatus(id, details)),
	};
};

export default connect(null, mapDispatchToProps)(Coupons);
