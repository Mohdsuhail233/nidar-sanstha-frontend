import React from 'react';
import { useMaintenancePolling } from '../hooks/useMaintenancePolling';

/**
 * Maintenance page styled to look like the default Nginx error page.
 * Polling and auto-recovery still work silently in the background.
 */
const MaintenancePage: React.FC = () => {
  // Hook handles 30s polling + auto-redirect when backend is back
  useMaintenancePolling();

  return (
    <html>
      <head>
        <title>503 Service Temporarily Unavailable</title>
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
            503 Service Temporarily Unavailable
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
