/**
 * COMPONENTE: Chatbot Flotante
 * Widget interactivo que aparece en la esquina inferior derecha
 */

export function mountChatbotWidget() {
  if (!window.React || !window.ReactDOM) {
    return;
  }

  const e = window.React.createElement;
  const { useState, useEffect, useRef } = window.React;

  function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
      { type: 'bot', text: '¡Hola! 👋 ¿En qué puedo ayudarte?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async () => {
      if (!inputValue.trim()) return;

      // Agregar mensaje del usuario
      setMessages(prev => [...prev, { type: 'user', text: inputValue }]);
      setInputValue('');
      setIsLoading(true);

      try {
        const response = await fetch('/api/chatbot/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pregunta: inputValue,
            userId: null // o el ID del usuario si está logueado
          })
        });

        const data = await response.json();
        setMessages(prev => [...prev, { type: 'bot', text: data.respuesta || 'Lo siento, no pude procesar tu pregunta.' }]);
      } catch (err) {
        console.error('Error en chatbot:', err);
        setMessages(prev => [...prev, { type: 'bot', text: 'Error de conexión. Intenta de nuevo.' }]);
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyPress = (evt) => {
      if (evt.key === 'Enter' && !evt.shiftKey) {
        evt.preventDefault();
        handleSendMessage();
      }
    };

    if (!isOpen) {
      return e(
        'button',
        {
          className: 'chatbot-button',
          onClick: () => setIsOpen(true),
          title: 'Abre el chat de soporte',
          style: {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#d374ff',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(211, 116, 255, 0.4)',
            zIndex: '9999',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }
        },
        '💬'
      );
    }

    return e(
      'div',
      {
        className: 'chatbot-container',
        style: {
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 5px 30px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: '10000',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }
      },
      // Header
      e(
        'div',
        {
          style: {
            backgroundColor: '#d374ff',
            color: 'white',
            padding: '15px',
            borderRadius: '12px 12px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }
        },
        e('h6', { style: { margin: '0', fontSize: '16px' } }, '🤖 Soporte'),
        e(
          'button',
          {
            onClick: () => setIsOpen(false),
            style: {
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer'
            }
          },
          '✕'
        )
      ),

      // Mensajes
      e(
        'div',
        {
          style: {
            flex: 1,
            overflow: 'auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#f8f8f8'
          }
        },
        messages.map((msg, idx) =>
          e(
            'div',
            {
              key: idx,
              style: {
                display: 'flex',
                justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '8px'
              }
            },
            e(
              'div',
              {
                style: {
                  maxWidth: '80%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  backgroundColor: msg.type === 'user' ? '#d374ff' : '#e9ecef',
                  color: msg.type === 'user' ? 'white' : '#333',
                  fontSize: '14px',
                  lineHeight: '1.4'
                }
              },
              msg.text
            )
          )
        ),
        e('div', { ref: messagesEndRef })
      ),

      // Input
      e(
        'div',
        {
          style: {
            padding: '12px',
            borderTop: '1px solid #ddd',
            display: 'flex',
            gap: '8px'
          }
        },
        e('textarea',
          {
            value: inputValue,
            onChange: (evt) => setInputValue(evt.target.value),
            onKeyPress: handleKeyPress,
            placeholder: 'Escribe tu pregunta...',
            disabled: isLoading,
            style: {
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '13px',
              fontFamily: 'inherit',
              resize: 'none',
              maxHeight: '60px'
            }
          }
        ),
        e(
          'button',
          {
            onClick: handleSendMessage,
            disabled: isLoading || !inputValue.trim(),
            style: {
              padding: '8px 12px',
              backgroundColor: '#d374ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading || !inputValue.trim() ? 'not-allowed' : 'pointer',
              fontSize: '18px'
            }
          },
          '→'
        )
      )
    );
  }

  const container = document.getElementById('chatbot-widget');
  if (container) {
    window.ReactDOM.createRoot(container).render(e(ChatbotWidget));
  }
}
