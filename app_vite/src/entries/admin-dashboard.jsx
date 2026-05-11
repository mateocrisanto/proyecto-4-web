import { mountAdminDashboard } from '../react/admin/dashboard.jsx';

// Montar el dashboard cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountAdminDashboard);
} else {
  mountAdminDashboard();
}
