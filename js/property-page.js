/**
 * Zameen-style property detail page
 */
(function () {
    const Z = ZameenSite;
    const L = Z.LABELS;
    const PH = Z.PH;

    function renderProperty(p) {
        document.title = p.title + ' — ASK REAL ESTATE FAISALABAD';

        const gallery = `<div class="zm-prop-gallery">${Z.propertyImageHTML(p)}</div>`;

        const chips = [];
        if (p.size) chips.push(`<span class="zm-chip">${Z.escapeHTML(p.size)}</span>`);
        if (p.beds) chips.push(`<span class="zm-chip">${p.beds} Beds</span>`);
        if (p.baths) chips.push(`<span class="zm-chip">${p.baths} Baths</span>`);
        chips.push(`<span class="zm-chip">${L.type[p.type]}</span>`);
        chips.push(`<span class="zm-chip">${L.purpose[p.purpose]}</span>`);

        const phone = p.phone || Z.getAgency().phone || PH.DEFAULT_AGENCY.phone;
        const contactName = Z.getAgency().contactName || p.contactName || PH.DEFAULT_AGENCY.contactName;
        const agency = Z.getAgency().name || PH.BRAND_NAME;
        const note = Z.getAgency().contactNote || PH.DEFAULT_AGENCY.contactNote;

        document.getElementById('propertyMain').innerHTML = `
        <div class="zm-prop-main">
            ${gallery}
            <div class="zm-prop-content">
                ${p.featured ? '<span class="zm-tag zm-tag-hot">SUPER HOT</span>' : ''}
                <h1 class="zm-prop-title">${Z.escapeHTML(p.title)}</h1>
                <p class="zm-prop-location">📍 ${Z.escapeHTML(p.city)}${p.area ? '، ' + Z.escapeHTML(p.area) : ''}</p>
                <div class="zm-prop-price">${PH.formatPriceZameen(p.price)}${p.purpose === 'rent' ? ' <span>/ ماہ</span>' : ''}</div>
                <div class="zm-card-chips">${chips.join('')}</div>
                <div class="zm-prop-desc">
                    <h2>تفصیل</h2>
                    <p>${Z.escapeHTML(p.description || 'تفصیل دستیاب نہیں۔ رابطہ کریں۔')}</p>
                </div>
                <table class="zm-prop-table">
                    <tr><td>قسم</td><td>${L.type[p.type]}</td></tr>
                    <tr><td>مقصد</td><td>${L.purpose[p.purpose]}</td></tr>
                    <tr><td>شہر</td><td>${Z.escapeHTML(p.city || '—')}</td></tr>
                    <tr><td>علاقہ</td><td>${Z.escapeHTML(p.area || '—')}</td></tr>
                    ${p.size ? `<tr><td>سائز</td><td>${Z.escapeHTML(p.size)}</td></tr>` : ''}
                </table>
            </div>
        </div>
        <aside class="zm-prop-sidebar">
            <div class="zm-agent-card">
                <p class="zm-agent-note">${Z.escapeHTML(note)}</p>
                <h3>ایجنٹ سے رابطہ</h3>
                <p class="zm-agent-name">${Z.escapeHTML(contactName)}</p>
                <p class="zm-agent-agency">${Z.escapeHTML(agency)}</p>
                <a href="tel:${phone.replace(/\s/g, '')}" class="zm-btn-call zm-btn-block">📞 ${Z.escapeHTML(phone)}</a>
                <a href="${PH.whatsAppUrl('سلام ' + contactName + '، میں ' + p.title + ' کے بارے میں معلومات چاہتا/چاہتی ہوں۔', phone)}" class="zm-btn-wa zm-btn-block" target="_blank" rel="noopener noreferrer">WhatsApp</a>
                <a href="${Z.searchUrl({ purpose: p.purpose, type: p.type, city: p.area || p.city })}" class="zm-btn-outline zm-btn-block">مشابہ تلاش</a>
                <button type="button" class="zm-btn-outline zm-btn-block fr-wishlist-page-btn ${PropertyHub.isWishlisted(p.id) ? 'active' : ''}" data-wishlist-id="${p.id}">♥ پسندیدہ میں شامل</button>
            </div>
        </aside>`;

        const similar = Z.getListings()
            .filter((x) => x.id !== p.id && (x.type === p.type || x.purpose === p.purpose))
            .slice(0, 4);
        if (similar.length) {
            document.getElementById('similarSection').classList.remove('hidden');
            document.getElementById('similarGrid').innerHTML = similar
                .map((s) => Z.cardHTML(s, { compact: true }))
                .join('');
        }
    }

    document.addEventListener('DOMContentLoaded', async () => {
        FrLayout.initCommon();
        if (window.LocalDbAuth?.isConfigured()) {
            try {
                await LocalDbAuth.syncPublicListingsToLocal();
            } catch (e) {
                console.warn('local db public listings', e);
            }
        }
        const q = Z.parseQuery();
        const p = Z.getListingById(q.id);
        if (!p) {
            document.getElementById('propertyMain').innerHTML =
                '<div class="zm-empty"><h2>پراپرٹی نہیں ملی</h2><p><a href="search.html">واپس تلاش</a></p></div>';
            return;
        }
        renderProperty(p);
        FrLayout.initWishlistButtons(document.getElementById('propertyMain'));
    });
})();
