import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ui/Toast';
import { AuthProvider } from '../context/AuthContext';
import { LanguageProvider } from '../context/LanguageContext';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import Routing from '../routing';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import DynamicTitle from '../components/ui/DynamicTitle';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <ErrorBoundary>
              <DynamicTitle />
              <Navbar />
              <div className="min-h-screen flex flex-col bg-gray-50 w-full">
                <main className="flex-grow w-full">
                  <Routing />
                </main>
                <Footer />
              </div>
            </ErrorBoundary>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;