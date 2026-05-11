import { safeParseJson } from '../shared/json.js';
import { updateCartBadge } from '../shared/cartBadge.js';
import { showToast } from '../shared/toast.js';

export function mountProductsApp() {
  const rootElement = document.getElementById('products-react-root');
  const dataElement = document.getElementById('products-initial-data');

  if (!rootElement || !dataElement || !window.React || !window.ReactDOM) {
    return;
  }

  const e = window.React.createElement;
  const { useMemo, useState } = window.React;

  function ProductCard(props) {
    const product = props.product;
    const isLoading = props.loadingProductId === product._id;
    const stock = Number(product.stock || 0);
    const isOutOfStock = stock <= 0;

    return e(
      'div',
      { className: 'col-lg-4 col-md-6' },
      e(
        'div',
        { className: 'card h-100 shadow-sm product-card' },
        e('img', {
          className: 'card-img-top',
          src: product.imagen || '/images/placeholder.png',
          alt: product.nombre || 'Producto',
          onError: function onError(event) {
            event.currentTarget.src = '/images/placeholder.png';
          }
        }),
        e(
          'div',
          { className: 'card-body d-flex flex-column' },
          e('h5', { className: 'card-title' }, product.nombre || 'Producto sin nombre'),
          e('p', { className: 'card-text' }, product.descripcion || 'Sin descripcion disponible.'),
          e(
            'div',
            { className: 'mt-auto' },
            e(
              'div',
              { className: 'd-flex justify-content-between align-items-center mb-3' },
              e('div', { className: 'price' }, e('strong', null, '$' + Number(product.precio || 0).toFixed(2))),
              e('small', { className: stock > 0 ? 'text-muted' : 'text-danger fw-bold' }, 'Stock: ' + stock)
            ),
            e(
              'button',
              {
                className: 'btn btn-primary w-100',
                type: 'button',
                disabled: isLoading || isOutOfStock,
                onClick: function onClick() {
                  props.onAddToCart(product);
                }
              },
              isOutOfStock ? 'Sin stock' : (isLoading ? 'Agregando...' : 'Anadir al Carrito')
            )
          )
        )
      )
    );
  }

  function ProductsApp() {
    const initialData = safeParseJson(dataElement.textContent || '{}', {});
    const initialProducts = Array.isArray(initialData.products) ? initialData.products : [];

    const [loadingProductId, setLoadingProductId] = useState(null);
    const [products, setProducts] = useState(initialProducts);

    const hasProducts = useMemo(function memoHasProducts() {
      return products.length > 0;
    }, [products]);

    function onAddToCart(product) {
      if (Number(product.stock || 0) <= 0) {
        showToast('Este producto no tiene stock disponible.', { type: 'warning', duration: 2600 });
        return;
      }

      setLoadingProductId(product._id);

      fetch('/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          cantidad: 1
        })
      })
        .then(function onResponse(response) {
          return response.json();
        })
        .then(function onData(data) {
          if (!data || !data._id) {
            throw new Error(data && data.message ? data.message : 'No se pudo agregar el producto.');
          }

          const itemsCount = Array.isArray(data.items) ? data.items.length : 0;
          updateCartBadge(itemsCount);
          setProducts(function decreaseStock(prevProducts) {
            return prevProducts.map(function (item) {
              if (String(item._id) !== String(product._id)) return item;
              const currentStock = Number(item.stock || 0);
              return Object.assign({}, item, { stock: Math.max(currentStock - 1, 0) });
            });
          });
          showToast('Producto agregado al carrito.', { type: 'success', duration: 2400 });
        })
        .catch(function onError(error) {
          showToast(error.message || 'Error de conexion.', { type: 'danger', duration: 3000 });
        })
        .finally(function onFinally() {
          setLoadingProductId(null);
        });
    }

    if (!hasProducts) {
      return e(
        'div',
        { className: 'row' },
        e(
          'div',
          { className: 'col-12' },
          e(
            'div',
            { className: 'alert alert-info text-center', role: 'alert' },
            e('h4', { className: 'mb-2' }, 'No hay productos disponibles en este momento'),
            e('p', { className: 'mb-0' }, 'Intenta de nuevo en unos minutos o revisa la carga de datos de la API.')
          )
        )
      );
    }

    return e(
      'div',
      { className: 'row g-4' },
      products.map(function renderProduct(product) {
        return e(ProductCard, {
          key: product._id,
          product: product,
          loadingProductId: loadingProductId,
          onAddToCart: onAddToCart
        });
      })
    );
  }

  window.ReactDOM.createRoot(rootElement).render(e(ProductsApp));
}
