import { Download, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { applyPwaUpdate, canInstallPwa, hasPwaUpdate, promptPwaInstall } from "../pwa";

const PwaControls = () => {
  const [installReady, setInstallReady] = useState(canInstallPwa);
  const [updateReady, setUpdateReady] = useState(hasPwaUpdate);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const onInstall = (event) => setInstallReady(Boolean(event.detail));
    const onUpdate = (event) => setUpdateReady(Boolean(event.detail));
    window.addEventListener("memora:pwa-install", onInstall);
    window.addEventListener("memora:pwa-update", onUpdate);
    return () => {
      window.removeEventListener("memora:pwa-install", onInstall);
      window.removeEventListener("memora:pwa-update", onUpdate);
    };
  }, []);

  const handleInstall = async () => { await promptPwaInstall(); setInstallReady(false); };
  const handleUpdate = () => { if (applyPwaUpdate()) setIsUpdating(true); };

  return <>
    {installReady && <button type="button" className="home-nav__install" onClick={handleInstall}><Download size={16} aria-hidden="true" /> Install app</button>}
    {updateReady && <aside className="pwa-update" aria-live="polite"><div><strong>A better Memora is ready.</strong><span>Update to get the latest version.</span></div><button type="button" onClick={handleUpdate} disabled={isUpdating}><RefreshCw size={16} className={isUpdating ? "is-spinning" : ""} aria-hidden="true" />{isUpdating ? "Updating" : "Update now"}</button></aside>}
  </>;
};

export default PwaControls;
