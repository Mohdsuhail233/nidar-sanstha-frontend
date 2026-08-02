import axios from 'axios';

const API_BASE_URL = "https://api.duaekhairfoundation.org";

/**
 * Dedicated Axios instance for health checks.
 * 
 * CRITICAL: This uses a SEPARATE Axios instance from the main `api` export.
 * The main `api` instance has an interceptor that redirects to /maintenance on 5xx errors.
 * If we used that same instance for health checks, the health-check failure would trigger
 * the interceptor → redirect to /maintenance → which polls health → which fails → redirect again.
 * 
 * By using an isolated instance, health-check failures are handled gracefully
 * without triggering any redirect logic.
 */
const healthAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout — generous enough for slow cold starts
});

export interface HealthCheckResult {
  isHealthy: boolean;
}

/**
 * Checks if the backend is reachable and healthy.
 * 
 * Hits the Spring Boot Actuator health endpoint.
 * Returns { isHealthy: true } if the backend responds with 2xx.
 * Returns { isHealthy: false } for any error (network, timeout, 5xx, etc.)
 * 
 * This function never throws — it always returns a result object.
 */
export const checkBackendHealth = async (): Promise<HealthCheckResult> => {
  try {
    const response = await healthAxios.get('/actuator/health');
    // Spring Boot Actuator returns { status: "UP" } when healthy
    // We accept any 2xx as healthy — don't rely on response body shape
    return { isHealthy: response.status >= 200 && response.status < 300 };
  } catch {
    return { isHealthy: false };
  }
};
