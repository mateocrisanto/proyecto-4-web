export function updateCartBadge(itemsCount) {
  const cartLink = document.getElementById('cart-link');
  if (!cartLink) return;

  const existingBadge = cartLink.querySelector('.badge');
  if (!itemsCount || itemsCount < 1) {
    if (existingBadge) existingBadge.remove();
    return;
  }

  if (existingBadge) {
    existingBadge.textContent = String(itemsCount);
    existingBadge.classList.remove('cart-badge-pop');
    void existingBadge.offsetWidth;
    existingBadge.classList.add('cart-badge-pop');
    return;
  }

  const badge = document.createElement('span');
  badge.className = 'badge bg-primary ms-1 cart-badge-pop';
  badge.textContent = String(itemsCount);
  cartLink.appendChild(badge);
}

