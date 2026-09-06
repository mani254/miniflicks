import { create } from 'zustand';

export const useModalStore = create((set) => ({
  isOpen: false,
  isModalOpen: false,
  props: {},
  modalProps: {},
  component: null,
  modalComponent: null,

  showModal: (arg1, arg2) => {
    // Flexible signature: supports showModal(props, component) or showModal(component, props)
    let comp = null;
    let p = {};
    if (typeof arg1 === 'function' || (arg1 && arg1.$$typeof)) {
      comp = arg1;
      p = arg2 || {};
    } else {
      comp = arg2;
      p = arg1 || {};
    }

    set({
      isOpen: true,
      isModalOpen: true,
      component: comp,
      modalComponent: comp,
      props: p,
      modalProps: p,
    });
  },

  hideModal: () =>
    set({
      isOpen: false,
      isModalOpen: false,
      props: {},
      modalProps: {},
      component: null,
      modalComponent: null,
    }),
}));

// Direct helper functions matching the legacy action signature
export const showModal = (arg1, arg2) => useModalStore.getState().showModal(arg1, arg2);
export const hideModal = () => useModalStore.getState().hideModal();
