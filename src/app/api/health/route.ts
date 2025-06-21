import { NextResponse } from 'next/server';
import { generateHealthCheck, withMonitoring } from '@/lib/monitoring';

/**
 * Health check endpoint for monitoring and load balancer probes
 */
async function healthHandler() {
  const healthCheck = await generateHealthCheck();

  const status =
    healthCheck.status === 'healthy'
      ? 200
      : healthCheck.status === 'degraded'
        ? 200
        : 503;

  return NextResponse.json(healthCheck, { status });
}

export const GET = withMonitoring(healthHandler, {
  name: 'health_check',
  timeout: 5000,
});

// Support HEAD requests for simple health probes
export const HEAD = withMonitoring(
  async () => {
    const healthCheck = await generateHealthCheck();
    const status = healthCheck.status === 'healthy' ? 200 : 503;

    return new NextResponse(null, { status });
  },
  {
    name: 'health_check_head',
    timeout: 2000,
  }
);
