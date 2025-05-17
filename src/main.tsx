
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { toast } from '@/hooks/use-toast'

// Registrar o service worker
const updateSW = registerSW({
  onNeedRefresh() {
    // Notificar usuário sobre atualização disponível
    toast({
      title: "Nova versão disponível!",
      description: "Clique em atualizar para obter a versão mais recente.",
      action: {
        label: "Atualizar",
        onClick: () => updateSW()
      }
    });
  },
  onOfflineReady() {
    // Notificar usuário que o app está pronto para uso offline
    toast({
      title: "Aplicativo pronto para uso offline!",
      description: "O aplicativo pode ser usado mesmo sem conexão com a internet.",
    });
  },
})

createRoot(document.getElementById("root")!).render(<App />);
