import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import queryClient from "./lib/queryClient";

createRoot(document.getElementById("root")).render(
	<QueryClientProvider client={queryClient}>
		<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<App />
			<Toaster
				position="bottom-right"
				richColors
				expand={false}
				visibleToasts={3}
				toastOptions={{
					style: { fontSize: '13px', padding: '10px 14px', maxWidth: '320px' },
				}}
			/>
		</BrowserRouter>
		<ReactQueryDevtools initialIsOpen={false} />
	</QueryClientProvider>
);
