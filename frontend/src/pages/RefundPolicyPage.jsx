// RefundPolicyPage.js
import React from "react";
import { AiOutlineDollarCircle } from "react-icons/ai";
import refundPolicy from "../utils/refundPolicy";
import { Helmet } from "react-helmet-async";

const RefundPolicyPage = () => (
	<>
		<Helmet>
			<title>Refund Policy | Miniflicks</title>
			<meta name="description" content="Understand Miniflicks' refund policy for private theatre bookings. Learn about our conditions for cancellations, refunds, and changes to your reservation." />
			<meta name="keywords" content="Miniflicks refund policy, private theatre refund, booking refund, cancellation policy, booking changes, theatre reservation refund" />
			<meta property="og:title" content="Refund Policy | Miniflicks" />
			<meta property="og:description" content="Learn about Miniflicks' refund and cancellation policy for private theatre bookings, including the conditions under which you may receive a refund." />
			<meta property="og:image" content="https://miniflicks.in/decoration.webp" />
			<meta property="og:type" content="website" />
			<meta property="og:url" content="https://miniflicks.in/refundpolicy" />
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content="Refund Policy | Miniflicks" />
			<meta name="twitter:description" content="Find out about Miniflicks' refund policy for private theatre bookings, including conditions for cancellations and changes." />
			<meta name="twitter:image" content="https://miniflicks.in/decoration.webp" />
		</Helmet>
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
	</>
);

export default RefundPolicyPage;
