
import React from 'react';
import ReactDOM from 'react-dom/client';
// FIX: App.tsx was not a module. With the new App.tsx, this import now works.
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Không tìm thấy phần tử root để gắn ứng dụng");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);