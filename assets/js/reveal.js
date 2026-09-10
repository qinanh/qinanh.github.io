/* 顶栏的真实高度写进 --tb。
   锚点跳转、sticky 的左栏都按 --tb 让位，可顶栏在手机上多一行目录、
   在桌面上少一行，硬编码一个数总差几像素（实测 390 宽是 82、780 宽是 91）。
   所以直接量。只在加载和 resize 时写一次，不跟着滚动写。 */
(function () {
  var bar = document.querySelector('.topbar');
  if (!bar) return;
  var root = document.documentElement;
  var last = 0;
  function sync() {
    var h = Math.round(bar.getBoundingClientRect().height);
    if (!h || h === last) return;
    last = h;
    root.style.setProperty('--tb', h + 'px');
  }
  sync();
  window.addEventListener('resize', sync);
  window.addEventListener('orientationchange', sync);
  if (window.ResizeObserver) new ResizeObserver(sync).observe(bar);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(sync);
})();

/* 滚动浮现：给 .reveal 元素在进入视口时挂上 .is-in。
   只做单向揭示，露出后即 unobserve，不来回闪。 */
(function () {
  var nodes = document.querySelectorAll('.reveal');
  if (!nodes.length) return;

  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < nodes.length; i++) nodes[i].classList.add('is-in');
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      entries[i].target.classList.add('is-in');
      io.unobserve(entries[i].target);
    }
    /* 底边留 40px 余量，不用负 margin：待浮现的元素本身被下移了
       26px，负 margin 会把贴着底边的条目挡在交叉区外，永远不显示。 */
  }, { rootMargin: '0px 0px 40px 0px', threshold: 0 });

  for (var j = 0; j < nodes.length; j++) io.observe(nodes[j]);
})();

/* 封面 → 内容：把滚动进度写成 CSS 变量，样式那边只管画。
     --e  封面让位程度 0→1（越滚越淡、越往上缩），写在 .opening 上
     --sp 全页阅读进度 0→1（顶栏底边那条金线），写在 .topbar 上
   变量挂在用到它的元素上，不挂 :root —— 挂在根上会让整棵树的
   自定义属性全部失效重算，滚动时很费。 */
(function () {
  var hero = document.querySelector('.opening');
  var bar = document.querySelector('.topbar');
  var root = document.documentElement;
  var ticking = false;

  function smooth(edge0, edge1, x) {          /* 两头缓，中间快 */
    var t = (x - edge0) / (edge1 - edge0);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    return t * t * (3 - 2 * t);
  }

  function frame() {
    ticking = false;
    var y = window.pageYOffset || root.scrollTop || 0;
    var max = root.scrollHeight - root.clientHeight;

    if (hero) {
      var p = y / Math.max(1, hero.offsetHeight);
      hero.style.setProperty('--e', smooth(0.30, 0.88, p).toFixed(4));
      if (bar) bar.classList.toggle('past-hero', p > 0.18);
    } else if (bar) {
      bar.classList.add('past-hero');
    }

    if (bar) {
      bar.style.setProperty('--sp', max > 0 ? Math.min(1, y / max).toFixed(4) : '0');
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();

/* 目录高亮：滚到哪一屏，左边菜单就把哪一项点亮。
   用 getBoundingClientRect 算绝对位置（offsetTop 是相对 main 的）。 */
(function () {
  var links = document.querySelectorAll('.menu a[data-sec]');
  if (!links.length) return;

  var pairs = [];
  for (var i = 0; i < links.length; i++) {
    var el = document.getElementById(links[i].getAttribute('data-sec'));
    if (el) pairs.push([el, links[i]]);
  }
  if (!pairs.length) return;

  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.pageYOffset || 0;
    var probe = y + window.innerHeight * 0.34;
    var current = null;
    for (var i = 0; i < pairs.length; i++) {
      var top = pairs[i][0].getBoundingClientRect().top + y;
      if (top <= probe) current = pairs[i][1];
    }
    for (var j = 0; j < pairs.length; j++) {
      pairs[j][1].classList.toggle('on', pairs[j][1] === current);
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(frame);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  frame();
})();

/* 「what I work on」的三张配图卡：点一张，下面展开那一张的介绍。
   没 JS 的时候 .posts 不加 .picked，三篇会全部摊开显示，不会白屏。 */
(function () {
  var posts = document.querySelector('.posts');
  var tabs  = document.querySelectorAll('.rcard[data-post]');
  if (!posts || tabs.length < 2) return;

  var current = null;                  /* 当前展开的那张卡，resize 时要重算尖角 */

  /* 把卡片中线的 x 换算成 .posts 坐标系里的位置，写进 --stem。
     面板顶上那枚尖角就停在这，看着像卡片自己往下抽出来一截。
     卡片本身带 ±0.6° 旋转，getBoundingClientRect 出来的中心仍然准。 */
  function aim(card) {
    var pr = posts.getBoundingClientRect();
    var cr = card.getBoundingClientRect();
    if (!pr.width) return;
    posts.style.setProperty('--stem', (cr.left - pr.left + cr.width / 2).toFixed(1) + 'px');
  }

  function pick(id) {
    var active = null;
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-post') === id;
      tabs[i].setAttribute('aria-selected', on ? 'true' : 'false');
      tabs[i].tabIndex = on ? 0 : -1;
      if (on) active = tabs[i];
    }
    var arts = posts.querySelectorAll('.post');
    for (var j = 0; j < arts.length; j++) {
      arts[j].classList.toggle('on', arts[j].id === id);
    }
    if (active) { current = active; aim(active); }
  }

  posts.classList.add('picked');
  /* 首屏那次定位是瞬间完成的，别让尖角从 50% 滑过去，所以先藏一帧 */
  requestAnimationFrame(function () {
    requestAnimationFrame(function () { posts.classList.add('revealed'); });
  });
  window.addEventListener('resize', function () { if (current) aim(current); });

  for (var k = 0; k < tabs.length; k++) {
    tabs[k].addEventListener('click', function () { pick(this.getAttribute('data-post')); });
    tabs[k].addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      for (var m = 0; m < tabs.length; m++) {
        if (tabs[m] === this) {
          var n = tabs[(m + d + tabs.length) % tabs.length];
          n.focus(); pick(n.getAttribute('data-post'));
          return;
        }
      }
    });
  }

  /* 深链接：URL 带 #<post-id> 就直接展开那一张。
     ⚠️ 这里必须比对 data-post，不能用 getElementById 判断存不存在 ——
     @ 的 section id 就叫 about / research / publications / code，
     而 location.hash 正好是 #research 这种。之前用 getElementById 判，
     pick('research') 谁都不匹配、把三篇全关掉，面板整块空白。
     也就是说任何带锚点的 URL（刷新、书签、别人转的链接）都会中招。 */
  var hash = (location.hash || '').replace('#', '');
  var wanted = null;
  for (var h = 0; h < tabs.length; h++) {
    if (tabs[h].getAttribute('data-post') === hash) { wanted = hash; break; }
  }
  pick(wanted || tabs[0].getAttribute('data-post'));
})();
