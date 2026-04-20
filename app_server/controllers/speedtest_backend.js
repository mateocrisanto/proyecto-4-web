/**
 * CONTROLADORES BACKEND LIBRESPEED
 * ==================================
 * Endpoints requeridos por el worker de LibreSpeed para medir
 * velocidad de descarga, carga y ping directamente desde el navegador.
 *
 * - GET /backend/garbage  → descarga: envía bytes aleatorios
 * - GET|POST /backend/empty → carga / ping: respuesta 200 vacía
 * - GET /backend/getIP    → retorna la IP del cliente
 */

const crypto = require('crypto');

// Buffer reutilizable de 64 KB con bytes aleatorios
const CHUNK_SIZE = 65536;
const randomChunk = crypto.randomBytes(CHUNK_SIZE);

// ========== GARBAGE: DATOS PARA PRUEBA DE DESCARGA ==========
// El worker solicita: GET /backend/garbage?ckSize=N&r=<random>
// ckSize indica cuántos MB enviar (el worker aborta cuando termina el tiempo)
const garbageController = (req, res) => {
    const ckSize = Math.min(Math.max(parseInt(req.query.ckSize) || 4, 1), 1024);
    const totalBytes = ckSize * 1048576;

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', totalBytes);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let remaining = totalBytes;

    const write = () => {
        let ok = true;
        while (remaining > 0 && ok && !res.writableEnded) {
            const toSend = Math.min(remaining, CHUNK_SIZE);
            remaining -= toSend;
            if (remaining === 0) {
                res.end(randomChunk.slice(0, toSend));
                return;
            }
            ok = res.write(randomChunk.slice(0, toSend));
        }
        if (remaining > 0 && !res.writableEnded) {
            res.once('drain', write);
        }
    };

    // El cliente aborta la conexión cuando expira el tiempo del test
    res.on('close', () => { remaining = 0; });
    write();
};

// ========== EMPTY: RESPUESTA VACÍA PARA CARGA Y PING ==========
// El worker solicita POST (carga) o GET (ping) a esta ruta y descarta la respuesta
const emptyController = (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(200).end();
};

// ========== GET IP: IP DEL CLIENTE ==========
// El worker solicita: GET /backend/getIP?isp=true&distance=km&r=<random>
// Responde con JSON { processedString, rawIspInfo } o texto plano
const getIpController = (req, res) => {
    const forwarded = req.headers['x-forwarded-for'];
    const raw = forwarded
        ? forwarded.split(',')[0].trim()
        : (req.socket.remoteAddress || '');
    const ip = raw.replace(/^::ffff:/, '');

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');

    if (req.query.isp === 'true') {
        res.json({ processedString: ip, rawIspInfo: '' });
    } else {
        res.send(ip);
    }
};

module.exports = { garbageController, emptyController, getIpController };
