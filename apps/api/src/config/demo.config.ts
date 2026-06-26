import { registerAs } from '@nestjs/config';

export default registerAs('demo', () => ({
  enabled: process.env.DEMO_MODE === 'true',
}));