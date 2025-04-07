import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from "@/components/ui/sonner";
import WelcomePage from './WelcomePage';
import { getMessage } from '@/core/utils/i18n';

// Set the document title using localized string
document.title = getMessage('appName', undefined, 'Jaydai');

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <WelcomePage />
    <Toaster richColors />
  </React.StrictMode>
);