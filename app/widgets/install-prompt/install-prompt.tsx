import { useEffect, useState } from "react";
import {
  clearInstallPrompt,
  getInstallPrompt,
  isIosSafari,
  isStandalone,
  subscribeInstallPrompt,
} from "~/lib/install-prompt";

const DISMISSED_KEY = "install-prompt-dismissed-at";
const DISMISS_DAYS = 14;

function recentlyDismissed() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_KEY));
    return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [mode, setMode] = useState<"native" | "ios" | null>(null);

  useEffect(() => {
    if (isStandalone() || recentlyDismissed()) return;
    const update = () =>
      setMode(getInstallPrompt() ? "native" : isIosSafari() ? "ios" : null);
    update();
    return subscribeInstallPrompt(update);
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // Storage may be blocked; hiding for this visit is enough.
    }
    setMode(null);
  }

  async function install() {
    const prompt = getInstallPrompt();
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    clearInstallPrompt();
    if (outcome === "dismissed") dismiss();
  }

  if (!mode) return null;
  return (
    <aside
      className="install-prompt"
      role="dialog"
      aria-label="Տեղադրել հավելվածը"
    >
      <img src="/favicon/icon-192.png" alt="" width={44} height={44} />
      <div className="install-prompt-text">
        <strong>Տեղադրել հավելվածը</strong>
        {mode === "native" ? (
          <p>
            Ավելացրեք սարքին՝ արագ բացելու և առանց ինտերնետի օգտագործելու համար։
          </p>
        ) : (
          <p>
            Սեղմեք <b>Կիսվել</b> <span aria-hidden="true">⎋</span>, ապա{" "}
            <b>Ավելացնել հիմնական էկրանին</b>։
          </p>
        )}
      </div>
      <div className="install-prompt-actions">
        {mode === "native" && (
          <button className="button" type="button" onClick={install}>
            Տեղադրել
          </button>
        )}
        <button
          type="button"
          className="button secondary"
          onClick={dismiss}
          aria-label="Փակել"
        >
          {mode === "native" ? "Ոչ հիմա" : "✕"}
        </button>
      </div>
    </aside>
  );
}
