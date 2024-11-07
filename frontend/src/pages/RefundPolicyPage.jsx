// RefundPolicyPage.js
import React from "react";
import { AiOutlineDollarCircle } from "react-icons/ai";
import refundPolicy from "../utils/refundPolicy";

const RefundPolicyPage = () => (
	<div className="p-8 min-h-screen max-w-4xl mx-auto">
		<h1 className="text-xl font-semibold mb-6 text-gray-800 text-center">Refund Policy</h1>
		<div className="space-y-3">
			{refundPolicy.map((policy, index) => (
				<div key={index} className="flex items-start bg-white bg-opacity-50 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
					<AiOutlineDollarCircle className="w-8 h-8 text-primary mr-4" size={24} />
					<div className="w-full">
						<h3 className="text-lg font-semibold text-gray-700">{policy.title}</h3>
						<p className="text-gray-600 mt-1">{policy.description}</p>
					</div>
				</div>
			))}
		</div>
	</div>
);

export default RefundPolicyPage;
