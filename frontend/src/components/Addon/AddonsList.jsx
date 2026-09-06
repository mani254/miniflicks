import React from "react";
import { useAllAddons } from "../../hooks/useCatalog";

const AddonsList = React.memo(({ handleChange, checkedValues = [] }) => {
	const { data: addons = [] } = useAllAddons();

	return (
		<div className="w-full flex">
			{addons.length > 0 ? (
				<div className="flex w-full flex-wrap">
					{addons.map((addon, index) => {
						const isChecked = checkedValues.includes(addon._id);
						return (
							<div className="input-wrapper checkbox flex gap-2 items-center w-1/4" key={index}>
								<input type="checkbox" id={addon._id} value={addon._id} onChange={(e) => handleChange(addon._id, e.target.checked)} checked={isChecked} />
								<label htmlFor={addon._id} className="whitespace-nowrap w-full peer-checked:text-logo">
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

export default AddonsList;
