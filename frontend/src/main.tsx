import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import { Toaster } from 'react-hot-toast';
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Toaster position="top-center" reverseOrder={false}/>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
  </BrowserRouter>
)
