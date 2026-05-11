let styleInjected = false;

function injectToastStyles() {
  if (styleInjected) return;

  const style = document.createElement('style');
  style.id = 'react-ui-toast-styles';
  style.textContent = [
    '.react-toast-host { position: fixed; top: 1rem; right: 1rem; z-index: 1080; display: flex; flex-direction: column; gap: .5rem; }',
    '.react-toast-item { min-width: 260px; max-width: 340px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,.25); transform: translateY(-8px) scale(.98); opacity: 0; transition: transform .25s ease, opacity .25s ease; }',
    '.react-toast-item.is-visible { transform: translateY(0) scale(1); opacity: 1; }',
    '.react-toast-item.is-hiding { transform: translateY(-10px) scale(.97); opacity: 0; }',
    '.cart-badge-pop { animation: cartBadgePop .28s ease; }',
    '@keyframes cartBadgePop { 0% { transform: scale(.75); } 65% { transform: scale(1.2); } 100% { transform: scale(1); } }'
  ].join('');

  document.head.appendChild(style);
  styleInjected = true;
}

function getToastHost() {
  let host = document.getElementById('react-toast-host');
  if (host) return host;

  host = document.createElement('div');
  host.id = 'react-toast-host';
  host.className = 'react-toast-host';
  document.body.appendChild(host);
  return host;
}

export function showToast(message, options) {
  const opts = options || {};
  const type = opts.type || 'success';
  const duration = Number(opts.duration) > 0 ? Number(opts.duration) : 2600;

  injectToastStyles();
  const host = getToastHost();

  const toast = document.createElement('div');
  toast.className = 'alert alert-' + type + ' react-toast-item mb-0';
  toast.setAttribute('role', 'status');
  toast.textContent = message;

  host.appendChild(toast);

  requestAnimationFrame(function () {
    toast.classList.add('is-visible');
  });

  setTimeout(function () {
    toast.classList.remove('is-visible');
    toast.classList.add('is-hiding');
    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 220);
  }, duration);
}
