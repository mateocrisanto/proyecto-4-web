import { safeParseJson } from '../shared/json.js';
import { updateCartBadge } from '../shared/cartBadge.js';
import { showToast } from '../shared/toast.js';

function formatMoney(value) {
  return '$' + Number(value || 0).toFixed(2);
}

function cloneCart(cart) {
  return JSON.parse(JSON.stringify(cart || { items: [], total: 0 }));
}

export function mountCartApp() {
  const rootElement = document.getElementById('cart-react-root');
  const dataElement = document.getElementById('cart-initial-data');

  if (!rootElement || !dataElement || !window.React || !window.ReactDOM) {
    return;
  }

  const e = window.React.createElement;
  const { useEffect, useMemo, useRef, useState } = window.React;

  function CartApp() {
    const initialData = safeParseJson(dataElement.textContent || '{}', {});
    const sessionId = initialData.sessionId || '';
    const paypalClientId = initialData.paypalClientId || null;
    const [cart, setCart] = useState(initialData.cart || { items: [], total: 0 });
    const [busyProductId, setBusyProductId] = useState(null);
    const [isClearing, setIsClearing] = useState(false);
    const [errorText, setErrorText] = useState('');
    const paypalRenderedRef = useRef(false);
    const cartRef = useRef(cart);

    useEffect(function syncCartRef() {
      cartRef.current = cart;
    }, [cart]);

    const items = Array.isArray(cart.items) ? cart.items : [];
    const hasItems = items.length > 0;

    const subtotal = useMemo(function memoSubtotal() {
      const total = Number(cart.total);
      if (!Number.isNaN(total)) return total;
      return items.reduce(function reducer(sum, item) {
        return sum + Number(item.precio || 0) * Number(item.cantidad || 0);
      }, 0);
    }, [cart.total, items]);

    const iva = subtotal * 0.15;
    const totalConIva = subtotal * 1.15;

    useEffect(function syncBadge() {
      updateCartBadge(items.length);
    }, [items.length]);

    useEffect(function renderPaypalButton() {
      if (!paypalClientId || !window.paypal) return;
      const container = document.getElementById('paypal-button-container');
      if (!container) return;

      if (!hasItems) {
        container.innerHTML = '';
        paypalRenderedRef.current = false;
        return;
      }

      if (paypalRenderedRef.current) return;

      window.paypal
        .Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
          createOrder: function createOrder() {
            return fetch('/pago/crear', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
            })
              .then(function (res) { return res.json(); })
              .then(function (data) {
                if (data.error) {
                  showToast('Error: ' + data.error, { type: 'danger', duration: 3200 });
                  return null;
                }
                return data.orderID;
              });
          },
          onApprove: function onApprove(data) {
            return fetch('/pago/capturar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID })
            })
              .then(function (res) { return res.json(); })
              .then(function (result) {
                if (result.success) {
                  window.location.href = '/pago/exito';
                } else {
                  showToast('Error al procesar el pago. Intenta nuevamente.', { type: 'danger', duration: 3200 });
                }
              });
          },
          onError: function onError(err) {
            console.error('PayPal error:', err);
            showToast('Ocurrio un error con PayPal. Intenta nuevamente.', { type: 'danger', duration: 3200 });
          }
        })
        .render('#paypal-button-container')
        .then(function () {
          paypalRenderedRef.current = true;
        });
    }, [hasItems, paypalClientId]);

    function mutateCart(url, method, payload, options) {
      const opts = options || {};
      if (opts.onStart) opts.onStart();
      setErrorText('');

      return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.assign({}, payload, { sessionId: sessionId }))
      })
        .then(function onResponse(response) {
          return response.json();
        })
        .then(function onData(data) {
          if (!data || !data._id) {
            throw new Error(data && data.message ? data.message : 'No se pudo actualizar el carrito.');
          }
          setCart(data);
        })
        .catch(function onError(error) {
          if (opts.rollbackCart) setCart(opts.rollbackCart);
          const message = error.message || 'Error de conexion.';
          setErrorText(message);
          showToast(message, { type: 'danger', duration: 3200 });
        })
        .finally(function onFinally() {
          if (opts.onEnd) opts.onEnd();
        });
    }

    function updateQuantity(productId, quantity) {
      const parsed = Number(quantity);
      if (!Number.isFinite(parsed)) return;

      const rollbackCart = cloneCart(cartRef.current);
      setBusyProductId(productId);

      setCart(function optimisticUpdate(current) {
        const currentItems = Array.isArray(current.items) ? current.items : [];
        const nextItems = currentItems
          .map(function (item) {
            if (String(item.productId) !== String(productId)) return item;
            return Object.assign({}, item, { cantidad: parsed < 0 ? 0 : parsed });
          })
          .filter(function (item) {
            return Number(item.cantidad) > 0;
          });

        const nextTotal = nextItems.reduce(function (sum, item) {
          return sum + Number(item.precio || 0) * Number(item.cantidad || 0);
        }, 0);

        return Object.assign({}, current, { items: nextItems, total: nextTotal });
      });

      mutateCart('/cart/update', 'PUT', { productId: productId, cantidad: parsed < 0 ? 0 : parsed }, {
        rollbackCart: rollbackCart,
        onEnd: function () { setBusyProductId(null); }
      });
    }

    function removeItem(productId) {
      if (!window.confirm('Eliminar este producto del carrito?')) return;

      const rollbackCart = cloneCart(cartRef.current);
      setBusyProductId(productId);

      setCart(function optimisticRemove(current) {
        const currentItems = Array.isArray(current.items) ? current.items : [];
        const nextItems = currentItems.filter(function (item) {
          return String(item.productId) !== String(productId);
        });

        const nextTotal = nextItems.reduce(function (sum, item) {
          return sum + Number(item.precio || 0) * Number(item.cantidad || 0);
        }, 0);

        return Object.assign({}, current, { items: nextItems, total: nextTotal });
      });

      mutateCart('/cart/update', 'PUT', { productId: productId, cantidad: 0 }, {
        rollbackCart: rollbackCart,
        onEnd: function () { setBusyProductId(null); }
      });
    }

    function clearCart() {
      if (!window.confirm('Vaciar el carrito?')) return;

      const rollbackCart = cloneCart(cartRef.current);
      setIsClearing(true);
      setCart(function optimisticClear(current) {
        return Object.assign({}, current, { items: [], total: 0 });
      });

      mutateCart('/cart/clear', 'POST', {}, {
        rollbackCart: rollbackCart,
        onEnd: function () { setIsClearing(false); }
      });
    }

    if (!hasItems) {
      return e(
        'div',
        { className: 'row' },
        e(
          'div',
          { className: 'col-12 text-center' },
          e(
            'div',
            { className: 'empty-cart py-5' },
            e('i', { className: 'fas fa-shopping-cart fa-4x text-muted mb-4' }),
            e('h3', null, 'Carrito vacio'),
            e('p', { className: 'text-muted' }, 'No has anadido productos a tu carrito aun.'),
            e('a', { className: 'btn btn-primary btn-lg', href: '/products' }, 'Explorar productos')
          )
        )
      );
    }

    return e(
      window.React.Fragment,
      null,
      errorText
        ? e(
            'div',
            { className: 'row mb-3' },
            e('div', { className: 'col-12' }, e('div', { className: 'alert alert-danger mb-0', role: 'alert' }, errorText))
          )
        : null,
      e(
        'div',
        { className: 'row' },
        e(
          'div',
          { className: 'col-lg-8' },
          e(
            'div',
            { className: 'card shadow' },
            e('div', { className: 'card-header' }, e('h4', { className: 'mb-0' }, 'Items en tu carrito')),
            e(
              'div',
              { className: 'card-body' },
              items.map(function renderItem(item) {
                const productId = String(item.productId);
                const isBusy = busyProductId === productId;

                return e(
                  'div',
                  { className: 'row mb-4 align-items-center cart-item-row gy-2', key: productId },
                  e(
                    'div',
                    { className: 'col-4 col-md-2' },
                    e('img', {
                      className: 'img-fluid rounded',
                      src: item.imagen || '/images/placeholder.png',
                      alt: item.nombre || 'Producto',
                      onError: function onError(event) {
                        event.currentTarget.src = '/images/placeholder.png';
                      }
                    })
                  ),
                  e(
                    'div',
                    { className: 'col-8 col-md-4' },
                    e('h5', null, item.nombre || 'Producto'),
                    e('p', { className: 'text-muted' }, formatMoney(item.precio) + ' c/u')
                  ),
                  e(
                    'div',
                    { className: 'col-7 col-md-3' },
                    e(
                      'div',
                      { className: 'input-group' },
                      e(
                        'button',
                        {
                          className: 'btn btn-outline-secondary btn-sm',
                          type: 'button',
                          disabled: isBusy || Number(item.cantidad) <= 1,
                          onClick: function onClick(event) {
                            event.preventDefault();
                            updateQuantity(productId, Number(item.cantidad) - 1);
                          }
                        },
                        '-'
                      ),
                      e('input', {
                        className: 'form-control text-center',
                        type: 'number',
                        min: '1',
                        value: Number(item.cantidad || 1),
                        disabled: isBusy,
                        onChange: function onChange(event) {
                          updateQuantity(productId, event.target.value);
                        }
                      }),
                      e(
                        'button',
                        {
                          className: 'btn btn-outline-secondary btn-sm',
                          type: 'button',
                          disabled: isBusy,
                          onClick: function onClick(event) {
                            event.preventDefault();
                            updateQuantity(productId, Number(item.cantidad) + 1);
                          }
                        },
                        '+'
                      )
                    )
                  ),
                  e(
                    'div',
                    { className: 'col-3 col-md-2 text-end' },
                    e('strong', null, formatMoney(Number(item.precio || 0) * Number(item.cantidad || 0)))
                  ),
                  e(
                    'div',
                    { className: 'col-2 col-md-1 text-end' },
                    e(
                      'button',
                      {
                        className: 'btn btn-outline-danger btn-sm',
                        type: 'button',
                        disabled: isBusy,
                        onClick: function onClick(event) {
                          event.preventDefault();
                          removeItem(productId);
                        }
                      },
                      e('i', { className: 'fas fa-trash' })
                    )
                  )
                );
              })
            )
          )
        ),
        e(
          'div',
          { className: 'col-lg-4' },
          e(
            'div',
            { className: 'card shadow' },
            e('div', { className: 'card-header' }, e('h4', { className: 'mb-0' }, 'Resumen del pedido')),
            e(
              'div',
              { className: 'card-body' },
              e('div', { className: 'd-flex justify-content-between mb-3' }, e('strong', null, 'Subtotal:'), e('span', null, formatMoney(subtotal))),
              e('div', { className: 'd-flex justify-content-between mb-3' }, e('strong', null, 'IVA (15%):'), e('span', null, formatMoney(iva))),
              e('hr'),
              e('div', { className: 'd-flex justify-content-between mb-4' }, e('strong', { className: 'h5' }, 'Total:'), e('span', { className: 'h5' }, formatMoney(totalConIva))),
              paypalClientId
                ? e('div', { id: 'paypal-button-container', className: 'mb-3' })
                : e('div', { className: 'alert alert-warning small mb-3' }, 'PayPal no esta configurado todavia en este entorno. Agrega un Client ID sandbox valido para habilitar el pago.'),
              e(
                'button',
                {
                  className: 'btn btn-outline-secondary btn-lg w-100 mt-2',
                  type: 'button',
                  disabled: isClearing,
                  onClick: function onClick(event) {
                    event.preventDefault();
                    clearCart();
                  }
                },
                isClearing ? 'Vaciando...' : 'Vaciar carrito'
              )
            )
          )
        )
      )
    );
  }

  window.ReactDOM.createRoot(rootElement).render(e(CartApp));
}
