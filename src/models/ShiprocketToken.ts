import mongoose from "mongoose";

export interface ShiprocketAuthDocument extends mongoose.Document {
  company_id: number;
  created_at: string;
  email: string;
  first_name: string;
  last_name: string;
  id: number;
  token: string;
}

const shiprocketSchema = new mongoose.Schema<ShiprocketAuthDocument>(
  {
    company_id: Number,
    created_at: String,
    email: String,
    first_name: String,
    last_name: String,
    id: Number,
    token: String,
  },
  { timestamps: true },
);

export const ShiprocketAuth =
  mongoose.models.ShiprocketAuth ||
  mongoose.model<ShiprocketAuthDocument>("ShiprocketAuth", shiprocketSchema);