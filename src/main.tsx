import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode> // Removed strict mode to avoid drag-and-drop issues in dev, or keep it if confident
  //   <App />
  // </React.StrictMode>,
  <App />
)
