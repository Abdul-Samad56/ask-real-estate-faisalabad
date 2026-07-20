/**
 * Canonical URL + share meta (site-config.js کے بعد لوڈ کریں)
 */
(function () {
    function siteBase() {
        const cfg = typeof SiteConfig !== 'undefined' ? SiteConfig : {};
        if (cfg.baseUrl && String(cfg.baseUrl).startsWith('http')) {
            return cfg.baseUrl.replace(/\/$/, '');
        }
        return location.origin + (location.pathname.replace(/[^/]*$/, '') || '/').replace(/\/$/, '');
    }

    function injectSiteMeta() {
        const base = siteBase();
        const page = location.pathname.split('/').pop() || 'index.html';
        const url = base + '/' + page;
        const name =
            (typeof SiteConfig !== 'undefined' && SiteConfig.siteName) ||
            'ASK REAL ESTATE FAISALABAD';

        if (!document.querySelector('link[rel="canonical"]')) {
            const c = document.createElement('link');
            c.rel = 'canonical';
            c.href = url;
            document.head.appendChild(c);
        }

        const setMeta = (attr, key, content) => {
            if (document.querySelector(`meta[${attr}="${key}"]`)) return;
            const m = document.createElement('meta');
            m.setAttribute(attr, key);
            m.content = content;
            document.head.appendChild(m);
        };

        setMeta('property', 'og:url', url);
        setMeta('property', 'og:title', document.title || name);
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:locale', 'ur_PK');
        setMeta('name', 'twitter:card', 'summary');
    }

    if (typeof PropertyHub !== 'undefined') {
        PropertyHub.getSiteUrl = siteBase;
    }

    document.addEventListener('DOMContentLoaded', injectSiteMeta);
})();
