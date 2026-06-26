import type { orderStatusUpdateRequest } from "@repo/types";
export interface OrderType {
  id: string;
  receiptNo: string;
    Ordertype: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
    orderstatus: "PENDING" | "PREPARING" | "READY" | "SERVED" | "VOID";
    createdAt: string;
    items: {
      name: string;
      quantity: number;
      category: string;
    }[];
}
export interface OrderStatusUpdateRequest extends orderStatusUpdateRequest {}

export interface OrderHistory{
    id: string;
    Ordertype: "DINE_IN" | "TAKEAWAY" | "DELIVERY";
    orderstatus: "PENDING" | "PREPARING" | "READY" | "SERVED" | "VOID";
    readyAt: string;
    receiptNo: string;
    createdAt: string;
    items: {
      name: string;
      quantity: number;
      unitPrice: number;
      category: string;
    }[];
    prepTime: string;
}