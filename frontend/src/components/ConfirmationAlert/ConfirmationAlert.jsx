import React from "react";
import "./ConfirmationAlert.css";
import CloseModelBtn from "../Modal/CloseModelBtn";
import { hideModal } from "../../redux/modal/modalActions";
import { connect } from "react-redux";

function ConfirmationAlert({ info, confirmFunction, hideModal, id }) {
  return (
    <div className="card">
      <div className="card-content">
        <p className="card-heading">Delete file?</p>
        <p className="card-description">{info}</p>
      </div>
      <div className="flex w-full justify-between">
        <button
          className="rounded-md bg-violet-400 px-3 py-1 text-white"
          onClick={() => hideModal()}
        >
          Cancel
        </button>
        <button
          className="rounded-md bg-red-400 px-3 py-1 text-white"
          onClick={() => {
            confirmFunction(id);
            hideModal();
          }}
        >
          Delete
        </button>
      </div>
      <CloseModelBtn onClick={() => hideModal()} />
    </div>
  );
}

const mapDispatchToProps = (dispatch) => ({
  hideModal: () => dispatch(hideModal()),
});

export default connect(null, mapDispatchToProps)(ConfirmationAlert);
