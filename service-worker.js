// @ts-nocheck

/*
  AquaGest Lite
  Arquivo: service-worker.js
  Etapa: integração geral
  Versão: service-worker-integracao-geral-v18
  Status:
  - cache offline seguro
  - Desempenho incluído
  - ativação corrigida
  - caches antigos controlados
  - sem interferência no IndexedDB
*/

"use strict";

/*
  ============================================================
  CACHE
  ============================================================
*/

const CACHE_PREFIX =
  "aquagestpro-";

const CACHE_NAME =
  "aquagestpro-producao-v25-tema-claro-relatorios";

/*
  ============================================================
  RECURSOS PRINCIPAIS
  ============================================================
*/

const APP_ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./estilo.css",
  "./desktop.html",
  "./baixar.html",
  "./privacidade.html",
  "./usar-aquagest.html",
  "./manifest.json",

  /*
    Ícones PWA
  */

  "./icon-192.png",
  "./icon-192-maskable.png",
  "./icon-512.png",
  "./icon-512-maskable.png",

  /*
    CSS
  */


  /*
    Core
  */


  /*
    Autenticação
  */


  /*
    Piscicultura
  */


  /*
    Viveiros
  */


  /*
    Produção
  */


  /*
    Biometria
  */


  /*
    Desempenho
  */


  /*
    Água
  */


  /*
    Arraçoamento
  */


  /*
    Estoque
  */


  /*
    Financeiro
  */


  /*
    Infraestrutura de datas
  */


  /*
    Orquestrador global
  */

];

/*
  ============================================================
  ESCOPO
  ============================================================
*/

const APP_SCOPE_URL =
  new URL(
    "./",
    self.location.href
  );

/*
  ============================================================
  NORMALIZAÇÃO DE URL
  ============================================================
*/

function cleanUrl(url) {
  try {
    const parsed =
      new URL(
        url,
        APP_SCOPE_URL
      );

    parsed.search = "";
    parsed.hash = "";

    return parsed.href;
  } catch (error) {
    return String(
      url || ""
    );
  }
}

const APP_ASSET_URLS =
  APP_ASSETS.map(
    function (asset) {
      return cleanUrl(
        asset
      );
    }
  );

/*
  ============================================================
  REQUEST
  ============================================================
*/

function createCleanRequest(url) {
  return new Request(
    cleanUrl(url),
    {
      method: "GET",

      cache: "reload",

      credentials:
        "same-origin"
    }
  );
}

function createNormalCleanRequest(
  url
) {
  return new Request(
    cleanUrl(url),
    {
      method: "GET",

      credentials:
        "same-origin"
    }
  );
}

/*
  ============================================================
  CLASSIFICAÇÃO DE REQUEST
  ============================================================
*/

function isGetRequest(request) {
  return !!(
    request &&
    request.method === "GET"
  );
}

function isSameOriginRequest(
  request
) {
  if (!request) {
    return false;
  }

  try {
    return (
      new URL(
        request.url
      ).origin ===
      self.location.origin
    );
  } catch (error) {
    return false;
  }
}

function isNavigationRequest(
  request
) {
  return !!(
    request &&
    request.mode ===
      "navigate"
  );
}

function isAppAssetRequest(
  request
) {
  if (!request) {
    return false;
  }

  try {
    return (
      APP_ASSET_URLS.indexOf(
        cleanUrl(
          request.url
        )
      ) >= 0
    );
  } catch (error) {
    return false;
  }
}

/*
  ============================================================
  RESPOSTAS CACHEÁVEIS
  ============================================================
*/

function isCacheableResponse(
  response
) {
  return !!(
    response &&
    response.ok &&
    (
      response.type ===
        "basic" ||
      response.type ===
        "default"
    )
  );
}

/*
  ============================================================
  CACHE DE ASSET
  ============================================================
*/

