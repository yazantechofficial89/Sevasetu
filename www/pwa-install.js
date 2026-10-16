// SevaSetu PWA Install Prompt Banner
(function () {
  let deferredPrompt;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing automatically on mobile
    e.preventDefault();
    deferredPrompt = e;

    // Show custom install banner
    showInstallBanner();
  });

  function showInstallBanner() {
    if (document.getElementById('sevasetu-install-banner')) return;

    const banner = document.createElement('div');
    banner.id = 'sevasetu-install-banner';
    banner.style.cssText = `
      position: fixed;
      top: 15px;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 420px;
      background: linear-gradient(135deg, rgba(1, 18, 50, 0.95), rgba(12, 28, 46, 0.95));
      border: 1px solid #ff7b00;
      border-radius: 16px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(255,123,0,0.3);
      z-index: 100000;
      backdrop-filter: blur(12px);
      font-family: 'Poppins', sans-serif;
      animation: fadeInDown 0.4s ease;
    `;

    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <img src="/icon-192.png" alt="SevaSetu Logo" style="width: 42px; height: 42px; border-radius: 10px; object-fit: cover;">
        <div>
          <div style="font-weight: 700; color: #fff; font-size: 14px;">Install SevaSetu App</div>
          <div style="font-size: 11px; color: #c9d1dc;">Add to Home Screen for fast mobile access</div>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <button id="pwa-install-btn" style="
          background: linear-gradient(135deg, #ff7b00, #ff5500);
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(255,123,0,0.4);
        ">Install</button>
        <button id="pwa-dismiss-btn" style="
          background: none;
          border: none;
          color: #a0aec0;
          font-size: 18px;
          cursor: pointer;
          padding: 4px;
          line-height: 1;
        ">&times;</button>
      </div>
    `;

    document.body.appendChild(banner);

    document.getElementById('pwa-install-btn').addEventListener('click', async () => {
      banner.style.display = 'none';
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('User response to install prompt:', outcome);
        deferredPrompt = null;
      }
    });

    document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
      banner.remove();
    });
  }

  window.addEventListener('appinstalled', () => {
    console.log('SevaSetu was installed successfully');
    const banner = document.getElementById('sevasetu-install-banner');
    if (banner) banner.remove();
  });
})();
