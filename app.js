// Automatizado Merch — SPA Router & App Logic

const App = (() => {
  // ---- State ----
  const state = {
    currentScreen: 'home',
    previousScreen: null,
    cart: [],
    selectedProduct: null,
    selectedSize: null,
    activeFilter: 'all',
    orderPlaced: false,
  };

  // ---- Products catalog ----
  const products = [
    {
      id: 1,
      name: 'Void Oversized Tee',
      price: 49,
      category: 'tops',
      tag: 'BESTSELLER',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      description: 'Heavy 320gsm cotton. Dropped shoulders. Screen-printed distressed logo in reflective ink. Designed to outlast trends.',
      color: 'linear-gradient(135deg, #0f0f1a 0%, #1a0a2e 100%)',
      emoji: '👕',
    },
    {
      id: 2,
      name: 'Electric Violet Hoodie',
      price: 89,
      category: 'tops',
      tag: 'NEW',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      description: '420gsm fleece-lined hoodie. Embroidered ∅ logo on chest. Ribbed cuffs with hidden thumbholes. Built for the cold.',
      color: 'linear-gradient(135deg, #1a0a2e 0%, #2d1060 100%)',
      emoji: '🧥',
    },
    {
      id: 3,
      name: 'Signal Cap',
      price: 34,
      category: 'accessories',
      tag: null,
      sizes: ['ONE SIZE'],
      description: '6-panel structured cap. Embossed logo patch. Adjustable metal clasp. 100% brushed cotton twill.',
      color: 'linear-gradient(135deg, #0d0d0d 0%, #1a1a1a 100%)',
      emoji: '🧢',
    },
    {
      id: 4,
      name: 'Noise Cargo Pants',
      price: 119,
      category: 'bottoms',
      tag: 'LIMITED',
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'Multi-pocket cargo silhouette. Wax-coated shell. Tonal stitching. Elastic waistband with cinch cord. Drop crotch fit.',
      color: 'linear-gradient(135deg, #111a0f 0%, #1a2a10 100%)',
      emoji: '👖',
    },
    {
      id: 5,
      name: 'Static Shoulder Bag',
      price: 64,
      category: 'accessories',
      tag: 'NEW',
      sizes: ['ONE SIZE'],
      description: '600D ripstop exterior. Padded interior divider. YKK zippers. Adjustable webbing strap with quick-release buckle.',
      color: 'linear-gradient(135deg, #0a0a1a 0%, #1a1030 100%)',
      emoji: '🎒',
    },
    {
      id: 6,
      name: 'Phantom Long Sleeve',
      price: 58,
      category: 'tops',
      tag: null,
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      description: '280gsm premium cotton jersey. Contrast sleeve panels. Heat-transfer ghost print on back. Made in Portugal.',
      color: 'linear-gradient(135deg, #1a0f0f 0%, #2a1010 100%)',
      emoji: '👔',
    },
  ];

  // ---- Router ----
  function navigate(screenId, direction = 'forward') {
    const screens = document.querySelectorAll('.screen');
    const current = document.querySelector('.screen.active');
    const target = document.getElementById(`screen-${screenId}`);

    if (!target || current === target) return;

    state.previousScreen = state.currentScreen;
    state.currentScreen = screenId;

    // Set starting position of target
    target.classList.remove('no-transition', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    current.classList.remove('no-transition');

    if (direction === 'forward') {
      target.style.transform = 'translateX(100%)';
    } else {
      target.style.transform = 'translateX(-30%)';
    }
    target.classList.add('active');

    // Force reflow
    target.offsetHeight;

    // Animate
    requestAnimationFrame(() => {
      if (direction === 'forward') {
        target.style.transform = 'translateX(0)';
        current.style.transform = 'translateX(-30%)';
      } else {
        target.style.transform = 'translateX(0)';
        current.style.transform = 'translateX(100%)';
      }

      // Clean up after transition
      const cleanup = () => {
        current.classList.remove('active');
        current.style.transform = '';
        target.style.transform = '';
        target.removeEventListener('transitionend', cleanup);
        // Scroll target to top
        target.scrollTop = 0;
      };
      target.addEventListener('transitionend', cleanup, { once: true });
    });

    updateHeader(screenId);
    updateBottomBar(screenId);
  }

  function goBack() {
    if (state.previousScreen) {
      navigate(state.previousScreen, 'back');
    } else {
      navigate('home', 'back');
    }
  }

  // ---- Header ----
  function updateHeader(screenId) {
    const backBtn = document.getElementById('header-back');
    const title = document.getElementById('header-title');
    const cartBtn = document.getElementById('header-cart-btn');

    const titles = {
      home: '',
      catalog: 'Catálogo',
      product: state.selectedProduct?.name || 'Producto',
      cart: 'Carrito',
      checkout: 'Checkout',
    };

    title.textContent = titles[screenId] || '';
    backBtn.style.display = ['catalog', 'product', 'cart', 'checkout'].includes(screenId) ? 'flex' : 'none';
    cartBtn.style.display = screenId !== 'cart' ? 'flex' : 'none';
    updateCartBadge();
  }

  function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  // ---- Bottom bar ----
  function updateBottomBar(screenId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.screen === screenId ||
        (screenId === 'product' && btn.dataset.screen === 'catalog'));
    });
  }

  // ---- Product helpers ----
  function openProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    state.selectedProduct = product;
    state.selectedSize = product.sizes[1] || product.sizes[0];
    renderProductScreen(product);
    navigate('product', 'forward');
  }

  function renderProductScreen(product) {
    const screen = document.getElementById('screen-product');

    const sizeBtns = product.sizes.map(size => `
      <button class="size-btn ${size === state.selectedSize ? 'selected' : ''}"
              onclick="App.selectSize('${size}')"
              data-size="${size}">
        ${size}
      </button>
    `).join('');

    screen.innerHTML = `
      <div id="app-header" class="sticky top-0 z-50" style="background:rgba(8,8,8,0.92);backdrop-filter:blur(20px);border-bottom:1px solid #1E1E1E;height:56px;display:flex;align-items:center;padding:0 16px;">
        <button onclick="App.goBack()" style="display:flex;align-items:center;gap:8px;color:#A0A0A0;margin-right:auto;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        <button onclick="App.navigate('cart', 'forward')" style="position:relative;color:#A0A0A0;margin-left:auto;">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
          <span id="cart-badge-product" style="position:absolute;top:-4px;right:-4px;background:#7B2FFF;color:white;border-radius:50%;width:16px;height:16px;font-size:10px;font-weight:700;display:${state.cart.reduce((s,i)=>s+i.qty,0)>0?'flex':'none'};align-items:center;justify-content:center;">${state.cart.reduce((s,i)=>s+i.qty,0)}</span>
        </button>
      </div>

      <div style="padding:20px 16px 0;">
        <!-- Product image -->
        <div style="width:100%;height:360px;background:${product.color};border-radius:16px;display:flex;align-items:center;justify-content:center;margin-bottom:24px;border:1px solid #1E1E1E;">
          <span style="font-size:96px;filter:drop-shadow(0 0 20px rgba(123,47,255,0.5));">${product.emoji}</span>
        </div>

        <!-- Title + price -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <h1 style="font-size:22px;font-weight:800;color:#fff;line-height:1.2;max-width:220px;">${product.name}</h1>
          <span style="font-size:24px;font-weight:800;color:#7B2FFF;">$${product.price}</span>
        </div>

        ${product.tag ? `<div class="chip" style="margin-bottom:16px;">${product.tag}</div>` : '<div style="height:8px;"></div>'}

        <!-- Description -->
        <p style="color:#A0A0A0;font-size:14px;line-height:1.6;margin-bottom:24px;">${product.description}</p>

        <!-- Size selector -->
        ${product.sizes[0] !== 'ONE SIZE' ? `
          <div style="margin-bottom:24px;">
            <p style="font-size:13px;font-weight:600;color:#A0A0A0;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:12px;">Talla</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap;" id="size-selector">
              ${sizeBtns}
            </div>
          </div>
        ` : ''}

        <!-- Add to cart -->
        <button class="btn-primary" onclick="App.addToCart()" style="width:100%;padding:16px;font-size:16px;font-weight:700;letter-spacing:0.02em;border:none;cursor:pointer;margin-bottom:12px;">
          Añadir al carrito — $${product.price}
        </button>
        <button class="btn-secondary" onclick="App.navigate('catalog','back')" style="width:100%;padding:14px;font-size:14px;font-weight:500;cursor:pointer;border:none;background:transparent;border:1px solid #1E1E1E;border-radius:8px;color:#A0A0A0;">
          Ver más productos
        </button>
      </div>
    `;
  }

  function selectSize(size) {
    state.selectedSize = size;
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.size === size);
    });
  }

  function addToCart() {
    if (!state.selectedProduct) return;

    const key = `${state.selectedProduct.id}-${state.selectedSize}`;
    const existing = state.cart.find(item => item.key === key);

    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({
        key,
        product: state.selectedProduct,
        size: state.selectedSize,
        qty: 1,
      });
    }

    updateCartBadge();
    renderCartScreen();

    // Flash feedback
    const btn = document.querySelector('#screen-product .btn-primary');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Añadido al carrito';
      btn.style.background = '#1a7a3f';
      btn.style.boxShadow = '0 0 20px rgba(26,122,63,0.4)';
      setTimeout(() => {
        btn.textContent = orig;
        btn.style.background = '';
        btn.style.boxShadow = '';
      }, 1400);
    }

    // Also update product screen badge
    const badge = document.getElementById('cart-badge-product');
    if (badge) {
      const count = state.cart.reduce((s, i) => s + i.qty, 0);
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }
  }

  // ---- Cart ----
  function renderCartScreen() {
    const screen = document.getElementById('screen-cart');
    const total = state.cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
    const shipping = total >= 100 ? 0 : 8;

    if (state.cart.length === 0) {
      screen.querySelector('#cart-content').innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:80px 24px;text-align:center;">
          <div style="font-size:64px;margin-bottom:20px;">🛒</div>
          <h3 style="font-size:20px;font-weight:700;margin-bottom:8px;">Tu carrito está vacío</h3>
          <p style="color:#A0A0A0;font-size:14px;margin-bottom:28px;">Explora el catálogo y añade algo cool.</p>
          <button class="btn-primary" onclick="App.navigate('catalog','back')" style="padding:14px 32px;font-size:15px;font-weight:600;border:none;cursor:pointer;border-radius:8px;">
            Ver catálogo
          </button>
        </div>
      `;
      return;
    }

    const itemsHtml = state.cart.map(item => `
      <div style="display:flex;gap:12px;align-items:center;padding:14px 0;border-bottom:1px solid #1E1E1E;">
        <div style="width:64px;height:64px;background:${item.product.color};border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:28px;">
          ${item.product.emoji}
        </div>
        <div style="flex:1;min-width:0;">
          <p style="font-size:14px;font-weight:600;color:#fff;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.product.name}</p>
          <p style="font-size:12px;color:#A0A0A0;">${item.size !== 'ONE SIZE' ? 'Talla ' + item.size : item.size}</p>
        </div>
        <div style="display:flex;align-items:center;gap:10px;flex-shrink:0;">
          <button class="qty-btn" onclick="App.updateQty('${item.key}', -1)">−</button>
          <span style="font-size:14px;font-weight:600;min-width:16px;text-align:center;">${item.qty}</span>
          <button class="qty-btn" onclick="App.updateQty('${item.key}', 1)">+</button>
        </div>
        <span style="font-size:14px;font-weight:700;color:#7B2FFF;flex-shrink:0;margin-left:4px;">$${item.product.price * item.qty}</span>
      </div>
    `).join('');

    screen.querySelector('#cart-content').innerHTML = `
      <div style="padding:16px;">
        ${itemsHtml}

        <!-- Coupon -->
        <div style="margin-top:16px;display:flex;gap:8px;">
          <input class="input-field" placeholder="Código de cupón" id="coupon-input" style="flex:1;" />
          <button class="btn-secondary" onclick="App.applyCoupon()" style="padding:12px 16px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;border-radius:8px;background:transparent;border:1px solid #1E1E1E;color:#A0A0A0;">
            Aplicar
          </button>
        </div>

        <!-- Summary -->
        <div style="margin-top:20px;background:#111;border:1px solid #1E1E1E;border-radius:12px;padding:16px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="color:#A0A0A0;font-size:14px;">Subtotal</span>
            <span style="font-size:14px;font-weight:600;">$${total}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid #1E1E1E;">
            <span style="color:#A0A0A0;font-size:14px;">Envío</span>
            <span style="font-size:14px;font-weight:600;color:${shipping === 0 ? '#22c55e' : '#fff'};">${shipping === 0 ? 'GRATIS' : '$' + shipping}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:16px;font-weight:700;">Total</span>
            <span style="font-size:20px;font-weight:800;color:#7B2FFF;">$${total + shipping}</span>
          </div>
        </div>

        ${total < 100 ? `<p style="color:#A0A0A0;font-size:12px;text-align:center;margin-top:10px;">Añade $${100 - total} más para envío gratuito</p>` : ''}

        <button class="btn-primary" onclick="App.navigate('checkout','forward')" style="width:100%;padding:16px;font-size:16px;font-weight:700;border:none;cursor:pointer;margin-top:16px;border-radius:8px;">
          Proceder al pago — $${total + shipping}
        </button>
      </div>
    `;
  }

  function updateQty(key, delta) {
    const item = state.cart.find(i => i.key === key);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      state.cart = state.cart.filter(i => i.key !== key);
    }
    renderCartScreen();
    updateCartBadge();
  }

  function applyCoupon() {
    const input = document.getElementById('coupon-input');
    if (input && input.value.toUpperCase() === 'AUTO20') {
      input.value = '';
      input.placeholder = '✓ AUTO20 aplicado (-20%)';
      input.style.borderColor = '#22c55e';
      input.style.color = '#22c55e';
    } else if (input) {
      input.style.borderColor = '#ef4444';
      setTimeout(() => { input.style.borderColor = ''; }, 1200);
    }
  }

  // ---- Catalog ----
  function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    const filtered = state.activeFilter === 'all'
      ? products
      : products.filter(p => p.category === state.activeFilter);

    grid.innerHTML = filtered.map(product => `
      <div class="card" onclick="App.openProduct(${product.id})" style="cursor:pointer;overflow:hidden;transition:transform 0.2s,box-shadow 0.2s;"
           onmousedown="this.style.transform='scale(0.97)'" onmouseup="this.style.transform=''" ontouchstart="this.style.transform='scale(0.97)'" ontouchend="this.style.transform=''">
        <div style="height:180px;background:${product.color};display:flex;align-items:center;justify-content:center;font-size:64px;">
          ${product.emoji}
        </div>
        <div style="padding:14px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;">
            <h3 style="font-size:14px;font-weight:700;color:#fff;line-height:1.3;">${product.name}</h3>
            ${product.tag ? `<span style="font-size:10px;font-weight:700;color:#7B2FFF;white-space:nowrap;letter-spacing:0.06em;">${product.tag}</span>` : ''}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:16px;font-weight:800;color:#7B2FFF;">$${product.price}</span>
            <span style="font-size:11px;color:#4A4A4A;">${product.category}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  function setFilter(filter) {
    state.activeFilter = filter;
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.filter === filter);
    });
    renderCatalog();
  }

  // ---- Checkout ----
  function placeOrder() {
    const screen = document.getElementById('screen-checkout');
    state.orderPlaced = true;
    state.cart = [];
    updateCartBadge();

    document.getElementById('checkout-content').innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px;text-align:center;">
        <div class="success-ring" style="width:96px;height:96px;display:flex;align-items:center;justify-content:center;margin-bottom:28px;font-size:44px;">
          ✓
        </div>
        <h2 style="font-size:26px;font-weight:800;margin-bottom:12px;">¡Pedido confirmado!</h2>
        <p style="color:#A0A0A0;font-size:15px;line-height:1.6;margin-bottom:8px;">Tu merch está en camino.</p>
        <p style="color:#7B2FFF;font-size:13px;font-weight:600;margin-bottom:36px;">Recibirás un email de confirmación.</p>
        <div style="background:#111;border:1px solid #1E1E1E;border-radius:12px;padding:16px 24px;width:100%;margin-bottom:28px;">
          <p style="font-size:12px;color:#4A4A4A;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Número de pedido</p>
          <p style="font-size:18px;font-weight:700;color:#7B2FFF;">#ATM-${Math.floor(10000 + Math.random() * 90000)}</p>
        </div>
        <button class="btn-primary" onclick="App.navigate('home','back')" style="width:100%;padding:16px;font-size:16px;font-weight:700;border:none;cursor:pointer;border-radius:8px;">
          Volver al inicio
        </button>
      </div>
    `;
  }

  // ---- Init ----
  function init() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // Show home screen
    const homeScreen = document.getElementById('screen-home');
    if (homeScreen) {
      homeScreen.classList.add('active');
      homeScreen.style.transform = 'translateX(0)';
    }

    // Render catalog initially
    renderCatalog();
    renderCartScreen();

    updateHeader('home');
    updateBottomBar('home');
  }

  // ---- Public API ----
  return {
    init,
    navigate,
    goBack,
    openProduct,
    selectSize,
    addToCart,
    updateQty,
    applyCoupon,
    setFilter,
    renderCatalog,
    placeOrder,
    get state() { return state; },
  };
})();

document.addEventListener('DOMContentLoaded', App.init);
