import { safeParseJson } from '../shared/json.jsx';
import { showToast } from '../shared/toast.jsx';

function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    if (!response.ok) {
      throw new Error('Respuesta invalida del servidor.');
    }
    return Promise.resolve({});
  }

  return response.json().then(function (data) {
    if (!response.ok) {
      throw new Error((data && data.message) ? data.message : 'Error en el servidor.');
    }
    return data;
  });
}

function formatDateTime(raw) {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('es-EC', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (_) {
    return '';
  }
}

function formatTime(raw) {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

function getMessageKey(message, index) {
  return (message && (message._id || message.enviado || message.texto) ? String(message._id || message.enviado || message.texto) : 'msg') + '-' + index;
}

export function mountContactApp() {
  const rootElement = document.getElementById('contact-react-root');
  const dataElement = document.getElementById('contact-initial-data');

  if (!rootElement || !dataElement || !window.React || !window.ReactDOM) {
    return;
  }

  const e = window.React.createElement;
  const { useEffect, useMemo, useRef, useState } = window.React;

  function scrollToBottom(containerRef, anchorRef, behavior) {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: behavior || 'smooth'
      });
      return;
    }

    if (anchorRef.current) {
      anchorRef.current.scrollIntoView({ behavior: behavior || 'smooth', block: 'end' });
    }
  }

  function ContactApp() {
    const initialData = safeParseJson(dataElement.textContent || '{}', {});
    const initialServices = Array.isArray(initialData.servicios) ? initialData.servicios : [];
    const [services] = useState(initialServices);
    const [asesoria, setAsesoria] = useState(initialData.miAsesoria || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [formValues, setFormValues] = useState({ nombre: '', servicio: '', consulta: '' });
    const [messageText, setMessageText] = useState('');
    const [errorText, setErrorText] = useState('');
    const [refreshTick, setRefreshTick] = useState(0);
    const [messageStatus, setMessageStatus] = useState('');
    const [highlightedMessageKeys, setHighlightedMessageKeys] = useState([]);
    const chatBottomRef = useRef(null);
    const chatContainerRef = useRef(null);
    const asesoriaRef = useRef(asesoria);
    const previousMessageCountRef = useRef(0);
    const previousMessagesRef = useRef([]);
    const clearStatusTimeoutRef = useRef(null);
    const clearHighlightsTimeoutRef = useRef(null);

    function showTransientStatus(text) {
      setMessageStatus(text);

      if (clearStatusTimeoutRef.current) {
        window.clearTimeout(clearStatusTimeoutRef.current);
      }

      clearStatusTimeoutRef.current = window.setTimeout(function () {
        setMessageStatus('');
      }, 2200);
    }

    useEffect(function syncAsesoriaRef() {
      asesoriaRef.current = asesoria;
    }, [asesoria]);

    useEffect(function cleanupStatusTimeout() {
      return function () {
        if (clearStatusTimeoutRef.current) {
          window.clearTimeout(clearStatusTimeoutRef.current);
        }
        if (clearHighlightsTimeoutRef.current) {
          window.clearTimeout(clearHighlightsTimeoutRef.current);
        }
      };
    }, []);

    const messages = useMemo(function () {
      if (!asesoria || !Array.isArray(asesoria.mensajes)) return [];
      return asesoria.mensajes;
    }, [asesoria]);

    const decoratedMessages = useMemo(function () {
      return messages.map(function (message, index) {
        const previous = index > 0 ? messages[index - 1] : null;
        const showSeparator = !previous || previous.autor !== message.autor;
        return {
          key: getMessageKey(message, index),
          message: message,
          showSeparator: showSeparator
        };
      });
    }, [messages]);

    useEffect(function scrollChatDown() {
      const currentCount = messages.length;
      const previousCount = previousMessageCountRef.current;
      const shouldSmoothScroll = currentCount > previousCount && previousCount > 0;

      if (currentCount !== previousCount) {
        requestAnimationFrame(function () {
          scrollToBottom(chatContainerRef, chatBottomRef, shouldSmoothScroll ? 'smooth' : 'auto');
        });
      }

      previousMessageCountRef.current = currentCount;
    }, [messages.length]);

    useEffect(function trackNewSupportMessages() {
      const previousMessages = previousMessagesRef.current;
      const knownKeys = new Set(previousMessages.map(function (message, index) {
        return getMessageKey(message, index);
      }));

      const newSupportKeys = messages
        .map(function (message, index) {
          return { key: getMessageKey(message, index), message: message };
        })
        .filter(function (entry) {
          return entry.message && entry.message.autor === 'admin' && !entry.message.__optimistic && !knownKeys.has(entry.key);
        })
        .map(function (entry) {
          return entry.key;
        });

      if (newSupportKeys.length > 0) {
        setHighlightedMessageKeys(newSupportKeys);
        if (clearHighlightsTimeoutRef.current) {
          window.clearTimeout(clearHighlightsTimeoutRef.current);
        }
        clearHighlightsTimeoutRef.current = window.setTimeout(function () {
          setHighlightedMessageKeys([]);
        }, 2600);
      }

      previousMessagesRef.current = messages;
    }, [messages]);

    useEffect(function pollAsesoriaUpdates() {
      if (!asesoria || !asesoria._id) return undefined;

      const intervalId = setInterval(function () {
        fetch('/api/asesorias/' + asesoria._id, {
          method: 'GET',
          headers: { Accept: 'application/json' }
        })
          .then(parseJsonResponse)
          .then(function (data) {
            if (!data || !data._id) return;
            setAsesoria(data);
            setRefreshTick(function (prev) { return prev + 1; });
          })
          .catch(function () {
            // polling silencioso
          });
      }, 9000);

      return function cleanup() {
        clearInterval(intervalId);
      };
    }, [asesoria && asesoria._id]);

    function resetToNewConsultation() {
      setAsesoria(null);
      setMessageText('');
      setErrorText('');
      setMessageStatus('');
      setFormValues({ nombre: '', servicio: '', consulta: '' });
    }

    function onFormChange(field, value) {
      setFormValues(function (prev) {
        return Object.assign({}, prev, { [field]: value });
      });
    }

    function submitAsesoria(event) {
      event.preventDefault();
      setErrorText('');

      if (!formValues.nombre.trim() || !formValues.servicio.trim() || !formValues.consulta.trim()) {
        setErrorText('Completa todos los campos para enviar tu solicitud.');
        return;
      }

      setIsSubmitting(true);
      fetch('/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'fetch'
        },
        body: JSON.stringify({
          nombre: formValues.nombre.trim(),
          servicio: formValues.servicio.trim(),
          consulta: formValues.consulta.trim()
        })
      })
        .then(parseJsonResponse)
        .then(function (data) {
          if (!data || !data._id) {
            throw new Error(data && data.message ? data.message : 'No se pudo crear la asesoria.');
          }

          setAsesoria(data);
          setMessageStatus('Solicitud creada. Puedes escribir tu primer mensaje.');
          showToast('Solicitud enviada. Ya puedes continuar en el chat.', { type: 'success', duration: 2600 });
        })
        .catch(function (err) {
          setErrorText(err.message || 'Error al enviar la solicitud.');
        })
        .finally(function () {
          setIsSubmitting(false);
        });
    }

    function sendMessage(event) {
      event.preventDefault();
      if (!asesoria || !asesoria._id) return;
      if (!messageText.trim()) return;

      const newMessage = {
        autor: 'cliente',
        texto: messageText.trim(),
        enviado: new Date().toISOString(),
        __optimistic: true
      };

      const rollback = asesoriaRef.current;
      setErrorText('');
      setIsSendingMessage(true);
      setMessageStatus('Enviando mensaje...');
      setAsesoria(function (prev) {
        if (!prev) return prev;
        const prevMessages = Array.isArray(prev.mensajes) ? prev.mensajes : [];
        return Object.assign({}, prev, { mensajes: prevMessages.concat(newMessage) });
      });
      setMessageText('');

      fetch('/contacto/mensaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'fetch'
        },
        body: JSON.stringify({
          asesoriaId: asesoriaRef.current ? asesoriaRef.current._id : null,
          texto: newMessage.texto
        })
      })
        .then(parseJsonResponse)
        .then(function (data) {
          if (!data || !data._id) {
            throw new Error(data && data.message ? data.message : 'No se pudo enviar el mensaje.');
          }
          setAsesoria(data);
          showTransientStatus('Mensaje enviado.');
        })
        .catch(function (err) {
          setAsesoria(rollback);
          const msg = err.message || 'Error al enviar mensaje.';
          setErrorText(msg);
          setMessageStatus('');
          showToast(msg, { type: 'danger', duration: 3200 });
        })
        .finally(function () {
          setIsSendingMessage(false);
        });
    }

    if (!asesoria) {
      return e(
        'div',
        null,
        e('p', { className: 'lead mb-4' }, 'Completa el formulario y nos pondremos en contacto para asesorarte sobre el plan ideal para ti.'),
        e(
          'div',
          { className: 'card shadow-sm' },
          e(
            'div',
            { className: 'card-body' },
            e(
              'form',
              { onSubmit: submitAsesoria },
              e('div', { className: 'mb-3' },
                e('label', { className: 'form-label', htmlFor: 'nombre' }, 'Nombre Completo'),
                e('input', {
                  className: 'form-control',
                  id: 'nombre',
                  type: 'text',
                  placeholder: 'Tu nombre',
                  required: true,
                  value: formValues.nombre,
                  onChange: function (event) { onFormChange('nombre', event.target.value); }
                })
              ),
              e('div', { className: 'mb-3' },
                e('label', { className: 'form-label', htmlFor: 'servicio' }, 'Tema de consulta'),
                e(
                  'select',
                  {
                    className: 'form-select',
                    id: 'servicio',
                    required: true,
                    value: formValues.servicio,
                    onChange: function (event) { onFormChange('servicio', event.target.value); }
                  },
                  e('option', { value: '' }, 'Selecciona un servicio'),
                  services.map(function (svc) {
                    return e('option', { key: svc._id || svc.nombre, value: svc.nombre }, svc.nombre);
                  }),
                  e('option', { value: 'Otra consulta' }, 'Otra consulta')
                )
              ),
              e('div', { className: 'mb-3' },
                e('label', { className: 'form-label', htmlFor: 'consulta' }, 'Detalle de tu consulta'),
                e('textarea', {
                  className: 'form-control',
                  id: 'consulta',
                  rows: '5',
                  placeholder: 'Cuentanos tu consulta o necesidad...',
                  required: true,
                  value: formValues.consulta,
                  onChange: function (event) { onFormChange('consulta', event.target.value); }
                })
              ),
              errorText ? e('div', { className: 'alert alert-danger mt-2', role: 'alert' }, errorText) : null,
              e('div', { className: 'd-grid' },
                e(
                  'button',
                  { className: 'btn btn-primary btn-lg', type: 'submit', disabled: isSubmitting },
                  isSubmitting ? 'Enviando...' : 'Enviar Solicitud de Asesoria'
                )
              )
            )
          )
        )
      );
    }

    return e(
      'div',
      null,
      e(
        'div',
        { className: 'd-flex justify-content-between align-items-center mb-3' },
        e('div', null,
          e('h5', { className: 'mb-1', style: { color: 'var(--c-cyan)' } },
            e('i', { className: 'fas fa-comments me-2' }),
            'Tu solicitud de asesoria'
          ),
          e('span', {
            className: 'badge',
            style: {
              background: 'linear-gradient(90deg,rgba(100,220,255,.12),rgba(211,116,255,.12))',
              border: '1px solid rgba(211,116,255,.35)',
              color: 'var(--c-purple)',
              fontSize: '.75rem'
            }
          }, e('i', { className: 'fas fa-tag me-1' }), asesoria.servicio || 'Otra consulta')
        ),
        e(
          'button',
          {
            className: 'btn btn-sm btn-outline-secondary',
            type: 'button',
            onClick: resetToNewConsultation,
            style: { borderRadius: '50px', fontSize: '.8rem' }
          },
          e('i', { className: 'fas fa-plus me-1' }),
          'Nueva consulta'
        )
      ),
      e(
        'div',
        { className: 'card mb-3', style: { border: '1px solid rgba(100,220,255,.2)' } },
        e('div', { className: 'card-body' },
          e('div', { className: 'd-flex align-items-start gap-2 mb-1' },
            e('i', { className: 'fas fa-user-circle mt-1', style: { color: 'var(--c-cyan)' } }),
            e('div', null,
              e('small', { className: 'fw-bold', style: { color: 'var(--c-cyan)' } }, asesoria.nombre || ''),
              e('small', { className: 'ms-2 text-muted', style: { fontSize: '.75rem' } }, formatDateTime(asesoria.creado))
            )
          ),
          e('p', { className: 'mb-0', style: { fontSize: '.9rem', color: '#d0d0e8' } }, asesoria.consulta || '')
        )
      ),
      messages.length > 0
        ? e(
            'div',
            { className: 'contact-chat-thread d-flex flex-column gap-2 mb-3', ref: chatContainerRef },
            decoratedMessages.map(function (entry) {
              const m = entry.message;
              const esAdmin = m.autor === 'admin';
              const isHighlighted = highlightedMessageKeys.indexOf(entry.key) !== -1;

              return e(
                window.React.Fragment,
                { key: entry.key },
                entry.showSeparator
                  ? e(
                      'div',
                      { className: 'contact-chat-separator ' + (esAdmin ? 'is-support' : 'is-client') },
                      e('span', null, esAdmin ? 'Soporte' : 'Tus mensajes')
                    )
                  : null,
                e(
                  'div',
                  { className: 'd-flex ' + (esAdmin ? 'justify-content-start' : 'justify-content-end') },
                  e(
                    'div',
                    {
                      className: 'contact-chat-bubble' + (esAdmin ? ' is-support' : ' is-client') + (isHighlighted ? ' is-new' : ''),
                      style: {
                        maxWidth: '80%',
                        padding: '.6rem 1rem',
                        borderRadius: '1rem',
                        borderBottomLeftRadius: esAdmin ? '.2rem' : undefined,
                        borderBottomRightRadius: esAdmin ? undefined : '.2rem'
                      }
                    },
                    e('small', {
                      className: 'd-block mb-1 fw-bold',
                      style: { fontSize: '.72rem', color: esAdmin ? 'var(--c-purple)' : 'var(--c-cyan)' }
                    }, esAdmin ? 'Soporte' : 'Tu'),
                    e('p', { className: 'mb-0', style: { fontSize: '.88rem', color: '#e0e0f0', wordBreak: 'break-word' } }, m.texto || ''),
                    e('small', { className: 'd-block text-end mt-1', style: { fontSize: '.68rem', color: '#6a6a8a' } }, (m.__optimistic ? 'Enviando...' : formatTime(m.enviado)))
                  )
                )
              );
            }),
            e('span', { ref: chatBottomRef })
          )
        : e('p', { className: 'text-muted text-center mb-3', style: { fontSize: '.85rem' } }, e('i', { className: 'fas fa-clock me-1' }), 'Tu solicitud fue recibida. Te responderemos pronto.'),
      e(
        'form',
        { onSubmit: sendMessage },
        e(
          'div',
          { className: 'input-group' },
          e('input', {
            className: 'form-control',
            placeholder: 'Escribe un mensaje de seguimiento...',
            autoComplete: 'off',
            required: true,
            value: messageText,
            disabled: isSendingMessage,
            onChange: function (event) { setMessageText(event.target.value); },
            style: {
              borderColor: 'rgba(211,116,255,.3)',
              background: '#12122a',
              color: '#e8e8f0',
              borderRadius: '.5rem 0 0 .5rem'
            }
          }),
          e(
            'button',
            {
              className: 'btn',
              type: 'submit',
              disabled: isSendingMessage,
              style: {
                background: 'linear-gradient(90deg,var(--c-cyan),var(--c-purple))',
                color: '#0d0d14',
                fontWeight: 600,
                borderRadius: '0 .5rem .5rem 0'
              }
            },
            e('i', { className: 'fas fa-paper-plane' })
          )
        )
      ),
      messageStatus
        ? e(
            'div',
            { className: 'contact-chat-status mt-2' },
            e('i', { className: isSendingMessage ? 'fas fa-circle-notch fa-spin me-2' : 'fas fa-check-circle me-2' }),
            messageStatus
          )
        : null,
      errorText ? e('div', { className: 'alert alert-danger mt-3 mb-0', role: 'alert' }, errorText) : null,
      e('small', { className: 'd-block text-muted mt-3' }, 'Chat actualizado automaticamente.', refreshTick > 0 ? ' Ultima sincronizacion reciente.' : '')
    );
  }

  window.ReactDOM.createRoot(rootElement).render(e(ContactApp));
}

