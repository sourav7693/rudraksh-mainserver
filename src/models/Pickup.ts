import mongoose from "mongoose";

export interface PickupDoc extends mongoose.Document {
  pickupId?: string;
  pickup_location: string;
  name: string;
  email: string;
  phone: string; // should be number for shiprocket
  address: string;
  address_2?: string;
  city: string;
  state: string;
  country: string;
  pin_code: string; // should be number for shiprocket
  pickup_id?: string; // shiprocket pickup_id
  status?: boolean;  
  createdAt?: Date;
  updatedAt?: Date;
}

const PickupSchema = new mongoose.Schema<PickupDoc>(
  {
    pickupId: { type: String, required: true, unique: true },
    pickup_location: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    address_2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pin_code: { type: String, required: true },
    pickup_id: { type: String, unique: true, required: true }, // shiprocket pickup_id
    status: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Pickup = mongoose.model<PickupDoc>("Pickup", PickupSchema);
