import router from '@/routes/app.route'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from "sonner"
import { BagProvider } from './context/bag-context'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode> <BagProvider>
    <Toaster richColors /> 
    <QueryClientProvider client={queryClient}>
       <div className="E5E5E5">
        <RouterProvider router={router} />
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider> </BagProvider> 
  </StrictMode>,
)
