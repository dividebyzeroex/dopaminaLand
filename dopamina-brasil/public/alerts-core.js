/*
 * Alertas de preço feitos pelo próprio navegador (sem servidor de push).
 * Usado pelo service worker (importScripts) e testado no Node (tests/alerts-core.test.ts).
 *
 * - Os alertas ficam no IndexedDB do aparelho.
 * - A checagem roda em segundo plano (Periodic Background Sync, Chrome/Edge com o
 *   app instalado) e sempre que o app é aberto.
 * - Alertas com `serverPush: true` também são checados de hora em hora pelo
 *   servidor, que manda o push; aqui eles só atualizam o preço exibido, sem
 *   notificar, para o aviso não chegar em dobro.
 * - Regras: baixou 3%+, subiu 3%+, estável (±1%) por 7 dias, sem repetir antes de 7 dias.
 * - Preço-alvo (opcional): avisa uma vez quando o preço chega ao valor escolhido;
 *   volta a valer se o preço subir de novo acima do alvo (+1%).
 */
(function (root) {
  "use strict";

  var DROP_OR_RISE = 0.03;
  var STABLE_BAND = 0.01;
  var STABLE_DAYS = 7;
  var DAY = 86400000;

  /**
   * Decide se um alerta dispara.
   * watch: { notifyDrop, notifyRise, notifyStable, lastPrice, lastChangeAt, lastNotifiedAt, targetPrice?, targetHitAt? }
   */
  function decideAlert(watch, price, now) {
    now = now || new Date();
    var nowIso = now.toISOString();
    var change = watch.lastPrice > 0 ? (price - watch.lastPrice) / watch.lastPrice : 0;
    var moved = Math.abs(change) > STABLE_BAND;
    var lastChangeAt = moved ? nowIso : watch.lastChangeAt;
    var target = watch.targetPrice > 0 ? watch.targetPrice : null;
    var targetHitAt = watch.targetHitAt || null;
    // Rearma o alvo quando o preço volta a ficar acima dele.
    if (target && targetHitAt && price > target * 1.01) targetHitAt = null;

    function result(kind, lastPrice, notified, hit) {
      return { kind: kind, change: change, next: { lastPrice: lastPrice, lastChangeAt: lastChangeAt, lastNotifiedAt: notified, targetHitAt: hit } };
    }

    if (target && price <= target && !targetHitAt) return result("target", price, nowIso, nowIso);
    if (change <= -DROP_OR_RISE && watch.notifyDrop) return result("drop", price, nowIso, targetHitAt);
    if (change >= DROP_OR_RISE && watch.notifyRise) return result("rise", price, nowIso, targetHitAt);
    var stableFor = (now.getTime() - Date.parse(lastChangeAt)) / DAY;
    var sinceLastPush = watch.lastNotifiedAt ? (now.getTime() - Date.parse(watch.lastNotifiedAt)) / DAY : Infinity;
    if (!moved && watch.notifyStable && stableFor >= STABLE_DAYS && sinceLastPush >= STABLE_DAYS) {
      return result("stable", watch.lastPrice, nowIso, targetHitAt);
    }
    // Sem aviso: a referência só muda quando o preço realmente mudou.
    return result(null, moved ? price : watch.lastPrice, watch.lastNotifiedAt, targetHitAt);
  }

  function brl(v) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v); }
  function pct(v) { return Math.abs(v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%"; }

  function alertMessage(kind, name, price, previous, change, stableDays, target) {
    var short = name.length > 60 ? name.slice(0, 58) + "…" : name;
    if (kind === "target") return { title: "Chegou ao seu preço: " + short, body: "Agora por " + brl(price) + " (seu alvo era " + brl(target || price) + "). Veja se é desconto real antes de comprar." };
    if (kind === "drop") return { title: "Baixou " + pct(change) + ": " + short, body: "De " + brl(previous) + " para " + brl(price) + ". Veja se é desconto real no histórico." };
    if (kind === "rise") return { title: "Subiu " + pct(change) + ": " + short, body: "Foi de " + brl(previous) + " para " + brl(price) + ". Se puder, espere." };
    return { title: "Preço estável: " + short, body: brl(price) + " há " + Math.floor(stableDays) + " dias, sem sinal de queda. Bom momento para decidir." };
  }

  // ── IndexedDB ────────────────────────────────────────────────────────────
  var DB_NAME = "dopamina-alertas";
  var STORE = "watches";
  var META = "meta";

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "path" });
        if (!db.objectStoreNames.contains(META)) db.createObjectStore(META);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function tx(store, mode, fn) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var t = db.transaction(store, mode);
        var result = fn(t.objectStore(store));
        t.oncomplete = function () { resolve(result && "result" in result ? result.result : result); db.close(); };
        t.onerror = function () { reject(t.error); db.close(); };
      });
    });
  }

  function listWatches() { return tx(STORE, "readonly", function (s) { return s.getAll(); }); }
  function putWatch(w) { return tx(STORE, "readwrite", function (s) { return s.put(w); }); }
  function removeWatch(path) { return tx(STORE, "readwrite", function (s) { return s.delete(path); }); }
  function getMeta(key) { return tx(META, "readonly", function (s) { return s.get(key); }); }
  function setMeta(key, value) { return tx(META, "readwrite", function (s) { return s.put(value, key); }); }

  // ── Checagem ─────────────────────────────────────────────────────────────
  /**
   * Consulta o preço de cada produto acompanhado e mostra as notificações.
   * notify(title, options) é injetado (registration.showNotification no service worker).
   */
  function checkAll(options) {
    var fetchFn = options.fetch;
    var notify = options.notify;
    var now = options.now || new Date();
    return listWatches().then(function (watches) {
      var report = { checked: 0, notified: 0, failed: 0 };
      return watches.reduce(function (chain, w) {
        return chain.then(function () {
          return fetchFn("/api/preco?path=" + encodeURIComponent(w.path))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
              if (!data || !data.ok || !(data.price > 0)) { report.failed++; return; }
              report.checked++;
              var previous = w.lastPrice || data.price;
              var decision = decideAlert(w, data.price, now);
              var updated = Object.assign({}, w, decision.next, { currentPrice: data.price, checkedAt: now.toISOString() });
              var shown = Promise.resolve();
              if (decision.kind && !w.serverPush) {
                var stableDays = (now.getTime() - Date.parse(w.lastChangeAt)) / DAY;
                var msg = alertMessage(decision.kind, w.name, data.price, previous, decision.change, stableDays, w.targetPrice);
                report.notified++;
                shown = notify(msg.title, {
                  body: msg.body,
                  icon: "/icons/icon-192.png",
                  badge: "/icons/badge-96.png",
                  tag: "preco-" + w.path,
                  renotify: true,
                  data: { url: "/produto/" + w.path + "?origem=alerta" },
                });
              }
              return Promise.resolve(shown).then(function () { return putWatch(updated); });
            })
            .catch(function () { report.failed++; });
        });
      }, Promise.resolve()).then(function () {
        return setMeta("lastCheck", now.toISOString()).then(function () { return report; });
      });
    });
  }

  var api = {
    decideAlert: decideAlert, alertMessage: alertMessage,
    listWatches: listWatches, putWatch: putWatch, removeWatch: removeWatch,
    getMeta: getMeta, setMeta: setMeta, checkAll: checkAll,
    DROP_OR_RISE: DROP_OR_RISE, STABLE_BAND: STABLE_BAND, STABLE_DAYS: STABLE_DAYS,
  };
  root.DopaminaAlerts = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof self !== "undefined" ? self : globalThis);
