
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("Dua-E-Khair Foundation Portal: App starting...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Dua-E-Khair Foundation Portal: Root element not found.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Dua-E-Khair Foundation Portal: App rendered successfully.");
  } catch (err: any) {
    console.error("Dua-E-Khair Foundation Portal: Critical Render Error:", err);
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; font-family: sans-serif; text-align: center; padding: 20px; background: #fff;">
        <h2 style="color: #ef4444; margin-bottom: 10px;">Application Loading Error</h2>
        <p style="color: #6b7280; max-width: 400px; margin-bottom: 20px;">The UI could not be rendered. This usually happens due to a module loading conflict.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 13px; text-align: left; max-width: 90%; overflow: auto; border: 1px solid #e5e7eb;">
          <strong style="display: block; margin-bottom: 5px;">Error details:</strong>
          <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${err.stack || err.message}</pre>
        </div>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Reload Page</button>
      </div>
    `;
  }
}