async function cacheAsset(
  cache,
  assetUrl
) {
  try {
    const request =
      createCleanRequest(
        assetUrl
      );

    const response =
      await fetch(
        request
      );

    if (
      !isCacheableResponse(
        response
      )
    ) {
      return false;
    }

    await cache.put(
      request,
      response.clone()
    );

    return true;
  } catch (error) {
    /*
      Um único recurso ausente não deve
      invalidar toda a instalação da PWA.
    */
    return false;
  }
}

/*
  ============================================================
  PRÉ-CACHE
  ============================================================
*/

async function cacheCoreAssets() {
  const cache =
    await caches.open(
      CACHE_NAME
    );

  for (
    let index = 0;
    index < APP_ASSETS.length;
    index += 1
  ) {
    await cacheAsset(
      cache,
      APP_ASSETS[index]
    );
  }

  return true;
}

/*
  ============================================================
  LIMPEZA DE CACHES ANTIGOS
  ============================================================
*/

async function deleteOldCaches() {
  const cacheNames =
    await caches.keys();

  const deletions =
    cacheNames.map(
      function (cacheName) {
        /*
          Apaga somente caches do AquaGest Lite.

          Caches de outros sistemas/domínios
          não são afetados.
        */
        if (
          cacheName.indexOf(
            CACHE_PREFIX
          ) === 0 &&
          cacheName !==
            CACHE_NAME
        ) {
          return caches.delete(
            cacheName
          );
        }

        return Promise.resolve(
          false
        );
      }
    );

  return Promise.all(
    deletions
  );
}

/*
  ============================================================
  INDEX.HTML OFFLINE
  ============================================================
*/

async function getCachedIndex() {
  const indexRequest =
    createNormalCleanRequest(
      "./index.html"
    );

  const rootRequest =
    createNormalCleanRequest(
      "./"
    );

  const cachedIndex =
    await caches.match(
      indexRequest,
      {
        ignoreSearch: true
      }
    );

  if (cachedIndex) {
    return cachedIndex;
  }

  return (
    await caches.match(
      rootRequest,
      {
        ignoreSearch: true
      }
    )
  );
}

async function updateIndexCache(
  response
) {
  try {
    if (
      !isCacheableResponse(
        response
      )
    ) {
      return false;
    }

    const cache =
      await caches.open(
        CACHE_NAME
      );

    const indexRequest =
      createNormalCleanRequest(
        "./index.html"
      );

    const rootRequest =
      createNormalCleanRequest(
        "./"
      );

    /*
      São necessários clones independentes
      porque o corpo de Response é consumível.
    */

    await cache.put(
      indexRequest,
      response.clone()
    );

    await cache.put(
      rootRequest,
      response.clone()
    );

    return true;
  } catch (error) {
    return false;
  }
}

/*
  ============================================================
  NAVEGAÇÃO
  Estratégia: network-first
  ============================================================
*/

