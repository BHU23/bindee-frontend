import type {
  PopularRouteResponse,
  PromotionResponse,
  RecentSearchResponse,
} from "../types/homeSearch";

export const recentSearchesFixture: RecentSearchResponse[] = [
  {
    id: "r1",
    tripType: "ROUND_TRIP",
    route: { origin: "BKK", destination: "CNX" },
    dates: { depart: "2026-10-14", return: "2026-10-18" },
    pax: { adults: 2, children: 1, infants: 0 },
    cabin: "ECONOMY",
  },
  {
    id: "r2",
    tripType: "ONE_WAY",
    route: { origin: "BKK", destination: "HKT" },
    dates: { depart: "2026-10-20" },
    pax: { adults: 1, children: 0, infants: 0 },
    cabin: "ECONOMY",
  },
];

export const popularRoutesFixture: PopularRouteResponse[] = [
  {
    origin: "BKK",
    destination: "CNX",
    city: "Chiang Mai",
    fromPricePerPax: 990,
  },
  { origin: "BKK", destination: "HKT", city: "Phuket", fromPricePerPax: 1290 },
  {
    origin: "BKK",
    destination: "SIN",
    city: "Singapore",
    fromPricePerPax: 2990,
  },
  { origin: "BKK", destination: "NRT", city: "Tokyo", fromPricePerPax: null },
];

export const promotionsFixture: PromotionResponse[] = [
  {
    id: "p1",
    title: "10 percent off every route",
    imageUrl: "/promotions/bindee10.jpg",
    route: { origin: "BKK", destination: "HKT" },
    promoCode: "BINDEE10",
    validUntil: "2026-12-31T16:59:59.999Z",
  },
];
