/**
 * Zameen-style public website — shared
 */
const ZameenSite = {
    PH: PropertyHub,
    get LABELS() {
        return PropertyHub.LABELS;
    },

    getListings() {
        return PropertyHub.getPublicCatalog().listings || [];
    },

    getAgency() {
        return PropertyHub.getPublicCatalog().agency || {};
    },

    getListingById(id) {
        return this.getListings().find((p) => p.id === id);
    },

    escapeHTML(str) {
        return PropertyHub.escapeHTML(str);
    },

    searchUrl(params = {}) {
        const q = new URLSearchParams();
        if (params.purpose) q.set('purpose', params.purpose);
        if (params.type) q.set('type', params.type);
        if (params.city) q.set('city', params.city);
        if (params.min) q.set('min', params.min);
        if (params.max) q.set('max', params.max);
        if (params.beds) q.set('beds', params.beds);
        if (params.baths) q.set('baths', params.baths);
        if (params.floors) q.set('floors', params.floors);
        if (params.page) q.set('page', params.page);
        const s = q.toString();
        return 'search.html' + (s ? '?' + s : '');
    },

    propertyUrl(id) {
        return 'property.html?id=' + encodeURIComponent(id);
    },

    parseQuery() {
        const q = new URLSearchParams(location.search);
        return {
            purpose: q.get('purpose') || '',
            type: q.get('type') || '',
            city: q.get('city') || '',
            min: q.get('min') || '',
            max: q.get('max') || '',
            beds: q.get('beds') || '',
            baths: q.get('baths') || '',
            floors: q.get('floors') || '',
            id: PropertyHub.sanitizeId(q.get('id') || ''),
            page: q.get('page') || '',
        };
    },

    filterListings(list, filters) {
        let out = [...list];
        const { purpose, type, city, min, max, beds, baths, floors } = filters;
        if (purpose) out = out.filter((p) => p.purpose === purpose);
        if (type) out = out.filter((p) => p.type === type);
        if (city) {
            const q = city.trim().toLowerCase();
            out = out.filter(
                (p) =>
                    (p.city && p.city.toLowerCase().includes(q)) ||
                    (p.area && p.area.toLowerCase().includes(q)) ||
                    (p.title && p.title.toLowerCase().includes(q))
            );
        }
        if (min) out = out.filter((p) => Number(p.price) >= Number(min));
        if (max) out = out.filter((p) => Number(p.price) <= Number(max));
        if (beds) out = out.filter((p) => Number(p.beds || 0) >= Number(beds));
        if (baths) out = out.filter((p) => Number(p.baths || 0) >= Number(baths));
        if (floors) out = out.filter((p) => Number(p.floors || 0) >= Number(floors));
        return out;
    },

    sortListings(list, sort) {
        const arr = [...list];
        if (sort === 'price-asc') arr.sort((a, b) => Number(a.price) - Number(b.price));
        else if (sort === 'price-desc') arr.sort((a, b) => Number(b.price) - Number(a.price));
        else if (sort === 'newest') arr.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
        else arr.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));
        return arr;
    },

    cardHTML(p, opts = {}) {
        const L = this.LABELS;
        const PH = this.PH;
        const compact = opts.compact;
        const link = opts.link !== false;
        const phone = p.phone || this.getAgency().phone || PH.DEFAULT_AGENCY.phone;

        const imgContent = this.propertyImageHTML(p);

        const tags = [];
        if (p.featured) tags.push('<span class="zm-tag zm-tag-hot">SUPER HOT</span>');
        tags.push(
            `<span class="zm-tag ${p.purpose === 'rent' ? 'zm-tag-rent' : 'zm-tag-purpose'}">${L.purpose[p.purpose]}</span>`
        );

        const chips = [];
        if (p.size) chips.push(`<span class="zm-chip">${this.escapeHTML(p.size)}</span>`);
        if (p.beds) chips.push(`<span class="zm-chip">${p.beds} Beds</span>`);
        if (p.baths) chips.push(`<span class="zm-chip">${p.baths} Baths</span>`);
        chips.push(`<span class="zm-chip">${L.type[p.type]}</span>`);

        const price =
            PH.formatPriceZameen(p.price) + (p.purpose === 'rent' ? ' <span>/ ماہ</span>' : '');

        if (compact) {
            const inner = `
            <div class="zm-mini-card" data-id="${p.id}">
                ${this.propertyImageHTML(p)}
                <div class="zm-mini-body">
                    <div class="zm-mini-price">${PH.formatPriceZameen(p.price)}</div>
                    <div class="zm-mini-title">${this.escapeHTML(p.title)}</div>
                    <div class="zm-mini-loc">${this.escapeHTML(p.area || p.city || '')}</div>
                </div>
            </div>`;
            return link ? `<a href="${this.propertyUrl(p.id)}" class="zm-mini-link">${inner}</a>` : inner;
        }

        return this.listingCardHTML(p, { link });
    },

    propertyImageHTML(p, alt = '') {
        const src = (p.images && p.images[0]) || p.image || this.getDefaultImage(p.type);
        const safeAlt = this.escapeHTML(alt || p.title || 'پراپرٹی');
        return `<img src="${src}" alt="${safeAlt}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${this.getDefaultImage(p.type)}';">`;
    },

    mediaPlaceholderHTML(p) {
        const L = this.LABELS;
        const typeLabel = this.escapeHTML(L.type[p.type] || p.type || 'پراپرٹی');
        const purposeLabel = this.escapeHTML(L.purpose[p.purpose] || '');
        const area = this.escapeHTML(p.area || p.city || 'فیصل آباد');
        const size = p.size ? this.escapeHTML(p.size) : '';
        return `
        <div class="zm-listing-media-ph" aria-hidden="true">
            <span class="zm-listing-ph-icon">🏠</span>
            <span class="zm-listing-ph-type">${typeLabel}</span>
            ${size ? `<span class="zm-listing-ph-size">${size}</span>` : ''}
            <span class="zm-listing-ph-area">${area}</span>
            ${purposeLabel ? `<span class="zm-listing-ph-purpose">${purposeLabel}</span>` : ''}
        </div>`;
    },

    listingMediaHTML(p) {
        const imgCount = this.imageCount(p) || 1;
        return `
            ${this.mediaPlaceholderHTML(p)}
            ${this.propertyImageHTML(p)}
            ${p.featured ? '<span class="zm-listing-hot">HOT</span>' : ''}
            <span class="zm-listing-imgcount"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2zm0 2v10h16V7H4zm4 2.5A2.5 2.5 0 1111.5 12 2.5 2.5 0 019 9.5z"/></svg>${imgCount}</span>`;
    },

    imageCount(p) {
        if (p.images?.length) return p.images.length;
        if (p.image) return 1;
        return 0;
    },

    truncateText(str, max = 72) {
        if (!str) return '';
        const s = String(str).trim();
        if (s.length <= max) return { text: s, more: false };
        return { text: s.slice(0, max).trim() + '…', more: true };
    },

    /** zameen.com horizontal listing card */
    listingCardHTML(p, opts = {}) {
        const L = this.LABELS;
        const PH = this.PH;
        const link = opts.link !== false;
        const grid = opts.grid === true;
        const phone = (p.phone || this.getAgency().phone || PH.DEFAULT_AGENCY.phone).replace(/\s/g, '');
        const agency = this.getAgency();
        const loc = [p.area, p.city || 'Faisalabad'].filter(Boolean).join(', ');
        const price = PH.formatPriceZameen(p.price) + (p.purpose === 'rent' ? ' <small>/ month</small>' : '');
        const desc = this.truncateText(p.description || p.title, 85);
        const waText = 'Hello, I am interested in ' + p.title;
        const email = agency.email || PH.DEFAULT_AGENCY.email;
        const agencyLogo = agency.logo || 'assets/logo-header.png';
        const propUrl = this.propertyUrl(p.id);
        const added = PH.formatRelativeEn(p.createdAt);

        const statIcon = (type, val, label) =>
            val
                ? `<span class="zm-stat" title="${label}">
                <svg class="zm-stat-ico" viewBox="0 0 24 24" aria-hidden="true">${type === 'bed' ? '<path fill="currentColor" d="M7 14c-1.1 0-2 .9-2 2v2h14v-2c0-1.1-.9-2-2-2H7zm8-9H9v7h6V5z"/>' : type === 'bath' ? '<path fill="currentColor" d="M9 17H7v-3H5v4h14v-4h-2v3h-2v-5H9v5zm2-7a2 2 0 110 4 2 2 0 010-4z"/>' : '<path fill="currentColor" d="M3 21V8l9-4 9 4v13H3zm2-2h14v-9l-7-3.2L5 10v9z"/>'}</svg>
                ${val}${type === 'area' ? '' : ''}
               </span>`
                : '';

        const stats = [
            statIcon('bed', p.beds || '', 'Beds'),
            statIcon('bath', p.baths || '', 'Baths'),
            statIcon('area', p.size ? this.escapeHTML(p.size) : '', 'Area'),
        ]
            .filter(Boolean)
            .join('');

        const priceBlock = grid
            ? `<div class="zm-grid-price-row">
                <div class="zm-listing-price">${price}</div>
                <span class="zm-grid-type">${this.escapeHTML(L.type[p.type] || p.type)}</span>
               </div>`
            : `<div class="zm-list-price-row">
                <div class="zm-listing-price">${price}</div>
                <div class="zm-list-badges">
                    <span class="zm-list-purpose zm-list-purpose--${p.purpose}">${this.escapeHTML(L.purpose[p.purpose] || p.purpose)}</span>
                    <span class="zm-list-type">${this.escapeHTML(L.type[p.type] || p.type)}</span>
                </div>
               </div>`;

        const locationBlock = grid
            ? `<div class="zm-listing-location zm-grid-location">
                <svg class="zm-grid-loc-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z"/></svg>
                <span>${this.escapeHTML(loc)}</span>
               </div>`
            : `<div class="zm-listing-location zm-list-location">
                <svg class="zm-list-loc-ico" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z"/></svg>
                <span>${this.escapeHTML(loc)}</span>
               </div>`;

        const inner = `
        <article class="zm-listing zm-listing--zameen${grid ? ' zm-listing--grid' : ''}">
            <div class="zm-listing-media">
                ${this.listingMediaHTML(p)}
                <div class="zm-listing-media-tools">
                    <a href="${propUrl}" class="zm-media-tool" title="Location" aria-label="Location" onclick="event.stopPropagation()">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1114.5 9 2.5 2.5 0 0112 11.5z"/></svg>
                    </a>
                    <button type="button" class="zm-media-tool" data-share-id="${p.id}" title="Share" aria-label="Share" onclick="event.stopPropagation()">
                        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7a3.27 3.27 0 000-1.39l7.05-4.11A2.99 2.99 0 1014 4a2.99 2.99 0 00.05.5L7 8.61a3 3 0 100 4.78l7.05 4.11c.26.88 1.08 1.5 2 1.5a3 3 0 003-3 3 3 0 00-3-3z"/></svg>
                    </button>
                    <button type="button" class="fr-wishlist-btn zm-media-tool zm-media-wish${PH.isWishlisted(p.id) ? ' active' : ''}" data-wishlist-id="${p.id}" title="Wishlist" onclick="event.stopPropagation()">♥</button>
                </div>
            </div>
            <div class="zm-listing-content">
                <div class="zm-listing-toprow">
                    <div class="zm-listing-trust">
                        ${p.featured ? '<span class="zm-trust zm-trust-hot" title="Hot"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 23c-1.1 0-2-.9-2-2 0-.7.4-1.3 1-1.7-.6-2.1-.2-4.4 1.2-6.1C13.1 11.2 14 9.2 14 7c0-2.2 1.8-4 4-4 .3 2.1-.6 4.2-2 5.8 1.4-.3 2.8.1 3.8 1.2-1.1 1.4-2.8 2.2-4.6 2.2-.4 1.3-1.5 2.3-2.8 2.5.8.6 1.3 1.5 1.3 2.5 0 1.7-1.3 3-3 3z"/></svg></span>' : ''}
                        ${p.published !== false ? '<span class="zm-trust zm-trust-verified" title="Verified"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg></span>' : ''}
                    </div>
                    ${p.featured ? '<span class="zm-listing-tier"><span class="zm-tier-star">★</span> PREMIUM</span>' : ''}
                </div>
                ${priceBlock}
                ${locationBlock}
                ${stats ? `<div class="zm-listing-stats">${stats}</div>` : ''}
                <h2 class="zm-listing-title">${this.escapeHTML(p.title)}</h2>
                ${!grid && desc.text ? `<p class="zm-listing-excerpt">${this.escapeHTML(desc.text)}${desc.more ? ` <a href="${propUrl}" class="zm-listing-more" onclick="event.stopPropagation()">more</a>` : ''}</p>` : ''}
                <p class="zm-listing-added">${grid ? '' : 'Added: '}${added || 'recently'}</p>
                <div class="zm-listing-footer">
                    <div class="zm-listing-actions">
                        <a href="mailto:${email}?subject=${encodeURIComponent(p.title)}" class="zm-listing-btn zm-listing-email" onclick="event.stopPropagation()" aria-label="Email">
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                        </a>
                        <a href="${PH.whatsAppUrl(waText, phone)}" class="zm-listing-btn zm-listing-wa" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            <span class="zm-btn-label">WhatsApp</span>
                        </a>
                        <a href="tel:${phone}" class="zm-listing-btn zm-listing-call" onclick="event.stopPropagation()">
                            <svg viewBox="0 0 24 24"><path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.36 11.36 0 003.56.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.36 11.36 0 00.57 3.56 1 1 0 01-.25 1.01l-2.2 2.22z"/></svg>
                            <span class="zm-btn-label">CALL</span>
                        </a>
                    </div>
                    <img src="${agencyLogo}" alt="${this.escapeHTML(agency.name || 'ASK REAL ESTATE')}" class="zm-listing-agency" loading="lazy">
                </div>
            </div>
        </article>`;

        return link
            ? `<div class="zm-listing-wrap" data-href="${propUrl}" role="link" tabindex="0">${inner}</div>`
            : inner;
    },

    bindListingWraps(root) {
        if (!root) return;
        root.querySelectorAll('.zm-listing-wrap[data-href]').forEach((wrap) => {
            if (wrap.dataset.bound === '1') return;
            wrap.dataset.bound = '1';
            const go = () => {
                const href = wrap.getAttribute('data-href');
                if (href) location.href = href;
            };
            wrap.addEventListener('click', (e) => {
                if (e.target.closest('a, button, input, textarea, select')) return;
                go();
            });
            wrap.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    go();
                }
            });
        });
    },

    countByArea(listings) {
        const map = {};
        listings.forEach((p) => {
            const key = (p.area || p.city || 'فیصل آباد').trim();
            map[key] = (map[key] || 0) + 1;
        });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ur'))
            .map(([name, count]) => ({ name, count }));
    },

    countByType(listings, purpose) {
        const filtered = purpose ? listings.filter((p) => p.purpose === purpose) : listings;
        const map = {};
        filtered.forEach((p) => {
            map[p.type] = (map[p.type] || 0) + 1;
        });
        return map;
    },

    paginate(list, page, perPage = 25) {
        const total = list.length;
        const pages = Math.max(1, Math.ceil(total / perPage));
        const p = Math.min(Math.max(1, page), pages);
        return {
            items: list.slice((p - 1) * perPage, p * perPage),
            page: p,
            pages,
            total,
            perPage,
            from: total ? (p - 1) * perPage + 1 : 0,
            to: Math.min(p * perPage, total),
        };
    },

    renderPagination(containerId, pageInfo, onPage) {
        const el = document.getElementById(containerId);
        if (!el || pageInfo.pages <= 1) {
            if (el) el.innerHTML = '';
            return;
        }

        const { page, pages } = pageInfo;
        const maxNums = 8;
        let start = 1;
        let end = Math.min(pages, maxNums);

        if (pages > maxNums) {
            start = Math.max(1, page - 3);
            end = Math.min(pages, start + maxNums - 1);
            if (end - start + 1 < maxNums) {
                start = Math.max(1, end - maxNums + 1);
            }
        }

        let html = '<nav class="zm-pagination zm-pagination--zameen" aria-label="Pages">';

        for (let i = start; i <= end; i++) {
            html += `<button type="button" class="zm-page-btn${i === page ? ' active' : ''}" data-page="${i}">${i}</button>`;
        }

        if (page < pages) {
            html += `<button type="button" class="zm-page-btn zm-page-next" data-page="${page + 1}" aria-label="Next page">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/></svg>
            </button>`;
        }

        html += '</nav>';
        el.innerHTML = html;
        el.querySelectorAll('[data-page]').forEach((btn) => {
            btn.addEventListener('click', () => onPage(Number(btn.getAttribute('data-page'))));
        });
    },

    initHeader() {
        PropertyHub.ensureDefaultAgency();
        const agency = this.getAgency();
        const phone = agency.phone || PropertyHub.DEFAULT_AGENCY.phone;
        const waMsg =
            agency.contactNote ||
            'سلام، میں ASK REAL ESTATE FAISALABAD سے پراپرٹی کے بارے میں معلومات چاہتا/چاہتی ہوں۔';

        document.querySelectorAll('[data-agency-phone]').forEach((el) => {
            el.href = 'tel:' + phone.replace(/\s/g, '');
            if (el.dataset.phonePrefix !== undefined) {
                el.textContent = (el.dataset.phonePrefix || '') + phone;
            } else if (!el.dataset.keepHtml) {
                el.textContent = phone;
            }
            el.style.display = '';
        });

        document.querySelectorAll('[data-agency-contact]').forEach((el) => {
            el.textContent = agency.contactName || PropertyHub.DEFAULT_AGENCY.contactName;
        });

        document.querySelectorAll('[data-agency-note]').forEach((el) => {
            el.textContent = agency.contactNote || PropertyHub.DEFAULT_AGENCY.contactNote;
        });

        document.querySelectorAll('[data-agency-wa]').forEach((el) => {
            const waPhone = agency.whatsapp || agency.phone || PropertyHub.DEFAULT_AGENCY.whatsapp || phone;
            el.href = PropertyHub.whatsAppUrl(waMsg, waPhone);
            if (el.dataset.waLabel) el.textContent = el.dataset.waLabel;
        });

        const brand = agency.name || PropertyHub.BRAND_NAME;
        document.querySelectorAll('.logo-img').forEach((img) => {
            img.alt = brand;
        });

        if (!document.getElementById('zmFloatWa') && !document.body.classList.contains('fr-site')) {
            const float = document.createElement('a');
            float.id = 'zmFloatWa';
            float.className = 'zm-float-wa';
            float.href = PropertyHub.whatsAppUrl(waMsg, agency.whatsapp || phone);
            float.target = '_blank';
            float.rel = 'noopener noreferrer';
            float.title = 'WhatsApp — +923215315603';
            float.innerHTML = '<span>WhatsApp</span>';
            document.body.appendChild(float);
        }
    },

    DEFAULT_IMAGES: {
        house: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
        room: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
        flat: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&auto=format&fit=crop&q=80',
        penthouse: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80',
        farmhouse: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
        shop: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&auto=format&fit=crop&q=80',
        office: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
        hall: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
        building: 'https://images.unsplash.com/photo-1486718448742-163663c566ace?w=800&auto=format&fit=crop&q=80',
        factory: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
        warehouse: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=800&auto=format&fit=crop&q=80',
        plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        residential_plot: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80',
        commercial_plot: 'https://images.unsplash.com/photo-1505843513577-59cfe5f6bde6?w=800&auto=format&fit=crop&q=80',
        agricultural: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&auto=format&fit=crop&q=80',
        industrial: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&auto=format&fit=crop&q=80',
        lower_portion: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        other: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&auto=format&fit=crop&q=80',
        default: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=80',
    },

    getDefaultImage(type) {
        return this.DEFAULT_IMAGES[type] || this.DEFAULT_IMAGES.default;
    },

    propertyImageHTML(p, alt = '') {
        const src = p.image || this.getDefaultImage(p.type);
        const safeAlt = this.escapeHTML(alt || p.title || 'پراپرٹی');
        return `<img src="${src}" alt="${safeAlt}" loading="lazy">`;
    },

    FAISALABAD_AREAS: [
        'Abdullah Garden',
        'Amin Town',
        'Al Najaf Colony',
        'Al Noor Garden',
        'Aziz Fatima Road',
        'Canal Expressway',
        'Canal Road',
        'Chen One Road',
        'Chak 208 Road',
        'Civil Lines',
        'Citi Housing',
        'D Ground',
        'Daewoo Road',
        'Eden Gardens',
        'Eden Orchard',
        'Eden Valley',
        'Eden Villas',
        'Four Season Housing',
        'Ghalib City',
        'Gulistan Colony No 1',
        'Gulshan e Madina',
        'Hamza Villas',
        'Ismail City',
        'Islamia Park',
        'Jail Road',
        'Jaranwala Road',
        'Kareem City',
        'Khawaja Islam Road',
        'Khayaban Colony',
        'Khayaban Colony 2',
        'Khayaban Colony 3',
        'Khayaban Gardens',
        'Kohinoor Town',
        'Lahore Sheikhupura Faisalabad Road',
        'Lasani Garden',
        'Lasani Town',
        'Lower Canal Road',
        'Madina Town',
        'Makkah Garden',
        'Mannan Town',
        'Mian Zulfiqar Ali Shahid Road',
        'Millat Chowk',
        'Millat Road',
        'Muslim Town',
        'Narwala Road',
        'Officers Colony 2',
        'Paradise Valley',
        'Peoples Colony No 1',
        'Peoples Colony No 2',
        'Punjab Govt Servants Housing Foundation',
        'Riaz ul Jannah',
        'Saeed Colony',
        'Samundari Road',
        'Sargodha Road',
        'Satiana Road',
        'Shahzad Colony',
        'Sitara Sapna City',
        'Sitara Supreme City',
        'Sitara Valley',
        'Susan Road',
        'Umair Town',
        'University Town',
        'Wapda City',
    ],
};
