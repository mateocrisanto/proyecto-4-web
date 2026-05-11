/**
 * PAYPAL.JS — CONTROLADOR DE PAGOS
 * ==================================
 * Usa la REST API de PayPal directamente (sin SDK npm).
 * El botón de pago se renderiza en el browser con el JS SDK de PayPal CDN,
 * que muestra un popup donde CUALQUIER usuario puede iniciar sesión o
 * pagar como invitado con tarjeta.
 *
 * Variables de entorno requeridas (Heroku Config Vars):
 *   PAYPAL_CLIENT_ID     — Client ID (sandbox o live)
 *   PAYPAL_CLIENT_SECRET — Secret (sandbox o live)
 *   PAYPAL_MODE          — 'sandbox' | 'live'
 *
 * Flujo:
 *   1. POST /pago/crear   → crea orden en PayPal, devuelve { orderID }
 *   2. POST /pago/capturar → captura el pago aprobado, vacía el carrito
 *   3. GET  /pago/exito   → página de confirmación
 */

const { requestApi } = require('../lib/apiClient');

function isConfiguredValue(value) {
  return Boolean(value) && !value.startsWith('TU_PAYPAL_');
}

function toCents(value) {
  return Math.round(Number(value || 0) * 100);
}

function centsToMoney(cents) {
  return (Number(cents || 0) / 100).toFixed(2);
}

async function parsePaypalError(response) {
  const fallback = `PayPal error ${response.status}`;
  try {
    const body = await response.json();
    const details = Array.isArray(body?.details) ? body.details : [];
    const detail = details[0];
    if (detail?.description) return detail.description;
    if (body?.message) return body.message;
    if (body?.name) return body.name;
    return fallback;
  } catch (_) {
    try {
      const text = await response.text();
      return text || fallback;
    } catch (_) {
      return fallback;
    }
  }
}

// Lee las vars en cada llamada para que funcionen correctamente en Heroku
function getPaypalConfig() {
  const mode = process.env.PAYPAL_MODE || 'sandbox';
  return {
    base: mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com',
    clientId:     isConfiguredValue(process.env.PAYPAL_CLIENT_ID) ? process.env.PAYPAL_CLIENT_ID : null,
    clientSecret: isConfiguredValue(process.env.PAYPAL_CLIENT_SECRET) ? process.env.PAYPAL_CLIENT_SECRET : null,
    mode
  };
}

async function getAccessToken() {
  const { base, clientId, clientSecret } = getPaypalConfig();

  if (!clientId || !clientSecret) {
    throw new Error('Faltan PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET en las variables de entorno');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

// POST /pago/crear
const crearOrden = async (req, res) => {
  try {
    const { base } = getPaypalConfig();
    const sessionId = req.cookies?.cartSessionId;

    if (!sessionId) {
      return res.status(400).json({ error: 'Sin sesión de carrito' });
    }

    const cartRes = await requestApi(`/api/cart/${sessionId}`, { method: 'GET' });
    if (!cartRes.ok || !cartRes.body?.items?.length) {
      return res.status(400).json({ error: 'Carrito vacío o no encontrado' });
    }

    const cart = cartRes.body;

    const items = cart.items
      .map(item => {
        const quantity = Math.max(0, Math.floor(Number(item.cantidad || 0)));
        const unitCents = toCents(item.precio);
        return {
          name: String(item.nombre || 'Producto').substring(0, 127),
          quantity,
          unitCents
        };
      })
      .filter(item => item.quantity > 0)
      .map(item => ({
        name: item.name,
        quantity: String(item.quantity),
        unit_amount: {
          currency_code: 'USD',
          value: centsToMoney(item.unitCents)
        }
      }));

    const subtotalCents = items.reduce((sum, item) => {
      return sum + Math.round(Number(item.unit_amount.value) * 100) * Number(item.quantity);
    }, 0);
    const taxCents = Math.round(subtotalCents * 0.15);
    const totalCents = subtotalCents + taxCents;

    const subtotal = centsToMoney(subtotalCents);
    const tax = centsToMoney(taxCents);
    const total = centsToMoney(totalCents);

    const token = await getAccessToken();

    const orderRes = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          description: 'Compra en ISP Store',
          amount: {
            currency_code: 'USD',
            value: total,
            breakdown: {
              item_total: { currency_code: 'USD', value: subtotal },
              tax_total:  { currency_code: 'USD', value: tax }
            }
          },
          items
        }]
      })
    });

    if (!orderRes.ok) {
      const err = await parsePaypalError(orderRes);
      console.error('PayPal create order error:', err);
      return res.status(500).json({ error: `PayPal rechazo la orden: ${err}` });
    }

    const order = await orderRes.json();
    res.json({ orderID: order.id });

  } catch (err) {
    console.error('crearOrden error:', err.message);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
};

// POST /pago/capturar
const capturarOrden = async (req, res) => {
  try {
    const { base } = getPaypalConfig();
    const { orderID } = req.body;

    if (!orderID) {
      return res.status(400).json({ error: 'orderID requerido' });
    }

    const token = await getAccessToken();

    const captureRes = await fetch(`${base}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!captureRes.ok) {
      const err = await parsePaypalError(captureRes);
      console.error('PayPal capture error:', err);
      return res.status(500).json({ error: `PayPal no pudo capturar el pago: ${err}` });
    }

    const capture = await captureRes.json();

    // Vaciar carrito tras pago exitoso
    const sessionId = req.cookies?.cartSessionId;
    if (sessionId) {
      await requestApi('/api/cart/clear', {
        method: 'POST',
        body: JSON.stringify({ sessionId })
      });
    }

    res.json({ success: true, capture });

  } catch (err) {
    console.error('capturarOrden error:', err.message);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
};

// GET /pago/exito
const pagoExito = (req, res) => {
  res.render('pago_exitoso', { title: 'Pago completado' });
};

module.exports = { crearOrden, capturarOrden, pagoExito };