async function networkFirstNavigation(
  request
) {
  try {
    const response =
      await fetch(
        request
      );

    if (
      isCacheableResponse(
        response
      )
    ) {
      await updateIndexCache(
        response
      );
    }

    return response;
  } catch (error) {
    const cachedIndex =
      await getCachedIndex();

    if (cachedIndex) {
      return cachedIndex;
    }

    return new Response(
      [
        "<!doctype html>",
        "<html lang='pt-BR'>",
        "<head>",
        "<meta charset='utf-8'>",
        "<meta name='viewport' content='width=device-width,initial-scale=1,viewport-fit=cover'>",
        "<meta name='theme-color' content='#0f8f81'>",
        "<title>AquaGest Lite</title>",
        "</head>",
        "<body>",
        "<main style='font-family:Arial,sans-serif;padding:24px'>",
        "<h1>AquaGest Lite</h1>",
        "<p>Aplicativo indisponível offline no momento.</p>",
        "<p>Conecte-se à internet uma vez para atualizar os arquivos locais.</p>",
        "</main>",
        "</body>",
        "</html>"
      ].join(""),
      {
        status: 503,

        headers: {
          "Content-Type":
            "text/html; charset=utf-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }
}

/*
  ============================================================
  ASSETS PRINCIPAIS
  Estratégia: cache-first
  ============================================================
*/

async function cacheFirstAsset(
  request
) {
  const cleanRequest =
    createNormalCleanRequest(
      request.url
    );

  const cached =
    await caches.match(
      cleanRequest,
      {
        ignoreSearch: true
      }
    );

  if (cached) {
    return cached;
  }

  try {
    const response =
      await fetch(
        request
      );

    if (
      isCacheableResponse(
        response
      )
    ) {
      const cache =
        await caches.open(
          CACHE_NAME
        );

      await cache.put(
        cleanRequest,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    return new Response(
      "Recurso indisponível offline.",
      {
        status: 503,

        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }
}

/*
  ============================================================
  OUTROS RECURSOS DO MESMO DOMÍNIO
  Estratégia: network-first
  ============================================================
*/

async function networkFirstSameOrigin(
  request
) {
  try {
    const response =
      await fetch(
        request
      );

    if (
      isCacheableResponse(
        response
      )
    ) {
      const cache =
        await caches.open(
          CACHE_NAME
        );

      const cleanRequest =
        createNormalCleanRequest(
          request.url
        );

      await cache.put(
        cleanRequest,
        response.clone()
      );
    }

    return response;
  } catch (error) {
    const cleanRequest =
      createNormalCleanRequest(
        request.url
      );

    const cached =
      await caches.match(
        cleanRequest,
        {
          ignoreSearch: true
        }
      );

    if (cached) {
      return cached;
    }

    return new Response(
      "Conteúdo indisponível offline.",
      {
        status: 503,

        headers: {
          "Content-Type":
            "text/plain; charset=utf-8",

          "Cache-Control":
            "no-store"
        }
      }
    );
  }
}

/*
  ============================================================
  INSTALL
  ============================================================
*/

self.addEventListener(
  "install",
  function (event) {
    event.waitUntil(
      cacheCoreAssets()
        .then(
          function () {
            return self.skipWaiting();
          }
        )
    );
  }
);

/*
  ============================================================
  ACTIVATE
  ============================================================
*/

self.addEventListener(
  "activate",
  function (event) {
    event.waitUntil(
      deleteOldCaches()
        .then(
          function () {
            return self.clients.claim();
          }
        )
    );
  }
);

/*
  ============================================================
  FETCH
  ============================================================
*/

self.addEventListener(
  "fetch",
  function (event) {
    const request =
      event.request;

    /*
      Nunca intercepta POST, PUT, DELETE etc.
    */

    if (
      !isGetRequest(
        request
      )
    ) {
      return;
    }

    /*
      Recursos externos não são controlados
      por este Service Worker.
    */

    if (
      !isSameOriginRequest(
        request
      )
    ) {
      return;
    }

    /*
      Navegação HTML
    */

    if (
      isNavigationRequest(
        request
      )
    ) {
      event.respondWith(
        networkFirstNavigation(
          request
        )
      );

      return;
    }

    /*
      Arquivos centrais do AquaGest Lite
    */

    if (
      isAppAssetRequest(
        request
      )
    ) {
      event.respondWith(
        cacheFirstAsset(
          request
        )
      );

      return;
    }

    /*
      Outros GET do mesmo domínio
    */

    event.respondWith(
      networkFirstSameOrigin(
        request
      )
    );
  }
);

/*
  ============================================================
  MESSAGE
  ============================================================
*/

self.addEventListener(
  "message",
  function (event) {
    const data =
      event &&
      event.data
        ? event.data
        : {};

    if (
      data.type ===
      "SKIP_WAITING"
    ) {
      self.skipWaiting();

      return;
    }

    if (
      data.type ===
        "GET_CACHE_VERSION" &&
      event.source
    ) {
      event.source.postMessage({
        type:
          "CACHE_VERSION",

        cacheName:
          CACHE_NAME
      });
    }
  }
);
