const axios = require('axios');

const DEFAULT_TIMEOUT_MS = Number(process.env.API_TIMEOUT_MS) || 10000;

const defaultApiServer = process.env.NODE_ENV === 'production'
  ? `http://127.0.0.1:${process.env.PORT || 3000}`
  : 'http://localhost:3000';

const API_SERVER = (process.env.API_SERVER || defaultApiServer).replace(/\/+$/, '');

const buildUrl = (path) => `${API_SERVER}${path}`;

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
