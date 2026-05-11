import { safeParseJson } from '../shared/json.js';
import { showToast } from '../shared/toast.js';

function formatShortDate(raw) {
  if (!raw) return '';
  try {
    return new Date(raw).toLocaleDateString('es-EC', { day: '2-digit', month: 'short' });
  } catch (_) {
    return '';
  }
}

function formatShortTime(raw) {
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

function parseJsonResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
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

function sortAsesorias(items) {
  return items.slice().sort(function (a, b) {
    return new Date(b.creado || 0).getTime() - new Date(a.creado || 0).getTime();
  });
}

export function mountAdminAsesoriasApp() {
  const rootElement = document.getElementById('admin-asesorias-react-root');
  const dataElement = document.getElementById('admin-asesorias-initial-data');

  if (!rootElement || !dataElement || !window.React || !window.ReactDOM) {
    return;
  }

  const e = window.React.createElement;
  const { useEffect, useMemo, useRef, useState } = window.React;

  function AdminAsesoriasApp() {
    const initialData = safeParseJson(dataElement.textContent || '{}', {});
    const [asesorias, setAsesorias] = useState(sortAsesorias(Array.isArray(initialData.asesorias) ? initialData.asesorias : []));
    const [selectedId, setSelectedId] = useState(initialData.asesorias && initialData.asesorias.length ? initialData.asesorias[0]._id : null);
    const [messageText, setMessageText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [unreadIds, setUnreadIds] = useState([]);
    const [highlightedKeys, setHighlightedKeys] = useState([]);
    const [statusText, setStatusText] = useState('');
    const [errorText, setErrorText] = useState(initialData.error || '');
    const previousMapRef = useRef(new Map());
    const clearHighlightsTimeoutRef = useRef(null);
    const clearStatusTimeoutRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const messagesBottomRef = useRef(null);

    const selectedAsesoria = useMemo(function () {
      return asesorias.find(function (item) { return item._id === selectedId; }) || null;
    }, [asesorias, selectedId]);

    const decoratedMessages = useMemo(function () {
      const messages = selectedAsesoria && Array.isArray(selectedAsesoria.mensajes) ? selectedAsesoria.mensajes : [];
      return messages.map(function (message, index) {
        const previous = index > 0 ? messages[index - 1] : null;
        return {
          key: getMessageKey(message, index),
          message: message,
          showSeparator: !previous || previous.autor !== message.autor
        };
      });
    }, [selectedAsesoria]);

    function clearStatusSoon(text) {
      setStatusText(text);
      if (clearStatusTimeoutRef.current) {
        window.clearTimeout(clearStatusTimeoutRef.current);
      }
      clearStatusTimeoutRef.current = window.setTimeout(function () {
        setStatusText('');
      }, 2200);
    }

    function syncUnreadAndHighlights(nextAsesorias) {
      const previousMap = previousMapRef.current;
      const nextUnread = [];
      const nextHighlights = [];

      nextAsesorias.forEach(function (asesoria) {
        const previous = previousMap.get(asesoria._id);
        const previousMessages = previous && Array.isArray(previous.mensajes) ? previous.mensajes : [];
        const currentMessages = Array.isArray(asesoria.mensajes) ? asesoria.mensajes : [];
        const previousKeys = new Set(previousMessages.map(function (message, index) {
          return getMessageKey(message, index);
        }));

        currentMessages.forEach(function (message, index) {
          const key = getMessageKey(message, index);
          if (!previousKeys.has(key) && message.autor === 'cliente') {
            if (asesoria._id !== selectedId) {
              nextUnread.push(asesoria._id);
            } else {
              nextHighlights.push(key);
            }
          }
        });
      });

      if (nextUnread.length > 0) {
        setUnreadIds(function (prev) {
          const merged = new Set(prev.concat(nextUnread));
          return Array.from(merged);
        });
      }

      if (nextHighlights.length > 0) {
        setHighlightedKeys(nextHighlights);
        if (clearHighlightsTimeoutRef.current) {
          window.clearTimeout(clearHighlightsTimeoutRef.current);
        }
        clearHighlightsTimeoutRef.current = window.setTimeout(function () {
          setHighlightedKeys([]);
        }, 2600);
      }

      previousMapRef.current = new Map(nextAsesorias.map(function (asesoria) {
        return [asesoria._id, asesoria];
      }));
    }

    useEffect(function seedPreviousMap() {
      previousMapRef.current = new Map(asesorias.map(function (asesoria) {
        return [asesoria._id, asesoria];
      }));
    }, []);

    useEffect(function pollAsesorias() {
      const intervalId = window.setInterval(function () {
        fetch('/api/asesorias', {
          method: 'GET',
          headers: { Accept: 'application/json' }
        })
          .then(parseJsonResponse)
          .then(function (data) {
            if (!Array.isArray(data)) return;
            const sorted = sortAsesorias(data);
            syncUnreadAndHighlights(sorted);
            setAsesorias(sorted);
            setErrorText('');
          })
          .catch(function () {
            // polling silencioso
          });
      }, 7000);

      return function cleanup() {
        window.clearInterval(intervalId);
      };
    }, [selectedId]);

    useEffect(function cleanupTimers() {
      return function () {
        if (clearHighlightsTimeoutRef.current) {
          window.clearTimeout(clearHighlightsTimeoutRef.current);
        }
        if (clearStatusTimeoutRef.current) {
          window.clearTimeout(clearStatusTimeoutRef.current);
        }
      };
    }, []);

    useEffect(function scrollMessagesDown() {
      requestAnimationFrame(function () {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        } else if (messagesBottomRef.current) {
          messagesBottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
    }, [decoratedMessages.length, selectedId]);

    useEffect(function clearUnreadForSelected() {
      if (!selectedId) return;
      setUnreadIds(function (prev) {
        return prev.filter(function (id) { return id !== selectedId; });
      });
    }, [selectedId]);

    function openChat(id) {
      setSelectedId(id);
      setMessageText('');
      setErrorText('');
    }

    function sendMessage(event) {
      event.preventDefault();
      if (!selectedAsesoria || !selectedAsesoria._id) return;
      const text = messageText.trim();
      if (!text) return;

      const optimisticMessage = {
        autor: 'admin',
        texto: text,
        enviado: new Date().toISOString(),
        __optimistic: true
      };

      const rollback = asesorias;
      setIsSending(true);
      setErrorText('');
      setStatusText('Enviando mensaje...');
      setMessageText('');
      setAsesorias(function (prev) {
        return prev.map(function (asesoria) {
          if (asesoria._id !== selectedAsesoria._id) return asesoria;
          const prevMessages = Array.isArray(asesoria.mensajes) ? asesoria.mensajes : [];
          return Object.assign({}, asesoria, { mensajes: prevMessages.concat(optimisticMessage) });
        });
      });

      fetch('/admin/asesorias/' + selectedAsesoria._id + '/mensaje', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Requested-With': 'fetch'
        },
        body: JSON.stringify({ texto: text })
      })
        .then(parseJsonResponse)
        .then(function (updatedAsesoria) {
          if (!updatedAsesoria || !updatedAsesoria._id) {
            throw new Error('No se pudo enviar el mensaje.');
          }
          setAsesorias(function (prev) {
            return sortAsesorias(prev.map(function (asesoria) {
              return asesoria._id === updatedAsesoria._id ? updatedAsesoria : asesoria;
            }));
          });
          previousMapRef.current.set(updatedAsesoria._id, updatedAsesoria);
          clearStatusSoon('Mensaje enviado.');
        })
        .catch(function (error) {
          setAsesorias(rollback);
          setErrorText(error.message || 'No se pudo enviar el mensaje.');
          setStatusText('');
          showToast(error.message || 'No se pudo enviar el mensaje.', { type: 'danger', duration: 3000 });
        })
        .finally(function () {
          setIsSending(false);
        });
    }

    function deleteSelected() {
      if (!selectedAsesoria || !selectedAsesoria._id) return;
      if (!window.confirm('Eliminar esta solicitud?')) return;

      const deletingId = selectedAsesoria._id;
      setIsDeleting(true);
      setErrorText('');

      fetch('/api/asesorias/' + deletingId, {
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      })
        .then(parseJsonResponse)
        .then(function () {
          setAsesorias(function (prev) {
            const next = prev.filter(function (asesoria) { return asesoria._id !== deletingId; });
            setSelectedId(next.length ? next[0]._id : null);
            return next;
          });
          setUnreadIds(function (prev) {
            return prev.filter(function (id) { return id !== deletingId; });
          });
          previousMapRef.current.delete(deletingId);
          clearStatusSoon('Solicitud eliminada.');
        })
        .catch(function (error) {
          setErrorText(error.message || 'No se pudo eliminar la solicitud.');
          showToast(error.message || 'No se pudo eliminar la solicitud.', { type: 'danger', duration: 3000 });
        })
        .finally(function () {
          setIsDeleting(false);
        });
    }

    if (!asesorias.length) {
      return e(
        'div',
        null,
        errorText
          ? e('div', {
              className: 'alert mb-3',
              style: {
                background: 'rgba(244,145,191,0.12)',
                border: '1px solid rgba(244,145,191,0.4)',
                color: '#F491BF',
                borderRadius: '.75rem'
              }
            }, errorText)
          : null,
        e('div', {
          className: 'alert text-center',
          style: {
            background: 'rgba(244,145,191,0.05)',
            border: '1px solid rgba(244,145,191,0.15)',
            color: '#a0a0b8'
          }
        }, e('i', { className: 'fas fa-inbox me-2' }), 'No hay solicitudes de asesoria por ahora.')
      );
    }

    return e(
      window.React.Fragment,
      null,
      errorText
        ? e('div', {
            className: 'alert mb-3',
            style: {
              background: 'rgba(244,145,191,0.12)',
              border: '1px solid rgba(244,145,191,0.4)',
              color: '#F491BF',
              borderRadius: '.75rem'
            }
          }, errorText)
        : null,
      e('p', { className: 'text-muted mb-3' }, e('i', { className: 'fas fa-inbox me-1' }), ' ', asesorias.length + ' solicitud(es) - selecciona una para ver el chat'),
      e(
        'div',
        { className: 'row g-0 admin-asesorias-workspace' },
        e(
          'div',
          { className: 'col-md-4 border-end admin-asesorias-list', style: { borderColor: 'rgba(211,116,255,0.2)' } },
          asesorias.map(function (asesoria) {
            const isActive = asesoria._id === selectedId;
            const hasUnread = unreadIds.indexOf(asesoria._id) !== -1;
            return e(
              'button',
              {
                key: asesoria._id,
                type: 'button',
                className: 'asesoria-item p-3 border-bottom text-start w-100 admin-asesoria-item' + (isActive ? ' is-active' : ''),
                onClick: function () { openChat(asesoria._id); }
              },
              e(
                'div',
                { className: 'd-flex justify-content-between align-items-start mb-1' },
                e('span', { className: 'fw-bold', style: { color: 'var(--c-pink)', fontSize: '.95rem' } }, e('i', { className: 'fas fa-user-circle me-1' }), asesoria.nombre),
                e('div', { className: 'd-flex align-items-center gap-2' },
                  hasUnread ? e('span', { className: 'badge rounded-pill admin-asesoria-new-badge' }, 'Nuevo') : null,
                  e('small', { className: 'text-muted', style: { fontSize: '.75rem' } }, formatShortDate(asesoria.creado))
                )
              ),
              e('span', {
                className: 'badge mb-2',
                style: {
                  background: 'linear-gradient(90deg,rgba(100,220,255,.15),rgba(211,116,255,.15))',
                  border: '1px solid rgba(211,116,255,.35)',
                  color: 'var(--c-purple)',
                  fontSize: '.7rem',
                  fontWeight: 500
                }
              }, e('i', { className: 'fas fa-tag me-1' }), asesoria.servicio || 'Otra consulta'),
              e('p', { className: 'mb-2 text-muted', style: { fontSize: '.82rem', lineHeight: 1.3 } }, (asesoria.consulta || '').length > 80 ? asesoria.consulta.slice(0, 80) + '...' : (asesoria.consulta || '')),
              e('div', { className: 'd-flex gap-2 align-items-center' },
                e('span', {
                  className: 'badge rounded-pill',
                  style: { background: 'rgba(244,145,191,.08)', color: '#a0a0b8', fontSize: '.7rem' }
                }, e('i', { className: 'fas fa-comment-dots me-1' }), ((asesoria.mensajes ? asesoria.mensajes.length : 0) + ' mens.'))
              )
            );
          })
        ),
        e(
          'div',
          { className: 'col-md-8 d-flex flex-column admin-asesorias-chat-panel' },
          selectedAsesoria
            ? e(
                window.React.Fragment,
                null,
                e(
                  'div',
                  { className: 'p-3 border-bottom', style: { borderColor: 'rgba(211,116,255,0.2)', flexShrink: 0 } },
                  e(
                    'div',
                    { className: 'd-flex justify-content-between align-items-center' },
                    e('div', null,
                      e('span', { className: 'fw-bold', style: { color: 'var(--c-cyan)' } }, selectedAsesoria.nombre),
                      e('span', {
                        className: 'ms-2 badge',
                        style: {
                          background: 'linear-gradient(90deg,rgba(100,220,255,.15),rgba(211,116,255,.15))',
                          border: '1px solid rgba(211,116,255,.35)',
                          color: 'var(--c-purple)',
                          fontSize: '.75rem'
                        }
                      }, selectedAsesoria.servicio || 'Otra consulta')
                    ),
                    e(
                      'button',
                      {
                        className: 'btn btn-sm btn-outline-danger',
                        type: 'button',
                        disabled: isDeleting,
                        onClick: deleteSelected
                      },
                      e('i', { className: 'fas fa-trash me-1' }),
                      isDeleting ? 'Eliminando...' : 'Eliminar'
                    )
                  ),
                  e('p', { className: 'mt-1 mb-0 text-muted', style: { fontSize: '.85rem' } }, selectedAsesoria.consulta)
                ),
                e(
                  'div',
                  { className: 'flex-grow-1 p-3 admin-asesorias-messages', ref: messagesContainerRef, style: { display: 'flex', flexDirection: 'column', gap: '.75rem' } },
                  decoratedMessages.length
                    ? decoratedMessages.map(function (entry) {
                        const m = entry.message;
                        const isAdmin = m.autor === 'admin';
                        const isHighlighted = highlightedKeys.indexOf(entry.key) !== -1;
                        return e(
                          window.React.Fragment,
                          { key: entry.key },
                          entry.showSeparator
                            ? e('div', { className: 'contact-chat-separator ' + (isAdmin ? 'is-support' : 'is-client') }, e('span', null, isAdmin ? 'Admin' : 'Cliente'))
                            : null,
                          e(
                            'div',
                            { className: 'd-flex ' + (isAdmin ? 'justify-content-end' : 'justify-content-start') },
                            e(
                              'div',
                              {
                                className: 'contact-chat-bubble' + (isAdmin ? ' is-support' : ' is-client') + (isHighlighted ? ' is-new' : ''),
                                style: {
                                  maxWidth: '70%',
                                  padding: '.5rem .85rem',
                                  borderRadius: '1rem',
                                  borderBottomLeftRadius: isAdmin ? undefined : '.2rem',
                                  borderBottomRightRadius: isAdmin ? '.2rem' : undefined
                                }
                              },
                              e('small', { className: 'd-block mb-1 fw-bold', style: { fontSize: '.7rem', color: isAdmin ? 'var(--c-purple)' : 'var(--c-cyan)' } }, isAdmin ? 'Admin' : 'Cliente'),
                              e('p', { className: 'mb-0', style: { fontSize: '.88rem', color: '#e8e8f0', wordBreak: 'break-word' } }, m.texto || ''),
                              e('small', { className: 'd-block text-end mt-1', style: { fontSize: '.68rem', color: '#6a6a8a' } }, m.__optimistic ? 'Enviando...' : formatShortTime(m.enviado))
                            )
                          )
                        );
                      })
                    : e('p', { className: 'text-center text-muted', style: { margin: 'auto', fontSize: '.85rem' } }, 'Sin mensajes aun - se el primero en responder.'),
                  e('span', { ref: messagesBottomRef })
                ),
                e(
                  'form',
                  { className: 'p-3 border-top', style: { borderColor: 'rgba(211,116,255,0.2)', flexShrink: 0 }, onSubmit: sendMessage },
                  e(
                    'div',
                    { className: 'input-group' },
                    e('input', {
                      className: 'form-control',
                      placeholder: 'Escribe tu respuesta...',
                      autoComplete: 'off',
                      required: true,
                      disabled: isSending,
                      value: messageText,
                      onChange: function (event) { setMessageText(event.target.value); },
                      style: { borderColor: 'rgba(211,116,255,.3)', background: '#12122a', color: '#e8e8f0' }
                    }),
                    e(
                      'button',
                      {
                        className: 'btn',
                        type: 'submit',
                        disabled: isSending,
                        style: { background: 'linear-gradient(90deg,var(--c-purple),var(--c-pink))', color: '#0d0d14', fontWeight: 600 }
                      },
                      e('i', { className: isSending ? 'fas fa-circle-notch fa-spin' : 'fas fa-paper-plane' })
                    )
                  ),
                  statusText ? e('div', { className: 'contact-chat-status mt-2' }, e('i', { className: isSending ? 'fas fa-circle-notch fa-spin me-2' : 'fas fa-check-circle me-2' }), statusText) : null
                )
              )
            : e(
                'div',
                { className: 'd-flex flex-column align-items-center justify-content-center h-100 text-muted', style: { gap: '1rem' } },
                e('i', { className: 'fas fa-comments', style: { fontSize: '3rem', color: 'rgba(211,116,255,.3)' } }),
                e('p', null, 'Selecciona una solicitud para iniciar el chat')
              )
        )
      )
    );
  }

  window.ReactDOM.createRoot(rootElement).render(e(AdminAsesoriasApp));
}
