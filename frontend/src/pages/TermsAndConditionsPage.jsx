// TermsAndConditionsPage.js
import React from "react";
import { AiOutlineWarning } from "react-icons/ai";
import terms from "../utils/termsAndConditions";

const TermsAndConditionsPage = () => (
	<div className="p-8 min-h-screen max-w-4xl mx-auto">
		<h1 className="text-xl font-semibold mb-6 text-gray-800 text-center">Terms and Conditions</h1>
		<div className="space-y-3">
			{terms.map((term, index) => (
				<div key={index} className="flex items-start bg-white bg-opacity-50 shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
					<AiOutlineWarning className="w-8 h-8 text-primary  mr-4" />
					<div className="w-full">
						<h3 className="text-lg font-semibold text-gray-700">{term.title}</h3>
						<p className="text-gray-600 mt-1">{term.description}</p>
					</div>
				</div>
			))}
		</div>
	</div>
);

export default TermsAndConditionsPage;
