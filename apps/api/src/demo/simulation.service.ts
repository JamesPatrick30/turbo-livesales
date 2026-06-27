// demo/simulation.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { DemoStoreService } from './demo-store.service';
import { PrismaService } from '../prisma/prisma.service';

const ORDER_TYPES = ['DINE_IN', 'TAKEOUT', 'DELIVERY'];
const CASHIER_ID = 'demo-cashier-id';

@Injectable()
export class SimulationService implements OnModuleDestroy {
  private intervals: NodeJS.Timeout[] = [];
  private running = false;
  private adminOwnerId: string | null = null;
  private menuItems: any[] = [];

  constructor(
    private readonly demoStore: DemoStoreService,
    private readonly prisma: PrismaService,
  ) {}

  async start(adminOwnerId: string) {
    if (this.running) return { running: true, message: 'Already running' };

    // Pull real menu items once
    this.menuItems = await this.prisma.client.menuItem.findMany({
      where: { adminOwnerId },
    });
    if (!this.menuItems.length) {
      return { running: false, message: 'No menu items found' };
    }

    this.adminOwnerId = adminOwnerId;
    this.running = true;

    // Spawn a new order every 12–30s
    const scheduleNextOrder = () => {
      const delay = this.randomMs(2000, 7000);
      const t = setTimeout(() => {
        if (!this.running) return;
        this.spawnOrder();
        scheduleNextOrder(); // reschedule with new random delay
      }, delay);
      this.intervals.push(t);
    };

    scheduleNextOrder();

    // Progress order statuses every 10s
    this.intervals.push(
      setInterval(() => this.progressOrders(), 5000),
    );

    // Auto-remove COMPLETED orders every 60s
    this.intervals.push(
      setInterval(() => this.cleanupOrders(), 60000),
    );

    return { running: true };
  }

  stop() {
    this.intervals.forEach(clearInterval);
    this.intervals.forEach((t) => clearTimeout(t));
    this.intervals = [];
    this.running = false;
    this.adminOwnerId = null;
    return { running: false };
  }

  isRunning() {
    return this.running;
  }

  onModuleDestroy() {
    this.stop();
  }

  // ── PRIVATE ──────────────────────────────────────────────────────────

  private spawnOrder() {
    if (!this.adminOwnerId || !this.menuItems.length) return;

    const itemCount = this.randomInt(1, 4);
    const shuffled = [...this.menuItems].sort(() => Math.random() - 0.5);
    const picked = shuffled.slice(0, itemCount);

    const items = picked.map((menuItem) => ({
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPrice: Number(menuItem.price),
      quantity: this.randomInt(1, 3),
      category: menuItem.category ?? 'UNCATEGORIZED',
    }));

    this.demoStore.addOrder(
      {
        items,
        orderType: ORDER_TYPES[this.randomInt(0, ORDER_TYPES.length - 1)],
        paymentMethod: Math.random() > 0.3 ? 'CASH' : 'CARD',
      },
      this.adminOwnerId,
      CASHIER_ID,
    );
  }

  private progressOrders() {
    if (!this.adminOwnerId) return;

    const flow = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
    const active = this.demoStore.getActiveOrders(this.adminOwnerId);

    for (const order of active) {
      const idx = flow.indexOf(order.orderstatus);
      if (idx === -1 || idx >= flow.length - 1) continue;

      // 40% chance to progress each tick — feels organic
      if (Math.random() < 0.4) {
        this.demoStore.updateOrderStatus(order.id, flow[idx + 1]);
      }
    }
  }

  private cleanupOrders() {
    if (!this.adminOwnerId) return;

    const all = this.demoStore.getOrders(this.adminOwnerId);
    for (const order of all) {
      if (order.orderstatus === 'SERVED') {
        // DemoStoreService doesn't have delete — add this small method
        this.demoStore.removeOrder(order.id);
      }
    }
  }

  private randomMs(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}