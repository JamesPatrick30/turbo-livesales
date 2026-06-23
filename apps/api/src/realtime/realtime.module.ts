import { Module } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { RealtimeGateway } from './realtime.gateway';
import { AuthModule } from '../auth/auth.module';
@Module({
  imports: [AuthModule],
  providers: [RealtimeService, RealtimeGateway],
  exports: [RealtimeService, RealtimeGateway],  // Export RealtimeService and RealtimeGateway for use in other modules
})
export class RealtimeModule {}
