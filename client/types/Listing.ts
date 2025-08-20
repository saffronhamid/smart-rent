export interface Listing {
  _id: string;
  title: string;
  city: string;
  district?: string;
  size_m2: number;
  rooms: number;
  furnished: boolean;
  rent_cold: number;
  rent_warm?: number;
  lat?: number;
  lng?: number;
}
