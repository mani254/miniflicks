const generateReminderHtml = (celebrationDate) => {

   const formattedDate = new Date(celebrationDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
   });

   return `<div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
       <div style="font-size: 24px; color: #333; text-align: center; margin-bottom: 20px;">
          Celebrate Your Special Day Again with Miniflicks!
       </div>
       <div style="font-size: 16px; line-height: 1.6; color: #555;">
          Hi there,<br><br>
 
          It's hard to believe that a year has passed since you celebrated your special day with us at Miniflicks on <strong>${formattedDate}</strong>. 
          We hope those memories are still bringing a smile to your face!<br><br>
 
          Why not relive the magic? Miniflicks offers the perfect setting for another unforgettable celebration or even a relaxing private movie night. 
          We'd be delighted to host you again and make your experience just as amazing as the last one.<br><br>
 
          Just click the button below to visit our website and plan your next visit. We can't wait to welcome you back!
       </div>
       <div style="text-align: center; margin-top: 20px;">
          <a href="https://miniflicks.in" style="background-color: #007BFF; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Plan Your Visit</a>
       </div>
       <div style="font-size: 12px; color: #aaa; text-align: center; margin-top: 30px;">
          Thank you for being part of the Miniflicks family!<br>
          Warm regards,<br>
          The Miniflicks Team
       </div>
    </div>`;
};

module.exports = generateReminderHtml;
