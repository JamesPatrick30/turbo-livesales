// demo/demo-store.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DemoStoreService {
    private orders = new Map<string, any>();
    private nextSequence = 1;

    private generateReceiptNo(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const seq = String(this.nextSequence++).padStart(4, '0');
        return `LS-${year}${month}${day}-${seq}`;
    }

    private formatHour(hour: number): string {
        const period = hour >= 12 ? 'PM' : 'AM';
        const h = hour % 12 === 0 ? 12 : hour % 12;
        return `${h} ${period}`;
    }

    // ── CREATE ────────────────────────────────────────────────────────
    addOrder(dto: any, adminOwnerId: string, cashierId: string) {
        const id = crypto.randomUUID();
        const now = new Date();

        // Build item snapshots matching SaleItem shape
        let totalCents = 0;
        const items = (dto.items ?? []).map((item: any) => {
        const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
        const unitPriceCents = Math.round(unitPrice * 100);
        const lineTotalCents = unitPriceCents * item.quantity;
        totalCents += lineTotalCents;

        return {
            id: crypto.randomUUID(),
            salesId: id,
            menuItemId: item.menuItemId,
            name: item.name ?? 'Demo Item',
            unitPrice,
            quantity: item.quantity,
            category: item.category ?? 'UNCATEGORIZED',
            lineTotal: lineTotalCents / 100,
            createdAt: now,
        };
        });

        const order = {
        id,
        receiptNo: this.generateReceiptNo(),
        adminOwnerId,
        cashierId,
        cashier: { id: cashierId, name: 'Demo Cashier' },
        items,
        paymentMethod: dto.paymentMethod ?? 'CASH',
        orderstatus: 'PENDING',
        Ordertype: dto.orderType,
        total: totalCents / 100,
        readyAt: null,
        createdAt: now,
        };

        this.orders.set(id, order);
        return order;
    }

    // ── READ ──────────────────────────────────────────────────────────
    getOrders(adminOwnerId: string) {
        return [...this.orders.values()]
        .filter((o) => o.adminOwnerId === adminOwnerId)
        .map(({ paymentMethod, total, cashier, ...rest }) => rest); // match getOrders() shape
    }

    getActiveOrders(adminOwnerId: string) {
        return [...this.orders.values()]
        .filter(
            (o) =>
            o.adminOwnerId === adminOwnerId &&
            ['PENDING', 'PREPARING', 'READY'].includes(o.orderstatus),
        )
        .map((o) => ({
            id: o.id,
            receiptNo: o.receiptNo,
            Ordertype: o.Ordertype,
            orderstatus: o.orderstatus,
            total: o.total,
            createdAt: o.createdAt,
            items: o.items.map((i: any) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            })),
        }));
    }

    getSales(adminOwnerId: string) {
        return [...this.orders.values()]
        .filter((o) => o.adminOwnerId === adminOwnerId)
        .map((o) => ({
            id: o.id,
            receiptNo: o.receiptNo,
            cashier: o.cashier,
            items: o.items.map((i: any) => ({ name: i.name, quantity: i.quantity })),
            orderstatus: o.orderstatus,
            Ordertype: o.Ordertype,
            total: o.total,
            createdAt: o.createdAt,
        }));
    }

    // ── UPDATE ────────────────────────────────────────────────────────
    updateOrderStatus(orderId: string, newStatus: string) {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const updated = {
        ...order,
        orderstatus: newStatus,
        readyAt: newStatus === 'READY' && !order.readyAt ? new Date() : order.readyAt,
        };

        this.orders.set(orderId, updated);
        return { message: 'Order status updated successfully', data: updated };
    }

    recallOrder(orderId: string) {
        const order = this.orders.get(orderId);
        if (!order) return null;

        const updated = { ...order, orderstatus: 'PREPARING', readyAt: null };
        this.orders.set(orderId, updated);
        return updated;
    }

    getHistory(adminOwnerId: string) {
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const orders = [...this.orders.values()].filter(
        (o) =>
            o.adminOwnerId === adminOwnerId &&
            ['READY', 'SERVED'].includes(o.orderstatus) &&
            o.createdAt >= dayStart &&
            o.createdAt <= dayEnd,
        );

        const ordersWithReadyAt = orders.filter((o) => o.readyAt);
        const avgPrepMinutes =
        ordersWithReadyAt.length > 0
            ? ordersWithReadyAt.reduce((sum: number, o: any) => {
                return sum + (o.readyAt.getTime() - o.createdAt.getTime()) / 1000 / 60;
            }, 0) / ordersWithReadyAt.length
            : 0;

        const hourBuckets: Record<number, number> = {};
        for (const o of ordersWithReadyAt) {
        const hour = o.readyAt.getHours();
        hourBuckets[hour] = (hourBuckets[hour] ?? 0) + 1;
        }

        const peakHour =
        Object.keys(hourBuckets).length > 0
            ? Object.entries(hourBuckets).sort((a, b) => b[1] - a[1])[0][0]
            : null;

        const peakHourLabel = peakHour ? this.formatHour(Number(peakHour)) : 'N/A';

        const peakHourOrders = ordersWithReadyAt.filter(
        (o: any) => o.readyAt.getHours() === Number(peakHour),
        );
        const peakAvgPrep =
        peakHourOrders.length > 0
            ? peakHourOrders.reduce((sum: number, o: any) => {
                return sum + (o.readyAt.getTime() - o.createdAt.getTime()) / 1000 / 60;
            }, 0) / peakHourOrders.length
            : 0;

        return {
        stats: {
            fulfilled: orders.length,
            avgPrepMinutes: Math.round(avgPrepMinutes * 10) / 10,
            peakHour: peakHourLabel,
            peakAvgPrepMinutes: Math.round(peakAvgPrep * 10) / 10,
        },
        orders: orders.map((o) => ({
            id: o.id,
            receiptNo: o.receiptNo,
            Ordertype: o.Ordertype,
            orderstatus: o.orderstatus,
            readyAt: o.readyAt,
            createdAt: o.createdAt,
            prepTime: o.readyAt
            ? `${Math.round((o.readyAt.getTime() - o.createdAt.getTime()) / 1000 / 60)} min`
            : '—',
            items: o.items.map((i: any) => ({ name: i.name, quantity: i.quantity })),
        })),
        };
    }

    // ── UTILS ─────────────────────────────────────────────────────────
    reset() {
        this.orders.clear();
        this.nextSequence = 1;
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────

    getDemoMetrics() {
        return {
        salesToday: 12480.50,
        salesTrend: '+18%',
        salesTrendUp: true,

        orders: 47,
        ordersTrend: 6,
        ordersTrendUp: true,

        avgOrder: 265.54,
        avgOrderTrend: '+5%',
        avgOrderTrendUp: true,

        peakHour: '12P',
        peakHourAmount: 3200,
        };
    }

    getDemoHourlySales() {
        // 10AM–9PM matching your real service's range
        return [
        { hour: '10A', amount: 420 },
        { hour: '11A', amount: 860 },
        { hour: '12P', amount: 3200 },
        { hour: '1P',  amount: 2100 },
        { hour: '2P',  amount: 980 },
        { hour: '3P',  amount: 640 },
        { hour: '4P',  amount: 520 },
        { hour: '5P',  amount: 1100 },
        { hour: '6P',  amount: 1850 },
        { hour: '7P',  amount: 2400 },
        { hour: '8P',  amount: 1560 },
        { hour: '9P',  amount: 850 },
        ];
    }

    getDemoTopItems() {
        return [
        { name: 'Chicken Inasal',  sold: 38, revenue: 5320.00 },
        { name: 'Pork Sinigang',   sold: 29, revenue: 4060.00 },
        { name: 'Lechon Kawali',   sold: 24, revenue: 3360.00 },
        { name: 'Halo-Halo',       sold: 21, revenue: 1890.00 },
        { name: 'Palabok',         sold: 18, revenue: 2520.00 },
        ];
    }

    getDemoActiveOrders() {
        const now = new Date();
        const t = (minusMinutes: number) =>
        new Date(now.getTime() - minusMinutes * 60000).toLocaleTimeString('en-PH', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        return [
        { id: 'demo-1', receiptNo: 'LS-20250101-0001', table: 'Dine In',  items: 3, total: 450.00, status: 'pending',   time: t(2)  },
        { id: 'demo-2', receiptNo: 'LS-20250101-0002', table: 'Takeout',  items: 1, total: 140.00, status: 'preparing', time: t(5)  },
        { id: 'demo-3', receiptNo: 'LS-20250101-0003', table: 'Dine In',  items: 4, total: 620.00, status: 'ready',     time: t(10) },
        { id: 'demo-4', receiptNo: 'LS-20250101-0004', table: 'Delivery', items: 2, total: 380.00, status: 'preparing', time: t(8)  },
        { id: 'demo-5', receiptNo: 'LS-20250101-0005', table: 'Dine In',  items: 5, total: 875.00, status: 'served',    time: t(15) },
        ];
    }
}