import ReactDOM from 'react-dom/client'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'
import './lib/env' // BUG-025 FIX: Trigger env validation on startup
import './index.css'

// Set dayjs locale globally — fixes Chinese text in TimePicker/DatePicker
dayjs.locale('pt-br')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
