/*
 * Service worker do Dopamina. Os alertas de preço são feitos pelo próprio
 * navegador: os produtos acompanhados ficam no aparelho (IndexedDB) e este
 * worker checa os preços e mostra as notificações.
 *   - Em segundo plano: Periodic Background Sync (Chrome/Edge com o app instalado).
 *   - Ao abrir o app: a página pede uma checagem ("check").
 */
importScripts("/alerts-core.js");

var SYNC_TAG = "dopamina-precos";

self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (event) { event.waitUntil(self.clients.claim()); });

function notify(title, options) {
  return self.registration.showNotification(title, options);
}

function runCheck() {
  return self.DopaminaAlerts.checkAll({ fetch: fetch.bind(self), notify: notify });
}

self.addEventListener("periodicsync", function (event) {
  if (event.tag === SYNC_TAG) event.waitUntil(runCheck());
});

// Comandos da página: listar, salvar, remover e checar agora.
self.addEventListener("message", function (event) {
  var msg = event.data || {};
  var port = event.ports && event.ports[0];
  var reply = function (payload) { if (port) port.postMessage(payload); };
  var A = self.DopaminaAlerts;
  var work;
  if (msg.type === "list") work = Promise.all([A.listWatches(), A.getMeta("lastCheck")]).then(function (r) { return { ok: true, watches: r[0], lastCheck: r[1] || null }; });
  else if (msg.type === "save") work = A.putWatch(msg.watch).then(function () { return { ok: true }; });
  else if (msg.type === "remove") work = A.removeWatch(msg.path).then(function () { return { ok: true }; });
  else if (msg.type === "check") work = runCheck().then(function (report) { return { ok: true, report: report }; });
  else work = Promise.resolve({ ok: false, error: "comando desconhecido" });
  event.waitUntil(work.then(reply, function (e) { reply({ ok: false, error: String(e && e.message || e) }); }));
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  var target = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (all) {
    for (var i = 0; i < all.length; i++) {
      var client = all[i];
      if ("focus" in client) {
        return client.focus().then(function (c) { return "navigate" in c ? c.navigate(target) : c; });
      }
    }
    return self.clients.openWindow(target);
  }));
});
