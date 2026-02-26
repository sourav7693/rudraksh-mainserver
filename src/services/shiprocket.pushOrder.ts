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
    pickup_location: pickup.pickup_location,

    billing_customer_name:
      address.name.trim().split(" ")[0] ??
      order.customer.name.trim().split(" ")[0],
    billing_last_name:
      address.name.trim().split(" ")[1] ??
      order.customer.name.trim().split(" ")[1],
    billing_address: `${address.area}${
      address.landmark ? ", " + address.landmark : ""
    }`,
    billing_pincode: Number(address.pin),
    billing_city: address.city,
    billing_state: address.state,
    billing_phone: address.mobile,

    shipping_is_billing: true,

    /* ✅ SINGLE PRODUCT */
    order_items: [
      {
        name: product.name,
        sku: product.productId,
        units: product.quantity,
        selling_price: product.price,
      },
    ],

    payment_method: order.paymentStatus === "Paid" ? "Prepaid" : "cod",
    sub_total: order.paymentStatus === "Paid" ? 0 : order.orderValue,

    weight: product.weight,
    length: product.dimensions[0].length,
    breadth: product.dimensions[0].width,
    height: product.dimensions[0].height,
  };

     // Get Cheapest Courier
      const courier = await getCheapestCourier({
        pickup_postcode: pickup?.pin_code,
        delivery_postcode: address.pin,
        weight: product.weight,
        cod: order.paymentStatus !== "Paid" ? 1 : 0,
      });

   const response = await shiprocketClient.post("/orders/create/adhoc", payload);
  
    const shipment_id = response.data?.shipment_id;
    
    console.log("🚚 Shiprocket push-order:", response.data);

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
