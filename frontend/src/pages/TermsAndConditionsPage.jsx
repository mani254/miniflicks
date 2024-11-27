// TermsAndConditionsPage.js
import React from "react";
import { AiOutlineWarning } from "react-icons/ai";
import terms from "../utils/termsAndConditions";
import { Helmet } from "react-helmet-async";

const TermsAndConditionsPage = () => (
	<>
		<Helmet>
			<title>Terms and Conditions | Miniflicks</title>
			<meta name="description" content="Read the terms and conditions for using Miniflicks. Learn about our policies, including booking, cancellations, and usage of our private theatre services." />
			<meta name="keywords" content="Miniflicks terms and conditions, private theatre policies, booking terms, cancellations, theatre usage rules" />
			<meta property="og:title" content="Terms and Conditions | Miniflicks" />
			<meta property="og:description" content="Review the terms and conditions of Miniflicks, including booking policies, cancellations, and usage of our private theatre services." />
			<meta property="og:image" content="https://miniflicks.in/decoration.webp" />
			<meta property="og:type" content="website" />
			<meta property="og:url" content="https://miniflicks.in//termsandconditions" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content="Terms and Conditions | Miniflicks" />
			<meta name="twitter:description" content="Read Miniflicks' terms and conditions for booking and using our private theatre, including cancellation and usage policies." />
			<meta name="twitter:image" content="https://miniflicks.in/decoration.webp" />
		</Helmet>
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
	</>
);

export default TermsAndConditionsPage;
