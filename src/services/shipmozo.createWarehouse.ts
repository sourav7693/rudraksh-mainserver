import type { PickupDoc } from "../models/Pickup";
import { shiprocketClient } from "./shiprocket.client";

export const createShiprocketWarehouse = async (pickup: PickupDoc) => {
  const payload = {
    pickup_location: pickup.pickup_location,
    name: pickup.name,
    email: pickup.email,
    phone: pickup.phone,
    address: pickup.address,
    address_2: pickup.address_2,
    city: pickup.city,
    state: pickup.state,
    country: pickup.country,
    pin_code: pickup.pin_code,
  };

  const { data } = await shiprocketClient.post(
    "/settings/company/addpickup",
    payload,
  );

  if (!data.success) {
    throw new Error(`Create warehouse failed: ${data.message}`);
  }

  return String(data.data.company_id);
};
