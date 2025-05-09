
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Registrar o service worker
registerSW({
  onNeedRefresh() {
    // Opcional: notificar usuário sobre atualização disponível
    console.log('Nova versão disponível!');
  },
  onOfflineReady() {
    // Opcional: notificar usuário que o app está pronto para uso offline
    console.log('Aplicativo pronto para uso offline!');
  },
})

createRoot(document.getElementById("root")!).render(<App />);
