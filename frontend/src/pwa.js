let deferredInstallPrompt = null;
let waitingWorker = null;
let hasPreparedPwa = false;
let shouldReload = false;

const dispatchPwaEvent = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

const watchRegistration = (registration) => {
  const announceUpdate = () => {
    if (registration.waiting && navigator.serviceWorker.controller) {
      waitingWorker = registration.waiting;
      dispatchPwaEvent("memora:pwa-update", true);
    }
  };
  announceUpdate();
  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    if (!worker) return;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed") announceUpdate();
    });
  });
};

export const preparePwa = () => {
  if (hasPreparedPwa || !window.isSecureContext) return;
  if (import.meta.env.DEV) {
    navigator.serviceWorker?.getRegistration().then((registration) => registration?.unregister());
    return;
  }
  hasPreparedPwa = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    dispatchPwaEvent("memora:pwa-install", true);
  });
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    dispatchPwaEvent("memora:pwa-install", false);
  });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).then((registration) => {
        watchRegistration(registration);
        registration.update().catch(() => {});
      }).catch(() => {});
    }, { once: true });
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (shouldReload) window.location.reload();
    });
  }
};

export const canInstallPwa = () => Boolean(deferredInstallPrompt);
export const hasPwaUpdate = () => Boolean(waitingWorker);

export const promptPwaInstall = async () => {
  if (!deferredInstallPrompt) return false;
  const prompt = deferredInstallPrompt;
  deferredInstallPrompt = null;
  dispatchPwaEvent("memora:pwa-install", false);
  await prompt.prompt();
  await prompt.userChoice;
  return true;
};

export const applyPwaUpdate = () => {
  if (!waitingWorker) return false;
  shouldReload = true;
  waitingWorker.postMessage({ type: "SKIP_WAITING" });
  return true;
};
