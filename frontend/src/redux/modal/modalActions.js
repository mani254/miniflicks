import modalTypes from "./modalActionTypes";

export const showModal = (props, component) => ({
   type: modalTypes.SHOW_MODAL,
   payload: { props, component },
});

export const hideModal = () => ({
   type: modalTypes.HIDE_MODAL,
});