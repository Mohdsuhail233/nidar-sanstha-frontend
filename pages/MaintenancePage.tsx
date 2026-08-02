import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMaintenancePolling } from '../hooks/useMaintenancePolling';

/**
 * Nginx-style status code to message mapping.
 */
const STATUS_MESSAGES: Record<number, string> = {
  500: '500 Internal Server Error',
  502: '502 Bad Gateway',
  503: '503 Service Temporarily Unavailable',
  504: '504 Gateway Timeout',
};

const DEFAULT_MESSAGE = 'Service Temporarily Unavailable';

/**
 * Maintenance page styled to look like the default Nginx error page.
 * Reads the actual status code from the URL query param (?status=502).
 * Polling and auto-recovery work silently in the background.
 */
const MaintenancePage: React.FC = () => {
  // Hook handles 30s polling + auto-redirect when backend is back
  useMaintenancePolling();

  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const statusCode = statusParam ? parseInt(statusParam, 10) : null;

  // Show the actual status message from nginx, or a generic fallback
  const displayMessage = (statusCode && STATUS_MESSAGES[statusCode])
    ? STATUS_MESSAGES[statusCode]
    : DEFAULT_MESSAGE;

  const pageTitle = (statusCode && STATUS_MESSAGES[statusCode])
    ? STATUS_MESSAGES[statusCode]
    : DEFAULT_MESSAGE;

  return (
    <html>
      <head>
        <title>{pageTitle}</title>
      </head>
      <body style={{
        fontFamily: 'Tahoma, Verdana, Arial, sans-serif',
        margin: 0,
        padding: 0,
        backgroundColor: '#ffffff',
      }}>
        <div style={{
          width: '100%',
          textAlign: 'center',
          paddingTop: '20vh',
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#000000',
            margin: '0 0 10px 0',
          }}>
            {displayMessage}
          </h1>
          <hr style={{
            width: '80%',
            maxWidth: '600px',
            border: 'none',
            borderTop: '1px solid #cccccc',
            margin: '10px auto',
          }} />
          <p style={{
            fontSize: '14px',
            color: '#333333',
            margin: '10px 0 0 0',
          }}>
            nginx
          </p>
        </div>
      </body>
    </html>
  );
};

export default MaintenancePage;
