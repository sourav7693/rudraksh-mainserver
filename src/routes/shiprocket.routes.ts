import express from "express";
import {
  serviceabilityCheck,
  shipWithCheapestCourier,
  trackOrder,
} from "../controllers/shiprocket.controller";

const router = express.Router();

router.post("/serviceability", serviceabilityCheck);
router.get("/track/:awb", trackOrder);

router.post("/ship", shipWithCheapestCourier);

export default router;