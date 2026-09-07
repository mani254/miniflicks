import { useQuery, useMutation } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog';

export const CATALOG_KEYS = {
  locations: (city) => ['locations', { city: city || 'all' }],
  location: (id) => ['location', id],
  screens: (locationId) => ['screens', { location: locationId || 'all' }],
  screen: (id) => ['screen', id],
  allCakes: ['cakes', 'all'],
  cakes: (params) => ['cakes', params || {}],
  allAddons: ['addons', 'all'],
  addons: (params) => ['addons', params || {}],
  allGifts: ['gifts', 'all'],
  gifts: (params) => ['gifts', params || {}],
  allOccasions: ['occasions', 'all'],
  occasions: (params) => ['occasions', params || {}],
  coupons: (params) => ['coupons', params || {}],
  userCoupons: ['coupons', 'user'],
  cities: (params) => ['cities', params || {}],
  banners: (params) => ['banners', params || {}],
  userBanners: ['banners', 'user'],
  customers: (params) => ['customers', params || {}],
};

// ─── Locations ───────────────────────────────────────────────────────────────
export function useLocations(city) {
  return useQuery({
    queryKey: CATALOG_KEYS.locations(city),
    queryFn: () => catalogApi.getLocations(city),
  });
}

export function useLocation(id) {
  return useQuery({
    queryKey: CATALOG_KEYS.location(id),
    queryFn: () => catalogApi.getLocation(id),
    enabled: Boolean(id),
  });
}

// ─── Screens ─────────────────────────────────────────────────────────────────
export function useScreens(locationId) {
  return useQuery({
    queryKey: CATALOG_KEYS.screens(locationId),
    queryFn: () => catalogApi.getScreens(locationId),
  });
}

export function useScreen(id) {
  return useQuery({
    queryKey: CATALOG_KEYS.screen(id),
    queryFn: () => catalogApi.getScreen(id),
    enabled: Boolean(id),
  });
}

// ─── Cakes ───────────────────────────────────────────────────────────────────
export function useAllCakes() {
  return useQuery({
    queryKey: CATALOG_KEYS.allCakes,
    queryFn: () => catalogApi.getAllCakes(),
  });
}

export function useCakes(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.cakes(params),
    queryFn: () => catalogApi.getCakes(params),
  });
}

// ─── Addons ──────────────────────────────────────────────────────────────────
export function useAllAddons() {
  return useQuery({
    queryKey: CATALOG_KEYS.allAddons,
    queryFn: () => catalogApi.getAllAddons(),
  });
}

export function useAddons(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.addons(params),
    queryFn: () => catalogApi.getAddons(params),
  });
}

// ─── Gifts ───────────────────────────────────────────────────────────────────
export function useAllGifts() {
  return useQuery({
    queryKey: CATALOG_KEYS.allGifts,
    queryFn: () => catalogApi.getAllGifts(),
  });
}

export function useGifts(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.gifts(params),
    queryFn: () => catalogApi.getGifts(params),
  });
}

// ─── Occasions ───────────────────────────────────────────────────────────────
export function useAllOccasions() {
  return useQuery({
    queryKey: CATALOG_KEYS.allOccasions,
    queryFn: () => catalogApi.getAllOccasions(),
  });
}

export function useOccasions(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.occasions(params),
    queryFn: () => catalogApi.getOccasions(params),
  });
}

// ─── Coupons ─────────────────────────────────────────────────────────────────
export function useCoupons(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.coupons(params),
    queryFn: () => catalogApi.getCoupons(params),
  });
}

export function useUserCoupons() {
  return useQuery({
    queryKey: CATALOG_KEYS.userCoupons,
    queryFn: () => catalogApi.getUserCoupons(),
  });
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, date }) => catalogApi.validateCoupon(code, date),
  });
}

// ─── Cities ──────────────────────────────────────────────────────────────────
export function useCities(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.cities(params),
    queryFn: () => catalogApi.getCities(params),
  });
}

// ─── Banners ─────────────────────────────────────────────────────────────────
export function useBanners(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.banners(params),
    queryFn: () => catalogApi.getBanners(params),
  });
}

export function useUserBanners() {
  return useQuery({
    queryKey: CATALOG_KEYS.userBanners,
    queryFn: () => catalogApi.getUserBanners(),
  });
}

// ─── Customers ───────────────────────────────────────────────────────────────
export function useCustomers(params) {
  return useQuery({
    queryKey: CATALOG_KEYS.customers(params),
    queryFn: () => catalogApi.getCustomers(params),
  });
}
