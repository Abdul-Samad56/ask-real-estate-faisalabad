/**
 * پراپرٹی ہب — Main UI
 */
const PH = PropertyHub;
const LABELS = PH.LABELS;

let pendingImages = [];
let pendingCeoPhoto = null;
let pendingSubmissionId = null;

function loadProperties() {
    return PH.loadProperties();
}
function saveProperties(list) {
    PH.saveProperties(list);
}
function loadClients() {
    return PH.loadClients();
}
function saveClients(list) {
    PH.saveClients(list);
}
function uid() {
    return PH.uid();
}
function formatPrice(n) {
    return PH.formatPrice(n);
}
function formatDate(iso) {
    return PH.formatDate(iso);
}
function escapeHTML(str) {
    return PH.escapeHTML(str);
}

function syncDealerSessionFromLocalDb() {
    if (!window.LocalDbAuth?.isLoggedIn() || !LocalDbAuth.isAdmin()) return null;
    const user = LocalDbAuth.getUser();
    PH.setSession({
        id: user.id,
        name: LocalDbAuth.displayName(),
        role: 'admin',
    });
    return user;
}

function seedSampleData() {
    if (PH.loadAllProperties().length > 0) return;
    const session = PH.getSession();
    const dealerId = session?.userId;
    const now = new Date().toISOString();
    const props = [
        {
            id: uid(),
            title: '5 مرلہ مکان DHA Phase 6',
            purpose: 'sale',
            type: 'house',
            price: 35000000,
            city: 'لاہور',
            area: 'DHA Phase 6',
            size: '5 مرلہ',
            beds: 5,
            baths: 6,
            owner: 'احمد علی',
            phone: '0300-1234567',
            description: 'برانڈ نیو، ڈبل یونٹ، کورنر',
            featured: true,
            published: true,
            images: [],
            dealerId,
            createdAt: now,
        },
        {
            id: uid(),
            title: 'دکان گلبرگ مارکیٹ',
            purpose: 'rent',
            type: 'shop',
            price: 150000,
            city: 'لاہور',
            area: 'گلبرگ III',
            size: '400 sq ft',
            beds: 0,
            baths: 1,
            owner: 'فاطمہ خان',
            phone: '0321-9876543',
            description: 'بزنس اسٹریٹ، اچھی لوکیشن',
            featured: false,
            published: false,
            images: [],
            dealerId,
            createdAt: now,
        },
    ];
    PH._saveRaw(PH.STORAGE.properties, props);
    PH._saveRaw(PH.STORAGE.clients, [
        {
            id: uid(),
            name: 'علی حسن',
            phone: '0333-1112233',
            purpose: 'buy',
            type: 'house',
            budgetMin: 25000000,
            budgetMax: 40000000,
            city: 'لاہور',
            areas: 'DHA, Bahria',
            minSize: '5 مرلہ',
            minBeds: 4,
            notes: 'فوری ضرورت',
            status: 'active',
            dealerId,
            createdAt: now,
        },
    ]);
    PH.syncPublicCatalog();
}

function clientPurposeToPropertyPurpose(clientPurpose) {
    if (clientPurpose === 'buy') return 'sale';
    if (clientPurpose === 'rent') return 'rent';
    if (clientPurpose === 'sell') return null;
    if (clientPurpose === 'lease_out') return 'rent';
    return null;
}

function scoreMatch(client, property) {
    let score = 0;
    const wantPurpose = clientPurposeToPropertyPurpose(client.purpose);
    if (wantPurpose && property.purpose === wantPurpose) score += 25;
    else if (!wantPurpose) score += 10;
    if (client.type === property.type) score += 25;
    if (client.city && property.city) {
        const c = client.city.trim().toLowerCase();
        const p = property.city.trim().toLowerCase();
        if (p.includes(c) || c.includes(p)) score += 15;
    }
    if (client.areas && property.area) {
        const areas = client.areas.split(/[,،]/).map((a) => a.trim().toLowerCase()).filter(Boolean);
        const propArea = property.area.toLowerCase();
        if (areas.some((a) => propArea.includes(a) || a.includes(propArea))) score += 15;
    }
    const price = Number(property.price) || 0;
    const min = Number(client.budgetMin) || 0;
    const maxB = Number(client.budgetMax) || Infinity;
    if (price >= min && price <= maxB) score += 20;
    else if (price <= maxB * 1.15 && price >= min * 0.85) score += 10;
    if (client.minBeds && property.beds >= client.minBeds) score += 5;
    return Math.min(score, 100);
}

function getMatchesForClient(clientId) {
    const client = loadClients().find((c) => c.id === clientId);
    if (!client || client.status === 'closed') return [];
    return loadProperties()
        .map((p) => ({ property: p, score: scoreMatch(client, p) }))
        .filter((m) => m.score >= 40)
        .sort((a, b) => b.score - a.score);
}

function shareWhatsApp(id) {
    const p = loadProperties().find((x) => x.id === id);
    if (!p) return;
    const agency = PH.getAgency();
    const url = PH.whatsAppUrl(PH.propertyShareText(p), agency.phone || p.phone);
    window.open(url, '_blank');
}

function propertyCardHTML(p, options = {}) {
    const { showActions = true, showScore } = options;
    const purposeLabel = LABELS.purpose[p.purpose] || p.purpose;
    const imgContent = p.images?.length
        ? `<img src="${p.images[0]}" alt="">`
        : `<span>${LABELS.icons[p.type] || '🏠'}</span>`;

    const tags = [];
    if (p.featured) tags.push('<span class="zm-tag zm-tag-hot">SUPER HOT</span>');
    tags.push(
        `<span class="zm-tag ${p.purpose === 'rent' ? 'zm-tag-rent' : 'zm-tag-purpose'}">${purposeLabel}</span>`
    );
    if (p.published) tags.push('<span class="zm-tag zm-tag-purpose">شائع</span>');

    const chips = [];
    if (p.size) chips.push(`<span class="zm-chip">${escapeHTML(p.size)}</span>`);
    if (p.beds) chips.push(`<span class="zm-chip">${p.beds} Beds</span>`);
    if (p.baths) chips.push(`<span class="zm-chip">${p.baths} Baths</span>`);
    chips.push(`<span class="zm-chip">${LABELS.type[p.type]}</span>`);

    const scoreHTML = showScore != null ? `<span class="match-score">${showScore}% میچ</span>` : '';

    const actions = showActions
        ? `<div class="zm-card-foot" onclick="event.stopPropagation()">
            ${scoreHTML}
            <button type="button" class="zm-btn-wa" data-whatsapp="${p.id}">WhatsApp</button>
            <button type="button" class="zm-btn-outline" data-edit-property="${p.id}">ترمیم</button>
            <button type="button" class="zm-btn-outline" style="border-color:#e03e3e;color:#e03e3e" data-delete-property="${p.id}">حذف</button>
           </div>`
        : '';

    const priceHtml =
        PH.formatPriceZameen(p.price) + (p.purpose === 'rent' ? ' <span>/ ماہ</span>' : '');

    return `
    <article class="zm-card" data-property-id="${p.id}">
        <div class="zm-card-img">
            ${imgContent}
            <div class="zm-card-tags">${tags.join('')}</div>
        </div>
        <div class="zm-card-body">
            <div>
                <div class="zm-card-price">${priceHtml}</div>
                <h3 class="zm-card-title">${escapeHTML(p.title)}</h3>
                <p class="zm-card-location">📍 ${escapeHTML(p.city)}${p.area ? '، ' + escapeHTML(p.area) : ''}</p>
                <div class="zm-card-chips">${chips.join('')}</div>
            </div>
            ${actions}
        </div>
    </article>`;
}

