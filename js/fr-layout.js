/**
 * faisalabadrealtors.com — shared layout, wishlist, cookies, content
 */
const FrLayout = {
    TEAM: [
        {
            name: 'حافظ عبدالصمد خٹک',
            role: 'CEO & Founder',
            bio: 'ASK REAL ESTATE FAISALABAD کے بانی — پراپرٹی مشیر اور قابل اعتماد رہنما۔',
            image: 'assets/ceo.jpg',
        },
        {
            name: 'پراپرٹی ایڈوائزر',
            role: 'Sales Consultant',
            bio: 'خرید، فروخت اور کرایہ — مکمل رہنمائی۔',
            image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
        },
        {
            name: 'لیگل ایڈوائزر',
            role: 'Documentation',
            bio: 'رجسٹری، ٹائٹل اور قانونی معاملات۔',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
        },
        {
            name: 'سائٹ انجینئر',
            role: 'Site Visit',
            bio: 'پراپرٹی معائنہ اور سائٹ وزٹ۔',
            image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        },
    ],

    BLOGS: [
        { id: 1, cat: 'real-estate', title: 'فیصل آباد میں پراپرٹی خریدنے کے 5 مشورے', date: '2025-03-10', excerpt: 'علاقہ، قیمت اور دستاویزات کی اہمیت...', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80' },
        { id: 2, cat: 'lifestyle', title: 'نئے گھر میں منتقلی — مکمل چیک لسٹ', date: '2025-02-20', excerpt: 'پیشگی منصوبہ بندی سے بچت ممکن...', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&auto=format&fit=crop&q=80' },
        { id: 3, cat: 'trends', title: '2025 میں فیصل آباد پراپرٹی مارکیٹ', date: '2025-01-15', excerpt: 'کرایہ اور فروخت کے رجحانات...', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80' },
        { id: 4, cat: 'laws', title: 'پراپرٹی ٹیکس اور قانونی تقاضے', date: '2024-12-01', excerpt: 'FBR اور رجسٹری کے بنیادی اصول...', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&auto=format&fit=crop&q=80' },
        { id: 5, cat: 'construction', title: 'مکان تعمیر — بجٹ اور منصوبہ', date: '2024-11-18', excerpt: 'تعمیراتی لاگت کا اندازہ...', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80' },
        { id: 6, cat: 'decor', title: 'گھر کی سجاوٹ — جدید خیالات', date: '2024-10-05', excerpt: 'کم بجٹ میں خوبصورت انterior...', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80' },
    ],

    BLOG_CATS: {
        'real-estate': 'رئیل اسٹیٹ',
        lifestyle: 'لائف سٹائل',
        trends: 'رجحانات',
        laws: 'قوانین و ٹیکس',
        construction: 'تعمیرات',
        decor: 'گھر کی سجاوٹ',
    },

    PARTNERS: [
        { name: 'Kohinoor Developers', icon: '🏢' },
        { name: 'Eden Builders', icon: '🏗️' },
        { name: 'Wapda City', icon: '🏘️' },
        { name: 'Bank Alfalah', icon: '🏦' },
        { name: 'FBR Registered', icon: '✅' },
        { name: 'Legal Associates', icon: '⚖️' },
    ],

    GALLERY: [
        { title: 'مکان — D Ground', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&auto=format&fit=crop&q=80' },
        { title: 'دکان — Millat Town', image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=600&auto=format&fit=crop&q=80' },
        { title: 'پلاٹ — Wapda City', image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&auto=format&fit=crop&q=80' },
        { title: 'آفس — Kohinoor Plaza', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
        { title: 'فلیٹ — Eden Garden', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80' },
        { title: 'صنعتی — Jaranwala Road', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80' },
        { title: 'فارم ہاؤس', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&auto=format&fit=crop&q=80' },
        { title: 'کمرشل بلڈنگ', image: 'https://images.unsplash.com/photo-1486718448742-163663c566ace?w=600&auto=format&fit=crop&q=80' },
    ],

    SERVICES: [
        { href: 'search.html?type=shop', title: 'کمرشل', desc: 'دکان، آفس، گودام — بہترین سرمایہ کاری', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80' },
        { href: 'search.html?type=industrial', title: 'صنعتی', desc: 'صنعتی زمین و عمارت', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80' },
        { href: 'search.html?type=agricultural', title: 'زرعی', desc: 'زرعی زمین کے مواقع', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&auto=format&fit=crop&q=80' },
        { href: 'search.html?purpose=rent', title: 'کرایہ و فروخت', desc: 'کرایہ پر یا خرید و فروخت', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80' },
        { href: 'search.html?purpose=sale', title: 'خریداری', desc: 'سرمایہ کاری کے مواقع', image: 'https://images.unsplash.com/photo-1479839672679-a68583c829e?w=600&auto=format&fit=crop&q=80' },
        { href: 'search.html?type=house', title: 'رہائشی', desc: 'مکان، فلیٹ، پلاٹ', image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&auto=format&fit=crop&q=80' },
    ],

    CEO_IMAGE: 'assets/ceo.jpg',

    getCeoPhoto() {
        const agency = PropertyHub.getAgency();
        return agency.ceoPhoto || this.CEO_IMAGE;
    },

    SHOWCASE: [
        'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=80',
    ],

    propertyMenuHTML() {
        const links = [
            ['مکان', 'house'], ['کمرہ', 'room'], ['فلیٹ', 'flat'], ['penthouse', 'penthouse'], ['فارم ہاؤس', 'farmhouse'],
            ['آفس', 'office'], ['دکان', 'shop'], ['ہال', 'hall'], ['عمارت', 'building'], ['فیکٹری', 'factory'], ['گودام', 'warehouse'],
            ['رہائشی پلاٹ', 'residential_plot'], ['کمرشل پلاٹ', 'commercial_plot'], ['زرعی زمین', 'agricultural'], ['صنعتی زمین', 'industrial'], ['لوئر پورشن', 'lower_portion'], ['دیگر', 'other'],
        ];
        const home = links.slice(0, 5);
        const comm = links.slice(5, 11);
        const plots = links.slice(11);
        const mk = (items) =>
            items.map(([label, type]) => `<a href="search.html?type=${type}">${label}</a>`).join('');
        return `
        <strong class="fr-menu-label">مکان</strong>${mk(home)}
        <strong class="fr-menu-label">کمرشل</strong>${mk(comm)}
        <strong class="fr-menu-label">پلاٹ</strong>${mk(plots)}`;
    },

    adBannerHTML() {
        const defaults = {
            enabled: true,
            type: 'text',
            text: 'فیصل آباد میں پراپرٹی کرایہ پر لینے یا دینے کے لیے رابطہ کریں',
            contactName: 'حافظ عبدالصمد خٹک',
            phone: '03215315603',
            phoneDisplay: '0321-5315603',
            href: '',
            image: 'assets/ad-banner.svg',
            alt: 'ASK REAL ESTATE FAISALABAD',
        };
        const cfg = {
            ...defaults,
            ...(typeof SiteConfig !== 'undefined' && SiteConfig.adBanner ? SiteConfig.adBanner : {}),
        };
        if (cfg.enabled === false) return '';

        const phone = (cfg.phone || defaults.phone).replace(/\D/g, '');
        const phoneDisplay = cfg.phoneDisplay || cfg.phone || defaults.phoneDisplay;
        const waUrl = PropertyHub.whatsAppUrl(
            cfg.text || defaults.text,
            phone.startsWith('0') ? phone : phone
        );
        const telUrl = 'tel:' + phoneDisplay.replace(/\s/g, '');

        if (cfg.type === 'text' || cfg.text) {
            const text = PropertyHub.escapeHTML(cfg.text || defaults.text);
            const name = PropertyHub.escapeHTML(cfg.contactName || defaults.contactName);
            const phoneHtml = PropertyHub.escapeHTML(phoneDisplay);
            const waSvg =
                '<svg class="fr-ad-wa-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';

            const marqueeItem = `
                <div class="fr-ad-marquee-item">
                    <span class="fr-ad-text">${text}</span>
                    <span class="fr-ad-marquee-sep">✦</span>
                    <div class="fr-ad-contact-card">
                        <span class="fr-ad-name">${name}</span>
                        <a href="${telUrl}" class="fr-ad-phone">${phoneHtml}</a>
                        <a href="${waUrl}" class="fr-ad-wa-icon-btn" target="_blank" rel="noopener" title="WhatsApp" aria-label="WhatsApp">${waSvg}</a>
                    </div>
                </div>`;

            return `
        <div class="fr-ad-strip fr-ad-strip--animated">
            <div class="fr-ad-strip-inner">
                <div class="fr-ad-banner fr-ad-banner--premium" role="banner">
                    <div class="fr-ad-bg-shimmer" aria-hidden="true"></div>
                    <div class="fr-ad-bg-glow" aria-hidden="true"></div>
                    <div class="fr-ad-marquee">
                        <div class="fr-ad-marquee-track">
                            ${marqueeItem}
                            ${marqueeItem.replace('<div class="fr-ad-marquee-item">', '<div class="fr-ad-marquee-item fr-ad-marquee-item--clone" aria-hidden="true">')}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        }

        const href = cfg.href || defaults.href;
        const alt = PropertyHub.escapeHTML(cfg.alt || defaults.alt);
        const image = cfg.image || defaults.image;

        return `
        <div class="fr-ad-strip">
            <div class="fr-ad-strip-inner">
                <a href="${href}" class="fr-ad-banner" rel="sponsored">
                    <img src="${image}" alt="${alt}" loading="lazy" width="1200" height="90">
                </a>
            </div>
        </div>`;
    },

    headerHTML(active = '') {
        const a = (path, label) =>
            `<a href="${path}" class="${active === path ? 'active' : ''}">${label}</a>`;
        return `
        ${this.adBannerHTML()}
        <div class="fr-topbar fr-topbar--utility">
            <div class="fr-topbar-inner">
                <div class="fr-topbar-links">
                    <span class="fr-topbar-lang">اردو</span>
                    <a href="dealer.html" class="fr-admin-dashboard-link" data-admin-dashboard-link hidden>ایڈمن ڈیش بورڈ</a>
                    <a href="account.html" class="fr-topbar-icon" title="اکاؤنٹ" aria-label="اکاؤنٹ">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                    </a>
                    <span class="fr-topbar-divider">|</span>
                    <a href="mailto:" data-agency-email></a>
                    <span class="fr-topbar-divider">|</span>
                    <a href="wishlist.html">پسندیدہ (<span data-wishlist-count>0</span>)</a>
                    <span class="fr-topbar-divider">|</span>
                    <span data-auth-slot><a href="login.html">لاگ ان</a></span>
                </div>
            </div>
        </div>
        <header class="fr-header">
            <div class="fr-header-inner">
                <a href="index.html" class="fr-logo logo">
                    <img src="assets/logo-header.png" alt="ASK REAL ESTATE FAISALABAD" class="logo-img logo-img--header">
                </a>
                <nav class="fr-nav" id="mainNav">
                    ${a('index.html', 'ہوم')}
                    <div class="fr-dropdown fr-nav-item">
                        <button type="button">پراپرٹی ▾</button>
                        <div class="fr-dropdown-menu fr-dropdown-wide">${this.propertyMenuHTML()}</div>
                    </div>
                    <div class="fr-dropdown fr-nav-item">
                        <button type="button">ہمارے بارے ▾</button>
                        <div class="fr-dropdown-menu">
                            <a href="team.html">ہماری ٹیم</a>
                            <a href="gallery.html">گیلری</a>
                        </div>
                    </div>
                    <a href="design-studio.html">ڈیزائن اسٹوڈیو</a>
                    <div class="fr-dropdown fr-nav-item">
                        <button type="button">بلاگ ▾</button>
                        <div class="fr-dropdown-menu">
                            <a href="blog.html">تمام مضامین</a>
                            <a href="blog.html?cat=real-estate">رئیل اسٹیٹ</a>
                            <a href="blog.html?cat=lifestyle">لائف سٹائل</a>
                            <a href="blog.html?cat=trends">رجحانات</a>
                            <a href="blog.html?cat=laws">قوانین و ٹیکس</a>
                            <a href="blog.html?cat=construction">تعمیرات</a>
                            <a href="blog.html?cat=decor">گھر کی سجاوٹ</a>
                        </div>
                    </div>
                    <a href="index.html#contact">رابطہ</a>
                </nav>
                <div class="fr-header-actions">
                    <a href="list-property.html" class="fr-btn-list">+ پراپرٹی درج کریں</a>
                </div>
                <button type="button" class="fr-mobile-toggle" id="mobileMenuBtn">☰</button>
            </div>
        </header>`;
    },

    footerHTML() {
        return `
        <footer class="fr-footer">
            <div class="fr-footer-grid">
                <div>
                    <img src="assets/logo.png" alt="" class="fr-footer-logo">
                    <p class="fr-footer-brand">ASK REAL ESTATE FAISALABAD</p>
                    <p class="fr-footer-addr" data-agency-address>فیصل آباد، پاکستان</p>
                </div>
                <div>
                    <h4>ہمارے بارے میں</h4>
                    <a href="team.html">ہمارے بارے</a>
                    <a href="index.html#contact">رابطہ</a>
                    <a href="dealer.html">کیریئر / ڈیلر</a>
                    <a href="#">شرائط و ضوابط</a>
                </div>
                <div>
                    <h4>مزید معلومات</h4>
                    <a href="search.html">تمام پراپرٹیز</a>
                    <a href="search.html?purpose=sale">فروخت</a>
                    <a href="search.html?purpose=rent">کرایہ</a>
                </div>
                <div>
                    <h4>خبریں</h4>
                    <a href="blog.html">تازہ بلاگ</a>
                    <a href="gallery.html">گیلری</a>
                    <a href="#">پرائیویسی پالیسی</a>
                    <a href="index.html#contact">ہمیں لکھیں</a>
                </div>
                <div>
                    <h4>رابطہ</h4>
                    <a href="tel:" data-agency-phone></a>
                    <a href="mailto:" data-agency-email></a>
                    <a href="#" data-agency-wa>WhatsApp</a>
                </div>
            </div>
            <div class="fr-footer-bottom">
                <div class="fr-footer-copy">© ${new Date().getFullYear()}, ASK REAL ESTATE FAISALABAD</div>
                <a href="dealer.html" class="fr-footer-admin">Admin</a>
            </div>
        </footer>
        <a
            href="https://wa.me/923215315603"
            class="fr-float-wa"
            data-agency-wa
            data-keep-html="1"
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp — +923215315603"
            aria-label="WhatsApp +923215315603"
        >
            <svg class="fr-float-wa-icon" viewBox="0 0 32 32" aria-hidden="true">
                <path fill="currentColor" d="M16.01 3C9.39 3 4 8.39 4 15.02c0 2.31.68 4.46 1.85 6.27L4 29l7.92-1.8A11.95 11.95 0 0 0 16.01 27C22.63 27 28 21.61 28 14.98 28 8.39 22.63 3 16.01 3zm0 21.8c-1.9 0-3.67-.52-5.2-1.43l-.37-.22-4.7 1.07 1.12-4.53-.24-.39A9.72 9.72 0 0 1 6.2 15c0-5.4 4.4-9.8 9.81-9.8 5.42 0 9.82 4.4 9.82 9.8 0 5.41-4.4 9.8-9.82 9.8zm5.38-7.34c-.29-.15-1.73-.86-2-.95-.27-.1-.46-.15-.66.15-.19.29-.76.95-.93 1.14-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.19.05-.37-.02-.52-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.56c-.19 0-.5.07-.76.37-.26.29-1 1-1 2.43s1.03 2.82 1.17 3.01c.15.19 2.02 3.09 4.9 4.33.68.3 1.22.47 1.64.6.69.22 1.31.19 1.81.11.55-.08 1.73-.71 1.97-1.39.24-.68.24-1.27.17-1.39-.07-.12-.26-.2-.55-.34z"/>
            </svg>
        </a>`;
    },

    injectLayout() {
        const shell = document.getElementById('fr-layout');
        if (shell) {
            shell.innerHTML = this.headerHTML(document.body.dataset.page || '') + (shell.innerHTML || '');
        }
        const foot = document.getElementById('fr-footer-slot');
        if (foot) foot.outerHTML = this.footerHTML();
    },

    initAgencyFields() {
        PropertyHub.ensureDefaultAgency();
        const agency = PropertyHub.getAgency();
        document.querySelectorAll('[data-agency-email]').forEach((el) => {
            const email = agency.email || PropertyHub.DEFAULT_AGENCY.email;
            el.href = 'mailto:' + email;
            if (!el.dataset.keepHtml) el.textContent = email;
        });
        document.querySelectorAll('[data-agency-address]').forEach((el) => {
            el.textContent = '📍 ' + (agency.address || PropertyHub.DEFAULT_AGENCY.address);
        });
    },

    initCookies() {
        /* cookie consent banner disabled */
        document.getElementById('cookieBanner')?.remove();
    },

    initMobileMenu() {
        const nav = document.getElementById('mainNav');
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            nav?.classList.toggle('mobile-open');
        });
        nav?.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => nav.classList.remove('mobile-open'));
        });
        document.querySelectorAll('.fr-dropdown > button').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                if (window.innerWidth > 768) return;
                e.preventDefault();
                btn.parentElement?.classList.toggle('open');
            });
        });
    },

    initWishlistButtons(root = document) {
        root.querySelectorAll('[data-wishlist-id]').forEach((btn) => {
            const id = btn.getAttribute('data-wishlist-id');
            btn.classList.toggle('active', PropertyHub.isWishlisted(id));
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const added = PropertyHub.toggleWishlist(id);
                btn.classList.toggle('active', added);
                PropertyHub.updateWishlistBadge();
            });
        });
    },

    wishlistBtnHTML(id) {
        const active = PropertyHub.isWishlisted(id) ? ' active' : '';
        return `<button type="button" class="fr-wishlist-btn${active}" data-wishlist-id="${id}" title="پسندیدہ">♥</button>`;
    },

    renderTeam(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        const ceoPhoto = this.getCeoPhoto();
        el.innerHTML = this.TEAM.map((m, i) => {
            const image = i === 0 ? ceoPhoto : m.image;
            return `
            <div class="fr-team-card">
                <div class="fr-team-photo"><img src="${image}" alt="${PropertyHub.escapeHTML(m.name)}" loading="lazy"></div>
                <h3>${PropertyHub.escapeHTML(m.name)}</h3>
                <p class="fr-team-role">${PropertyHub.escapeHTML(m.role)}</p>
                <p class="fr-team-bio">${PropertyHub.escapeHTML(m.bio)}</p>
            </div>`;
        }).join('');
    },

    renderServices(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this.SERVICES.map(
            (s) => `
            <a href="${s.href}" class="fr-service-card">
                <div class="fr-service-img"><img src="${s.image}" alt="${PropertyHub.escapeHTML(s.title)}" loading="lazy"></div>
                <div class="fr-service-body">
                    <h3>${PropertyHub.escapeHTML(s.title)}</h3>
                    <p>${PropertyHub.escapeHTML(s.desc)}</p>
                </div>
            </a>`
        ).join('');
    },

    renderShowcase(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this.SHOWCASE.map(
            (src, i) => `<div class="fr-showcase-item"><img src="${src}" alt="پراپرٹی ${i + 1}" loading="lazy"></div>`
        ).join('');
    },

    initCeoPhoto() {
        const el = document.querySelector('.fr-ceo-photo');
        if (!el) return;
        const agency = PropertyHub.getAgency();
        const alt = agency.contactName || PropertyHub.DEFAULT_AGENCY.contactName;
        el.innerHTML = `<img src="${this.getCeoPhoto()}" alt="${PropertyHub.escapeHTML(alt)}" loading="lazy">`;
    },

    renderBlogs(containerId, limit = 3) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this.BLOGS.slice(0, limit)
            .map(
                (b) => `
            <a href="blog.html?id=${b.id}" class="fr-blog-card">
                <div class="fr-blog-img"><img src="${b.image}" alt="" loading="lazy"></div>
                <div class="fr-blog-body">
                    <span class="fr-blog-cat">${this.BLOG_CATS[b.cat] || b.cat}</span>
                    <h3>${PropertyHub.escapeHTML(b.title)}</h3>
                    <p>${PropertyHub.escapeHTML(b.excerpt)}</p>
                    <time>${b.date}</time>
                </div>
            </a>`
            )
            .join('');
    },

    renderPartners(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this.PARTNERS.map(
            (p) => `<div class="fr-partner-card"><span>${p.icon}</span><p>${PropertyHub.escapeHTML(p.name)}</p></div>`
        ).join('');
    },

    renderGallery(containerId) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = this.GALLERY.map(
            (g) => `
            <div class="fr-gallery-item">
                <div class="fr-gallery-thumb"><img src="${g.image}" alt="${PropertyHub.escapeHTML(g.title)}" loading="lazy"></div>
                <p>${PropertyHub.escapeHTML(g.title)}</p>
            </div>`
        ).join('');
    },

    initCommon() {
        this.injectLayout();
        PropertyHub.ensureDefaultAgency();
        if (typeof ZameenSite !== 'undefined') ZameenSite.initHeader();
        this.initAgencyFields();
        PropertyHub.updateWishlistBadge();
        this.initCookies();
        this.initMobileMenu();
        this.initCloudAuth();
        document.addEventListener('wishlist:change', () => PropertyHub.updateWishlistBadge());
    },

    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const s = document.createElement('script');
            s.src = src;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error(src));
            document.head.appendChild(s);
        });
    },

    loadScriptModule(src) {
        return new Promise((resolve) => {
            if (document.querySelector(`script[type="module"][src="${src}"]`)) {
                const wait = () => (window.CloudAuth?.ready ? resolve() : setTimeout(wait, 40));
                wait();
                return;
            }
            const s = document.createElement('script');
            s.type = 'module';
            s.src = src;
            s.onload = () => {
                const wait = () => (window.CloudAuth?.ready ? resolve() : setTimeout(wait, 40));
                wait();
            };
            document.head.appendChild(s);
        });
    },

    updateAuthTopbar() {
        const slot = document.querySelector('[data-auth-slot]');
        this.updateAdminDashboardLink();
        if (!slot) return;
        if (window.CloudAuth?.isLoggedIn()) {
            const name = PropertyHub.escapeHTML(CloudAuth.displayName());
            slot.innerHTML = `<a href="account.html" class="fr-topbar-user">${name}</a><span class="fr-topbar-divider">|</span><button type="button" class="fr-topbar-linkbtn" data-auth-logout>لاگ آؤٹ</button>`;
            slot.querySelector('[data-auth-logout]')?.addEventListener('click', async (e) => {
                e.preventDefault();
                await OwnerAuth.signOut();
                this.updateAuthTopbar();
            });
        } else if (window.OwnerAuth?.isLoggedIn()) {
            const name = PropertyHub.escapeHTML(OwnerAuth.displayName());
            slot.innerHTML = `<a href="account.html" class="fr-topbar-user">${name}</a><span class="fr-topbar-divider">|</span><button type="button" class="fr-topbar-linkbtn" data-auth-logout>لاگ آؤٹ</button>`;
            slot.querySelector('[data-auth-logout]')?.addEventListener('click', async (e) => {
                e.preventDefault();
                await OwnerAuth.signOut();
                this.updateAuthTopbar();
            });
        } else {
            slot.innerHTML =
                '<a href="login.html">لاگ ان</a><span class="fr-topbar-divider">|</span><a href="login.html?redirect=list-property.html">رجسٹر</a>';
        }
    },

    updateAdminDashboardLink() {
        const isAdmin =
            (window.LocalDbAuth?.isLoggedIn() && LocalDbAuth.isAdmin()) ||
            (window.CloudAuth?.isLoggedIn() && CloudAuth.isAdmin());
        document.querySelectorAll('[data-admin-dashboard-link]').forEach((link) => {
            link.hidden = !isAdmin;
        });
    },

    async initCloudAuth() {
        this.updateAuthTopbar();
        window.addEventListener('localdb-auth:change', () => this.updateAuthTopbar());
        const cfg = typeof SiteConfig !== 'undefined' ? SiteConfig.supabase : null;
        if (!cfg?.enabled || !cfg.url || !cfg.anonKey) return;
        try {
            if (typeof SiteConfig === 'undefined') await this.loadScript('js/site-config.js');
            if (typeof SupabaseConfig === 'undefined') await this.loadScript('js/supabase-config.js');
            if (!window.CloudAuth) await this.loadScriptModule('js/cloud-auth.js');
            await CloudAuth.waitReady();
            this.updateAuthTopbar();
            window.addEventListener('auth:change', () => this.updateAuthTopbar());
        } catch (e) {
            console.warn('CloudAuth load', e);
        }
    },
};
