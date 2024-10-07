import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getAddons } from "../../redux/addon/addonActions";

const AddonsList = React.memo(({ getAddons, addonData, handleChange, checkedValues }) => {
	useEffect(() => {
		(async () => {
			try {
				await getAddons();
			} catch (err) {
				console.log(err);
			}
		})();
	}, []);

	return (
		<div className="w-full flex">
			{addonData.addons.length > 0 ? (
				<div className="flex w-full flex-wrap">
					{addonData.addons.map((addon, index) => {
						const isChecked = checkedValues.includes(addon._id);
						return (
							<div className="input-wrapper checkbox flex gap-2 items-center w-1/4" key={index}>
								<input type="checkbox" id={addon._id} value={addon._id} onChange={(e) => handleChange(addon._id, e.target.checked)} checked={isChecked}></input>
								<label htmlFor={addon._id} className="whitespace-nowrap w-full  peer-checked:text-logo">
									{addon.name}
								</label>
							</div>
						);
					})}
				</div>
			) : (
				<div className="w-full flex items-center justify-center min-h-sm">
					<h3 className="text-gray-500">Add Addons to select</h3>
				</div>
			)}
		</div>
	);
});

const mapStateToProps = (state) => {
	return {
		addonData: state.addons,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getAddons: () => dispatch(getAddons()),
});

export default connect(mapStateToProps, mapDispatchToProps)(AddonsList);
