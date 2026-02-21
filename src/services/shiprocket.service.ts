import { shiprocketClient } from "./shiprocket.client";
import { CourierOption } from "../types/types";

export const getCheapestCourier = async ({
  pickup_postcode,
  delivery_postcode,
  weight,
  cod,
}: {
  pickup_postcode: string;
  delivery_postcode: string;
  weight: number;
  cod: number;
}) => {
  const response = await shiprocketClient.get("/courier/serviceability/", {
    params: {
      pickup_postcode,
      delivery_postcode,
      weight,
      cod,
    },
  });

  const couriers: CourierOption[] =
    response.data?.data?.available_courier_companies || [];

  if (!couriers.length) {
    throw new Error("No courier service available");
  }

  const cheapestCourier = couriers.reduce(
    (min: CourierOption, curr: CourierOption) =>
      curr.rate < min.rate ? curr : min,
  );

  return cheapestCourier;
};

export const createShiprocketOrder = async (payload: any) => {
  const response = await shiprocketClient.post("/orders/create/adhoc", payload);

  const shipment_id = response.data?.shipment_id;

  if (!shipment_id) {
    throw new Error("Shipment ID not generated");
  }

  return response.data;
};

/**
 * Assign AWB to Shipment
 */
export const assignAwbToShipment = async ({
  shipment_id,
  courier_id,
}: {
  shipment_id: number;
  courier_id: number;
}) => {
  const response = await shiprocketClient.post("/courier/assign/awb", {
    shipment_id,
    courier_id,
  });

  return response.data;
};
