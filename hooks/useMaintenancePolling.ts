import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkBackendHealth } from '../services/healthService';

const POLL_INTERVAL_SECONDS = 30;

/**
 * Custom hook for the maintenance page.
 * 
 * Polls the backend health endpoint every 30 seconds.
 * When the backend becomes healthy, automatically navigates the user back to "/".
 * 
 * Returns:
 * - countdown: seconds until the next health check
 * - isChecking: true while a health check request is in-flight (for UI pulse animation)
 */
export const useMaintenancePolling = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(POLL_INTERVAL_SECONDS);
  const [isChecking, setIsChecking] = useState(false);
  
  // Use refs to avoid stale closures in setInterval callbacks
  const countdownRef = useRef(countdown);
  countdownRef.current = countdown;

  const performHealthCheck = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkBackendHealth();
      if (result.isHealthy) {
        // Backend is back! Navigate to home.
        // Use replace: true so pressing Back doesn't return to /maintenance
        navigate('/', { replace: true });
        return;
      }
    } finally {
      setIsChecking(false);
      // Reset countdown after each check
      setCountdown(POLL_INTERVAL_SECONDS);
    }
  }, [navigate]);

  useEffect(() => {
    // Run an immediate health check when the maintenance page mounts
    // (in case backend recovered between the redirect and page render)
    performHealthCheck();

    // Countdown timer — ticks every second
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Time's up — trigger health check
          performHealthCheck();
          return POLL_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdownInterval);
    };
  }, [performHealthCheck]);

  return { countdown, isChecking };
};
