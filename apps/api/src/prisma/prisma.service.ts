import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from "@nestjs/common";
import { prisma } from "@repo/db";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    await prisma.$connect();
    this.logger.log("Connected to Neon via Prisma");
  }

  async onModuleDestroy() {
    await prisma.$disconnect();
  }

  get client() {
    return prisma;
  }
}