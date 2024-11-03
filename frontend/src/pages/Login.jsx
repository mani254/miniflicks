import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { connect } from "react-redux";
import { login, registerSuperAdmin } from "../redux/auth/authActions";
import { useNavigate } from "react-router-dom";

function Login({ login, registerSuperAdmin }) {
	const [reg, setReg] = useState(false);
	const [loginDetails, setLoginDetails] = useState({
		email: "",
		password: "",
		name: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const navigate = useNavigate();

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
			if (reg) {
				await registerSuperAdmin(loginDetails);
				setLoginDetails({
					email: "",
					password: "",
					name: "",
				});
				navigate("/login");
			} else {
				await login(loginDetails);
				navigate("/admin/dashboard");
			}
			console.log("Login details submitted:", loginDetails);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (window.location.pathname === "/register") {
			setReg(true);
		} else {
			setReg(false);
		}
	}, [window.location.pathname]);

	return (
		<div className="w-full h-screen flex items-center justify-center">
			<form className="bg-white rounded-xl px-6 py-6 shadow-md min-w-[390px]" onSubmit={handleSubmit}>
				<h3 className="text-center">{reg ? "Register" : "Login"}</h3>

				{reg && (
					<div className="input-wrapper">
						<label htmlFor="email">Name</label>
						<input type="text" id="name" name="name" placeholder="name" value={loginDetails.name} onChange={handleChange} required />
					</div>
				)}

				<div className="input-wrapper">
					<label htmlFor="email">Email:</label>
					<input type="email" id="email" name="email" placeholder="email" value={loginDetails.email} onChange={handleChange} required />
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

				<button type="submit" className="btn btn-1 mt-3">
					{reg ? "Register" : "Login"}
				</button>
			</form>
		</div>
	);
}
const mapDispatchToProps = (dispatch) => {
	return {
		login: (user) => dispatch(login(user)),
		registerSuperAdmin: (user) => dispatch(registerSuperAdmin(user)),
	};
};
export default connect(null, mapDispatchToProps)(Login);
