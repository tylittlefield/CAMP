(function () {
  if (window.CAMP_CHAT) return;

  /* ── CSS ── */
  var styleEl = document.createElement('style');
  styleEl.textContent = [
    '#camp-chat-panel{position:fixed;top:64px;right:20px;z-index:9997;width:320px;max-height:calc(100vh - 90px);background:#F0EDD9;border-radius:10px;box-shadow:0 8px 40px rgba(0,0,0,0.22);display:flex;flex-direction:column;overflow:hidden;transform:translateY(-12px) scale(0.97);opacity:0;pointer-events:none;transition:transform 0.22s cubic-bezier(.4,0,.2,1),opacity 0.22s;}',
    '#camp-chat-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all;}',
    '#camp-chat-head{background:#3A3C1C;color:#F0EDD9;padding:13px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}',
    '#camp-chat-avatar{width:30px;height:30px;background:#A9B36C;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0;}',
    '#camp-chat-meta{flex:1;}',
    '#camp-chat-name{font-family:"Archivo",sans-serif;font-size:0.75rem;font-weight:700;letter-spacing:0.04em;}',
    '#camp-chat-status{font-size:0.82rem;opacity:0.6;font-style:italic;}',
    '#camp-chat-x{background:none;border:none;color:#F0EDD9;cursor:pointer;font-size:1.1rem;line-height:1;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;transition:background 0.15s;flex-shrink:0;}',
    '#camp-chat-x:hover{background:rgba(240,237,217,0.15);}',
    '#camp-chat-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}',
    '.cc-msg{max-width:84%;line-height:1.5;font-family:"Cormorant Garamond",serif;font-size:1.05rem;padding:9px 13px;border-radius:10px;animation:ccIn 0.16s ease;}',
    '@keyframes ccIn{from{opacity:0;transform:translateY(5px);}to{opacity:1;transform:none;}}',
    '.cc-bot{background:#fff;color:#2A2A1E;align-self:flex-start;border-bottom-left-radius:3px;}',
    '.cc-bot a{color:#3A3C1C;font-weight:600;text-decoration:underline;text-underline-offset:2px;}',
    '.cc-user{background:#3A3C1C;color:#F0EDD9;align-self:flex-end;border-bottom-right-radius:3px;}',
    '.cc-typing{display:flex;gap:4px;align-items:center;padding:11px 14px;background:#fff;border-radius:10px;border-bottom-left-radius:3px;align-self:flex-start;}',
    '.cc-typing span{width:5px;height:5px;background:#A9B36C;border-radius:50%;animation:ccDot 1.2s infinite;}',
    '.cc-typing span:nth-child(2){animation-delay:0.18s;}',
    '.cc-typing span:nth-child(3){animation-delay:0.36s;}',
    '@keyframes ccDot{0%,80%,100%{opacity:0.3;transform:scale(0.85);}40%{opacity:1;transform:scale(1.15);}}',
    '#camp-chat-footer{display:flex;border-top:1.5px solid #D8D2BF;flex-shrink:0;}',
    '#camp-chat-input{flex:1;padding:13px 14px;font-family:"Cormorant Garamond",serif;font-size:1.1rem;background:transparent;border:none;outline:none;color:#2A2A1E;}',
    '#camp-chat-input::placeholder{color:#b0a898;}',
    '#camp-chat-send{padding:0 16px;background:#A9B36C;border:none;cursor:pointer;color:#2A2A1E;display:flex;align-items:center;justify-content:center;transition:background 0.15s;flex-shrink:0;}',
    '#camp-chat-send:hover{background:#C2CC8E;}',
    '#camp-chat-send svg{width:16px;height:16px;}',
    '@media(max-width:480px){#camp-chat-panel{right:0;left:0;top:auto;bottom:0;width:100%;border-radius:16px 16px 0 0;max-height:72vh;}}'
  ].join('');
  document.head.appendChild(styleEl);

  /* ── Panel HTML ── */
  var panel = document.createElement('div');
  panel.id = 'camp-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'CAMP Assistant');
  panel.innerHTML = [
    '<div id="camp-chat-head">',
    '  <div id="camp-chat-avatar">⛺</div>',
    '  <div id="camp-chat-meta">',
    '    <div id="camp-chat-name">CAMP Assistant</div>',
    '    <div id="camp-chat-status">Ask us anything</div>',
    '  </div>',
    '  <button id="camp-chat-x" aria-label="Close chat">&#x2715;</button>',
    '</div>',
    '<div id="camp-chat-msgs" aria-live="polite"></div>',
    '<div id="camp-chat-footer">',
    '  <input id="camp-chat-input" type="text" placeholder="Ask about gear, sizing, shipping…" autocomplete="off">',
    '  <button id="camp-chat-send" aria-label="Send">',
    '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    '  </button>',
    '</div>'
  ].join('');
  document.body.appendChild(panel);

  /* ── Refs ── */
  var msgs = document.getElementById('camp-chat-msgs');
  var input = document.getElementById('camp-chat-input');

  /* ── Responses ── */
  var RULES = [
    { re: /\b(hi|hey|hello|howdy|yo|sup)\b/, reply: "Hey! Welcome to CAMP. I can help with collections, sizing, shipping, returns, and more. What are you looking for?" },
    { re: /what.*(can you|do you do|help with)|^help$/, reply: "I can answer questions about our collections, products, sizing, shipping, returns, your account, and more. Just ask!" },
    { re: /peak|mountain|alpine|summit|ridge/, reply: 'The <a href="peaks-collection.html">Peaks Collection</a> is built for high-altitude terrain — technical shells, insulation, and layering for serious mountain time.' },
    { re: /explorer|trail|hiking|trekking|backpack/, reply: 'The <a href="explorer-collection.html">Explorer Collection</a> covers versatile trail-ready gear — built for multi-day adventures and backcountry routes.' },
    { re: /wildlife|animal|nature|forest|woodland/, reply: 'The <a href="wildlife-collection.html">Wildlife Collection</a> blends technical performance with nature-inspired design — for those who move quietly through wild spaces.' },
    { re: /base.?camp|basecamp|campfire|camp gear|camp essential/, reply: 'The <a href="base-camp-collection.html">Base Camp Collection</a> is for comfort at camp — fleeces, vests, and essentials for evenings by the fire.' },
    { re: /sea|ocean|coastal|water|surf|beach|maritime/, reply: 'The <a href="sea-collection.html">Sea Collection</a> is built for coastal conditions — wind-resistant, salt-proof, and ready for life on the water.' },
    { re: /collection|shop|browse|what.*(sell|carry|have|offer)|all gear/, reply: 'We have five collections: <a href="peaks-collection.html">Peaks</a>, <a href="explorer-collection.html">Explorer</a>, <a href="wildlife-collection.html">Wildlife</a>, <a href="base-camp-collection.html">Base Camp</a>, and <a href="sea-collection.html">Sea</a>. Or browse <a href="shop.html">everything</a>.' },
    { re: /new.?arriv|latest|just.?in|new.?stuff|what.?new/, reply: 'New pieces land throughout the season. Check <a href="new-arrivals.html">New Arrivals</a> to see what\'s just in.' },
    { re: /size|sizing|fit|measurement|how.*(measure|big)|chart/, reply: 'We have a full <a href="size-guide.html">Size Guide</a> with inch/cm toggle for tops, bottoms, and hats. Between sizes? Size up for a relaxed fit.' },
    { re: /ship|deliver|how long|when.*(arriv|get|receive)|days/, reply: 'Standard shipping is 5–7 business days. Expedited options at checkout. Orders over $150 ship free. Full details on our <a href="shipping.html">Shipping & Returns</a> page.' },
    { re: /return|refund|exchange|send.?back|30.?day/, reply: 'Returns accepted within 30 days on unworn, unwashed items with original tags. Start one from your <a href="account.html">Account</a> page or see <a href="shipping.html">Shipping & Returns</a>.' },
    { re: /price|cost|how much|expensive|budget|afford|worth/, reply: 'Our gear ranges from ~$45 for accessories to $250+ for technical outerwear. Every piece is priced for durability — built to outlast the conditions.' },
    { re: /order|track|where.*(order|package)|status|confirm/, reply: 'Your order history and status live on your <a href="account.html">Account</a> page. Need more help? <a href="contact.html">Contact us</a> with your order number.' },
    { re: /cart|checkout|buy|purchase/, reply: 'Browse any collection, pick your size and color, and add to your <a href="cart.html">cart</a>. Checkout takes about 2 minutes.' },
    { re: /wishlist|save|favorite|favourite|saved/, reply: 'Save items to your <a href="wishlist.html">Wishlist</a> from any product page. Sign in to access it across devices.' },
    { re: /sign.?in|log.?in|login|sign.?up|creat.*(account)|register|account/, reply: '<a href="signin.html">Sign in</a> or <a href="create-account.html">create an account</a> to track orders, save addresses, and manage your wishlist.' },
    { re: /password|forgot|reset/, reply: 'Reset your password on the <a href="forgot-password.html">Forgot Password</a> page.' },
    { re: /contact|email|reach|talk.*(someone|human|person|real)/, reply: 'Reach us through our <a href="contact.html">Contact</a> page. We reply within 1–2 business days.' },
    { re: /about|brand|story|who.*(you|camp)|what.*(is camp)/, reply: 'CAMP is an outdoor clothing brand built for people who take their adventures seriously. <a href="about.html">Learn more about us</a>.' },
    { re: /look.?book|editorial|inspiration|look/, reply: 'Our <a href="lookbook.html">Lookbook</a> has field-tested style and editorial shoots from real terrain.' },
    { re: /terms|tos|legal/, reply: 'Read our <a href="tos.html">Terms of Service</a> here.' },
    { re: /privacy|data|personal.*(info|data)/, reply: 'Our <a href="privacy.html">Privacy Policy</a> covers how we handle your information.' },
    { re: /instagram|social|follow/, reply: 'Follow us on <a href="https://www.instagram.com/_camp.life" target="_blank" rel="noopener">Instagram @_camp.life</a>.' },
    { re: /thank|thanks|cheers|great|awesome|perfect|helpful/, reply: "Happy to help! Anything else?" },
    { re: /bye|goodbye|see ya|later|done|no thanks/, reply: "Take care and stay wild. Come back anytime! 🏔" }
  ];

  var FALLBACKS = [
    'Not sure about that one — try our <a href="help.html">Help</a> page or <a href="contact.html">contact us</a> directly.',
    'Good question. I\'d point you to our <a href="help.html">Help</a> page, or feel free to <a href="contact.html">reach out</a> and we\'ll sort it out.',
    'I don\'t have that answer handy — the team at our <a href="contact.html">Contact</a> page can help you out.'
  ];
  var fbIdx = 0;

  /* ── Chat logic ── */
  var opened = false;

  function addBot(html) {
    var el = document.createElement('div');
    el.className = 'cc-msg cc-bot';
    el.innerHTML = html;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUser(text) {
    var el = document.createElement('div');
    el.className = 'cc-msg cc-user';
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function typing() {
    var el = document.createElement('div');
    el.className = 'cc-typing';
    el.id = 'cc-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
    return el;
  }

  function clearTyping() {
    var el = document.getElementById('cc-typing');
    if (el) el.remove();
  }

  function getReply(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < RULES.length; i++) {
      if (RULES[i].re.test(lower)) return RULES[i].reply;
    }
    return FALLBACKS[(fbIdx++) % FALLBACKS.length];
  }

  function send() {
    var text = input.value.trim();
    if (!text) return;
    input.value = '';
    addUser(text);
    typing();
    setTimeout(function () {
      clearTyping();
      addBot(getReply(text));
    }, 650 + Math.random() * 450);
  }

  /* ── Open / close ── */
  function open() {
    panel.classList.add('open');
    input.focus();
    if (!opened) {
      opened = true;
      setTimeout(function () {
        addBot("Hi! I'm the CAMP assistant ⛺ Ask me about gear, collections, sizing, shipping, or anything else.");
      }, 200);
    }
  }

  function close() { panel.classList.remove('open'); }
  function toggle() { panel.classList.contains('open') ? close() : open(); }

  /* ── Events ── */
  document.getElementById('camp-chat-x').addEventListener('click', close);
  document.getElementById('camp-chat-send').addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  /* ── Global API ── */
  window.CAMP_CHAT = { open: open, close: close, toggle: toggle };
})();
