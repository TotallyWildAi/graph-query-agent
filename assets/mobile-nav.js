/* =====================================================================
   mobile-nav.js  ·  Graph Query Agent
   Dependency-free mobile navigation chrome (top bar + slide drawer +
   bottom tab bar). Injected into every page that loads this script.
   Pairs with the "MOBILE / RESPONSIVE NAV + FIXES" section in
   assets/console-system.css — all visibility is driven there by media
   query, so on desktop this injected markup stays display:none.
   Idempotent: bails if the chrome already exists.
   ===================================================================== */
(function () {
  'use strict';

  /* Canonical navigation — single source of truth for the whole app. */
  var NAV = [
    { label: 'Ask',              href: 'Console - Ask.html',          icon: 'ph-terminal-window',         group: 'Workspace' },
    { label: 'Results',          href: 'Results - Lineage.html',      icon: 'ph-table',                   group: 'Workspace' },
    { label: 'Trace',            href: 'Trace - Audit.html',          icon: 'ph-tree-structure',          group: 'Workspace' },
    { label: 'History',          href: 'History.html',                icon: 'ph-clock-counter-clockwise', group: 'Workspace' },
    { label: 'Intent catalogue', href: 'Intent catalogue.html',       icon: 'ph-list-checks',             group: 'Reference' },
    { label: 'Tool registry',    href: 'Tool registry.html',          icon: 'ph-plugs',                   group: 'Reference' },
    { label: 'Graph schema',     href: 'Graph schema.html',           icon: 'ph-graph',                   group: 'Reference' },
    { label: 'Graph explorer',   href: 'Graph explorer - Sigma.html', icon: 'ph-share-network',           group: 'Reference' }
  ];

  /* Bottom tab bar shows the 4 workspace screens + a "More" trigger. */
  var BOTTOM = ['Ask', 'Results', 'Trace', 'History'];

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  /* Strip a trailing ".html" (live site serves clean, extension-less URLs). */
  function stripExt(s) {
    return s.replace(/\.html$/i, '');
  }

  /* Match a nav href against the current page basename. The Sigma explorer
     and the dependency-free explorer both map to the "Graph explorer" item. */
  function isActive(href, current) {
    var h = stripExt(href);
    if (h === current) return true;
    if (h === 'Graph explorer - Sigma' &&
        (current === 'Graph explorer - Sigma' || current === 'Graph explorer')) {
      return true;
    }
    return false;
  }

  function el(tag, cls, attrs) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) {
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
      }
    }
    return n;
  }

  function icon(name) {
    return el('i', 'ph ' + name);
  }

  function brand() {
    var a = el('a', 'oc-mtop-brand', { href: 'index.html' });
    var mark = el('span', 'oc-brandmark');
    mark.appendChild(icon('ph-graph'));
    var label = el('span');
    label.textContent = 'Graph Query Agent';
    a.appendChild(mark);
    a.appendChild(label);
    return a;
  }

  function build() {
    if (document.querySelector('.oc-mtop')) return; // idempotent

    var current = stripExt(decodeURIComponent((location.pathname.split('/').pop()) || ''));

    /* (a) Fixed top bar — hamburger + brand ------------------------------ */
    var top = el('header', 'oc-mtop');
    var burger = el('button', 'oc-mtop-burger', {
      type: 'button',
      'aria-label': 'Open navigation',
      'aria-expanded': 'false'
    });
    burger.appendChild(icon('ph-list'));
    top.appendChild(burger);
    top.appendChild(brand());

    /* (b) Slide-in drawer — full grouped nav ----------------------------- */
    var drawer = el('aside', 'oc-mdrawer', {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': 'Navigation',
      tabindex: '-1'
    });

    var dhead = el('div', 'oc-mdrawer-head');
    dhead.appendChild(brand());
    var close = el('button', 'oc-mdrawer-close', {
      type: 'button',
      'aria-label': 'Close navigation'
    });
    close.appendChild(icon('ph-x'));
    dhead.appendChild(close);
    drawer.appendChild(dhead);

    var lastGroup = null;
    NAV.forEach(function (item) {
      if (item.group !== lastGroup) {
        var grp = el('div', 'oc-navgrp-m');
        grp.textContent = item.group;
        drawer.appendChild(grp);
        lastGroup = item.group;
      }
      var link = el('a', 'oc-mnav' + (isActive(item.href, current) ? ' on' : ''), { href: item.href });
      link.appendChild(icon(item.icon));
      var span = el('span');
      span.textContent = item.label;
      link.appendChild(span);
      drawer.appendChild(link);
    });

    /* (c) Backdrop scrim ------------------------------------------------- */
    var scrim = el('div', 'oc-mscrim');

    /* (d) Bottom tab bar ------------------------------------------------- */
    var bottom = el('nav', 'oc-mbottom', { 'aria-label': 'Primary' });
    BOTTOM.forEach(function (label) {
      var item = NAV.filter(function (n) { return n.label === label; })[0];
      if (!item) return;
      var tab = el('a', 'oc-mtab' + (isActive(item.href, current) ? ' on' : ''), { href: item.href });
      tab.appendChild(icon(item.icon));
      var span = el('span');
      span.textContent = item.label;
      tab.appendChild(span);
      bottom.appendChild(tab);
    });
    var more = el('button', 'oc-mtab oc-mtab-more', { type: 'button', 'aria-label': 'More' });
    more.appendChild(icon('ph-dots-three-outline'));
    var moreLabel = el('span');
    moreLabel.textContent = 'More';
    more.appendChild(moreLabel);
    bottom.appendChild(more);

    document.body.appendChild(top);
    document.body.appendChild(drawer);
    document.body.appendChild(scrim);
    document.body.appendChild(bottom);

    /* Open / close behavior --------------------------------------------- */
    function open() {
      drawer.classList.add('open');
      scrim.classList.add('open');
      document.body.classList.add('oc-mdrawer-lock');
      burger.setAttribute('aria-expanded', 'true');
      drawer.focus();
    }
    function shut() {
      drawer.classList.remove('open');
      scrim.classList.remove('open');
      document.body.classList.remove('oc-mdrawer-lock');
      burger.setAttribute('aria-expanded', 'false');
      burger.focus();
    }

    burger.addEventListener('click', open);
    more.addEventListener('click', open);
    close.addEventListener('click', shut);
    scrim.addEventListener('click', shut);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && drawer.classList.contains('open')) {
        shut();
      }
    });
  }

  ready(build);
})();
