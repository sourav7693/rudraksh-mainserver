import type { Request, Response } from "express";
import { Pickup, type PickupDoc } from "../models/Pickup";
import { generateCustomId } from "../utils/generateCustomId";
import { createShiprocketWarehouse } from "../services/shiprocket.wareHouse";
import axios from "axios";

export const createPickup = async (req: Request, res: Response) => {
    const {  pickup_location,
  name,
  email,
  phone,
  address,
  address_2,
  city,
  state,
  country,
  pin_code, } = req.body;

    const pickupId = await generateCustomId(Pickup, "pickupId", "PICK");
   

    try {
     const shiprocketResponse = await createShiprocketWarehouse(req.body as PickupDoc);
     if(!shiprocketResponse || !shiprocketResponse.pickup_id) {
      console.error("Invalid response from Shiprocket:", shiprocketResponse);
      return res.status(500).json({
        success: false,
        message: "Failed to create pickup in Shiprocket",
      });
     }

      const pickup = await Pickup.create({
        pickupId,
        pickup_location,
        name,
        email,
        phone,
        address,
        address_2,
        city,
        state,
        country,
        pin_code,
        pickup_id: shiprocketResponse.pickup_id,
      });

    return res.status(201).json({
      success: true,
      message: "Pickup created successfully",
      pickup_saved: pickup,
      shiprocket_response: shiprocketResponse,
    });

    } catch (error) {
      console.error("Error creating warehouse in Shiprocket:", error);
      return res.status(500).json({
        success: false,
        message: "Error creating warehouse in Shiprocket",
      });
    }
    
}

export const getPickups = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const sort = req.query.sort ? String(req.query.sort) : "desc";
    const sortOrder = sort === "asc" ? 1 : -1;

    const filter: any = {};

    if (req.query.status) {
      filter.status = req.query.status === "true";
    }
    const total = await Pickup.countDocuments(filter);
    const pickups = await Pickup.find(filter)
      .sort({ createdAt: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean<PickupDoc[]>();

    return res.json({
      success: true,
      page,
      total,
      pages: Math.ceil(total / limit),
      pickups,
    });
  } catch (error) {
    res.status(500).json({
      message: "Something went wrong",
      success: false,
      page: 0,
      total: 0,
      pages: 0,
    });
  }
};

// export const updatePickup = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const { name, address1, address2, city, state, pin, mobile, status } =
//       req.body;

//     const pickup = await Pickup.findOne({ pickupId: id });
//     if (!pickup) {
//       return res.status(404).json({ message: "Pickup not found" });
//     }

//     if (name !== undefined) pickup.name = name;
//     if (address1 !== undefined) pickup.address1 = address1;
//     if (address2 !== undefined) pickup.address2 = address2;
//     if (city !== undefined) pickup.city = city;
//     if (state !== undefined) pickup.state = state;
//     if (pin !== undefined) pickup.pin = pin;
//     if (mobile !== undefined) pickup.mobile = mobile;
//     if (status !== undefined) pickup.status = status;

//     await pickup.save();
//     res.status(200).json(pickup);
//   } catch (error) {
//     res
//       .status(500)
//       .json(error instanceof Error ? error.message : "Internal Server Error");
//   }
// };

// export const deletePickup = async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;

//     const pickup = await Pickup.findOne({
//       $or: [
//         { pickupId: id },
//         {
//           _id: mongoose.Types.ObjectId.isValid(id as string) ? id : null,
//         },
//       ],
//     });
//     if (!pickup) {
//       return res.status(404).json({ message: "Pickup not found" });
//     }

//     const isPickupUsed = await Product.exists({ pickup: pickup._id });

//     if (isPickupUsed) {
//       return res.status(400).json({ message: "Pickup is used in products" });
//     }

//     await Pickup.findOneAndDelete({
//       $or: [
//         { pickupId: id },
//         {
//           _id: mongoose.Types.ObjectId.isValid(id as string) ? id : null,
//         },
//       ],
//     });
//     res.status(200).json({ message: "Pickup deleted" });
//   } catch (error) {
//     res
//       .status(500)
//       .json(error instanceof Error ? error.message : "Internal Server Error");
//   }
// };

export async function getLocationDetailsWithPin(req: Request, res: Response) {
  try {
    const { pin } = req.params;
    const location = await axios.get(`${process.env.POSTAL_API}/${pin}`);
    res.status(200).json(location.data);
  } catch (error) {
    res
      .status(500)
      .json(error instanceof Error ? error.message : "Internal Server Error");
  }
}
