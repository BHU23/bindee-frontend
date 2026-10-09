import { common } from "./common";
import { fareSelection } from "./fareSelection";
import { flightResults } from "./flightResults";
import { homeSearch } from "./homeSearch";
import { passengerInfo } from "./passengerInfo";
import { paymentMethod } from "./paymentMethod";
import { priceChanged } from "./priceChanged";
import { returnFlights } from "./returnFlights";
import { reviewHold } from "./reviewHold";

/** One namespace per feature: add `<feature>: { ... }` here when a feature is built. */
export const th = {
  common,
  fareSelection,
  flightResults,
  homeSearch,
  passengerInfo,
  paymentMethod,
  priceChanged,
  returnFlights,
  reviewHold,
};
