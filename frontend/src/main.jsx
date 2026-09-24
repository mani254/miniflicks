import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { Toaster as HotToaster } from "react-hot-toast";
import queryClient from "./lib/queryClient";

createRoot(document.getElementById("root")).render(
	<QueryClientProvider client={queryClient}>
		<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<App />
			<Toaster
				position="top-center"
				richColors
				expand={false}
				visibleToasts={4}
				closeButton
				toastOptions={{
					style: { fontSize: '14px', padding: '12px 16px', maxWidth: '380px' },
				}}
			/>
			<HotToaster position="top-center" />
		</BrowserRouter>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);
