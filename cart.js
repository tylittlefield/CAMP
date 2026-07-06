(function() {
  function getKey() {
    var user = localStorage.getItem('camp-user');
    return user ? 'camp-cart-' + user : 'camp-cart-anon';
  }

  function getCart() {
    try { return JSON.parse(localStorage.getItem(getKey())) || []; }
    catch(e) { return []; }
  }

  function saveCart(items) {
    localStorage.setItem(getKey(), JSON.stringify(items));
  }

  function addToCart(item) {
    var cart = getCart();
    var match = cart.find(function(i) {
      return i.id === item.id && i.size === item.size && i.color === item.color;
    });
    if (match) {
      match.qty = (match.qty || 1) + 1;
    } else {
      item.qty = item.qty || 1;
      cart.push(item);
    }
    saveCart(cart);
    updateBadges();
  }

  function removeFromCart(id, size, color) {
    saveCart(getCart().filter(function(i) {
      return !(i.id === id && i.size === size && i.color === color);
    }));
    updateBadges();
  }

  function updateQty(id, size, color, qty) {
    if (qty < 1) { removeFromCart(id, size, color); return; }
    var cart = getCart();
    var item = cart.find(function(i) {
      return i.id === id && i.size === size && i.color === color;
    });
    if (item) { item.qty = qty; saveCart(cart); }
    updateBadges();
  }

  function clearCart() {
    localStorage.removeItem(getKey());
    updateBadges();
  }

  function getCount() {
    return getCart().reduce(function(s, i) { return s + (i.qty || 1); }, 0);
  }

  function updateBadges() {
    var count = getCount();
    document.querySelectorAll('.cart-badge').forEach(function(el) {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-block' : 'none';
    });
  }

  // Inject cart count badges into all cart links on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', function() {
    var count = getCount();
    var links = document.querySelectorAll('.cart-link, .map-cart-icon');
    links.forEach(function(link) {
      if (link.querySelector('.cart-badge')) return;
      var badge = document.createElement('span');
      badge.className = 'cart-badge';
      badge.style.cssText = 'background:var(--olive-dark,#3A3C1C);color:var(--cream,#F0EDD9);font-family:Archivo,sans-serif;font-size:0.62rem;font-weight:700;padding:2px 6px;border-radius:99px;margin-left:4px;vertical-align:middle;display:' + (count > 0 ? 'inline-block' : 'none') + ';';
      badge.textContent = count;
      link.appendChild(badge);
    });
  });

  window.Cart = {
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    removeFromCart: removeFromCart,
    updateQty: updateQty,
    clearCart: clearCart,
    getCount: getCount
  };
})();
