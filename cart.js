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
  }

  function removeFromCart(id, size, color) {
    saveCart(getCart().filter(function(i) {
      return !(i.id === id && i.size === size && i.color === color);
    }));
  }

  function updateQty(id, size, color, qty) {
    if (qty < 1) { removeFromCart(id, size, color); return; }
    var cart = getCart();
    var item = cart.find(function(i) {
      return i.id === id && i.size === size && i.color === color;
    });
    if (item) { item.qty = qty; saveCart(cart); }
  }

  function clearCart() {
    localStorage.removeItem(getKey());
  }

  window.Cart = { getCart: getCart, saveCart: saveCart, addToCart: addToCart, removeFromCart: removeFromCart, updateQty: updateQty, clearCart: clearCart };
})();
