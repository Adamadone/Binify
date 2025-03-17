import { HomePage } from './pages/HomePage'
import { queryClient } from './trpc'
import { QueryClientProvider } from '@tanstack/react-query'

export const App = () => (
  <QueryClientProvider client={queryClient}>
    <HomePage />
  </QueryClientProvider>
)



