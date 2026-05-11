import { mountChatbotWidget } from '../react/chatbot/widget.jsx';

// Esperar a que React y ReactDOM estén disponibles en window
function waitForReactAndMount() {
  if (typeof window.React !== 'undefined' && typeof window.ReactDOM !== 'undefined') {
    mountChatbotWidget();
  } else {
    // Reintentar en 100ms si React no está listo
    setTimeout(waitForReactAndMount, 100);
  }
}

// Montar el widget cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForReactAndMount);
} else {
  waitForReactAndMount();
}
