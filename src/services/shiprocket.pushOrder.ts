import type { CustomerDoc } from "../models/Customer";
import type { OrderDoc } from "../models/Order";
import { Pickup, type PickupDoc } from "../models/Pickup";
import type { ProductDoc } from "../models/Product";
import { shipmozoClient } from "./shipmozo.client";
import { shiprocketClient } from "./shiprocket.client";
import { getCheapestCourier } from "./shiprocket.service";

export interface OrderPopulatedDoc extends Omit<
  OrderDoc,
  "customer" | "address" | "items"
> {
  customer: CustomerDoc;
  address: any;
  items: Array<{
    product: ProductDoc & {
      pickup: PickupDoc;
    };
    quantity: number;
  }>;
}

export const createShiprocketOrder = async (
  order: any,
  address: {
    mobile: string;
    area: string;
    city: string;
    state: string;
    pin: string;
    landmark?: string;
    name?: string;
  },
) => {
  /* ✅ PRODUCT IS DIRECTLY ON ORDER */
  const product = order.product;

  if (!product) {
    throw new Error("Order product missing");
  }

  /* ✅ PICKUP FROM PRODUCT */
  const pickup = await Pickup.findById(product.pickup);

  if (!pickup?.pickup_id) {
    throw new Error("Shiprocket warehouse ID missing in pickup");
  }

 const payload = {
   order_id: order.orderId,
   order_date: new Date().toISOString().split("T")[0],
   pickup_location: pickup.pickup_location.trim(),

   billing_customer_name: address.name.split(" ")[0]
     ? address.name.split(" ")[0].trim()
     : "Rudraksh",
   billing_last_name: address.name.split(" ")[1]
     ? address.name.split(" ")[1].trim()
     : "Rudraksh",

   billing_address: `${address.area}, ${address.landmark || ""}`,
   billing_pincode: Number(address.pin),
   billing_city: address.city,
   billing_state: address.state
     .toLowerCase()
     .replace(/\b\w/g, (c) => c.toUpperCase()),
   billing_phone: address.mobile,

   shipping_is_billing: true,
   billing_country: "India",

   order_items: [
     {
       name: product.name,
       sku: product.productId,
       units: product.quantity || 1,
       selling_price: product.price,
     },
   ],

   payment_method: order.paymentStatus === "Paid" ? "Prepaid" : "COD",

   sub_total: order.orderValue,

   weight: Number(product.weight),
   length: Number(product.dimensions[0].length),
   breadth: Number(product.dimensions[0].width),
   height: Number(product.dimensions[0].height),
 };

     // Get Cheapest Courier
      const courier = await getCheapestCourier({
        pickup_postcode: pickup?.pin_code,
        delivery_postcode: address.pin,
        weight: product.weight,
        cod: order.paymentStatus !== "Paid" ? 1 : 0,
      });
      console.log(pickup.pickup_location.trim());
let response;
   try {
     response = await shiprocketClient.post(
       "/orders/create/adhoc",
       payload,
     );
   } catch (err: any) {
     console.log("SHIPROCKET ERROR ↓↓↓");
     console.log(err.response?.data);
     throw err;
   }
  
    const shipment_id = response.data?.shipment_id;
    
    console.log("🚚 Shiprocket push-order:", response.data);
   console.log(JSON.stringify(response.data, null, 2));
    if (!shipment_id) {
      throw new Error("Shipment ID not generated");
    }
  
    return {
      shiprocket: response.data,
      courier: {
        courier_name: courier.courier_name,
        courier_id: courier.courier_company_id,
        rate: courier.rate,
      },
    };
};
