// src/demo/demo-allowed.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const DEMO_ALLOWED_KEY = 'demo_allowed';

/** Mark an endpoint as allowed to mutate data even in demo mode */
export const DemoAllowed = () => SetMetadata(DEMO_ALLOWED_KEY, true);