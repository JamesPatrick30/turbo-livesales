import { type DriveStep } from "driver.js";

export const cashierDashboardSteps: DriveStep[] = [
  {
    // Category pills strip
    element: "[data-tour='cashier-categories']",
    popover: {
      title: "Filter by Category",
      description:
        "Tap any pill to narrow the menu down to that category. The amber pill is the active filter — tap it again or pick another to switch.",
      side: "bottom",
      align: "start",
    },
  },
  {
    // Search input
    element: "[data-tour='cashier-search']",
    popover: {
      title: "Search the Menu",
      description:
        "Type any part of an item's name to find it instantly. Hit the × to clear and go back to the full list.",
      side: "bottom",
      align: "end",
    },
  },
  {
    // Menu grid
    element: "[data-tour='cashier-menu-grid']",
    popover: {
      title: "Menu Items",
      description:
        "Tap any item to add it to the ticket. The amber badge shows how many you've already added. Greyed-out items are sold out.",
      side: "right",
      align: "start",
    },
  },
  {
    // Order type switcher (Dine In / Takeaway / Delivery)
    element: "[data-tour='cashier-order-type']",
    popover: {
      title: "Order Type",
      description:
        "Switch between Dine In, Takeaway, and Delivery before submitting. This gets recorded on the receipt and shown to the kitchen.",
      side: "left",
      align: "start",
    },
  },
  {
    // Cart items area
    element: "[data-tour='cashier-cart']",
    popover: {
      title: "Current Ticket",
      description:
        "Your running order lives here. Use + / − to adjust quantities, or tap × to remove an item entirely. The ticket count badge updates as you go.",
      side: "left",
      align: "start",
    },
  },
  {
    // Payment method selector
    element: "[data-tour='cashier-payment']",
    popover: {
      title: "Payment Method",
      description:
        "Choose Cash, Card, or GCash before placing the order. You can change this right up until you tap Proceed.",
      side: "top",
      align: "center",
    },
  },
  {
    // Submit button
    element: "[data-tour='cashier-submit']",
    popover: {
      title: "Proceed to Payment",
      description:
        "Submits the ticket to the kitchen and records the sale. The button stays disabled until at least one item is in the cart.",
      side: "top",
      align: "center",
    },
  },
];