/**
 * Homepage — faisalabadrealtors.com style (full features)
 */
(function () {
    const Z = ZameenSite;
    const PH = PropertyHub;
    const FR = FrLayout;
    let homePurpose = 'sale';

    function propCardHTML(p) {
        const L = Z.LABELS;
        const img = p.image
            ? `<img src="${p.image}" alt="">`
            : `<img src="${Z.getDefaultImage(p.type)}" alt="" loading="lazy">`;
        const tag = p.purpose === 'rent' ? 'کرایہ' : 'فروخت';
        const meta = [];
        if (p.beds) meta.push(`🛏 ${p.beds}`);
        if (p.baths) meta.push(`🚿 ${p.baths}`);
        if (p.floors) meta.push(`🏢 ${p.floors}`);
        if (p.size) meta.push(`📐 ${Z.escapeHTML(p.size)}`);

        return `
        <a href="${Z.propertyUrl(p.id)}" class="fr-prop-card">
            <div class="fr-prop-img">${img}${FR.wishlistBtnHTML(p.id)}<span class="fr-prop-tag">${tag}</span></div>
            <div class="fr-prop-body">
                <div class="fr-prop-price">${PH.formatPriceZameen(p.price)}${p.purpose === 'rent' ? ' / ماہ' : ''}</div>
                <div class="fr-prop-title">${Z.escapeHTML(p.title)}</div>
                <div class="fr-prop-loc">${Z.escapeHTML(p.area || p.city || 'فیصل آباد')}</div>
                ${meta.length ? `<div class="fr-prop-meta">${meta.join(' · ')}</div>` : ''}
            </div>
        </a>`;
    }

    function renderPropertySections() {
        const list = Z.getListings();
        const rent = list.filter((p) => p.purpose === 'rent').slice(0, 6);
        const sale = list.filter((p) => p.purpose === 'sale').slice(0, 6);

        const rentEl = document.getElementById('rentProperties');
        const saleEl = document.getElementById('saleProperties');

        rentEl.innerHTML = rent.length
            ? rent.map(propCardHTML).join('')
            : '<p class="fr-empty-msg">ابھی کرایہ کی لسٹنگ نہیں۔</p>';

        saleEl.innerHTML = sale.length
            ? sale.map(propCardHTML).join('')
            : '<p class="fr-empty-msg">ابھی فروخت کی لسٹنگ نہیں۔</p>';

        FR.initWishlistButtons(document);
    }

    function renderAreas() {
        const dl = document.getElementById('areaList');
        if (dl) {
            dl.innerHTML = Z.FAISALABAD_AREAS.map((a) => `<option value="${a}"></option>`).join('');
        }
    }

    function initSearch() {
        document.querySelectorAll('.fr-search-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.fr-search-tab').forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                homePurpose = tab.getAttribute('data-purpose');
            });
        });

        document.getElementById('advancedToggle')?.addEventListener('click', () => {
            document.getElementById('advancedPanel')?.classList.toggle('open');
        });

        document.getElementById('advancedOk')?.addEventListener('click', () => {
            document.getElementById('advancedPanel')?.classList.remove('open');
        });

        document.getElementById('homeSearchForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            location.href = Z.searchUrl({
                purpose: homePurpose,
                type: document.getElementById('homeCategory').value,
                city: document.getElementById('homeCity').value,
                min: document.getElementById('homeMin')?.value,
                max: document.getElementById('homeMax')?.value,
                beds: document.getElementById('homeBeds')?.value,
                baths: document.getElementById('homeBaths')?.value,
                floors: document.getElementById('homeFloors')?.value,
            });
        });
    }

    function initInquiryForm() {
        document.getElementById('inquiryForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const agency = PH.getAgency();
            const phone = agency.phone || PH.DEFAULT_AGENCY.phone;
            const typeLabels = { buy: 'خریداری', rent: 'کرایہ', sale: 'فروخت' };
            const roleLabels = { buyer: 'خریدار', owner: 'مالک', agent: 'ایجنٹ' };
            const inquiryType = document.getElementById('inquiryType').value;
            const inquiryRole = document.getElementById('inquiryRole').value;
            const propertyType = document.getElementById('inquiryTypeProp').value;
            const name = document.getElementById('inquiryName').value;
            const inquiryPhone = document.getElementById('inquiryPhone').value;
            const message = document.getElementById('inquiryMsg').value;
            const msg = [
                'نیا استفسار — ASK REAL ESTATE',
                'نام: ' + name,
                'فون: ' + inquiryPhone,
                'استفسار: ' + (typeLabels[inquiryType] || ''),
                'کردار: ' + (roleLabels[inquiryRole] || ''),
                'پراپرٹی: ' + propertyType,
                message,
            ]
                .filter(Boolean)
                .join('\n');
            window.open(PH.whatsAppUrl(msg, phone), '_blank');

            const inquiryRow = {
                name,
                phone: inquiryPhone,
                inquiryType: typeLabels[inquiryType] || inquiryType,
                role: roleLabels[inquiryRole] || inquiryRole,
                propertyType,
                message,
            };
            PH.addInquiry(inquiryRow);
            await PH.persistDataRow('Inquiries', PH.inquirySheetRow(inquiryRow));
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        FR.initCommon();
        PH.syncPublicCatalog();
        if (window.LocalDbAuth?.isConfigured()) {
            try {
                await LocalDbAuth.syncPublicListingsToLocal();
            } catch (e) {
                console.warn('local db public listings', e);
            }
        }
        renderAreas();
        renderPropertySections();
        FR.renderServices('homeServices');
        FR.initCeoPhoto();
        FR.renderTeam('homeTeam');
        FR.renderBlogs('homeBlog', 3);
        FR.renderPartners('homePartners');
        initSearch();
        initInquiryForm();
    });
})();
