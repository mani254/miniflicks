import React, { useEffect, useState } from "react";
import Loader from "../Loader/Loader";
import { connect } from "react-redux";
import { getCustomers } from "../../redux/customer/customerActions";
import { useSearchParams } from "react-router-dom";
import CustomersFilter from "./CustomersFilter";
import Pagination from "../Pagination/Pagination";

function Customers({ getCustomers, customerData, auth }) {
	const [params, setParams] = useSearchParams();
	const [currentPage, setCurrentPage] = useState(1);
	const [noOfDocuments, setNoOfDocuments] = useState(0);

	useEffect(() => {
		(async () => {
			try {
				const data = await getCustomers(Object.fromEntries(params));
				console.log(data);
				setNoOfDocuments(data.totalDocuments);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [params]);

	return (
		<div className="w-full container px-6 mt-3">
			<div className="flex justify-between pb-2 border-b border-gray-400">
				<h3>Customers</h3>
				<CustomersFilter params={params} setParams={setParams} auth={auth} />
			</div>
			{customerData.loading ? (
				<div className="h-96 relative">
					<Loader />
				</div>
			) : (
				<div className="h-96 relative">
					<table className="main-table">
						<thead>
							<tr>
								<th>S.NO</th>
								<th>Name</th>
								<th>Phone No</th>
							</tr>
						</thead>
						<tbody>
							{customerData.customers.length >= 1 &&
								customerData.customers.map((customer, index) => (
									<tr key={customer._id}>
										<td>{index + 1}</td>
										<td>{customer.name}</td>
										<td>{customer.number}</td>
									</tr>
								))}
						</tbody>
					</table>
					<Pagination noOfDocuments={noOfDocuments} limit={10} currentPage={currentPage} setCurrentPage={setCurrentPage} params={params} setParams={setParams} />
				</div>
			)}
		</div>
	);
}

const mapStateToProps = (state) => {
	return {
		customerData: state.customers,
		auth: state.auth,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		getCustomers: (params) => dispatch(getCustomers(params)),
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Customers);
