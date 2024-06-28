// Notification.js
import React, { useEffect } from "react";
import { connect } from "react-redux";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

import { hideNotification } from "../../redux/notification/notificationActions";
import "./Notification.css";

function Notification({ notifications, hideNotification }) {
   useEffect(() => {
      const timeoutIds = notifications.map((notification) => setTimeout(() => hideNotification(notification.id), 3500));
      return () => {
         timeoutIds.forEach((timeoutId) => clearTimeout(timeoutId));
      };
   }, [notifications, hideNotification]);

   const handleHide = (id) => {
      hideNotification(id);
   };

   const notificationContainerVariants = {
      hidden: {},
      visible: {},
   };

   const notificationVariants = {
      hidden: { opacity: 0, y: 15, x: "-50%", scaleX: 0 },
      visible: { opacity: 1, y: 0, x: "-50%", scaleX: 1, transition: { type: "spring", stiffness: 500, damping: 30 } },
   };

   return (
      <motion.div className="notification-container glassmorphism-card " variants={notificationContainerVariants} initial="hidden" animate="visible" exit="hidden">
         <AnimatePresence>
            {notifications.map((notification, index) => (
               <motion.div key={notification.id} className="notification" variants={notificationVariants} initial="hidden" animate="visible" exit="hidden" style={{ marginTop: index === notifications.length - 1 ? "0px" : index === notifications.length - 2 ? "5px" : "8px" }}>
                  <p>{notification.message}</p>
                  <span className="close-icon" onClick={() => handleHide(notification.id)}>
                     <IoIosCloseCircleOutline />
                  </span>
               </motion.div>
            ))}
         </AnimatePresence>
      </motion.div>
   );
}

const mapStateToProps = (state) => ({
   notifications: state.notification.notifications,
});

const mapDispatchToProps = (dispatch) => ({
   hideNotification: (id) => dispatch(hideNotification(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Notification);