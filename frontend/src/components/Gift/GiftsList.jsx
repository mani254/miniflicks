import React, { useEffect } from "react";
import { connect } from "react-redux";
import { getAllGifts } from "../../redux/gift/giftActions";

const GiftList = React.memo(({ getAllGifts, giftData, handleChange, checkedValues }) => {
	useEffect(() => {
		(async () => {
			try {
				await getAllGifts();
			} catch (err) {
				console.log(err);
			}
		})();
	}, [getAllGifts]);

	return (
		<div className="w-full flex">
			{giftData.gifts.length > 0 ? (
				<div className="flex w-full flex-wrap">
					{giftData.gifts.map((gift, index) => {
						const isChecked = checkedValues.includes(gift._id);
						return (
							<div className="input-wrapper checkbox flex gap-2 items-center w-1/4" key={index}>
								<input type="checkbox" id={gift._id} value={gift._id} onChange={(e) => handleChange(gift._id, e.target.checked)} checked={isChecked} />
								<label htmlFor={gift._id} className="whitespace-nowrap w-full peer-checked:text-logo">
									{gift.name}
								</label>
							</div>
						);
					})}
				</div>
			) : (
				<div className="w-full flex items-center justify-center min-h-sm">
					<h3 className="text-gray-500">No gifts available to select</h3>
				</div>
			)}
		</div>
	);
});

const mapStateToProps = (state) => {
	return {
		giftData: state.gifts,
	};
};

const mapDispatchToProps = (dispatch) => ({
	getAllGifts: () => dispatch(getAllGifts()),
});

export default connect(mapStateToProps, mapDispatchToProps)(GiftList);
