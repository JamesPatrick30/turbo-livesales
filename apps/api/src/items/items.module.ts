import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [PrismaModule, AuthModule],
  providers: [ItemsService],
  controllers: [ItemsController]
})
export class ItemsModule {}
