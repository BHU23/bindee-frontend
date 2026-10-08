/** Search criteria shared by the features that create or replay a search. */
export type TripType = "ONE_WAY" | "ROUND_TRIP";
export type Cabin = "ECONOMY";

export interface SearchQueryDto {
  tripType: TripType;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabin: Cabin;
}

export interface CreateSearchResponse {
  searchId: string;
  expiresAt: string;
}
