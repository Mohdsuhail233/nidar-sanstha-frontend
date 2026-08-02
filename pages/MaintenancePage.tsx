import React from 'react';
import { useMaintenancePolling } from '../hooks/useMaintenancePolling';

const POLL_INTERVAL_SECONDS = 30;

const MaintenancePage: React.FC = () => {
  const { countdown, isChecking } = useMaintenancePolling();

  // Progress bar percentage (fills up as countdown approaches 0)
  const progress = ((POLL_INTERVAL_SECONDS - countdown) / POLL_INTERVAL_SECONDS) * 100;

  return (
    <>
      {/* Keyframe animations — injected via <style> tag to keep component self-contained */}
      <style>{`
        @keyframes maintenance-float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes maintenance-float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-40px, 30px) scale(1.1); }
          66% { transform: translate(25px, -40px) scale(0.9); }
        }
        @keyframes maintenance-float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(35px, 35px) scale(1.08); }
        }
        @keyframes maintenance-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes maintenance-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes maintenance-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes maintenance-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes maintenance-wrench {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 40%, #16213e 70%, #0f0f23 100%)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          position: 'relative',
          overflow: 'hidden',
          padding: '20px',
        }}
      >
        {/* Animated floating orbs for depth */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            animation: 'maintenance-float-1 8s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '10%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%)',
            animation: 'maintenance-float-2 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '30%',
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            animation: 'maintenance-float-3 12s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Main Card */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '48px 40px',
            maxWidth: '520px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            animation: 'maintenance-fade-in 0.8s ease-out',
          }}
        >
          {/* Animated Gear + Wrench Icon */}
          <div
            style={{
              position: 'relative',
              width: '88px',
              height: '88px',
              margin: '0 auto 32px',
            }}
          >
            {/* Gear — spins continuously */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(99, 102, 241, 0.8)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                width: '88px',
                height: '88px',
                animation: 'maintenance-spin 6s linear infinite',
              }}
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>

            {/* Wrench overlay — subtle rocking animation */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(168, 85, 247, 0.7)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                position: 'absolute',
                bottom: '-4px',
                right: '-4px',
                width: '36px',
                height: '36px',
                animation: 'maintenance-wrench 2s ease-in-out infinite',
                background: 'rgba(15, 15, 35, 0.8)',
                borderRadius: '50%',
                padding: '6px',
              }}
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>

          {/* Heading with gradient text */}
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 50%, #c4b5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            We'll Be Back Soon
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '16px',
              color: 'rgba(203, 213, 225, 0.8)',
              margin: '0 0 36px',
              lineHeight: 1.6,
              maxWidth: '380px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Our team is currently fixing a technical issue.
            <br />
            <span style={{ fontSize: '14px', color: 'rgba(148, 163, 184, 0.6)' }}>
              We appreciate your patience while we work on this.
            </span>
          </p>

          {/* Status indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '24px',
            }}
          >
            {/* Pulsing dot */}
            <div
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isChecking
                  ? '#facc15'
                  : '#f87171',
                boxShadow: isChecking
                  ? '0 0 12px rgba(250, 204, 21, 0.5)'
                  : '0 0 12px rgba(248, 113, 113, 0.5)',
                animation: 'maintenance-pulse 2s ease-in-out infinite',
                transition: 'background 0.3s, box-shadow 0.3s',
              }}
            />
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isChecking
                  ? 'rgba(250, 204, 21, 0.9)'
                  : 'rgba(248, 113, 113, 0.9)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                transition: 'color 0.3s',
              }}
            >
              {isChecking ? 'Checking connection...' : 'Service Unavailable'}
            </span>
          </div>

          {/* Progress bar + countdown */}
          <div style={{ marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(148, 163, 184, 0.6)',
                  fontWeight: 500,
                }}
              >
                Next health check
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(165, 180, 252, 0.8)',
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {countdown}s
              </span>
            </div>
            {/* Track */}
            <div
              style={{
                width: '100%',
                height: '4px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
              }}
            >
              {/* Fill */}
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: '4px',
                  background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                  transition: 'width 1s linear',
                }}
              />
            </div>
          </div>

          {/* Shimmer divider */}
          <div
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
              marginBottom: '24px',
            }}
          />

          {/* Footer info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              color: 'rgba(148, 163, 184, 0.5)',
              fontSize: '12px',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ width: '14px', height: '14px' }}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
            <span>This page auto-refreshes every 30 seconds</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default MaintenancePage;