function renderImagePreview() {
    const el = document.getElementById('propImagePreview');
    if (!el) return;
    el.innerHTML = pendingImages
        .map(
            (src, i) =>
                `<div class="preview-thumb"><img src="${src}" alt=""><button type="button" class="preview-remove" data-remove-img="${i}">&times;</button></div>`
        )
        .join('');
}

function renderDashboard() {
    const properties = loadProperties();
    const clients = loadClients().filter((c) => c.status === 'active');

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card"><div class="stat-value">${properties.length}</div><div class="stat-label">کل لسٹنگز</div></div>
        <div class="stat-card"><div class="stat-value">${properties.filter((p) => p.purpose === 'sale').length}</div><div class="stat-label">فروخت</div></div>
        <div class="stat-card"><div class="stat-value">${properties.filter((p) => p.purpose === 'rent').length}</div><div class="stat-label">کرایہ</div></div>
        <div class="stat-card"><div class="stat-value">${properties.filter((p) => p.published).length}</div><div class="stat-label">شائع شدہ</div></div>
        <div class="stat-card"><div class="stat-value">${clients.length}</div><div class="stat-label">فعال کلائنٹس</div></div>
        <div class="stat-card"><div class="stat-value">${PH.loadOwnerSubmissions().filter((s) => s.status === 'pending').length}</div><div class="stat-label">نئی مالکان درخواست</div></div>
    `;

    const recentP = [...properties].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);
    document.getElementById('recentProperties').innerHTML = recentP.length
        ? recentP.map((p) => `<div class="mini-item" data-goto-property="${p.id}"><span>${escapeHTML(p.title)}</span><span>${formatPrice(p.price)}</span></div>`).join('')
        : '<p class="empty-msg">کوئی لسٹنگ نہیں</p>';

    const recentC = [...loadClients()].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')).slice(0, 5);
    document.getElementById('recentClients').innerHTML = recentC.length
        ? recentC.map((c) => `<div class="mini-item" data-goto-client="${c.id}"><span>${escapeHTML(c.name)}</span><span>${LABELS.clientPurpose[c.purpose]}</span></div>`).join('')
        : '<p class="empty-msg">کوئی کلائنٹ نہیں</p>';
}

function filterProperties(list) {
    const purpose = document.getElementById('filterPropertyPurpose')?.value;
    const type = document.getElementById('filterPropertyType')?.value;
    let out = [...list];
    if (purpose) out = out.filter((p) => p.purpose === purpose);
    if (type) out = out.filter((p) => p.type === type);
    return out;
}

function renderProperties(extraFilter) {
    let list = loadProperties();
    list = filterProperties(list);

    if (extraFilter) {
        const { purpose, type, city, minPrice, maxPrice } = extraFilter;
        if (purpose) list = list.filter((p) => p.purpose === purpose);
        if (type) list = list.filter((p) => p.type === type);
        if (city) {
            const q = city.trim().toLowerCase();
            list = list.filter(
                (p) =>
                    (p.city && p.city.toLowerCase().includes(q)) ||
                    (p.area && p.area.toLowerCase().includes(q)) ||
                    (p.title && p.title.toLowerCase().includes(q))
            );
        }
        if (minPrice) list = list.filter((p) => Number(p.price) >= Number(minPrice));
        if (maxPrice) list = list.filter((p) => Number(p.price) <= Number(maxPrice));
    }

    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (b.createdAt || '').localeCompare(a.createdAt || ''));

    const grid = document.getElementById('propertiesGrid');
    const empty = document.getElementById('propertiesEmpty');
    if (list.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
    } else {
        empty.classList.add('hidden');
        grid.innerHTML = list.map((p) => propertyCardHTML(p)).join('');
    }
}

function renderClients() {
    const list = [...loadClients()].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
    const container = document.getElementById('clientsList');
    const empty = document.getElementById('clientsEmpty');

    const select = document.getElementById('matchClientSelect');
    const current = select.value;
    select.innerHTML =
        '<option value="">کلائنٹ منتخب کریں</option>' +
        list
            .filter((c) => c.status !== 'closed')
            .map((c) => `<option value="${c.id}">${escapeHTML(c.name)} — ${LABELS.clientPurpose[c.purpose]}</option>`)
            .join('');
    select.value = current;

    if (list.length === 0) {
        container.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    container.innerHTML = list
        .map((c) => {
            const budget =
                c.budgetMin || c.budgetMax
                    ? `${c.budgetMin ? formatPrice(c.budgetMin) : '—'} سے ${c.budgetMax ? formatPrice(c.budgetMax) : '—'}`
                    : 'بجٹ نہیں';
            return `
        <div class="client-card status-${c.status}">
            <div>
                <div class="client-name">${escapeHTML(c.name)} <span class="status-pill ${c.status === 'closed' ? 'closed' : ''}">${LABELS.status[c.status]}</span></div>
                <div class="client-requirement">${LABELS.clientPurpose[c.purpose]} • ${LABELS.type[c.type]} • ${escapeHTML(c.city || 'کوئی شہر')} ${c.areas ? '• ' + escapeHTML(c.areas) : ''}</div>
                <div class="client-budget">${budget}</div>
                <div style="font-size:0.85rem;color:var(--text-muted);margin-top:0.35rem">
                    <a href="tel:${c.phone}">${escapeHTML(c.phone)}</a>
                    <a class="wa-link" href="${PH.whatsAppUrl('سلام ' + c.name, c.phone)}" target="_blank">WhatsApp</a>
                    ${c.notes ? ' • ' + escapeHTML(c.notes) : ''}
                </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:0.5rem">
                <button class="btn btn-outline btn-sm" data-match-client="${c.id}">میچ دیکھیں</button>
                <button class="btn btn-outline btn-sm" data-edit-client="${c.id}">ترمیم</button>
                <button class="btn btn-danger btn-sm" data-delete-client="${c.id}">حذف</button>
            </div>
        </div>`;
        })
        .join('');
}

function renderMatches(clientId) {
    const results = document.getElementById('matchesResults');
    const empty = document.getElementById('matchesEmpty');

    if (!clientId) {
        results.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    const matches = getMatchesForClient(clientId);
    const client = loadClients().find((c) => c.id === clientId);

    if (!matches.length) {
        results.innerHTML = `<p class="empty-msg">${escapeHTML(client?.name || '')} کے لیے 40% سے اوپر کوئی میچ نہیں۔</p>`;
        return;
    }

    results.innerHTML = `
        <p style="margin-bottom:1rem;font-family:var(--font-urdu)"><strong>${escapeHTML(client.name)}</strong> کے لیے ${matches.length} مناسب پراپرٹیز</p>
        <div class="match-list zm-grid">
            ${matches.map((m) => propertyCardHTML(m.property, { showScore: m.score })).join('')}
        </div>`;
}

function showPropertyDetail(id) {
    const p = loadProperties().find((x) => x.id === id);
    if (!p) return;
    const imgs =
        p.images?.length > 0
            ? `<div class="detail-gallery">${p.images.map((src) => `<img src="${src}" alt="">`).join('')}</div>`
            : '';

    document.getElementById('detailTitle').textContent = p.title;
    document.getElementById('detailBody').innerHTML = `
        ${imgs}
        <div class="detail-price zm-card-price">${PH.formatPriceZameen(p.price)}${p.purpose === 'rent' ? ' / ماہ' : ''}</div>
        <div class="detail-actions-row">
            <button type="button" class="btn btn-whatsapp" data-whatsapp="${p.id}">WhatsApp پر بھیجیں</button>
            ${p.published ? '<span class="badge-published">ویب پر شائع</span>' : ''}
        </div>
        <div class="detail-row"><span>مقصد</span><span>${LABELS.purpose[p.purpose]}</span></div>
        <div class="detail-row"><span>قسم</span><span>${LABELS.type[p.type]}</span></div>
        <div class="detail-row"><span>مقام</span><span>${escapeHTML(p.city)} ${p.area ? '، ' + escapeHTML(p.area) : ''}</span></div>
        <div class="detail-row"><span>سائز</span><span>${escapeHTML(p.size || '—')}</span></div>
        <div class="detail-row"><span>بیڈ / باتھ</span><span>${p.beds || 0} / ${p.baths || 0}</span></div>
        <div class="detail-row"><span>مالک</span><span>${escapeHTML(p.owner || '—')}</span></div>
        <div class="detail-row"><span>فون</span><span><a href="tel:${p.phone}">${escapeHTML(p.phone || '—')}</a></span></div>
        <div class="detail-row"><span>تفصیل</span><span>${escapeHTML(p.description || '—')}</span></div>
        <div class="detail-row"><span>تاریخ</span><span>${formatDate(p.createdAt)}</span></div>
    `;
    document.getElementById('detailModal').showModal();
}

let cloudSubmissionsCache = [];

function findSubmission(subId) {
    const local = PH.loadOwnerSubmissions().find((s) => s.id === subId);
    if (local) return local;
    return cloudSubmissionsCache.find((s) => s.id === subId);
}

function openPropertyModalFromSubmission(subId) {
    const sub = findSubmission(subId);
    if (!sub) return;
    pendingSubmissionId = subId;
    openPropertyModal();
    document.getElementById('propTitle').value = sub.title || '';
    document.getElementById('propPurpose').value = sub.purpose;
    document.getElementById('propType').value = sub.type;
    document.getElementById('propPrice').value = sub.price;
    document.getElementById('propCity').value = sub.city || 'فیصل آباد';
    document.getElementById('propArea').value = sub.area || '';
    document.getElementById('propSize').value = sub.size || '';
    document.getElementById('propBeds').value = sub.beds || '';
    document.getElementById('propBaths').value = sub.baths || '';
    document.getElementById('propOwner').value = sub.ownerName || '';
    document.getElementById('propPhone').value = sub.ownerPhone || '';
    const desc = [sub.description, sub.address ? 'پتہ: ' + sub.address : ''].filter(Boolean).join('\n\n');
    document.getElementById('propDescription').value = desc;
    document.getElementById('propFeatured').checked = false;
    document.getElementById('propPublished').checked = false;
    pendingImages = [...(sub.images || [])];
    renderImagePreview();
    document.getElementById('propertyModalTitle').textContent = 'مالک کی درخواست — لسٹنگ';
}

async function syncCloudSubmissionsToLocal() {
    if (!window.CloudAuth?.isConfigured()) return [];
    await CloudAuth.waitReady();
    if (!CloudAuth.isLoggedIn() || !CloudAuth.isAdmin()) {
        throw new Error('Cloud sync کے لیے admin Google/Facebook لاگ ان ضروری ہے');
    }
    const cloud = await CloudAuth.fetchAllSubmissions();
    cloudSubmissionsCache = cloud.map((r) => CloudAuth.toLocalSubmission(r));
    if (window.OwnerAuth) OwnerAuth.mirrorCloudSubmissionsToLocal(cloud);
    return cloudSubmissionsCache;
}

async function syncLocalDbSubmissionsToLocal() {
    if (!window.LocalDbAuth?.isConfigured()) return [];
    const rows = await LocalDbAuth.fetchAllSubmissions();
    const local = rows.map((r) => LocalDbAuth.toLocalSubmission(r));
    local.forEach((sub) => PH.upsertOwnerSubmission(sub));
    return local;
}

function submissionAccountLabel(sub) {
    const email = sub.submitterEmail || sub.ownerEmail || '';
    const name = sub.submitterName || sub.ownerName || '';
    if (email && name) return `${name} (${email})`;
    return email || name || 'نامعلوم اکاؤنٹ';
}

async function renderOwnerSubmissions() {
    let list = [...PH.loadOwnerSubmissions()];

    const hint = document.getElementById('submissionsCloudHint');
    const syncBtn = document.getElementById('btnSyncCloudSubmissions');

    if (window.LocalDbAuth?.isConfigured()) {
        syncBtn?.removeAttribute('hidden');
        try {
            await syncLocalDbSubmissionsToLocal();
            list = [...PH.loadOwnerSubmissions()];
            hint?.classList.add('hidden');
        } catch (e) {
            console.warn('local db submissions', e);
            if (hint) {
                hint.classList.remove('hidden');
                hint.textContent = 'Local database sync ناکام: ' + (e.message || 'unknown');
            }
        }
    } else if (window.CloudAuth?.isConfigured()) {
        syncBtn?.removeAttribute('hidden');
        try {
            await CloudAuth.waitReady();
            if (CloudAuth.isLoggedIn() && CloudAuth.isAdmin()) {
                const cloud = await CloudAuth.fetchAllSubmissions();
                cloudSubmissionsCache = cloud.map((r) => CloudAuth.toLocalSubmission(r));
                OwnerAuth?.mirrorCloudSubmissionsToLocal(cloud);
                list = [...PH.loadOwnerSubmissions()];
                hint?.classList.add('hidden');
            } else if (hint) {
                hint.classList.remove('hidden');
                hint.textContent =
                    '☁ Cloud ریکارڈ دیکھنے کے لیے «Cloud سے sync» دبائیں (admin Google/Facebook لاگ ان) — local درخواستیں نیچے دکھائی جا رہی ہیں';
            }
        } catch (e) {
            console.warn('cloud submissions', e);
            if (hint) {
                hint.classList.remove('hidden');
                hint.textContent = 'Cloud sync ناکام: ' + (e.message || 'unknown');
            }
        }
    } else {
        syncBtn?.setAttribute('hidden', '');
        hint?.classList.add('hidden');
    }

    list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    const statsEl = document.getElementById('submissionsStats');
    if (statsEl) {
        const accounts = new Set(list.map((s) => s.userId || s.submitterEmail || s.ownerEmail).filter(Boolean));
        const pending = list.filter((s) => s.status === 'pending').length;
        statsEl.innerHTML = `
            <span class="submissions-stat"><strong>${list.length}</strong> کل درخواستیں</span>
            <span class="submissions-stat"><strong>${accounts.size}</strong> الگ اکاؤنٹس</span>
            <span class="submissions-stat"><strong>${pending}</strong> نئی (زیرِ غور)</span>`;
    }

    const container = document.getElementById('ownerSubmissionsList');
    const empty = document.getElementById('submissionsEmpty');
    if (!container) return;

    if (list.length === 0) {
        container.innerHTML = '';
        empty?.classList.remove('hidden');
        return;
    }
    empty?.classList.add('hidden');

    container.innerHTML = list
        .map((sub) => {
            const statusLabel = PH.OWNER_SUBMISSION_STATUS[sub.status] || sub.status;
            const badgeClass =
                sub.status === 'converted' ? 'converted' : sub.status === 'reviewed' ? 'reviewed' : '';
            const imgs = (sub.images || [])
                .slice(0, 3)
                .map((src) => `<img src="${src}" alt="">`)
                .join('');
            const account = submissionAccountLabel(sub);
            return `
            <article class="submission-card status-${sub.status || 'pending'}${sub.cloud ? ' submission-card--cloud' : ''}">
                <div class="submission-head">
                    <div class="submission-title">${escapeHTML(sub.title || 'بغیر عنوان')}${sub.cloud ? ' <span class="submission-cloud-tag">☁ Cloud</span>' : ''}${sub.localDb ? ' <span class="submission-cloud-tag">PC DB</span>' : ''}</div>
                    <span class="submission-badge ${badgeClass}">${escapeHTML(statusLabel)}</span>
                </div>
                <div class="submission-account-bar">
                    <span class="submission-account-ico">👤</span>
                    <div>
                        <strong>اکاؤنٹ:</strong> ${escapeHTML(account)}
                        ${sub.userId ? `<span class="submission-user-id">ID: ${escapeHTML(String(sub.userId).slice(0, 12))}…</span>` : ''}
                    </div>
                </div>
                <div class="submission-meta">
                    <div><strong>${LABELS.purpose[sub.purpose]}</strong> · ${LABELS.type[sub.type]} · ${formatPrice(sub.price)}${sub.purpose === 'rent' ? ' / ماہ' : ''}</div>
                    <div>📍 ${escapeHTML(sub.area || '')}${sub.city ? '، ' + escapeHTML(sub.city) : ''}</div>
                    ${sub.size ? `<div>📐 ${escapeHTML(sub.size)}</div>` : ''}
                    ${sub.beds ? `<div>🛏 ${sub.beds} بیڈ · 🚿 ${sub.baths || 0} باتھ</div>` : ''}
                    <div>📞 ${escapeHTML(sub.ownerPhone || sub.submitterPhone || '—')}</div>
                    <div style="margin-top:0.35rem">${escapeHTML(sub.description || '')}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">${PH.formatRelativeUrdu(sub.createdAt)}</div>
                </div>
                ${imgs ? `<div class="submission-images">${imgs}</div>` : ''}
                <div class="submission-actions">
                    <a class="btn btn-whatsapp btn-sm" href="${PH.whatsAppUrl(PH.ownerSubmissionWhatsAppText(sub), sub.ownerPhone)}" target="_blank">مالک WhatsApp</a>
                    <button type="button" class="btn btn-primary btn-sm" data-convert-submission="${sub.id}" ${sub.status === 'converted' ? 'disabled' : ''}>لسٹنگ بنائیں</button>
                    ${sub.status === 'pending' ? `<button type="button" class="btn btn-outline btn-sm" data-review-submission="${sub.id}">دیکھ لی</button>` : ''}
                    <button type="button" class="btn btn-danger btn-sm" data-delete-submission="${sub.id}">حذف</button>
                </div>
            </article>`;
        })
        .join('');
}

function openPropertyModal(id) {
    const form = document.getElementById('propertyForm');
    form.reset();
    pendingImages = [];
    document.getElementById('propertyId').value = '';
    document.getElementById('propertyModalTitle').textContent = id ? 'پراپرٹی ترمیم' : 'نئی پراپرٹی';
    renderImagePreview();

    if (id) {
        pendingSubmissionId = null;
        const p = loadProperties().find((x) => x.id === id);
        if (!p) return;
        document.getElementById('propertyId').value = p.id;
        document.getElementById('propTitle').value = p.title;
        document.getElementById('propPurpose').value = p.purpose;
        document.getElementById('propType').value = p.type;
        document.getElementById('propPrice').value = p.price;
        document.getElementById('propCity').value = p.city;
        document.getElementById('propArea').value = p.area || '';
        document.getElementById('propSize').value = p.size || '';
        document.getElementById('propBeds').value = p.beds || '';
        document.getElementById('propBaths').value = p.baths || '';
        document.getElementById('propOwner').value = p.owner || '';
        document.getElementById('propPhone').value = p.phone || '';
        document.getElementById('propDescription').value = p.description || '';
        document.getElementById('propFeatured').checked = !!p.featured;
        document.getElementById('propPublished').checked = !!p.published;
        pendingImages = [...(p.images || [])];
        renderImagePreview();
    }
    document.getElementById('propertyModal').showModal();
}

function openClientModal(id) {
    const form = document.getElementById('clientForm');
    form.reset();
    document.getElementById('clientId').value = '';
    document.getElementById('clientModalTitle').textContent = id ? 'کلائنٹ ترمیم' : 'نیا کلائنٹ';

    if (id) {
        const c = loadClients().find((x) => x.id === id);
        if (!c) return;
        document.getElementById('clientId').value = c.id;
        document.getElementById('clientName').value = c.name;
        document.getElementById('clientPhone').value = c.phone;
        document.getElementById('clientPurpose').value = c.purpose;
        document.getElementById('clientType').value = c.type;
        document.getElementById('clientBudgetMin').value = c.budgetMin || '';
        document.getElementById('clientBudgetMax').value = c.budgetMax || '';
        document.getElementById('clientCity').value = c.city || '';
        document.getElementById('clientAreas').value = c.areas || '';
        document.getElementById('clientMinSize').value = c.minSize || '';
        document.getElementById('clientMinBeds').value = c.minBeds || '';
        document.getElementById('clientNotes').value = c.notes || '';
        document.getElementById('clientStatus').value = c.status;
    }
    document.getElementById('clientModal').showModal();
}

function renderCeoPhotoPreview(src) {
    const el = document.getElementById('agencyCeoPreview');
    if (!el) return;
    if (!src) {
        el.innerHTML = '<p class="settings-hint">ابھی کوئی تصویر نہیں — نیچے سے اپ لوڈ کریں</p>';
        return;
    }
    el.innerHTML = `<img src="${src}" alt="CEO preview" class="ceo-photo-preview-img">`;
}

function renderSettings() {
    const agency = PH.getAgency();
    document.getElementById('agencyName').value = agency.name || '';
    document.getElementById('agencyContactName').value = agency.contactName || PH.DEFAULT_AGENCY.contactName;
    document.getElementById('agencyPhone').value = agency.phone || PH.DEFAULT_AGENCY.phone;
    document.getElementById('agencyEmail').value = agency.email || PH.DEFAULT_AGENCY.email;
    document.getElementById('agencyAddress').value = agency.address || PH.DEFAULT_AGENCY.address;
    document.getElementById('agencyContactNote').value = agency.contactNote || PH.DEFAULT_AGENCY.contactNote;
    pendingCeoPhoto = null;
    renderCeoPhotoPreview(agency.ceoPhoto || '');

    const adminCard = document.getElementById('adminUsersCard');
    if (PH.isAdmin()) {
        adminCard.classList.remove('hidden');
        const users = PH.loadUsers();
        document.getElementById('usersList').innerHTML = users
            .map(
                (u) => `
            <div class="user-row">
                <span><strong>${escapeHTML(u.name)}</strong> (${escapeHTML(u.username)}) — ${u.role === 'admin' ? 'منتظم' : 'ڈیلر'}</span>
                ${u.id !== 'admin' ? `<button type="button" class="btn btn-danger btn-sm" data-delete-user="${u.id}">حذف</button>` : ''}
            </div>`
            )
            .join('');
    } else {
        adminCard.classList.add('hidden');
    }

    const sc = PH.sheetsConfig();
    const sheetsEnabledEl = document.getElementById('sheetsEnabled');
    const sheetsUrlEl = document.getElementById('sheetsWebAppUrl');
    const sheetsSecretEl = document.getElementById('sheetsSecret');
    const sheetsStatus = document.getElementById('sheetsStatus');
    if (sheetsEnabledEl) {
        sheetsEnabledEl.checked = !!sc.enabled;
        sheetsUrlEl.value = sc.webAppUrl || '';
        sheetsSecretEl.value = sc.secret || '';
        if (sheetsStatus) {
            sheetsStatus.textContent = PH.sheetsStatusMessage();
        }
    }
}

function navigate(view) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
    document.getElementById('view-' + view)?.classList.add('active');
    document.querySelector(`[data-nav="${view}"]`)?.classList.add('active');

    if (view === 'dashboard') renderDashboard();
    if (view === 'properties') renderProperties();
    if (view === 'clients') renderClients();
    if (view === 'settings') renderSettings();
    if (view === 'matches') {
        renderClients();
        renderMatches(document.getElementById('matchClientSelect').value);
    }
    if (view === 'submissions') renderOwnerSubmissions();
}

function refreshAll() {
    renderDashboard();
    renderProperties();
    renderClients();
    renderOwnerSubmissions();
    const matchId = document.getElementById('matchClientSelect')?.value;
    if (matchId) renderMatches(matchId);
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.body.classList.add('logged-in');
    if (window.LocalDbAuth?.isLoggedIn() && LocalDbAuth.isAdmin()) syncDealerSessionFromLocalDb();
    const session = PH.getSession();
    document.getElementById('userDisplayName').textContent =
        (window.LocalDbAuth?.isLoggedIn() && LocalDbAuth.isAdmin() ? LocalDbAuth.displayName() : session?.name) || '';
    seedSampleData();
    refreshAll();
}

function showLogin() {
    document.getElementById('loginScreen').classList.remove('hidden');
    document.body.classList.remove('logged-in');
}

function bindEvents() {
    document.getElementById('toggleLoginPassword')?.addEventListener('click', () => {
        const input = document.getElementById('loginPassword');
        const btn = document.getElementById('toggleLoginPassword');
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.setAttribute('aria-pressed', show ? 'true' : 'false');
        btn.setAttribute('aria-label', show ? 'پاس ورڈ چھپائیں' : 'پاس ورڈ دکھائیں');
        btn.textContent = show ? '🙈' : '👁';
    });

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const err = document.getElementById('loginError');
        const btn = e.target.querySelector('button[type="submit"]');
        err.classList.add('hidden');
        if (btn) btn.disabled = true;
        try {
            if (window.LocalDbAuth?.isConfigured()) {
                await LocalDbAuth.loginAdmin(
                    document.getElementById('loginUsername').value,
                    document.getElementById('loginPassword').value
                );
                syncDealerSessionFromLocalDb();
                showApp();
                return;
            }
            const result = await PH.loginAsync(
                document.getElementById('loginUsername').value,
                document.getElementById('loginPassword').value
            );
            if (result.error) {
                err.textContent = result.error;
                err.classList.remove('hidden');
                return;
            }
            showApp();
        } catch {
            err.textContent = 'لاگ ان ناکام — HTTPS یا localhost استعمال کریں';
            err.classList.remove('hidden');
        } finally {
            if (btn) btn.disabled = false;
        }
    });

    document.getElementById('btnLogout').addEventListener('click', async () => {
        if (window.LocalDbAuth?.isLoggedIn()) await LocalDbAuth.signOut();
        PH.logout();
        showLogin();
    });

    document.querySelectorAll('[data-nav]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const view = el.getAttribute('data-nav');
            if (view) navigate(view);
        });
    });

    document.getElementById('btnAddProperty').addEventListener('click', () => {
        pendingSubmissionId = null;
        openPropertyModal();
    });
    document.getElementById('btnQuickAdd').addEventListener('click', () => {
        pendingSubmissionId = null;
        navigate('properties');
        openPropertyModal();
    });
    document.getElementById('btnAddClient').addEventListener('click', () => openClientModal());

    document.getElementById('btnSyncCloudSubmissions')?.addEventListener('click', async () => {
        const btn = document.getElementById('btnSyncCloudSubmissions');
        if (btn) btn.disabled = true;
        try {
            if (window.LocalDbAuth?.isConfigured()) await syncLocalDbSubmissionsToLocal();
            else await syncCloudSubmissionsToLocal();
            renderOwnerSubmissions();
            renderDashboard();
            alert('Database ریکارڈ sync ہو گئے — تمام اکاؤنٹس کی درخواستیں ایک جگہ');
        } catch (e) {
            alert(e.message || 'Sync ناکام');
        } finally {
            if (btn) btn.disabled = false;
        }
    });

    document.getElementById('ownerSubmissionsList')?.addEventListener('click', (e) => {
        const convert = e.target.closest('[data-convert-submission]');
        if (convert) {
            navigate('properties');
            openPropertyModalFromSubmission(convert.getAttribute('data-convert-submission'));
            return;
        }
        const review = e.target.closest('[data-review-submission]');
        if (review) {
            const sid = review.getAttribute('data-review-submission');
            const sub = findSubmission(sid);
            if (sub?.localDb && LocalDbAuth?.isConfigured()) {
                LocalDbAuth.updateSubmissionStatus(sid, 'reviewed').then(() => {
                    PH.updateOwnerSubmission(sid, { status: 'reviewed' });
                    refreshAll();
                });
            } else if (sub?.cloud && CloudAuth?.isConfigured()) {
                CloudAuth.updateSubmissionStatus(sid, 'reviewed').then(() => {
                    PH.updateOwnerSubmission(sid, { status: 'reviewed' });
                    refreshAll();
                });
            } else {
                PH.updateOwnerSubmission(sid, { status: 'reviewed' });
                renderOwnerSubmissions();
                renderDashboard();
            }
            return;
        }
        const del = e.target.closest('[data-delete-submission]');
        if (del && confirm('یہ درخواست حذف کریں؟')) {
            const sid = del.getAttribute('data-delete-submission');
            const sub = findSubmission(sid);
            if (sub?.localDb && LocalDbAuth?.isConfigured()) {
                LocalDbAuth.deleteSubmission(sid).then(() => {
                    PH.deleteOwnerSubmission(sid);
                    refreshAll();
                });
            } else if (sub?.cloud && CloudAuth?.isConfigured()) {
                CloudAuth.deleteSubmission(sid).then(() => {
                    PH.deleteOwnerSubmission(sid);
                    refreshAll();
                });
            } else {
                PH.deleteOwnerSubmission(sid);
                refreshAll();
            }
        }
    });

    document.querySelectorAll('[data-close="propertyModal"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            pendingSubmissionId = null;
        });
    });

    document.getElementById('filterPropertyPurpose').addEventListener('change', () => renderProperties());
    document.getElementById('filterPropertyType').addEventListener('change', () => renderProperties());

    document.querySelectorAll('#dealerSearchTabs .zm-search-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('#dealerSearchTabs .zm-search-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('searchPurpose').value = tab.getAttribute('data-purpose');
        });
    });

    document.getElementById('globalSearchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        navigate('properties');
        const purpose = document.getElementById('searchPurpose').value;
        document.getElementById('filterPropertyPurpose').value = purpose;
        renderProperties({
            purpose,
            type: document.getElementById('searchType').value,
            city: document.getElementById('searchCity').value,
            minPrice: document.getElementById('searchMinPrice').value,
            maxPrice: document.getElementById('searchMaxPrice').value,
        });
    });

    document.getElementById('propImages').addEventListener('change', async (e) => {
        const files = [...e.target.files].slice(0, 3 - pendingImages.length);
        for (const file of files) {
            if (pendingImages.length >= 3) break;
            try {
                const data = await PH.compressImage(file);
                pendingImages.push(data);
            } catch {
                alert('تصویر لوڈ نہیں ہو سکی');
            }
        }
        e.target.value = '';
        renderImagePreview();
    });

    document.getElementById('propImagePreview').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove-img]');
        if (btn) {
            pendingImages.splice(Number(btn.getAttribute('data-remove-img')), 1);
            renderImagePreview();
        }
    });

    document.getElementById('propertyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('propertyId').value;
        const session = PH.getSession();
        const data = {
            title: document.getElementById('propTitle').value.trim(),
            purpose: document.getElementById('propPurpose').value,
            type: document.getElementById('propType').value,
            price: Number(document.getElementById('propPrice').value),
            city: document.getElementById('propCity').value.trim(),
            area: document.getElementById('propArea').value.trim(),
            size: document.getElementById('propSize').value.trim(),
            beds: Number(document.getElementById('propBeds').value) || 0,
            baths: Number(document.getElementById('propBaths').value) || 0,
            owner: document.getElementById('propOwner').value.trim(),
            phone: document.getElementById('propPhone').value.trim(),
            description: document.getElementById('propDescription').value.trim(),
            featured: document.getElementById('propFeatured').checked,
            published: document.getElementById('propPublished').checked,
            images: [...pendingImages],
            dealerId: session?.userId,
        };

        let list = loadProperties();
        let saved;
        if (id) {
            const idx = list.findIndex((p) => p.id === id);
            if (idx >= 0) {
                saved = { ...list[idx], ...data };
                list[idx] = saved;
            }
        } else {
            saved = { id: uid(), ...data, createdAt: new Date().toISOString() };
            list.push(saved);
        }
        saveProperties(list);
        if (pendingSubmissionId) {
            const sub = findSubmission(pendingSubmissionId);
            if (sub?.localDb && LocalDbAuth?.isConfigured()) {
                await LocalDbAuth.updateSubmissionStatus(pendingSubmissionId, 'converted');
                PH.updateOwnerSubmission(pendingSubmissionId, { status: 'converted' });
            } else if (sub?.cloud && CloudAuth?.isConfigured()) {
                await CloudAuth.updateSubmissionStatus(pendingSubmissionId, 'converted');
            } else {
                PH.updateOwnerSubmission(pendingSubmissionId, { status: 'converted' });
            }
            pendingSubmissionId = null;
        }
        PH.syncPublicCatalog();
        if (saved) {
            await PH.persistDataRow('Properties', PH.propertySheetRow(saved));
        }
        document.getElementById('propertyModal').close();
        refreshAll();
    });

    document.getElementById('clientForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('clientId').value;
        const session = PH.getSession();
        const data = {
            name: document.getElementById('clientName').value.trim(),
            phone: document.getElementById('clientPhone').value.trim(),
            purpose: document.getElementById('clientPurpose').value,
            type: document.getElementById('clientType').value,
            budgetMin: Number(document.getElementById('clientBudgetMin').value) || null,
            budgetMax: Number(document.getElementById('clientBudgetMax').value) || null,
            city: document.getElementById('clientCity').value.trim(),
            areas: document.getElementById('clientAreas').value.trim(),
            minSize: document.getElementById('clientMinSize').value.trim(),
            minBeds: Number(document.getElementById('clientMinBeds').value) || null,
            notes: document.getElementById('clientNotes').value.trim(),
            status: document.getElementById('clientStatus').value,
            dealerId: session?.userId,
        };

        let list = loadClients();
        if (id) {
            const idx = list.findIndex((c) => c.id === id);
            if (idx >= 0) list[idx] = { ...list[idx], ...data };
        } else {
            list.push({ id: uid(), ...data, createdAt: new Date().toISOString() });
        }
        saveClients(list);
        document.getElementById('clientModal').close();
        refreshAll();
    });

    document.querySelectorAll('[data-close]').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.getAttribute('data-close'))?.close();
        });
    });

    document.getElementById('matchClientSelect').addEventListener('change', (e) => {
        renderMatches(e.target.value);
    });

    document.getElementById('agencyForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const agency = PH.getAgency();
        PH.saveAgency({
            name: document.getElementById('agencyName').value.trim(),
            contactName: document.getElementById('agencyContactName').value.trim(),
            phone: document.getElementById('agencyPhone').value.trim(),
            whatsapp: document.getElementById('agencyPhone').value.trim(),
            email: document.getElementById('agencyEmail').value.trim(),
            address: document.getElementById('agencyAddress').value.trim(),
            contactNote: document.getElementById('agencyContactNote').value.trim(),
            ceoPhoto: pendingCeoPhoto ?? agency.ceoPhoto ?? '',
            city: 'Faisalabad',
        });
        pendingCeoPhoto = null;
        PH.syncPublicCatalog();
        alert('ایجنسی کی تفصیل محفوظ ہو گئی');
    });

    document.getElementById('agencyCeoPhoto')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            pendingCeoPhoto = await PH.compressImage(file, 600, 0.82);
            renderCeoPhotoPreview(pendingCeoPhoto);
        } catch {
            alert('تصویر لوڈ نہیں ہو سکی');
        }
        e.target.value = '';
    });

    document.getElementById('sheetsSettingsForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const saved = PH.saveSheetsSettings({
            enabled: document.getElementById('sheetsEnabled').checked,
            webAppUrl: document.getElementById('sheetsWebAppUrl').value.trim(),
            secret: document.getElementById('sheetsSecret').value.trim(),
        });
        if (saved.error) {
            alert(saved.error);
            return;
        }
        renderSettings();
        alert('Google Sheets ترتیب محفوظ ہو گئی');
    });

    document.getElementById('btnTestSheets')?.addEventListener('click', async () => {
        const saved = PH.saveSheetsSettings({
            enabled: true,
            webAppUrl: document.getElementById('sheetsWebAppUrl').value.trim(),
            secret: document.getElementById('sheetsSecret').value.trim(),
        });
        if (saved.error) {
            alert(saved.error);
            return;
        }
        const r = await fetch(PH.sheetsApiUrl({ action: 'setup' }), { mode: 'cors' });
        const text = await r.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = { ok: false, error: text };
        }
        if (!data.ok) {
            alert('خرابی: ' + (data.error || text));
            renderSettings();
            return;
        }
        const testRow = await PH.submitToGoogleSheet('Inquiries', [
            new Date().toISOString(),
            'ٹیسٹ',
            '03000000000',
            'ٹیسٹ',
            'ٹیسٹ',
            'house',
            'کنکشن ٹیسٹ',
        ]);
        alert(
            testRow.ok
                ? 'کنکشن ٹھیک — ٹیسٹ قطار Inquiries میں لکھ دی گئی'
                : 'GET ٹھیک، POST نہیں: ' + (testRow.error || testRow.raw || JSON.stringify(testRow))
        );
        renderSettings();
    });

    document.getElementById('btnSetupSheets')?.addEventListener('click', async () => {
        const r = await PH.setupGoogleSheets();
        alert(r.ok ? '۴ ٹیبز بن گئیں: OwnerSubmissions, Inquiries, Properties, Clients' : 'خرابی: ' + (r.error || r.raw || 'URL چیک کریں'));
    });

    document.getElementById('btnSyncGoogleSheets')?.addEventListener('click', async () => {
        if (!PH.sheetsEnabled()) {
            alert('پہلے Google Sheets فعال کریں اور URL محفوظ کریں');
            return;
        }
        const r = await PH.syncAllToGoogleSheets();
        if (r.skipped) {
            alert('Google Sheets فعال نہیں');
            return;
        }
        alert(
            r.ok
                ? `کامیاب: ${r.rows} قطاریں، ${r.ok} شیٹیں اپ ڈیٹ`
                : `کچھ شیٹیں نہیں گئیں — OK: ${r.ok}, Fail: ${r.fail}`
        );
    });

    document.getElementById('btnSyncPublic').addEventListener('click', () => {
        const n = PH.syncPublicCatalog();
        alert(`${n} پراپرٹیز عوامی کیٹلاگ میں اپ ڈیٹ ہو گئیں`);
    });

    document.getElementById('btnSyncDataFolder')?.addEventListener('click', async () => {
        if (typeof DataSheet === 'undefined') return;
        const r = await DataSheet.syncAllToFolder();
        if (r.fail && !r.ok) {
            alert('سرور نہیں چل رہا۔ پہلے start-local-server.bat چلائیں، پھر http://localhost:8000/dealer.html کھولیں۔');
            return;
        }
        alert('Excel ڈیٹابیس میں محفوظ: ' + r.rows + ' قطاریں، ' + r.ok + ' فائلیں (data\\*.csv — MS Excel میں کھولیں)');
    });

    document.getElementById('btnDownloadAllCsv')?.addEventListener('click', () => {
        if (typeof DataSheet === 'undefined') return;
        DataSheet.exportAllDownloads();
    });

    document.getElementById('btnOpenDataFolder')?.addEventListener('click', async () => {
        try {
            const res = await fetch('/api/sheet/open-folder', { method: 'POST' });
            const data = await res.json();
            if (data.ok) {
                alert('data فولڈر کھول دیا گیا:\n' + (data.path || 'data'));
                return;
            }
            alert(data.error || 'فولڈر نہیں کھل سکا — start-local-server.bat چلائیں');
        } catch {
            alert('سرور نہیں چل رہا۔ پہلے start-local-server.bat چلائیں۔');
        }
    });

    document.getElementById('btnExportJSON').addEventListener('click', () => {
        PH.downloadFile(JSON.stringify(PH.exportJSON(), null, 2), `ask-real-estate-faisalabad-backup-${Date.now()}.json`, 'application/json');
    });

    document.getElementById('btnExportPropsCSV').addEventListener('click', () => {
        PH.downloadFile(PH.exportCSV().properties, `properties-${Date.now()}.csv`, 'text/csv;charset=utf-8');
    });

    document.getElementById('btnExportClientsCSV').addEventListener('click', () => {
        PH.downloadFile(PH.exportCSV().clients, `clients-${Date.now()}.csv`, 'text/csv;charset=utf-8');
    });

    document.getElementById('importJSON').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = JSON.parse(await file.text());
            PH.importJSON(data, true);
            PH.syncPublicCatalog();
            refreshAll();
            alert('ڈیٹا کامیابی سے درآمد ہو گیا');
        } catch {
            alert('فائل پڑھی نہیں جا سکی');
        }
        e.target.value = '';
    });

    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!PH.isAdmin()) return;
        const users = PH.loadUsers();
        const username = document.getElementById('newUserUsername').value.trim();
        const pwd = document.getElementById('newUserPassword').value;
        if (pwd.length < 6) {
            alert('پاس ورڈ کم از کم 6 حروف کا ہونا چاہیے');
            return;
        }
        if (users.some((u) => u.username === username)) {
            alert('یہ لاگ ان نام پہلے سے موجود ہے');
            return;
        }
        const newUser = {
            id: uid(),
            name: document.getElementById('newUserName').value.trim(),
            username,
            phone: document.getElementById('newUserPhone').value.trim(),
            role: 'dealer',
        };
        await PH.setUserPassword(newUser, pwd);
        users.push(newUser);
        PH.saveUsers(users);
        e.target.reset();
        renderSettings();
    });

    document.getElementById('usersList').addEventListener('click', (e) => {
        const btn = e.target.closest('[data-delete-user]');
        if (!btn || !confirm('یہ صارف حذف کریں؟')) return;
        PH.saveUsers(PH.loadUsers().filter((u) => u.id !== btn.getAttribute('data-delete-user')));
        renderSettings();
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.closest('[data-whatsapp]')) {
            shareWhatsApp(e.target.closest('[data-whatsapp]').getAttribute('data-whatsapp'));
            return;
        }
        const t = e.target.closest('[data-edit-property]');
        if (t) {
            openPropertyModal(t.getAttribute('data-edit-property'));
            return;
        }
        if (e.target.closest('[data-delete-property]')) {
            const id = e.target.closest('[data-delete-property]').getAttribute('data-delete-property');
            if (confirm('یہ پراپرٹی حذف کریں؟')) {
                saveProperties(loadProperties().filter((p) => p.id !== id));
                PH.syncPublicCatalog();
                refreshAll();
            }
            return;
        }
        const card = e.target.closest('[data-property-id]');
        if (card && !e.target.closest('.zm-card-foot')) {
            showPropertyDetail(card.getAttribute('data-property-id'));
            return;
        }
        if (e.target.closest('[data-edit-client]')) {
            openClientModal(e.target.closest('[data-edit-client]').getAttribute('data-edit-client'));
            return;
        }
        if (e.target.closest('[data-delete-client]')) {
            const id = e.target.closest('[data-delete-client]').getAttribute('data-delete-client');
            if (confirm('یہ کلائنٹ حذف کریں؟')) {
                saveClients(loadClients().filter((c) => c.id !== id));
                refreshAll();
            }
            return;
        }
        if (e.target.closest('[data-match-client]')) {
            const id = e.target.closest('[data-match-client]').getAttribute('data-match-client');
            navigate('matches');
            document.getElementById('matchClientSelect').value = id;
            renderMatches(id);
            return;
        }
        if (e.target.closest('[data-goto-property]')) {
            navigate('properties');
            showPropertyDetail(e.target.closest('[data-goto-property]').getAttribute('data-goto-property'));
            return;
        }
        if (e.target.closest('[data-goto-client]')) {
            navigate('clients');
            openClientModal(e.target.closest('[data-goto-client]').getAttribute('data-goto-client'));
        }
    });
}

async function init() {
    await PH.ensureDefaultAdminAsync();
    await PH.upgradePlainPasswords();
    PH.ensureDefaultAgency();
    bindEvents();

    if (window.LocalDbAuth?.isConfigured()) {
        if (LocalDbAuth.isLoggedIn() && LocalDbAuth.isAdmin()) {
            syncDealerSessionFromLocalDb();
            showApp();
        } else {
            PH.logout();
            showLogin();
        }
        return;
    }

    if (window.CloudAuth) {
        try {
            await CloudAuth.waitReady();
            if (CloudAuth.isConfigured() && CloudAuth.isLoggedIn() && CloudAuth.isAdmin()) {
                showApp();
                document.getElementById('userDisplayName').textContent = CloudAuth.displayName();
                return;
            }
        } catch (e) {
            console.warn('CloudAuth dealer', e);
        }
    }

    if (PH.getSession()) {
        showApp();
    } else {
        showLogin();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    init().catch((err) => console.error(err));
});
