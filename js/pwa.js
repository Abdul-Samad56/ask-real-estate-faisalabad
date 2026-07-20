/**
 * PWA — ڈیسک ٹاپ / موبائل ایپ انسٹال
 */
const AskPwa = {
    deferredPrompt: null,
    _inited: false,

    base() {
        const path = location.pathname.replace(/[^/]*$/, '');
        return path || '/';
    },

    init() {
        if (this._inited) return;
        this._inited = true;
        this.injectHead();
        this.registerServiceWorker();
        this.setupInstallUI();
    },

    injectHead() {
        const base = this.base();
        if (!document.querySelector('link[rel="manifest"]')) {
            const link = document.createElement('link');
            link.rel = 'manifest';
            link.href = base + 'manifest.webmanifest';
            document.head.appendChild(link);
        }
        if (!document.querySelector('meta[name="theme-color"]')) {
            const theme = document.createElement('meta');
            theme.name = 'theme-color';
            theme.content = '#0d3b7a';
            document.head.appendChild(theme);
        }
        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
            const apple = document.createElement('meta');
            apple.name = 'apple-mobile-web-app-capable';
            apple.content = 'yes';
            document.head.appendChild(apple);
        }
        if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
            const title = document.createElement('meta');
            title.name = 'apple-mobile-web-app-title';
            title.content = 'ASK Estate';
            document.head.appendChild(title);
        }
        if (!document.querySelector('link[rel="apple-touch-icon"]')) {
            const icon = document.createElement('link');
            icon.rel = 'apple-touch-icon';
            icon.href = base + 'assets/logo.png';
            document.head.appendChild(icon);
        }
    },

    registerServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        const base = this.base();
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register(base + 'sw.js', { scope: base })
                .catch((err) => console.warn('Service worker:', err));
        });
    },

    isInstalled() {
        return (
            window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true
        );
    },

    setupInstallUI() {
        if (this.isInstalled()) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showBanner();
        });

        if (!document.getElementById('pwaInstallBanner')) {
            const banner = document.createElement('div');
            banner.id = 'pwaInstallBanner';
            banner.className = 'fr-pwa-banner';
            banner.hidden = true;
            banner.innerHTML = `
                <div class="fr-pwa-banner-text">
                    <strong>ایپ انسٹال کریں</strong>
                    <span>موبائل ہوم اسکرین یا ڈیسک ٹاپ — Install app</span>
                </div>
                <div class="fr-pwa-banner-actions">
                    <button type="button" class="fr-pwa-install-btn" id="pwaInstallBtn">انسٹال</button>
                    <button type="button" class="fr-pwa-dismiss-btn" id="pwaInstallDismiss" aria-label="بند">✕</button>
                </div>`;
            document.body.appendChild(banner);
        }

        const dismissed = localStorage.getItem('propertyHub_pwaDismissed');
        if (!dismissed && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            this.showBanner(true);
        }

        document.getElementById('pwaInstallBtn')?.addEventListener('click', () => this.promptInstall());
        document.getElementById('pwaInstallDismiss')?.addEventListener('click', () => {
            localStorage.setItem('propertyHub_pwaDismissed', '1');
            document.getElementById('pwaInstallBanner').hidden = true;
        });
    },

    showBanner(iosHint) {
        const el = document.getElementById('pwaInstallBanner');
        if (!el || this.isInstalled()) return;
        if (iosHint && !this.deferredPrompt) {
            el.querySelector('.fr-pwa-banner-text span').textContent =
                'Safari: Share → Add to Home Screen | iOS ہوم اسکرین';
        }
        el.hidden = false;
    },

    async promptInstall() {
        if (!this.deferredPrompt) {
            this.showBanner(true);
            return;
        }
        this.deferredPrompt.prompt();
        await this.deferredPrompt.userChoice;
        this.deferredPrompt = null;
        document.getElementById('pwaInstallBanner').hidden = true;
    },
};

document.addEventListener('DOMContentLoaded', () => AskPwa.init());
