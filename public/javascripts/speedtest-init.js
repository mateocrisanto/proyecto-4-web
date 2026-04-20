/**
 * SPEEDTEST INIT - LibreSpeed
 * ============================
 * Inicializa la prueba de velocidad usando la librería LibreSpeed
 * (speedtest.js + speedtest_worker.js) y conecta la UI de index.pug
 * con los endpoints backend /backend/garbage, /backend/empty, /backend/getIP.
 */
(function () {
    const dlEl   = document.getElementById('download-speed');
    const ulEl   = document.getElementById('upload-speed');
    const pingEl = document.getElementById('ping');
    const dlBar  = document.getElementById('download-progress-bar');
    const ulBar  = document.getElementById('upload-progress-bar');
    const pingBar = document.getElementById('ping-progress-bar');
    const startBtn = document.getElementById('start-speed-test');

    if (!startBtn) return;

    let st = null;

    const reset = () => {
        dlEl.textContent   = '--';
        ulEl.textContent   = '--';
        pingEl.textContent = '--';
        dlBar.style.width   = '0%';
        ulBar.style.width   = '0%';
        pingBar.style.width = '0%';
    };

    startBtn.addEventListener('click', function () {
        // Si el test ya está corriendo, lo detiene
        if (st && st.getState() === 3) {
            st.abort();
            startBtn.textContent = 'Iniciar Prueba de Velocidad';
            return;
        }

        reset();
        startBtn.textContent = 'Detener';

        st = new Speedtest();

        // Apuntar al backend Express en lugar de los defaults PHP
        st.setParameter('url_dl',    '/backend/garbage');
        st.setParameter('url_ul',    '/backend/empty');
        st.setParameter('url_ping',  '/backend/empty');
        st.setParameter('url_getIp', '/backend/getIP');

        // Duración más corta para una experiencia ágil
        st.setParameter('time_dl_max', 10);
        st.setParameter('time_ul_max', 10);

        // Deshabilitar ISP info (no tenemos base de datos de ISPs)
        st.setParameter('getIp_ispInfo', false);

        // Callback durante el test: actualiza los valores en la UI
        st.onupdate = function (data) {
            if (data.dlStatus) {
                dlEl.textContent  = data.dlStatus;
                dlBar.style.width = (data.dlProgress * 100).toFixed(0) + '%';
            }
            if (data.ulStatus) {
                ulEl.textContent  = data.ulStatus;
                ulBar.style.width = (data.ulProgress * 100).toFixed(0) + '%';
            }
            if (data.pingStatus) {
                pingEl.textContent  = data.pingStatus;
                pingBar.style.width = Math.min(data.pingProgress * 100, 100).toFixed(0) + '%';
            }
        };

        // Callback al terminar
        st.onend = function (aborted) {
            startBtn.textContent = 'Iniciar Prueba de Velocidad';
            if (aborted) reset();
        };

        st.start();
    });
})();
