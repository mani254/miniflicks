import { create } from 'zustand';

const getInitialDate = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).toISOString();
};

const defaultInitialState = {
  city: '',
  location: '',
  screen: '',
  date: getInitialDate(),
  slot: {},
  package: null,
  occasion: null,
  addons: [],
  gifts: [],
  cakes: [],
  customer: null,
  otherInfo: {
    numberOfPeople: 0,
    numberOfExtraPeople: 0,
    extraPersonsPrice: 0,
    nameOnCake: '',
    ledName: '',
    ledNumber: '',
    couponCode: '',
    couponPrice: 0,
  },
  advance: 0,
  note: '',
  total: 0,
  isEditing: false,
  fullPayment: false,
  id: null,
};

// Hydrate initial state from sessionStorage if available
const loadSavedState = () => {
  try {
    const saved = sessionStorage.getItem('customerBooking');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        return { ...defaultInitialState, ...parsed };
      }
    }
  } catch (err) {
    console.error('Failed to load booking state from sessionStorage', err);
  }
  return defaultInitialState;
};

export const useBookingStore = create((set, get) => ({
  ...loadSavedState(),

  // Save helper
  _persist: () => {
    try {
      const state = get();
      const dataToSave = {};
      Object.keys(state).forEach((key) => {
        if (typeof state[key] !== 'function' && !key.startsWith('_')) {
          dataToSave[key] = state[key];
        }
      });
      sessionStorage.setItem('customerBooking', JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Failed to persist booking to sessionStorage', e);
    }
  },

  setCustomerBooking: (data) => {
    set((state) => ({ ...state, ...data }));
    get()._persist();
  },

  setBookingCity: (city) => {
    set(() => ({
      ...defaultInitialState,
      city,
    }));
    get()._persist();
  },

  setBookingLocation: (location) => {
    set((state) => ({
      ...defaultInitialState,
      city: state.city,
      location,
    }));
    get()._persist();
  },

  setBookingScreen: (screen) => {
    set((state) => ({
      ...defaultInitialState,
      city: state.city,
      location: state.location,
      screen,
    }));
    get()._persist();
  },

  setBookingDate: (date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const zeroUTCDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
    set((state) => ({
      ...defaultInitialState,
      city: state.city,
      location: state.location,
      screen: state.screen,
      date: zeroUTCDate,
    }));
    get()._persist();
  },

  setBookingSlot: (slot) => {
    set({ slot });
    get()._persist();
  },

  setBookingPackage: (pack) => {
    set({ package: pack });
    get()._persist();
  },

  setBookingOccasion: (occasion) => {
    set({ occasion });
    get()._persist();
  },

  setBookingAddons: (addons) => {
    set({ addons });
    get()._persist();
  },

  setBookingGifts: (gifts) => {
    set({ gifts });
    get()._persist();
  },

  setBookingCakes: (cakes) => {
    set({ cakes });
    get()._persist();
  },

  setBookingCustomer: (customer) => {
    set({ customer });
    get()._persist();
  },

  setBookingOtherInfo: (otherInfo) => {
    set({ otherInfo });
    get()._persist();
  },

  setBookingAdvance: (advance) => {
    set({ advance: Number(advance) || 0 });
    get()._persist();
  },

  setBookingNote: (note) => {
    set({ note });
    get()._persist();
  },

  setBookingTotal: (total) => {
    set({ total });
    get()._persist();
  },

  setBookingFullPayment: (fullPayment) => {
    set({ fullPayment: Boolean(fullPayment) });
    get()._persist();
  },

  resetBooking: () => {
    sessionStorage.removeItem('customerBooking');
    localStorage.removeItem('customerBooking');
    set({ ...defaultInitialState, date: getInitialDate() });
  },
}));
