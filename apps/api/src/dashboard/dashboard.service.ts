import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { receiveMessageOnPort } from 'worker_threads';

@Injectable()
export class DashboardService {

    constructor(private readonly prisma: PrismaService) {}
  // ── Helpers ────────────────────────────────────────────────────────────────

  private getTodayRange() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private getYesterdayRange() {
    const start = new Date();
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  private formatHour(h: number): string {
    if (h === 0) return '12A';
    if (h < 12) return `${h}A`;
    if (h === 12) return '12P';
    return `${h - 12}P`;
  }

  private pctChange(current: number, previous: number): string {
    if (previous === 0) return '+0%';
    const diff = Math.round(((current - previous) / previous) * 100);
    return `${diff >= 0 ? '+' : ''}${diff}%`;
  }

  // ── KPI Metrics ────────────────────────────────────────────────────────────

  async getMetrics(adminOwnerId: string) {
    const { start: todayStart, end: todayEnd } = this.getTodayRange();
    const { start: yestStart, end: yestEnd } = this.getYesterdayRange();

    const baseWhere = { adminOwnerId, orderstatus: { not: 'VOID' as const } };

    const [todaySales, yesterdaySales, hourlySales] = await Promise.all([
      this.prisma.client.sales.findMany({
        where: {
          ...baseWhere,
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        select: { total: true, createdAt: true },
      }),
      this.prisma.client.sales.findMany({
        where: {
          ...baseWhere,
          createdAt: { gte: yestStart, lte: yestEnd },
        },
        select: { total: true },
      }),
      this.getHourlySales(adminOwnerId),
    ]);

    const toNum = (d: any) => parseFloat(d.toString());

    const todayTotal = todaySales.reduce((sum, s) => sum + toNum(s.total), 0);
    const yesterdayTotal = yesterdaySales.reduce((sum, s) => sum + toNum(s.total), 0);
    const todayCount = todaySales.length;
    const yesterdayCount = yesterdaySales.length;
    const avgOrder = todayCount > 0 ? todayTotal / todayCount : 0;
    const yesterdayAvg = yesterdayCount > 0 ? yesterdayTotal / yesterdayCount : 0;

    const peakHour = hourlySales.reduce(
      (best, h) => (h.amount > best.amount ? h : best),
      hourlySales[0] ?? { hour: 'N/A', amount: 0 },
    );

    return {
      salesToday: todayTotal,
      salesTrend: this.pctChange(todayTotal, yesterdayTotal),
      salesTrendUp: todayTotal >= yesterdayTotal,

      orders: todayCount,
      ordersTrend: todayCount - yesterdayCount,
      ordersTrendUp: todayCount >= yesterdayCount,

      avgOrder,
      avgOrderTrend: this.pctChange(avgOrder, yesterdayAvg),
      avgOrderTrendUp: avgOrder >= yesterdayAvg,

      peakHour: peakHour.hour,
      peakHourAmount: peakHour.amount,
    };
  }

  // ── Hourly Sales ────────────────────────────────────────────────────────────

  async getHourlySales(adminOwnerId: string) {
    const { start, end } = this.getTodayRange();

    const sales = await this.prisma.client.sales.findMany({
      where: {
        adminOwnerId,
        orderstatus: { not: 'VOID' },
        createdAt: { gte: start, lte: end },
      },
      select: { total: true, createdAt: true },
    });

    const hourMap = new Map<number, number>();
    for (const sale of sales) {
      const h = new Date(sale.createdAt).getHours();
      const amount = parseFloat(sale.total.toString());
      hourMap.set(h, (hourMap.get(h) ?? 0) + amount);
    }

    // 10AM–9PM — adjust range to your business hours
    return Array.from({ length: 12 }, (_, i) => {
      const h = i + 10;
      return {
        hour: this.formatHour(h),
        amount: Math.round(hourMap.get(h) ?? 0),
      };
    });
  }

  // ── Top Items ────────────────────────────────────────────────────────────────

  async getTopItems(adminOwnerId: string, limit = 5) {
    const { start, end } = this.getTodayRange();

    // SaleItem has name snapshot + menuItemId, grouped by menuItemId
    const grouped = await this.prisma.client.saleItem.groupBy({
      by: ['menuItemId', 'name'],     // name is a snapshot on SaleItem itself
      where: {
        sales: {
          adminOwnerId,
          orderstatus: { not: 'VOID' },
          createdAt: { gte: start, lte: end },
        },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    return grouped.map((item) => ({
      name: item.name,                                        // from snapshot
      sold: item._sum.quantity ?? 0,
      revenue: parseFloat((item._sum.lineTotal ?? 0).toString()),
    }));
  }

  // ── Active Orders ────────────────────────────────────────────────────────────

  async getActiveOrders(adminOwnerId: string) {
    const orders = await this.prisma.client.sales.findMany({
      where: {
        adminOwnerId,
        orderstatus: { in: ['PENDING', 'PREPARING', 'READY', 'SERVED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        receiptNo: true,
        Ordertype: true,
        total: true,
        orderstatus: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });

    return orders.map((o) => ({
      id: o.id,
      receiptNo: o.receiptNo,
      table: o.Ordertype === 'DINE_IN'   ? 'Dine In'
           : o.Ordertype === 'TAKEAWAY'  ? 'Takeout'
           : 'Delivery',
      items: o._count.items,
      total: parseFloat(o.total.toString()),
      status: o.orderstatus.toLowerCase(),   // matches your STATUS_STYLES keys
      time: new Date(o.createdAt).toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
    }));
  }
}