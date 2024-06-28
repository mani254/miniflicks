import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import './Modal.css';

const Modal = ({ component, props }) => {
   const modalRoot = document.getElementById("modal-root");
   const el = document.createElement("div");

   useEffect(() => {
      modalRoot.appendChild(el);
      return () => {
         modalRoot.removeChild(el);
      };

   }, [el, modalRoot]);


   return ReactDOM.createPortal(
      <section className="modal-section">
         <div className="modal-container">{component && React.createElement(component, props)}</div>
      </section>,
      el
   );

};

export default Modal;