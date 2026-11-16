import { render } from '@testing-library/react';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ConfirmationProvider } from './context/ConfirmationContext.jsx';

test('renders without crashing', async () => {
  await render(
    <AuthProvider>
      <ToastProvider>
        <ConfirmationProvider>
          <App />
        </ConfirmationProvider>
      </ToastProvider>
    </AuthProvider>
  );
});
