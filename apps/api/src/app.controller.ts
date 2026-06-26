import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly config: ConfigService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): string {
    return this.appService.getHealth();
  }

  @Get('status')
  status() {
    const isDemo = this.config.get<boolean>('demo.enabled');
    return {
      status: 'ok',
      demo: isDemo,
      message: isDemo
        ? 'App is running in demo mode. No data will be persisted.'
        : 'App is running normally.',
    };
  }
}
