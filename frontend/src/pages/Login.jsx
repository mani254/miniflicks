import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";

function Login() {
	const location = useLocation();
	const navigate = useNavigate();
	const { login, register, isLoggingIn, isRegistering } = useAuth();
	
	// Signup blocks commented out after initial admin creation
	const [isRegisterMode, setIsRegisterMode] = useState(false);
	const [loginDetails, setLoginDetails] = useState({
		email: "",
		password: "",
		name: "",
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setLoginDetails((prevDetails) => ({
			...prevDetails,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (isRegisterMode) {
				// 1. Create admin directly in database
				await register(loginDetails);
				// 2. Automatically log in with the new credentials and redirect to dashboard
				await login({ email: loginDetails.email, password: loginDetails.password });
				navigate("/admin/dashboard");
			} else {
				await login(loginDetails);
				navigate("/admin/dashboard");
			}
		} catch (err) {
			console.error("Auth error:", err);
		}
	};

	return (
		<div className="w-full h-screen flex items-center justify-center">
			<form className="bg-white rounded-xl px-6 py-6 shadow-md min-w-[390px]" onSubmit={handleSubmit}>
				{/* === TEMPORARY INITIAL ADMIN SIGNUP TAB (COMMENTED OUT AFTER SETUP) ===
				<div className="flex justify-center gap-4 mb-4 border-b border-gray-200 pb-2">
					<button
						type="button"
						className={`text-sm font-semibold pb-1 transition-colors ${!isRegisterMode ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"}`}
						onClick={() => setIsRegisterMode(false)}>
						Admin Login
					</button>
					<button
						type="button"
						className={`text-sm font-semibold pb-1 transition-colors ${isRegisterMode ? "text-red-600 border-b-2 border-red-600" : "text-gray-400 hover:text-gray-600"}`}
						onClick={() => setIsRegisterMode(true)}>
						Create Admin (Initial Setup)
					</button>
				</div>
				=== END TEMPORARY TAB BLOCK === */}

				<h3 className="text-center">{isRegisterMode ? "Create Admin" : "Login"}</h3>

				{isRegisterMode && (
					<div className="input-wrapper mt-3">
						<label htmlFor="name">Name</label>
						<input type="text" id="name" name="name" placeholder="Admin Name" value={loginDetails.name} onChange={handleChange} required />
					</div>
				)}

				<div className="input-wrapper mt-3">
					<label htmlFor="email">Email:</label>
					<input type="email" id="email" name="email" placeholder="admin@miniflicks.in" value={loginDetails.email} onChange={handleChange} required />
				</div>

				<div className="input-wrapper mt-5 variant-2">
					<label htmlFor="password">Password:</label>
					<div className="relative">
						<input type={showPassword ? "text" : "password"} placeholder="Password" name="password" id="password" value={loginDetails.password} onChange={handleChange} required />
						<span
							className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
							onClick={() => {
								setShowPassword(!showPassword);
							}}>
							{showPassword ? <FaEyeSlash className="fill-gray-700" /> : <FaEye className="fill-gray-700" />}
						</span>
					</div>
				</div>

				<button type="submit" className="btn btn-1 mt-5 w-full" disabled={isLoggingIn || isRegistering}>
					{isRegisterMode ? (isRegistering ? "Creating Admin..." : "Create Admin & Enter") : (isLoggingIn ? "Logging in..." : "Login")}
				</button>

				{/* === TEMPORARY INITIAL ADMIN SIGNUP FOOTER LINK (COMMENTED OUT AFTER SETUP) ===
				<div className="mt-4 text-center">
					<p className="text-xs text-gray-500">
						{isRegisterMode ? "Already created an admin? " : "First time setup? "}
						<button
							type="button"
							className="text-red-600 font-semibold underline ml-1 cursor-pointer"
							onClick={() => setIsRegisterMode(!isRegisterMode)}>
							{isRegisterMode ? "Switch to Login" : "Create Initial Admin"}
						</button>
					</p>
				</div>
				=== END TEMPORARY FOOTER LINK BLOCK === */}
			</form>
		</div>
	);
}

export default Login;
