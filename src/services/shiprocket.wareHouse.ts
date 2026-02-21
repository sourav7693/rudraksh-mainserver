import type { PickupDoc } from "../models/Pickup";
import { shiprocketClient } from "./shiprocket.client";

export const createShiprocketWarehouse = async (pickup: PickupDoc) => {
  const payload = {
    pickup_location: pickup.pickup_location,
    name: pickup.name,
    email: pickup.email,
    phone: Number(pickup.phone),
    address: pickup.address,
    address_2: pickup?.address_2 || "",
    city: pickup.city,
    state: pickup.state,
    country: pickup.country,
    pin_code: Number(pickup.pin_code),
  };

  const { data } = await shiprocketClient.post(
    "/settings/company/addpickup",
    payload,
  );

  if (!data.success) {
    throw new Error(`Create warehouse failed: ${data.message}`);
  }
  
  return {
    company_id: data.address.company_id,
    pickup_id: data.pickup_id,
    pickup_code: data.address.pickup_code,
    // full_response: data,
  };
};
