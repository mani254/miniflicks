const Coupon = require('../schema/couponSchema')

const generateBookingHTML = async (bookingData) => {
   // Helper functions to calculate prices
   const packagePrice = () => bookingData.package?.price || 0;
   const occasionPrice = () => bookingData.occasion?.price || 0;
   const addonsPrice = () => bookingData.addons?.reduce((sum, addon) => sum + addon.price * addon.count, 0) || 0;
   const giftsPrice = () => bookingData.gifts?.reduce((sum, gift) => sum + gift.price * gift.count, 0) || 0;
   const cakesPrice = () => bookingData.cakes?.reduce((sum, cake) => sum + cake.price, 0) || 0;
   const peoplePrice = () => {
      if (bookingData?.numberOfPeople > bookingData?.screen?.minPeople) {
         const extraPeople = bookingData.numberOfPeople - bookingData.screen.minPeople;
         return bookingData.screen.extraPersonPrice * extraPeople;
      }
      return 0;
   };

   const couponCodePrice = async () => {
      if (!bookingData.couponCode) return 0

      const coupon = await Coupon.findOne({ code: bookingData.couponCode.toUpperCase() });

      let amount = 0

      if (coupon.type === "fixed") {
         amount = -coupon.discount;
         return amount
      } else {
         const total = packagePrice() + occasionPrice() + addonsPrice() + giftsPrice() + cakesPrice() + peoplePrice();
         amount = -parseFloat(((coupon.discount / 100) * total).toFixed(2));
         return amount
      }
   }

   const couponValue = await couponCodePrice()

   const convertToAMPM = (time) => {
      const [hours, minutes] = time.split(":");
      const period = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes} ${period}`;
   };

   if (!bookingData) return "<h2 style='text-align: center; margin-top: 20px;'>Invalid booking Id</h2>";

   // Return HTML as a string
   return `
     <h2 style="text-align:center; margin-bottom:20px;">Thanks for choosing Miniflicks</h2>
     <h3 style="text-align:center;">Attached is your booking invoice for Miniflicks. Please review the details, and let us know if you have any questions. We look forward to serving you!</h3>

     <div style="display: flex; align-items: center; justify-content: center;"">
     <a href="${bookingData.location.addressLink}" 
         style="display: inline-block; margin-bottom: 10px; padding: 8px 12px; background-color: #007BFF; color: #ffffff; text-decoration: none; border-radius: 5px; font-family: Arial, sans-serif; font-size: 17px;" 
         target="_blank" 
         rel="noopener noreferrer"
         aria-label="Navigate to the location on the map">
         Navigate to Location
      </a>
     </div>
     

		<div style="background-color: #f7fafc; padding: 20px; width: 700px; margin: 0 auto;">
			<div style="background-color: white; box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1); border-radius: 8px; padding: 24px;">
				<h2 style="text-align: center; margin-bottom: 24px;">Invoice</h2>

				<table style="width: 100%; margin-bottom: 16px; border-collapse: collapse;">
               <tr>
                  <td style="padding: 8px;">
                     <strong>Location</strong>
                     <p style="color: #4a5568; margin: 0;">${bookingData.location.name}</p>
                  </td>
                  <td style="padding: 8px;">
                     <strong>Screen</strong>
                     <p style="color: #4a5568; margin: 0;">${bookingData.screen.name}</p>
                  </td>
               </tr>
               <tr>
                  <td style="padding: 8px;">
                     <strong>Date</strong>
                     <p style="color: #4a5568; margin: 0;">${new Date(bookingData.date).toLocaleDateString()}</p>
                  </td>
                  <td style="padding: 8px;">
                     <strong>Slot</strong>
                     <p style="color: #4a5568; margin: 0;">${convertToAMPM(bookingData.slot.from)} - ${convertToAMPM(bookingData.slot.to)}</p>
                  </td>
               </tr>
            </table>

				${bookingData.package
         ? `
				<div style="margin-bottom: 16px;">
					<h4 style="font-size: 18px; margin-bottom: 8px;">Package Details</h4>
					<table style="width: 100%; text-align: left; border: 1px solid #e2e8f0;">
						<tbody>
							<tr style="border-bottom: 1px solid #e2e8f0;">
								<td style="padding: 4px; color: #2d3748;">Package Name</td>
								<td style="padding: 4px; color: #4a5568;">${bookingData.package.name}</td>
								<td style="padding: 4px; color: #2d3748;">Price</td>
								<td style="padding: 4px; color: #4a5568;">₹${packagePrice()}</td>
							</tr>
						</tbody>
					</table>
				</div>`
         : ""
      }

				${bookingData.occasion?.name
         ? `
				<div style="margin-bottom: 16px;">
					<h4 style="font-size: 18px; margin-bottom: 8px;">Occasion Details</h4>
					<table style="width: 100%; text-align: left; border: 1px solid #e2e8f0;">
						<tbody>
							<tr style="border-bottom: 1px solid #e2e8f0;">
								<td style="padding: 4px; color: #2d3748;">Occasion</td>
								<td style="padding: 4px; color: #4a5568;">${bookingData.occasion.name}</td>
								<td style="padding: 4px; color: #2d3748;">Price</td>
								<td style="padding: 4px; color: #4a5568;">₹${occasionPrice()}</td>
							</tr>
						</tbody>
					</table>
				</div>`
         : ""
      }

				${bookingData.addons?.length > 0
         ? `
				<div style="margin-bottom: 16px;">
					<h4 style="font-size: 18px; margin-bottom: 8px;">Add-ons</h4>
					<table style="width: 100%; text-align: left; border: 1px solid #e2e8f0;">
						<thead><tr style="background-color: #f7fafc;">
							<th style="padding: 4px; color: #2d3748;">Name</th>
							<th style="padding: 4px; color: #2d3748;">Count</th>
							<th style="padding: 4px; color: #2d3748;">Price</th>
							<th style="padding: 4px; color: #2d3748;">Total Price</th>
						</tr></thead>
						<tbody>
							${bookingData.addons
            .map(
               (addon) => `
								<tr style="border-bottom: 1px solid #e2e8f0;">
									<td style="padding: 4px; color: #4a5568;">${addon.name}</td>
									<td style="padding: 4px; color: #4a5568;">${addon.count}</td>
									<td style="padding: 4px; color: #4a5568;">₹${addon.price}</td>
									<td style="padding: 4px; color: #4a5568;">₹${addon.price * addon.count}</td>
								</tr>
							`
            )
            .join("")}
						</tbody>
					</table>
				</div>`
         : ""
      }

            ${bookingData.gifts?.length > 0
         ? `
               <div style="margin-bottom: 16px;">
                  <h4 style="font-size: 18px; margin-bottom: 8px;">Gifts</h4>
                  <table style="width: 100%; text-align: left; border: 1px solid #e2e8f0;">
                     <thead><tr style="background-color: #f7fafc;">
                        <th style="padding: 4px; color: #2d3748;">Name</th>
                        <th style="padding: 4px; color: #2d3748;">Count</th>
                        <th style="padding: 4px; color: #2d3748;">Price</th>
                        <th style="padding: 4px; color: #2d3748;">Total Price</th>
                     </tr></thead>
                     <tbody>
                        ${bookingData.gifts
            .map(
               (gift) => `
                           <tr style="border-bottom: 1px solid #e2e8f0;">
                              <td style="padding: 4px; color: #4a5568;">${gift.name}</td>
                              <td style="padding: 4px; color: #4a5568;">${gift.count}</td>
                              <td style="padding: 4px; color: #4a5568;">₹${gift.price}</td>
                              <td style="padding: 4px; color: #4a5568;">₹${gift.price * gift.count}</td>
                           </tr>
                        `
            )
            .join("")}
                     </tbody>
                  </table>
               </div>`
         : ""
      }

               ${bookingData.cakes?.length > 0
         ? `
                  <div style="margin-bottom: 16px;">
                     <h4 style="font-size: 18px; margin-bottom: 8px;">Cakes</h4>
                     <table style="width: 100%; text-align: left; border: 1px solid #e2e8f0;">
                        <thead><tr style="background-color: #f7fafc;">
                           <th style="padding: 4px; color: #2d3748;">Name</th>
                           <th style="padding: 4px; color: #2d3748;">Count</th>
                           <th style="padding: 4px; color: #2d3748;">Price</th>
                           <th style="padding: 4px; color: #2d3748;">Total Price</th>
                        </tr></thead>
                        <tbody>
                           ${bookingData.cakes
            .map(
               (cake) => `
                              <tr style="border-bottom: 1px solid #e2e8f0;">
                                 <td style="padding: 4px; color: #4a5568;">${cake.name}</td>
                                 <td style="padding: 4px; color: #4a5568;">${1}</td>
                                 <td style="padding: 4px; color: #4a5568;">₹${cake.price}</td>
                                 <td style="padding: 4px; color: #4a5568;">₹${cake.price}</td>
                              </tr>
                           `
            )
            .join("")}
                        </tbody>
                     </table>
                  </div>`
         : ""
      }

         <h4 style="font-size:18px; margin-bottom:12px;">Summary</h4>
         <table style="width:100%; text-align:left; border-collapse:collapse; border:1px solid #e2e8f0; margin-bottom:24px;">
         <tbody>
               ${packagePrice() > 0
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Package</td>
                  <td style="padding:4px; color:#4a5568;">₹${packagePrice()}</td>
               </tr>`
         : ""
      }
               ${peoplePrice() > 0
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Extra Persons Price</td>
                  <td style="padding:4px; color:#4a5568;">₹${peoplePrice()}</td>
               </tr>`
         : ""
      }
               ${occasionPrice() > 0
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Occasion</td>
                  <td style="padding:4px; color:#4a5568;">₹${occasionPrice()}</td>
               </tr>`
         : ""
      }
               ${addonsPrice() > 0
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Addons</td>
                  <td style="padding:4px; color:#4a5568;">₹${addonsPrice()}</td>
               </tr>`
         : ""
      }
               ${giftsPrice() > 0
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Gifts</td>
                  <td style="padding:4px; color:#4a5568;">₹${giftsPrice()}</td>
               </tr>`
         : ""
      }
               ${cakesPrice() > 0
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Cakes</td>
                  <td style="padding:4px; color:#4a5568;">₹${cakesPrice()}</td>
               </tr>`
         : ""
      }
               ${(couponValue < 0)
         ? `
               <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:4px; color:#4a5568;">Coupon</td>
                  <td style="padding:4px; color:#4a5568;">₹${couponValue}</td>
               </tr>`
         : ""
      }
            </tbody>
      </table>

			

      <table style="width: 100%; margin-top: 16px; border-collapse: collapse;">
         <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
               <span style="font-weight: 500; color: #2d3748;">Advance:</span>
               <span style="color: #4a5568;">${bookingData.advancePrice}</span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
               <span style="font-weight: 500; color: #2d3748;">Total:</span>
               <span style="color: #4a5568;">₹${bookingData.totalPrice}</span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">
               <span style="font-weight: 500; color: #2d3748;">Remaining:</span>
               <span style="color: #4a5568;">₹${bookingData.remainingAmount}</span>
            </td>
         </tr>
      </table>

<table style="width: 100%; margin-top: 16px; border-collapse: collapse; border: 1px solid #e2e8f0; font-family: Arial, sans-serif;">
   <thead>
      <tr>
         <th colspan="2" style="background-color: #f7fafc; padding: 12px; text-align: left; font-size: 16px; color: #2d3748; border-bottom: 1px solid #e2e8f0;">
            Booking Details
         </th>
      </tr>
   </thead>
   <tbody>
      ${bookingData?.occasion?.celebrantName || bookingData?.nameOnCake
         ? `
            <tr>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
                  Celebrant Name:
               </td>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
                  ${bookingData.occasion?.celebrantName || 'N/A'}
               </td>
            </tr>
            <tr>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
                  Name On Cake:
               </td>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
                  ${bookingData?.nameOnCake || 'N/A'}
               </td>
            </tr>`
         : ""
      }
      ${bookingData?.ledName || bookingData?.ledNumber
         ? `
            <tr>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
                  LED Name:
               </td>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
                  ${bookingData?.ledName || 'N/A'}
               </td>
            </tr>
            <tr>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
                  LED Number:
               </td>
               <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
                  ${bookingData?.ledNumber || 'N/A'}
               </td>
            </tr>`
         : ""
      }
      <tr>
         <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
            Customer Name:
         </td>
         <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
            ${bookingData.customer?.name || 'N/A'}
         </td>
      </tr>
      <tr>
         <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
            Customer Number:
         </td>
         <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
            ${bookingData.customer.number || 'N/A'}
         </td>
      </tr>
      <tr>
         <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; font-weight: 500; color: #2d3748;">
            Number Of People:
         </td>
         <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; color: #4a5568;">
            ${bookingData?.numberOfPeople || 'N/A'}
         </td>
      </tr>
   </tbody>
</table>

			</div>
		</div>`;
};

module.exports = generateBookingHTML