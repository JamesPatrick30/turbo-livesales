import { type DriveStep } from "driver.js";

export const adminDashboardSteps: DriveStep[] = [
  {
    // Header refresh button — good first stop, non-intrusive
    element: "[data-tour='admin-refresh']",
    popover: {
      title: "Refresh Dashboard",
      description:
        "Manually re-fetch all metrics, charts, and orders. The dashboard also updates automatically via WebSocket — this is just for when you want an instant resync.",
      side: "bottom",
      align: "end",
    },
  },
  {
    // KPI stat cards grid
    element: "[data-tour='admin-kpi-grid']",
    popover: {
      title: "Today's KPIs",
      description:
        "Sales, total orders, average order value, and peak hour — all compared against yesterday. Green means up, red means down.",
      side: "bottom",
      align: "start",
    },
  },
  {
    // Hourly revenue bar chart
    element: "[data-tour='admin-hourly-chart']",
    popover: {
      title: "Revenue by Hour",
      description:
        "The amber bar is your peak hour. Hover any bar to see the exact peso amount for that hour.",
      side: "top",
      align: "start",
    },
  },
  {
    // Top items list
    element: "[data-tour='admin-top-items']",
    popover: {
      title: "Top Items",
      description:
        "Your best-selling dishes today, ranked by units sold. The progress bar shows each item's share relative to the top seller.",
      side: "top",
      align: "start",
    },
  },
  {
    // Active orders panel
    element: "[data-tour='admin-active-orders']",
    popover: {
      title: "Active Orders",
      description:
        "Live order feed — new tickets appear here the moment the cashier submits them. The dot color shows status: amber = pending, blue (pulsing) = preparing, green = ready.",
      side: "top",
      align: "end",
    },
  },
  {
    // "View all →" link
    element: "[data-tour='admin-view-all-orders']",
    popover: {
      title: "Full Order Management",
      description:
        "Jump to the Orders page for the complete list with filtering, voiding, and detailed breakdowns.",
      side: "left",
      align: "center",
    },
  },
];