/**
 * COMPONENTE: Dashboard Mejorado para Admin
 * Muestra estadísticas de ventas, usuarios, productos, etc.
 */

export function mountAdminDashboard() {
  if (!window.React || !window.ReactDOM) {
    return;
  }

  const e = window.React.createElement;
  const { useState, useEffect } = window.React;

  function StatCard({ icon, title, value, color, subtitle }) {
    return e(
      'div',
      { className: 'col-lg-3 col-md-6' },
      e(
        'div',
        { className: 'card shadow-sm h-100' },
        e(
          'div',
          { className: 'card-body' },
          e(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'start' } },
            e(
              'div',
              null,
              e('h6', { className: 'text-muted mb-1' }, title),
              e('h3', { style: { color: color, margin: '0' } }, value),
              subtitle ? e('small', { className: 'text-muted' }, subtitle) : null
            ),
            e('div', { style: { fontSize: '28px' } }, icon)
          )
        )
      )
    );
  }

  function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(function fetchStats() {
      fetch('/api/stats/dashboard')
        .then(res => res.json())
        .then(data => {
          setStats(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error cargando estadísticas:', err);
          setError('No se pudieron cargar las estadísticas');
          setLoading(false);
        });
    }, []);

    if (loading) {
      return e(
        'div',
        { className: 'text-center py-5' },
        e('div', { className: 'spinner-border text-primary', role: 'status' })
      );
    }

    if (error) {
      return e(
        'div',
        { className: 'alert alert-danger', role: 'alert' },
        error
      );
    }

    if (!stats) {
      return e(
        'div',
        { className: 'alert alert-warning' },
        'No hay datos disponibles'
      );
    }

    const { resumen, alertas, topProducts, ordenesPorMes } = stats;

    return e(
      'div',
      { className: 'container-fluid py-4' },
      // Título
      e('h2', { className: 'mb-4' }, '📊 Dashboard de Administrador'),

      // Cards de Resumen
      e(
        'div',
        { className: 'row g-3 mb-4' },
        e(StatCard, {
          icon: '👥',
          title: 'Usuarios Registrados',
          value: resumen.totalUsers,
          color: '#0d6efd'
        }),
        e(StatCard, {
          icon: '📦',
          title: 'Productos',
          value: resumen.totalProducts,
          color: '#0dcaf0',
          subtitle: resumen.totalProducts > 0 ? 'activos' : ''
        }),
        e(StatCard, {
          icon: '🛒',
          title: 'Órdenes Completadas',
          value: resumen.totalOrdenes,
          color: '#198754'
        }),
        e(StatCard, {
          icon: '💰',
          title: 'Ingresos Totales',
          value: `$${resumen.totalIngresos}`,
          color: '#ffc107'
        })
      ),

      // Asesorías Abiertas
      e(
        'div',
        { className: 'row g-3 mb-4' },
        e(
          'div',
          { className: 'col-lg-3 col-md-6' },
          e(
            'div',
            { className: 'card shadow-sm bg-warning bg-opacity-10' },
            e(
              'div',
              { className: 'card-body' },
              e('h6', { className: 'text-muted mb-1' }, 'Asesorías Abiertas'),
              e('h3', { style: { color: '#ff6b6b', margin: '0' } }, resumen.asesoriasAbiertas),
              e('small', { className: 'text-muted' }, 'que requieren atención')
            )
          )
        )
      ),

      // Alertas de Stock Bajo
      alertas.productosStockBajo && alertas.productosStockBajo.length > 0
        ? e(
            'div',
            { className: 'row mb-4' },
            e(
              'div',
              { className: 'col-12' },
              e(
                'div',
                { className: 'card shadow-sm border-warning' },
                e(
                  'div',
                  { className: 'card-header bg-warning bg-opacity-10' },
                  e('h5', { className: 'mb-0' }, '⚠️ Productos con Stock Bajo (< 5 unidades)')
                ),
                e(
                  'div',
                  { className: 'card-body' },
                  e(
                    'ul',
                    { className: 'list-group list-group-flush' },
                    alertas.productosStockBajo.map((prod, idx) =>
                      e(
                        'li',
                        { key: idx, className: 'list-group-item d-flex justify-content-between' },
                        e('span', null, prod.nombre),
                        e('span', { className: 'badge bg-warning' }, `Stock: ${prod.stock}`)
                      )
                    )
                  )
                )
              )
            )
          )
        : null,

      // Top Productos
      topProducts && topProducts.length > 0
        ? e(
            'div',
            { className: 'row mb-4' },
            e(
              'div',
              { className: 'col-12' },
              e(
                'div',
                { className: 'card shadow-sm' },
                e(
                  'div',
                  { className: 'card-header bg-light' },
                  e('h5', { className: 'mb-0' }, '🏆 Top 5 Productos Más Vendidos')
                ),
                e(
                  'div',
                  { className: 'card-body' },
                  e(
                    'table',
                    { className: 'table table-sm' },
                    e(
                      'thead',
                      null,
                      e(
                        'tr',
                        null,
                        e('th', null, 'Producto'),
                        e('th', null, 'Cantidad'),
                        e('th', null, 'Ingresos')
                      )
                    ),
                    e(
                      'tbody',
                      null,
                      topProducts.map((prod, idx) =>
                        e(
                          'tr',
                          { key: idx },
                          e('td', null, prod.producto?.[0]?.nombre || 'Desconocido'),
                          e('td', null, prod.cantidad),
                          e('td', null, `$${(prod.ingresos || 0).toFixed(2)}`)
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        : null,

      // Gráfico simple de ventas por mes
      ordenesPorMes && ordenesPorMes.length > 0
        ? e(
            'div',
            { className: 'row' },
            e(
              'div',
              { className: 'col-12' },
              e(
                'div',
                { className: 'card shadow-sm' },
                e(
                  'div',
                  { className: 'card-header bg-light' },
                  e('h5', { className: 'mb-0' }, '📈 Ventas por Mes (últimos 6 meses)')
                ),
                e(
                  'div',
                  { className: 'card-body' },
                  e(
                    'div',
                    { style: { overflowX: 'auto' } },
                    e(
                      'div',
                      {
                        style: {
                          display: 'flex',
                          gap: '8px',
                          paddingBottom: '16px',
                          alignItems: 'flex-end',
                          height: '200px'
                        }
                      },
                      ordenesPorMes.map((mes, idx) => {
                        const maxTotal = Math.max(...ordenesPorMes.map(m => m.total));
                        const barHeight = (mes.total / maxTotal) * 150;

                        return e(
                          'div',
                          {
                            key: idx,
                            style: {
                              flex: '1',
                              minWidth: '60px',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px'
                            }
                          },
                          e(
                            'div',
                            {
                              style: {
                                width: '100%',
                                height: barHeight,
                                backgroundColor: '#d374ff',
                                borderRadius: '4px 4px 0 0'
                              }
                            }
                          ),
                          e('small', { style: { fontSize: '11px', textAlign: 'center' } }, `$${mes.total.toFixed(0)}`),
                          e('small', { style: { fontSize: '10px', color: '#999' } }, mes._id)
                        );
                      })
                    )
                  )
                )
              )
            )
          )
        : null
    );
  }

  const container = document.getElementById('admin-dashboard-root');
  if (container) {
    window.ReactDOM.createRoot(container).render(e(AdminDashboard));
  }
}
