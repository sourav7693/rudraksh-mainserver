export interface ServiceabilityRequest {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod: boolean;
}

export interface CourierOption {
  courier_name: string;
  rate: number;
  etd: string;
  estimated_delivery_days: number;
  courier_company_id: number;
}