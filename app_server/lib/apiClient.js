/**
 * APICLIENT.JS — CLIENTE HTTP INTERNO (SERVIDOR → API)
 * ======================================================
 * Este módulo centraliza TODAS las llamadas HTTP que el servidor hace
 * a su propia REST API (/api/*). Usa axios en lugar de fetch nativo.
 *
 * PATRÓN DE USO:
 *   const { requestApi } = require('../lib/apiClient');
 *   const { ok, status, body } = await requestApi('/api/products', { method: 'GET' });
 *
 * POR QUÉ SELF-CALL (llamarse a sí mismo):
 *   La app separa la lógica en dos capas:
 *     - app_api/  → capa de datos pura (REST API, sin HTML)
 *     - app_server/ → capa de presentación (renderiza Pug)
 *   Los controladores del servidor NO importan modelos Mongoose directamente;
 *   siempre pasan por la API para respetar esta separación de responsabilidades.
 *
 * API_SERVER:
 *   - En producción: http://127.0.0.1:<PORT>  (mismo proceso, red local)
 *   - En desarrollo: http://localhost:3000
 *   Se puede sobreescribir con la variable de entorno API_SERVER.
 */

const axios = require('axios');

// Tiempo máximo de espera por petición (en ms). Sobreescribible con API_TIMEOUT_MS.
const DEFAULT_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS) || 10000;

const defaultApiServer = process.env.NODE_ENV === 'production'
  ? `http://127.0.0.1:${process.env.PORT || 3000}`
  : 'http://localhost:3000';

// URL base de la API. Se elimina la barra final para evitar doble-slash.
const API_SERVER = (process.env.API_SERVER || defaultApiServer).replace(/\/+$/, '');

const buildUrl = (path) => `${API_SERVER}${path}`;

/**
 * requestApi(path, options) — realiza una petición HTTP a la API interna.
 *
 * @param {string} path    - Ruta relativa, ej: '/api/products'
 * @param {object} options - Opciones: method, body (string JSON), headers, timeoutMs
 * @returns {{ ok: boolean, status: number, body: any }}
 *   - ok: true si el status es 2xx
 *   - status: código HTTP de la respuesta
 *   - body: objeto JavaScript parseado (o null si 204 No Content)
 *
 * validateStatus: () => true  → axios no lanza excepciones por status 4xx/5xx,
 * permitiendo que el controlador maneje los errores manualmente.
 */
const requestApi = async (path, options = {}) => {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestOptions } = options;
  const method = (requestOptions.method || 'GET').toUpperCase();

  const response = await axios({
    url: buildUrl(path),
    method,
    timeout: timeoutMs,
    headers: {
      'Content-Type': 'application/json',
      ...(requestOptions.headers || {})
    },
    data: requestOptions.body,
    validateStatus: () => true
  });

  const body = response.status === 204 ? null : response.data;

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    body
  };
};

module.exports = {
  API_SERVER,
  requestApi
};
