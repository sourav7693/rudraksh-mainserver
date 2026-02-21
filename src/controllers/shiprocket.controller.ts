import type { Request, Response } from "express";
import { shiprocketClient } from "../services/shiprocket.client";
import { CourierOption } from "../types/types";
import { assignAwbToShipment, createShiprocketOrder, getCheapestCourier } from "../services/shiprocket.service";
export const serviceabilityCheck = async (req : Request, res : Response) => {
  try {
    const {
      pickup_postcode,
      delivery_postcode,
      weight = 1, //kgs
      cod = 0,
    } = req.body;

    if (
      !pickup_postcode ||
      !delivery_postcode ||
      weight === undefined ||
      cod === undefined
    ) {
      return res.status(400).json({
        error:
          "pickup_postcode, delivery_postcode, weight and cod are required",
      });
    }

    const response = await shiprocketClient.get("/courier/serviceability/", {
      params: {
        pickup_postcode,
        delivery_postcode,
        weight,
        cod,
      },
    });

    // Extract courier list
    const couriers: CourierOption[] =
      response.data?.data?.available_courier_companies || [];

    if (!couriers.length) {
      return res.status(404).json({
        message: "No courier service available for this route",
      });
    }

    // Find courier with lowest rate
    const cheapestCourier = couriers.reduce(
      (min: CourierOption, curr: CourierOption) => {
        return curr.rate < min.rate ? curr : min;
      },
    );

    //  Filtered response
    const filteredResult = {
      courier_name: cheapestCourier.courier_name,
      rate: cheapestCourier.rate,
      etd: cheapestCourier.etd,
      estimated_delivery_days: cheapestCourier.estimated_delivery_days,
      courier_company_id: cheapestCourier.courier_company_id,
    };

    // res.json(response.data);
    return res.json({
      success: true,
      best_courier: filteredResult,
    });
  } catch (error) {
    console.error(
      "Serviceability Error:",
      error.response?.data || error.message,
    );
    res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Server Error" });
  }
};

export const shipWithCheapestCourier = async (req: Request, res: Response) => {
  try {
    // Create Order after confirm
    const orderData = await createShiprocketOrder(req.body);

    const shipment_id = orderData.shipment_id;

    // Get Cheapest Courier
    const courier = await getCheapestCourier({
      pickup_postcode: req.body.pickup_postcode,
      delivery_postcode: req.body.delivery_postcode,
      weight: req.body.weight,
      cod: req.body.cod ? 1 : 0,
    });

    // Assign AWB
    const awbData = await assignAwbToShipment({
      shipment_id,
      courier_id: courier.courier_company_id,
    });

    return res.json({
      success: true,
      shipment_id,
      courier_assigned: {
        courier_name: courier.courier_name,
        courier_id: courier.courier_company_id,
        rate: courier.rate,
      },
      awb_details: awbData,
    });
  } catch (error) {
    console.error("Shipping Error:", error.response?.data || error.message);
    return res.status(500).json({
      error: "Shipping failed",
      details: error.message,
    });
  }
};



export const trackOrder = async (req: Request, res: Response) => {
  try {
    const { awb } = req.params;

    const response = await shiprocketClient.get(`/courier/track/awb/${awb}`);

    return res.json(response.data);
  } catch (error: any) {
    console.error("Track Order Error:", error.response?.data || error.message);

    return res
      .status(error.response?.status || 500)
      .json(error.response?.data || { error: "Server Error" });
  }
};
