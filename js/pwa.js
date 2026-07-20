/**
 * PWA — ڈیسک ٹاپ / موبائل ایپ انسٹال
 * لنک کھولتے ہی انسٹال بینر دکھاتا ہے (جب تک ایپ انسٹال / بند نہ ہو)
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
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://')
        );
    },

    isMobile() {
        return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth < 900;
    },

    isIOS() {
        return /iPhone|iPad|iPod/i.test(navigator.userAgent);
    },

    setupInstallUI() {
        if (this.isInstalled()) return;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showBanner();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.hideBanner();
        });

        if (!document.getElementById('pwaInstallBanner')) {
            const banner = document.createElement('div');
            banner.id = 'pwaInstallBanner';
            banner.className = 'fr-pwa-banner';
            banner.setAttribute('hidden', '');
            banner.innerHTML = `
                <div class="fr-pwa-banner-text">
                    <strong>ایپ انسٹال کریں</strong>
                    <span id="pwaInstallHint">ہوم اسکرین پر ASK Estate لگائیں</span>
                </div>
                <div class="fr-pwa-banner-actions">
                    <button type="button" class="fr-pwa-install-btn" id="pwaInstallBtn">انسٹال</button>
                    <button type="button" class="fr-pwa-dismiss-btn" id="pwaInstallDismiss" aria-label="بند">✕</button>
                </div>`;
            document.body.appendChild(banner);
        }

        document.getElementById('pwaInstallBtn')?.addEventListener('click', () => this.promptInstall());
        document.getElementById('pwaInstallDismiss')?.addEventListener('click', () => {
            sessionStorage.setItem('propertyHub_pwaDismissed', '1');
            this.hideBanner();
        });

        // لنک کھولتے ہی بینر دکھائیں (اسی سیشن میں بند نہ کیا ہو)
        if (!sessionStorage.getItem('propertyHub_pwaDismissed')) {
            this.updateHint();
            this.showBanner();
        }
    },

    updateHint() {
        const hint = document.getElementById('pwaInstallHint');
        if (!hint) return;
        if (this.isIOS()) {
            hint.textContent = 'Safari: Share → Add to Home Screen';
        } else if (/Android/i.test(navigator.userAgent)) {
            hint.textContent = 'Chrome: مینو ⋮ → Install app / Add to Home screen';
        } else {
            hint.textContent = 'ایپ کی طرح ہوم اسکرین یا ڈیسک ٹاپ پر انسٹال کریں';
        }
    },

    showBanner() {
        const el = document.getElementById('pwaInstallBanner');
        if (!el || this.isInstalled()) return;
        this.updateHint();
        el.removeAttribute('hidden');
        el.classList.add('fr-pwa-banner-visible');
    },

    hideBanner() {
        const el = document.getElementById('pwaInstallBanner');
        if (!el) return;
        el.setAttribute('hidden', '');
        el.classList.remove('fr-pwa-banner-visible');
    },

    async promptInstall() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            await this.deferredPrompt.userChoice;
            this.deferredPrompt = null;
            this.hideBanner();
            return;
        }
        // براؤزر خود پرامپٹ نہ دے تو ہدایت دکھائیں
        this.updateHint();
        this.showBanner();
        const hint = document.getElementById('pwaInstallHint');
        if (hint) {
            if (this.isIOS()) {
                hint.textContent = 'Share (□↑) دبائیں → Add to Home Screen';
            } else {
                hint.textContent = 'براؤزر مینو ⋮ → Install app / Add to Home screen';
            }
        }
    },
};

document.addEventListener('DOMContentLoaded', () => AskPwa.init());
