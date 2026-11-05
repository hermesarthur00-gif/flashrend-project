/* @ds-bundle: {"format":4,"namespace":"FlashInv","components":[{"name":"Logo"},{"name":"Icon"},{"name":"Button"},{"name":"IconButton"},{"name":"Badge"},{"name":"StatusBadge"},{"name":"PriceChange"},{"name":"CryptoIcon"},{"name":"Input"},{"name":"AmountInput"},{"name":"CryptoSelect"},{"name":"Switch"},{"name":"OtpInput"},{"name":"Tabs"},{"name":"BalanceCard"},{"name":"AssetRow"},{"name":"TransactionList"},{"name":"Sparkline"},{"name":"PriceChart"},{"name":"AllocationDonut"},{"name":"Alert"},{"name":"Toast"},{"name":"Modal"},{"name":"Stepper"},{"name":"TopBar"},{"name":"BottomNav"},{"name":"Skeleton"},{"name":"HeroBlock"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useMemo = React.useMemo, useId = React.useId;

  var ICONS = {"arrow-up-right":["M17 7l-10 10","M8 7l9 0l0 9"],"arrow-down-left":["M17 7l-10 10","M16 17l-9 0l0 -9"],"arrow-up":["M12 5l0 14","M18 11l-6 -6","M6 11l6 -6"],"arrow-down":["M12 5l0 14","M18 13l-6 6","M6 13l6 6"],"chevron-down":["M6 9l6 6l6 -6"],"chevron-right":["M9 6l6 6l-6 6"],"chevron-left":["M15 6l-6 6l6 6"],"x":["M18 6l-12 12","M6 6l12 12"],"check":["M5 12l5 5l10 -10"],"info-circle":["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0","M12 9h.01","M11 12h1v4h1"],"alert-triangle":["M12 9v4","M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z","M12 16h.01"],"alert-circle":["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0","M12 8v4","M12 16h.01"],"circle-check":["M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0","M9 12l2 2l4 -4"],"home":["M5 12l-2 0l9 -9l9 9l-2 0","M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7","M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"],"chart-line":["M4 19l16 0","M4 15l4 -6l4 2l4 -5l4 4"],"wallet":["M17 8v-3a1 1 0 0 0 -1 -1h-10a2 2 0 0 0 0 4h12a1 1 0 0 1 1 1v3m0 4v3a1 1 0 0 1 -1 1h-12a2 2 0 0 1 -2 -2v-12","M20 12v4h-4a2 2 0 0 1 0 -4h4"],"user":["M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0","M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2"],"plus":["M12 5l0 14","M5 12l14 0"],"minus":["M5 12l14 0"],"search":["M10 10m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0","M21 21l-6 -6"],"eye":["M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0","M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6"],"eye-off":["M10.585 10.587a2 2 0 0 0 2.829 2.828","M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87","M3 3l18 18"],"bell":["M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6","M9 17v1a3 3 0 0 0 6 0v-1"],"arrows-exchange":["M7 10h14l-4 -4","M17 14h-14l4 4"],"building-bank":["M3 21l18 0","M3 10l18 0","M5 6l7 -3l7 3","M4 10l0 11","M20 10l0 11","M8 14l0 3","M12 14l0 3","M16 14l0 3"],"clock":["M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0","M12 7v5l3 3"],"copy":["M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z","M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1"],"settings":["M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z","M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"],"logout":["M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2","M9 12h12l-3 -3","M18 15l3 -3"],"arrow-right":["M5 12l14 0","M13 18l6 -6","M13 6l6 6"],"shield-check":["M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 -3a12 12 0 0 0 8.5 3a12 12 0 0 1 -.09 7.06","M15 19l2 2l4 -4"],"id":["M3 4m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v10a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z","M9 10m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0","M15 8l2 0","M15 12l2 0","M7 16l10 0"],"file-upload":["M14 3v4a1 1 0 0 0 1 1h4","M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z","M12 11v6","M9.5 13.5l2.5 -2.5l2.5 2.5"],"camera":["M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2","M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"],"refresh":["M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4","M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"]};
  var LOGO = {"squircle":"M100.00 50.00 L99.99 58.09 L99.97 61.44 L99.92 64.01 L99.86 66.17 L99.79 68.06 L99.69 69.78 L99.58 71.34 L99.45 72.80 L99.30 74.16 L99.14 75.44 L98.96 76.65 L98.76 77.79 L98.54 78.89 L98.31 79.93 L98.06 80.93 L97.79 81.89 L97.50 82.81 L97.20 83.69 L96.87 84.54 L96.53 85.36 L96.17 86.14 L95.79 86.90 L95.39 87.63 L94.97 88.33 L94.54 89.01 L94.08 89.66 L93.60 90.29 L93.10 90.90 L92.58 91.48 L92.04 92.04 L91.48 92.58 L90.90 93.10 L90.29 93.60 L89.66 94.08 L89.01 94.54 L88.33 94.97 L87.63 95.39 L86.90 95.79 L86.14 96.17 L85.36 96.53 L84.54 96.87 L83.69 97.20 L82.81 97.50 L81.89 97.79 L80.93 98.06 L79.93 98.31 L78.89 98.54 L77.79 98.76 L76.65 98.96 L75.44 99.14 L74.16 99.30 L72.80 99.45 L71.34 99.58 L69.78 99.69 L68.06 99.79 L66.17 99.86 L64.01 99.92 L61.44 99.97 L58.09 99.99 L50.00 100.00 L41.91 99.99 L38.56 99.97 L35.99 99.92 L33.83 99.86 L31.94 99.79 L30.22 99.69 L28.66 99.58 L27.20 99.45 L25.84 99.30 L24.56 99.14 L23.35 98.96 L22.21 98.76 L21.11 98.54 L20.07 98.31 L19.07 98.06 L18.11 97.79 L17.19 97.50 L16.31 97.20 L15.46 96.87 L14.64 96.53 L13.86 96.17 L13.10 95.79 L12.37 95.39 L11.67 94.97 L10.99 94.54 L10.34 94.08 L9.71 93.60 L9.10 93.10 L8.52 92.58 L7.96 92.04 L7.42 91.48 L6.90 90.90 L6.40 90.29 L5.92 89.66 L5.46 89.01 L5.03 88.33 L4.61 87.63 L4.21 86.90 L3.83 86.14 L3.47 85.36 L3.13 84.54 L2.80 83.69 L2.50 82.81 L2.21 81.89 L1.94 80.93 L1.69 79.93 L1.46 78.89 L1.24 77.79 L1.04 76.65 L0.86 75.44 L0.70 74.16 L0.55 72.80 L0.42 71.34 L0.31 69.78 L0.21 68.06 L0.14 66.17 L0.08 64.01 L0.03 61.44 L0.01 58.09 L0.00 50.00 L0.01 41.91 L0.03 38.56 L0.08 35.99 L0.14 33.83 L0.21 31.94 L0.31 30.22 L0.42 28.66 L0.55 27.20 L0.70 25.84 L0.86 24.56 L1.04 23.35 L1.24 22.21 L1.46 21.11 L1.69 20.07 L1.94 19.07 L2.21 18.11 L2.50 17.19 L2.80 16.31 L3.13 15.46 L3.47 14.64 L3.83 13.86 L4.21 13.10 L4.61 12.37 L5.03 11.67 L5.46 10.99 L5.92 10.34 L6.40 9.71 L6.90 9.10 L7.42 8.52 L7.96 7.96 L8.52 7.42 L9.10 6.90 L9.71 6.40 L10.34 5.92 L10.99 5.46 L11.67 5.03 L12.37 4.61 L13.10 4.21 L13.86 3.83 L14.64 3.47 L15.46 3.13 L16.31 2.80 L17.19 2.50 L18.11 2.21 L19.07 1.94 L20.07 1.69 L21.11 1.46 L22.21 1.24 L23.35 1.04 L24.56 0.86 L25.84 0.70 L27.20 0.55 L28.66 0.42 L30.22 0.31 L31.94 0.21 L33.83 0.14 L35.99 0.08 L38.56 0.03 L41.91 0.01 L50.00 0.00 L58.09 0.01 L61.44 0.03 L64.01 0.08 L66.17 0.14 L68.06 0.21 L69.78 0.31 L71.34 0.42 L72.80 0.55 L74.16 0.70 L75.44 0.86 L76.65 1.04 L77.79 1.24 L78.89 1.46 L79.93 1.69 L80.93 1.94 L81.89 2.21 L82.81 2.50 L83.69 2.80 L84.54 3.13 L85.36 3.47 L86.14 3.83 L86.90 4.21 L87.63 4.61 L88.33 5.03 L89.01 5.46 L89.66 5.92 L90.29 6.40 L90.90 6.90 L91.48 7.42 L92.04 7.96 L92.58 8.52 L93.10 9.10 L93.60 9.71 L94.08 10.34 L94.54 10.99 L94.97 11.67 L95.39 12.37 L95.79 13.10 L96.17 13.86 L96.53 14.64 L96.87 15.46 L97.20 16.31 L97.50 17.19 L97.79 18.11 L98.06 19.07 L98.31 20.07 L98.54 21.11 L98.76 22.21 L98.96 23.35 L99.14 24.56 L99.30 25.84 L99.45 27.20 L99.58 28.66 L99.69 30.22 L99.79 31.94 L99.86 33.83 L99.92 35.99 L99.97 38.56 L99.99 41.91 Z","bolt":"M50.00 17.20 L71.32 41.80 L55.74 41.80 L53.21 53.28 L68.04 53.28 L44.42 82.80 L50.92 53.28 L35.08 53.28 L44.26 41.80 L28.68 41.80 Z","wordmark":"M11.136000000000001 46.08V27.839999999999996H27.072V22.08H11.136000000000001V11.519999999999996H28.736V5.503999999999998H4.224V46.08ZM32.784000000000006 1.024000000000001V46.08H39.312000000000005V1.024000000000001ZM80.608 46.08V40.192H78.94400000000002C77.60000000000001 40.192 76.96000000000001 39.552 76.96000000000001 38.272V15.232H70.49600000000001V19.136C67.808 16.063999999999997 63.52000000000001 14.591999999999999 59.36000000000001 14.591999999999999C51.040000000000006 14.591999999999999 44.44800000000001 19.967999999999996 44.44800000000001 30.72C44.44800000000001 40.512 50.144000000000005 46.656 59.55200000000001 46.72C64.096 46.72 68.38400000000001 45.12 70.75200000000001 41.92C71.456 44.736 73.504 46.08 77.024 46.08ZM61.08800000000001 40.704C55.584 40.704 51.104000000000006 37.952 51.104000000000006 30.656C51.104000000000006 23.296 55.584 20.607999999999997 61.08800000000001 20.607999999999997C67.552 20.607999999999997 70.432 24.895999999999997 70.432 30.784C70.432 35.519999999999996 67.808 40.704 61.08800000000001 40.704ZM82.032 35.647999999999996C82.032 44.8 90.672 46.72 97.136 46.72C104.75200000000001 46.72 110.44800000000001 43.263999999999996 110.44800000000001 37.12C110.44800000000001 30.464 102.256 28.479999999999997 97.072 27.2C92.592 26.112 90.352 25.471999999999998 90.352 23.36C90.352 21.311999999999998 93.36 20.223999999999997 96.112 20.223999999999997C99.824 20.223999999999997 103.21600000000001 21.567999999999998 103.408 25.343999999999998H109.808C109.488 17.023999999999997 102.32000000000001 14.591999999999999 96.048 14.591999999999999C89.584 14.591999999999999 83.568 17.279999999999998 83.568 23.488C83.568 30.336 90.096 31.552 95.536 32.831999999999994C99.696 33.855999999999995 103.408 34.879999999999995 103.408 37.312C103.47200000000001 39.616 101.168 41.152 97.136 41.152C93.488 41.152 88.688 40.64 88.432 35.647999999999996ZM121.152 46.08V29.439999999999998C121.152 23.679999999999996 125.44000000000001 20.479999999999997 130.56 20.479999999999997C135.936 20.479999999999997 138.24 24.255999999999997 138.24 29.439999999999998V46.08H144.768V29.375999999999998C144.768 21.503999999999998 141.12 14.527999999999999 132.032 14.527999999999999C127.87200000000001 14.527999999999999 123.90400000000001 15.871999999999996 121.152 19.455999999999996V0.8960000000000008H114.62400000000001V46.08ZM157.968 46.08V5.567999999999998H151.05599999999998V46.08ZM171.488 46.08V29.439999999999998C171.488 23.679999999999996 175.77599999999998 20.479999999999997 180.832 20.479999999999997C186.272 20.479999999999997 188.576 24.255999999999997 188.576 29.439999999999998V46.08H195.10399999999998V29.375999999999998C195.10399999999998 21.503999999999998 191.456 14.527999999999999 182.304 14.527999999999999C178.144 14.527999999999999 174.23999999999998 15.871999999999996 171.488 19.455999999999996V15.232H164.95999999999998V46.08ZM208.944 46.08H216.87999999999997L228.59199999999998 15.232H222.06399999999996L212.91199999999998 39.168L203.76 15.232H197.16799999999998Z","wmw":228.59,"wmh":48.08,"boltbare":"M50.00 9.82 L76.12 39.95 L57.03 39.95 L53.94 54.02 L72.10 54.02 L43.17 90.18 L51.13 54.02 L31.72 54.02 L42.97 39.95 L23.88 39.95 Z"};

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(' ');
  }

  /* ---------- formatting ---------- */
  var usdFmt = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function formatUSD(v) { return usdFmt.format(v || 0); }
  function formatPct(v, digits) {
    var d = digits == null ? 2 : digits;
    var abs = Math.abs(v).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
    return (v > 0 ? '+' : v < 0 ? '−' : '') + abs + ' %';
  }
  function formatCrypto(v, sym) {
    return v.toLocaleString('fr-FR', { maximumFractionDigits: 8 }) + ' ' + sym;
  }

  /* ---------- Logo ---------- */
  function Logo(props) {
    var variant = props.variant || 'horizontal';
    var tone = props.tone || 'auto'; // auto: follows the theme; 'light' = for light grounds; 'dark' = for dark grounds
    var size = props.size || 32;
    var toneCls = 'fi-logo--' + tone;
    var box = 'fi-logo__box', bolt = 'fi-logo__bolt', txt = 'fi-logo__text';
    var symbol = [h('path', { key: 's', d: LOGO.squircle, className: box }), h('path', { key: 'b', d: LOGO.bolt, className: bolt })];
    if (variant === 'symbol') {
      return h('svg', { className: cx('fi-logo', toneCls, props.className), viewBox: '0 0 100 100', width: size, height: size, role: 'img', 'aria-label': 'FlashInv' }, symbol);
    }
    // symbol 100 units tall, wordmark at 64 units, cap height centred on the symbol
    var totalW = 100 + 24 + LOGO.wmw;
    return h('svg', { className: cx('fi-logo', toneCls, props.className), viewBox: '0 0 ' + totalW + ' 100', height: size, width: size * totalW / 100, role: 'img', 'aria-label': 'FlashInv' },
      symbol,
      h('g', { transform: 'translate(124 ' + (50 + 0.633 * 64 / 2 - 64 * 0.72) + ')' }, h('path', { d: LOGO.wordmark, className: txt }))
    );
  }

  /* ---------- Icon (Tabler outline) ---------- */
  function Icon(props) {
    var paths = ICONS[props.name] || [];
    var size = props.size || 20;
    return h('svg', {
      className: cx('fi-icon', props.className), width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
      stroke: 'currentColor', strokeWidth: props.stroke || 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
      'aria-hidden': props.label ? undefined : 'true', role: props.label ? 'img' : undefined, 'aria-label': props.label
    }, paths.map(function (d, i) { return h('path', { key: i, d: d }); }));
  }

  /* ---------- Button ---------- */
  function Spinner() { return h('span', { className: 'fi-spinner', 'aria-hidden': 'true' }); }
  function Button(props) {
    var variant = props.variant || 'primary', size = props.size || 'md';
    var rest = Object.assign({}, props);
    ['variant', 'size', 'block', 'loading', 'iconLeft', 'iconRight', 'className', 'children'].forEach(function (k) { delete rest[k]; });
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('fi-btn', 'fi-btn--' + variant, 'fi-btn--' + size, props.block && 'fi-btn--block', props.loading && 'is-loading', props.className),
      disabled: props.disabled || props.loading, 'aria-busy': props.loading ? 'true' : undefined
    }),
      props.loading ? h(Spinner) : props.iconLeft ? h(Icon, { name: props.iconLeft, size: size === 'sm' ? 16 : 20 }) : null,
      h('span', null, props.children),
      props.iconRight && !props.loading ? h(Icon, { name: props.iconRight, size: size === 'sm' ? 16 : 20 }) : null
    );
  }
  function IconButton(props) {
    var rest = Object.assign({}, props);
    ['icon', 'label', 'variant', 'size', 'className', 'badge'].forEach(function (k) { delete rest[k]; });
    return h('button', Object.assign({ type: 'button' }, rest, { className: cx('fi-iconbtn', 'fi-iconbtn--' + (props.variant || 'ghost'), props.size === 'sm' && 'fi-iconbtn--sm', props.className), 'aria-label': props.label, title: props.label }),
      h(Icon, { name: props.icon, size: props.size === 'sm' ? 18 : 22 }),
      props.badge ? h('span', { className: 'fi-iconbtn__dot', 'aria-hidden': 'true' }) : null);
  }

  /* ---------- Badges ---------- */
  function Badge(props) {
    return h('span', { className: cx('fi-badge', 'fi-badge--' + (props.tone || 'neutral'), props.className) },
      props.icon ? h(Icon, { name: props.icon, size: 14, stroke: 2 }) : null, props.children);
  }
  var STATUS = {
    completed: { tone: 'up', icon: 'circle-check', label: 'Effectué' },
    pending: { tone: 'warning', icon: 'clock', label: 'En attente' },
    processing: { tone: 'info', icon: 'refresh', label: 'En cours' },
    failed: { tone: 'down', icon: 'alert-circle', label: 'Échoué' }
  };
  function StatusBadge(props) {
    var s = STATUS[props.status] || STATUS.pending;
    return h(Badge, { tone: s.tone, icon: s.icon }, props.children || s.label);
  }
  function PriceChange(props) {
    var v = props.value || 0;
    var dir = v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
    return h('span', { className: cx('fi-change', 'fi-change--' + dir, props.variant === 'soft' && 'fi-change--soft', props.className) },
      dir !== 'flat' ? h('span', { className: 'fi-change__arrow', 'aria-hidden': 'true' }, dir === 'up' ? '▲' : '▼') : null,
      h('span', null, formatPct(v, props.digits)),
      h('span', { className: 'fi-sr' }, dir === 'up' ? ' en hausse' : dir === 'down' ? ' en baisse' : ' stable'));
  }

  /* ---------- CryptoIcon ---------- */
  var ASSETS = {
    BTC: { name: 'Bitcoin', glyph: '₿', token: 'crypto-btc' },
    ETH: { name: 'Ethereum', glyph: 'Ξ', token: 'crypto-eth' },
    BNB: { name: 'BNB', glyph: 'B', token: 'crypto-bnb' },
    DOGE: { name: 'Dogecoin', glyph: 'Ð', token: 'crypto-doge' },
    USDT: { name: 'Tether', glyph: '₮', token: 'crypto-usdt' },
    SOL: { name: 'Solana', glyph: 'S', token: 'crypto-sol' }
  };
  function CryptoIcon(props) {
    var a = ASSETS[props.symbol] || { glyph: (props.symbol || '?').charAt(0), token: 'line-strong' };
    var size = props.size || 36;
    if (props.src) return h('img', { className: 'fi-crypto', src: props.src, width: size, height: size, alt: '' });
    return h('span', { className: cx('fi-crypto', props.className), 'aria-hidden': 'true', style: { width: size, height: size, fontSize: Math.round(size * 0.46), background: 'var(--' + a.token + ')' } }, a.glyph);
  }

  /* ---------- Form controls ---------- */
  function Field(props) {
    return h('div', { className: cx('fi-field', props.error && 'has-error', props.className) },
      props.label ? h('label', { className: 'fi-field__label', htmlFor: props.id }, props.label) : null,
      props.children,
      props.error ? h('p', { className: 'fi-field__msg fi-field__msg--error', id: props.id + '-msg' }, h(Icon, { name: 'alert-circle', size: 16 }), props.error)
        : props.hint ? h('p', { className: 'fi-field__msg', id: props.id + '-msg' }, props.hint) : null);
  }
  function Input(props) {
    var autoId = useId();
    var id = props.id || autoId;
    var rest = Object.assign({}, props);
    ['label', 'hint', 'error', 'prefix', 'suffix', 'className', 'icon'].forEach(function (k) { delete rest[k]; });
    return h(Field, { id: id, label: props.label, hint: props.hint, error: props.error, className: props.className },
      h('div', { className: 'fi-input' },
        props.icon ? h(Icon, { name: props.icon, size: 20, className: 'fi-input__icon' }) : null,
        props.prefix ? h('span', { className: 'fi-input__affix' }, props.prefix) : null,
        h('input', Object.assign({ id: id, 'aria-invalid': props.error ? 'true' : undefined, 'aria-describedby': (props.error || props.hint) ? id + '-msg' : undefined }, rest)),
        props.suffix ? h('span', { className: 'fi-input__affix' }, props.suffix) : null));
  }

  function AmountInput(props) {
    var autoId = useId();
    var _s = useState(props.defaultValue != null ? String(props.defaultValue) : ''), local = _s[0], setLocal = _s[1];
    var value = props.value != null ? String(props.value) : local;
    function set(v) { if (props.onChange) props.onChange(v); if (props.value == null) setLocal(v); }
    var num = parseFloat(String(value).replace(',', '.')) || 0;
    var over = props.max != null && num > props.max;
    var under = props.min != null && num > 0 && num < props.min;
    var quick = props.quick || [50, 100, 250, 500];
    return h('div', { className: cx('fi-amount', (over || under) && 'has-error') },
      h('label', { className: 'fi-field__label', htmlFor: autoId }, props.label || 'Montant'),
      h('div', { className: 'fi-amount__row' },
        h('input', { id: autoId, inputMode: 'decimal', placeholder: '0', value: value, 'aria-describedby': autoId + '-msg',
          onChange: function (e) { set(e.target.value.replace(/[^0-9.,]/g, '')); } }),
        h('span', { className: 'fi-amount__cur' }, '$')),
      h('p', { className: cx('fi-field__msg', (over || under) && 'fi-field__msg--error'), id: autoId + '-msg' },
        over ? 'Montant supérieur à votre solde disponible.' : under ? 'Minimum ' + formatUSD(props.min) + '.' : props.max != null ? 'Disponible : ' + formatUSD(props.max) : (props.hint || '')),
      h('div', { className: 'fi-amount__quick', role: 'group', 'aria-label': 'Montants rapides' },
        quick.map(function (q) {
          return h('button', { key: q, type: 'button', className: cx('fi-chip', num === q && 'is-active'), onClick: function () { set(String(q)); } }, q + ' $');
        })));
  }

  function CryptoSelect(props) {
    var items = props.items || [];
    var _o = useState(false), open = _o[0], setOpen = _o[1];
    var _v = useState(props.defaultValue || (items[0] && items[0].symbol)), local = _v[0], setLocal = _v[1];
    var value = props.value || local;
    var cur = items.filter(function (i) { return i.symbol === value; })[0] || items[0];
    var ref = useRef(null);
    useEffect(function () {
      function onDoc(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
      document.addEventListener('mousedown', onDoc);
      return function () { document.removeEventListener('mousedown', onDoc); };
    }, []);
    function pick(sym) { setLocal(sym); setOpen(false); if (props.onChange) props.onChange(sym); }
    return h('div', { className: 'fi-select', ref: ref },
      props.label ? h('span', { className: 'fi-field__label' }, props.label) : null,
      h('button', { type: 'button', className: 'fi-select__trigger', 'aria-haspopup': 'listbox', 'aria-expanded': open, onClick: function () { setOpen(!open); } },
        cur ? h(CryptoIcon, { symbol: cur.symbol, size: 28 }) : null,
        h('span', { className: 'fi-select__name' }, cur ? cur.name : 'Choisir', cur ? h('small', null, cur.symbol) : null),
        h(Icon, { name: 'chevron-down', size: 20, className: cx('fi-select__chev', open && 'is-open') })),
      open ? h('ul', { className: 'fi-select__list', role: 'listbox' },
        items.map(function (i) {
          return h('li', { key: i.symbol, role: 'option', 'aria-selected': i.symbol === value, className: cx('fi-select__opt', i.symbol === value && 'is-selected'), onClick: function () { pick(i.symbol); },
            onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i.symbol); } }, tabIndex: 0 },
            h(CryptoIcon, { symbol: i.symbol, size: 28 }),
            h('span', { className: 'fi-select__name' }, i.name, h('small', null, i.symbol)),
            i.change != null ? h(PriceChange, { value: i.change }) : null);
        })) : null);
  }

  function Switch(props) {
    var autoId = useId();
    var _s = useState(!!props.defaultChecked), local = _s[0], setLocal = _s[1];
    var on = props.checked != null ? props.checked : local;
    function toggle() { if (props.disabled) return; var n = !on; setLocal(n); if (props.onChange) props.onChange(n); }
    return h('div', { className: 'fi-switch-row' },
      h('span', { className: 'fi-switch-row__text' },
        h('span', { id: autoId, className: 'fi-switch-row__label' }, props.label),
        props.description ? h('span', { className: 'fi-switch-row__desc' }, props.description) : null),
      h('button', { type: 'button', role: 'switch', 'aria-checked': on, 'aria-labelledby': autoId, disabled: props.disabled, className: cx('fi-switch', on && 'is-on'), onClick: toggle },
        h('span', { className: 'fi-switch__thumb' })));
  }

  function OtpInput(props) {
    var len = props.length || 6;
    var _s = useState(Array(len).fill('')), vals = _s[0], setVals = _s[1];
    var refs = useRef([]);
    function set(i, v) {
      var d = v.replace(/\D/g, '');
      var next = vals.slice();
      if (d.length > 1) { d.split('').slice(0, len - i).forEach(function (c, j) { next[i + j] = c; }); setVals(next); var last = Math.min(i + d.length, len - 1); refs.current[last] && refs.current[last].focus(); }
      else { next[i] = d; setVals(next); if (d && i < len - 1) refs.current[i + 1].focus(); }
      if (props.onComplete && next.join('').length === len) props.onComplete(next.join(''));
    }
    return h('div', { className: cx('fi-otp', props.error && 'has-error'), role: 'group', 'aria-label': props.label || 'Code de vérification' },
      vals.map(function (v, i) {
        return h('input', { key: i, ref: function (el) { refs.current[i] = el; }, inputMode: 'numeric', autoComplete: i === 0 ? 'one-time-code' : 'off', maxLength: len, value: v, 'aria-label': 'Chiffre ' + (i + 1),
          onChange: function (e) { set(i, e.target.value); },
          onKeyDown: function (e) { if (e.key === 'Backspace' && !vals[i] && i > 0) refs.current[i - 1].focus(); } });
      }));
  }

  /* ---------- Tabs ---------- */
  function Tabs(props) {
    var items = props.items || [];
    var _s = useState(props.defaultValue || (items[0] && (items[0].value || items[0]))), local = _s[0], setLocal = _s[1];
    var value = props.value || local;
    var variant = props.variant || 'segmented';
    return h('div', { className: cx('fi-tabs', 'fi-tabs--' + variant, props.block && 'fi-tabs--block', props.className), role: 'tablist', 'aria-label': props.label },
      items.map(function (it) {
        var v = it.value || it, l = it.label || it;
        var on = v === value;
        return h('button', { key: v, type: 'button', role: 'tab', 'aria-selected': on, tabIndex: on ? 0 : -1, className: cx('fi-tab', on && 'is-active'),
          onClick: function () { setLocal(v); if (props.onChange) props.onChange(v); } }, l);
      }));
  }

  /* ---------- Data display ---------- */
  function BalanceCard(props) {
    var _s = useState(false), hidden = _s[0], setHidden = _s[1];
    return h('section', { className: 'fi-balance', 'aria-label': props.label || 'Solde total' },
      h('div', { className: 'fi-balance__top' },
        h('span', { className: 'overline fi-balance__label' }, props.label || 'Solde total'),
        h('button', { type: 'button', className: 'fi-balance__eye', 'aria-label': hidden ? 'Afficher le solde' : 'Masquer le solde', onClick: function () { setHidden(!hidden); } },
          h(Icon, { name: hidden ? 'eye-off' : 'eye', size: 20 }))),
      h('p', { className: 'amount-xl fi-balance__amount' }, hidden ? '••••••' : formatUSD(props.amount)),
      props.gain != null ? h('p', { className: 'fi-balance__gain' },
        h('span', { className: cx('fi-balance__pill', props.gain >= 0 ? 'is-up' : 'is-down') }, (props.gain >= 0 ? '▲ +' : '▼ −') + formatUSD(Math.abs(props.gain))),
        h('span', null, props.gainLabel || 'depuis le début')) : null,
      props.children ? h('div', { className: 'fi-balance__actions' }, props.children) : null);
  }

  function Sparkline(props) {
    var data = props.data || [];
    var w = props.width || 72, ht = props.height || 28;
    if (data.length < 2) return null;
    var min = Math.min.apply(null, data), max = Math.max.apply(null, data), rng = max - min || 1;
    var pts = data.map(function (v, i) { return [i / (data.length - 1) * w, ht - 2 - (v - min) / rng * (ht - 4)]; });
    var up = data[data.length - 1] >= data[0];
    return h('svg', { className: 'fi-spark', width: w, height: ht, viewBox: '0 0 ' + w + ' ' + ht, 'aria-hidden': 'true' },
      h('polyline', { points: pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '), fill: 'none', stroke: up ? 'var(--up)' : 'var(--down)', strokeWidth: 1.75, strokeLinejoin: 'round', strokeLinecap: 'round' }));
  }

  function AssetRow(props) {
    var a = ASSETS[props.symbol] || {};
    var Tag = props.onClick ? 'button' : 'div';
    return h(Tag, { className: 'fi-asset', type: props.onClick ? 'button' : undefined, onClick: props.onClick },
      h(CryptoIcon, { symbol: props.symbol, size: 40 }),
      h('span', { className: 'fi-asset__id' },
        h('span', { className: 'fi-asset__name' }, props.name || a.name || props.symbol),
        h('span', { className: 'fi-asset__sub' }, props.holding != null ? formatCrypto(props.holding, props.symbol) : props.symbol)),
      props.trend ? h(Sparkline, { data: props.trend }) : null,
      h('span', { className: 'fi-asset__val' },
        h('span', { className: 'amount' }, formatUSD(props.value != null ? props.value : props.price)),
        props.change != null ? h(PriceChange, { value: props.change }) : null));
  }

  var TX = {
    deposit: { icon: 'building-bank', label: 'Virement reçu', sign: '+' },
    withdraw: { icon: 'arrow-up-right', label: 'Retrait', sign: '−' },
    invest: { icon: 'arrows-exchange', label: 'Investissement', sign: '' },
    gain: { icon: 'chart-line', label: 'Gain', sign: '+' }
  };
  function TransactionList(props) {
    var groups = [], idx = {};
    (props.items || []).forEach(function (t) { var g = t.date || ''; if (idx[g] == null) { idx[g] = groups.length; groups.push({ date: g, items: [] }); } groups[idx[g]].items.push(t); });
    if (!groups.length) return h('div', { className: 'fi-empty' }, h(Icon, { name: 'clock', size: 28 }), h('p', null, props.emptyText || 'Aucune opération pour le moment.'));
    return h('div', { className: 'fi-txlist' }, groups.map(function (g) {
      return h('section', { key: g.date },
        g.date ? h('h4', { className: 'fi-txlist__date' }, g.date) : null,
        h('ul', null, g.items.map(function (t, i) {
          var m = TX[t.type] || TX.invest;
          var pos = m.sign === '+';
          return h('li', { key: i, className: 'fi-tx' },
            h('span', { className: cx('fi-tx__icon', 'fi-tx__icon--' + t.type) }, h(Icon, { name: m.icon, size: 20 })),
            h('span', { className: 'fi-tx__id' }, h('span', { className: 'fi-tx__title' }, t.title || m.label), h('span', { className: 'fi-tx__sub' }, t.subtitle || t.time || '')),
            h('span', { className: 'fi-tx__val' },
              h('span', { className: cx('amount', pos && 'fi-text-up') }, m.sign + formatUSD(t.amount)),
              t.status && t.status !== 'completed' ? h(StatusBadge, { status: t.status }) : null));
        })));
    }));
  }

  function PriceChart(props) {
    var series = props.series || {};
    var ranges = props.ranges || Object.keys(series);
    var _r = useState(props.defaultRange || ranges[0]), range = _r[0], setRange = _r[1];
    var data = series[range] || [];
    var _h = useState(null), hover = _h[0], setHover = _h[1];
    var W = 640, H = props.height || 200, pad = 8;
    var min = Math.min.apply(null, data), max = Math.max.apply(null, data), rng = max - min || 1;
    var pts = data.map(function (v, i) { return [i / Math.max(1, data.length - 1) * W, pad + (1 - (v - min) / rng) * (H - pad * 2)]; });
    var up = data[data.length - 1] >= data[0];
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L' + W + ' ' + H + ' L0 ' + H + ' Z';
    var shown = hover != null ? data[hover] : data[data.length - 1];
    var change = data.length ? ((shown - data[0]) / data[0]) * 100 : 0;
    function onMove(e) {
      var r = e.currentTarget.getBoundingClientRect();
      var x = ((e.touches ? e.touches[0].clientX : e.clientX) - r.left) / r.width;
      setHover(Math.max(0, Math.min(data.length - 1, Math.round(x * (data.length - 1)))));
    }
    return h('div', { className: 'fi-chart' },
      h('div', { className: 'fi-chart__head' },
        h('p', { className: 'amount-lg' }, formatUSD(shown)),
        h(PriceChange, { value: change })),
      h('div', { className: 'fi-chart__plot', onMouseMove: onMove, onTouchMove: onMove, onMouseLeave: function () { setHover(null); }, onTouchEnd: function () { setHover(null); } },
        h('svg', { viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', width: '100%', height: H, role: 'img', 'aria-label': (props.label || 'Évolution du prix') + ', ' + range + ', ' + formatPct(((data[data.length - 1] - data[0]) / data[0]) * 100) },
          h('path', { key: range + 'a', d: area, className: cx('fi-chart__area', up ? 'is-up' : 'is-down') }),
          h('path', { key: range + 'l', d: line, className: cx('fi-chart__line', up ? 'is-up' : 'is-down'), vectorEffect: 'non-scaling-stroke', pathLength: 1 }),
          hover != null ? h('line', { x1: pts[hover][0], x2: pts[hover][0], y1: 0, y2: H, className: 'fi-chart__cross', vectorEffect: 'non-scaling-stroke' }) : null),
        hover != null ? h('span', { className: cx('fi-chart__dot', up ? 'is-up' : 'is-down'), style: { left: (pts[hover][0] / W * 100) + '%', top: pts[hover][1] } }) : null),
      h(Tabs, { items: ranges, value: range, onChange: setRange, variant: 'segmented', block: true, label: 'Période' }));
  }

  function AllocationDonut(props) {
    var items = props.items || [];
    var total = items.reduce(function (s, i) { return s + i.value; }, 0) || 1;
    var R = 52, C = 2 * Math.PI * R, off = 0;
    var size = props.size || 148;
    return h('div', { className: 'fi-donut' },
      h('div', { className: 'fi-donut__ring', style: { width: size, height: size } },
        h('svg', { viewBox: '0 0 128 128', width: size, height: size, role: 'img', 'aria-label': 'Répartition du portefeuille' },
          h('circle', { cx: 64, cy: 64, r: R, fill: 'none', stroke: 'var(--surface-sunken)', strokeWidth: 16 }),
          items.map(function (it) {
            var len = it.value / total * C;
            var gap = items.length > 1 ? 2 : 0;
            var el = h('circle', { key: it.symbol || it.label, cx: 64, cy: 64, r: R, fill: 'none', stroke: it.color || ('var(--' + ((ASSETS[it.symbol] || {}).token || 'line-strong') + ')'), strokeWidth: 16,
              strokeDasharray: Math.max(0, len - gap) + ' ' + (C - Math.max(0, len - gap)), strokeDashoffset: -off, transform: 'rotate(-90 64 64)' });
            off += len; return el;
          })),
        h('span', { className: 'fi-donut__center' }, h('span', { className: 'caption' }, props.centerLabel || 'Actifs'), h('span', { className: 'amount' }, String(items.length)))),
      h('ul', { className: 'fi-donut__legend' }, items.map(function (it) {
        return h('li', { key: it.symbol || it.label },
          h('span', { className: 'fi-donut__sw', style: { background: it.color || ('var(--' + ((ASSETS[it.symbol] || {}).token || 'line-strong') + ')') } }),
          h('span', { className: 'fi-donut__name' }, it.label || (ASSETS[it.symbol] || {}).name || it.symbol),
          h('span', { className: 'amount-sm' }, (it.value / total * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + ' %'));
      })));
  }

  /* ---------- Feedback ---------- */
  var TONE_ICON = { info: 'info-circle', up: 'circle-check', warning: 'alert-triangle', down: 'alert-circle', flash: 'info-circle' };
  function Alert(props) {
    var tone = props.tone || 'info';
    return h('div', { className: cx('fi-alert', 'fi-alert--' + tone), role: tone === 'down' ? 'alert' : 'status' },
      h(Icon, { name: TONE_ICON[tone], size: 20, className: 'fi-alert__icon' }),
      h('div', { className: 'fi-alert__body' },
        props.title ? h('p', { className: 'fi-alert__title' }, props.title) : null,
        props.children ? h('div', { className: 'fi-alert__text' }, props.children) : null,
        props.action ? h('div', { className: 'fi-alert__action' }, props.action) : null));
  }
  function Toast(props) {
    var tone = props.tone || 'up';
    return h('div', { className: cx('fi-toast', 'fi-toast--' + tone), role: 'status', 'aria-live': 'polite' },
      h('span', { className: 'fi-toast__icon' }, h(Icon, { name: TONE_ICON[tone], size: 20 })),
      h('div', { className: 'fi-toast__body' }, h('p', { className: 'fi-toast__title' }, props.title), props.description ? h('p', { className: 'fi-toast__desc' }, props.description) : null),
      props.onClose ? h('button', { type: 'button', className: 'fi-toast__close', 'aria-label': 'Fermer', onClick: props.onClose }, h(Icon, { name: 'x', size: 18 })) : null);
  }
  function Modal(props) {
    var ref = useRef(null);
    useEffect(function () {
      if (!props.open) return;
      function onKey(e) { if (e.key === 'Escape' && props.onClose) props.onClose(); }
      document.addEventListener('keydown', onKey);
      if (ref.current) ref.current.focus();
      return function () { document.removeEventListener('keydown', onKey); };
    }, [props.open]);
    if (!props.open) return null;
    return h('div', { className: 'fi-modal', onMouseDown: function (e) { if (e.target === e.currentTarget && props.onClose) props.onClose(); } },
      h('div', { className: 'fi-modal__panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'fi-modal-title', tabIndex: -1, ref: ref },
        h('span', { className: 'fi-modal__grab', 'aria-hidden': 'true' }),
        h('div', { className: 'fi-modal__head' },
          h('h2', { className: 'h3', id: 'fi-modal-title' }, props.title),
          props.onClose ? h(IconButton, { icon: 'x', label: 'Fermer', size: 'sm', onClick: props.onClose }) : null),
        h('div', { className: 'fi-modal__body' }, props.children),
        props.footer ? h('div', { className: 'fi-modal__foot' }, props.footer) : null));
  }

  function Stepper(props) {
    var steps = props.steps || [], cur = props.current || 0;
    return h('ol', { className: 'fi-stepper', 'aria-label': props.label || 'Étapes' },
      steps.map(function (s, i) {
        var state = i < cur ? 'done' : i === cur ? 'current' : 'todo';
        return h('li', { key: i, className: 'fi-step is-' + state, 'aria-current': state === 'current' ? 'step' : undefined },
          h('span', { className: 'fi-step__dot' }, state === 'done' ? h(Icon, { name: 'check', size: 14, stroke: 2.5 }) : String(i + 1)),
          h('span', { className: 'fi-step__label' }, s));
      }));
  }

  /* ---------- Navigation ---------- */
  function TopBar(props) {
    return h('header', { className: 'fi-topbar' },
      props.onBack ? h(IconButton, { icon: 'chevron-left', label: 'Retour', onClick: props.onBack }) : h(Logo, { variant: props.title ? 'symbol' : 'horizontal', size: 28 }),
      props.title ? h('h1', { className: 'fi-topbar__title' }, props.title) : h('span', { className: 'fi-topbar__spacer' }),
      h('div', { className: 'fi-topbar__right' }, props.right));
  }
  function BottomNav(props) {
    var items = props.items || [
      { value: 'home', label: 'Accueil', icon: 'home' },
      { value: 'portfolio', label: 'Portefeuille', icon: 'chart-line' },
      { value: 'invest', label: 'Investir', icon: 'plus', primary: true },
      { value: 'activity', label: 'Activité', icon: 'clock' },
      { value: 'profile', label: 'Profil', icon: 'user' }
    ];
    var _s = useState(props.defaultValue || items[0].value), local = _s[0], setLocal = _s[1];
    var value = props.value || local;
    return h('nav', { className: 'fi-bottomnav', 'aria-label': 'Navigation principale' },
      items.map(function (it) {
        var on = it.value === value;
        return h('button', { key: it.value, type: 'button', className: cx('fi-bottomnav__item', on && 'is-active', it.primary && 'is-primary'), 'aria-current': on ? 'page' : undefined,
          onClick: function () { setLocal(it.value); if (props.onChange) props.onChange(it.value); } },
          h('span', { className: 'fi-bottomnav__icon' }, h(Icon, { name: it.icon, size: it.primary ? 24 : 22, stroke: on || it.primary ? 2 : 1.75 })),
          h('span', { className: 'fi-bottomnav__label' }, it.label));
      }));
  }

  function Skeleton(props) {
    return h('span', { className: cx('fi-skeleton', props.circle && 'fi-skeleton--circle', props.className), 'aria-hidden': 'true', style: { width: props.width || '100%', height: props.height || 16 } });
  }

  /* ---------- Marketing ---------- */
  function HeroBlock(props) {
    return h('section', { className: 'fi-hero' },
      h('div', { className: 'fi-hero__top' },
        h('div', { className: 'fi-hero__copy' },
          props.eyebrow ? h('p', { className: 'overline' }, props.eyebrow) : null,
          h('p', { className: 'body-lg fi-hero__lead' }, props.lead),
          h('div', { className: 'fi-hero__cta' },
            h(Button, { variant: 'dark', size: 'lg', iconRight: 'arrow-right' }, props.cta || 'Commencer'),
            props.secondary ? h(Button, { variant: 'ghost', size: 'lg' }, props.secondary) : null)),
        h('div', { className: 'fi-hero__media' }, props.media)),
      h('div', { className: 'fi-hero__band' }, h('h1', { className: 'fi-hero__title' }, props.title)));
  }

  window.FlashInv = Object.assign(window.FlashInv || {}, {
    Logo: Logo, Icon: Icon, Button: Button, IconButton: IconButton, Badge: Badge, StatusBadge: StatusBadge, PriceChange: PriceChange,
    CryptoIcon: CryptoIcon, Input: Input, AmountInput: AmountInput, CryptoSelect: CryptoSelect, Switch: Switch, OtpInput: OtpInput,
    Tabs: Tabs, BalanceCard: BalanceCard, AssetRow: AssetRow, TransactionList: TransactionList, Sparkline: Sparkline, PriceChart: PriceChart,
    AllocationDonut: AllocationDonut, Alert: Alert, Toast: Toast, Modal: Modal, Stepper: Stepper, TopBar: TopBar, BottomNav: BottomNav,
    Skeleton: Skeleton, HeroBlock: HeroBlock,
    formatUSD: formatUSD, formatPct: formatPct, formatCrypto: formatCrypto, ASSETS: ASSETS
  });
})();
