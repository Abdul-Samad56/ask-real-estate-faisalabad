/**
 * User account — my property submissions (per-account)
 */
(function () {
    const PH = PropertyHub;
    const L = PH.LABELS;

    function statusLabel(s) {
        const extra = { pending: 'زیرِ غور', rejected: 'مسترد' };
        return extra[s] || PH.OWNER_SUBMISSION_STATUS[s] || s;
    }

    function detailRow(label, value) {
        if (value == null || value === '' || value === 0) return '';
        return `<div class="fr-account-detail"><span>${label}</span><strong>${PH.escapeHTML(String(value))}</strong></div>`;
    }

    function renderImages(urls) {
        if (!urls?.length) return '';
        return `<div class="fr-account-images">${urls
            .map((src) => `<img src="${PH.escapeHTML(src)}" alt="" loading="lazy">`)
            .join('')}</div>`;
    }

    function submissionCard(r) {
        const price = PH.formatPriceZameen(r.price) + (r.purpose === 'rent' ? ' / ماہ' : '');
        const date = new Date(r.created_at || r.createdAt).toLocaleString('ur-PK');
        const imgs = r.image_urls || r.images || [];
        return `
        <article class="fr-account-item" data-submission-id="${r.id}">
            <div class="fr-account-item-head">
                <div>
                    <strong class="fr-account-item-title">${PH.escapeHTML(r.title || r.area || 'پراپرٹی')}</strong>
                    <span class="fr-account-id">ID: ${PH.escapeHTML(String(r.id).slice(0, 8))}…</span>
                </div>
                <span class="fr-account-status fr-account-status--${r.status}">${statusLabel(r.status)}</span>
            </div>
            ${renderImages(imgs)}
            <div class="fr-account-detail-grid">
                ${detailRow('مقصد', L.purpose[r.purpose] || r.purpose)}
                ${detailRow('قسم', L.type[r.type] || r.type)}
                ${detailRow('علاقہ', r.area)}
                ${detailRow('شہر', r.city)}
                ${detailRow('قیمت', price)}
                ${detailRow('سائز', r.size)}
                ${detailRow('بیڈروم', r.beds || '')}
                ${detailRow('باتھ', r.baths || '')}
                ${detailRow('منزلیں', r.floors || '')}
                ${detailRow('پتہ', r.address)}
                ${detailRow('نام', r.owner_name || r.ownerName)}
                ${detailRow('فون', r.owner_phone || r.ownerPhone)}
                ${detailRow('ای میل', r.owner_email || r.ownerEmail)}
            </div>
            ${r.description ? `<p class="fr-account-desc"><strong>تفصیل:</strong> ${PH.escapeHTML(r.description)}</p>` : ''}
            <div class="fr-account-item-foot">
                <time>درج: ${PH.escapeHTML(date)}</time>
                <div class="fr-account-item-btns">
                    <button type="button" class="fr-account-delete" data-delete-submission="${r.id}">حذف کریں</button>
                </div>
            </div>
        </article>`;
    }

    async function renderSubmissions() {
        const box = document.getElementById('accountSubmissions');
        const countEl = document.getElementById('accountCount');
        if (!box) return;
        box.innerHTML = '<p class="fr-account-loading">لوڈ ہو رہا ہے…</p>';
        try {
            const rows = await OwnerAuth.fetchMySubmissions();
            if (countEl) countEl.textContent = rows.length ? `(${rows.length})` : '';
            if (!rows.length) {
                box.innerHTML =
                    '<p class="fr-empty">ابھی کوئی پراپرٹی درج نہیں۔ <a href="list-property.html">+ پراپرٹی درج کریں</a></p>';
                return;
            }
            box.innerHTML = rows.map(submissionCard).join('');
        } catch (e) {
            box.innerHTML = `<p class="fr-auth-error">${PH.escapeHTML(e.message)}</p>`;
        }
    }

    async function handleDelete(id) {
        if (!confirm('یہ پراپرٹی مستقل حذف ہو جائے گی۔ یقین ہے؟')) return;
        const btn = document.querySelector(`[data-delete-submission="${id}"]`);
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'حذف…';
        }
        try {
            await OwnerAuth.deleteMySubmission(id);
            await renderSubmissions();
        } catch (e) {
            alert(e.message || 'حذف نہیں ہو سکی');
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'حذف کریں';
            }
        }
    }

    function renderUser() {
        const el = document.getElementById('accountUserInfo');
        if (!el) return;
        if (OwnerAuth.usesCloud() && CloudAuth.isLoggedIn()) {
            const u = CloudAuth.getUser();
            const avatar = CloudAuth.getProfile()?.avatar_url || u?.user_metadata?.picture || '';
            const name = CloudAuth.displayName();
            const email = u?.email || '';
            el.innerHTML = `
            ${avatar ? `<img src="${PH.escapeHTML(avatar)}" alt="" class="fr-account-avatar">` : ''}
            <div>
                <h2>${PH.escapeHTML(name)}</h2>
                <p>${PH.escapeHTML(email)}</p>
            </div>`;
        } else if (OwnerAuth.usesLocalDb() && LocalDbAuth.isLoggedIn()) {
            const user = LocalDbAuth.getUser();
            el.innerHTML = `
            <div>
                <h2>${PH.escapeHTML(LocalDbAuth.displayName())}</h2>
                <p>${PH.escapeHTML(user?.email || '')}</p>
            </div>`;
        } else {
            const owner = PH.getCurrentOwnerUser();
            el.innerHTML = `
            <div>
                <h2>${PH.escapeHTML(owner?.fullName || OwnerAuth.displayName())}</h2>
                <p>${PH.escapeHTML(owner?.email || '')}</p>
            </div>`;
        }
    }

    function showGate() {
        const gate = document.getElementById('accountLoginGate');
        if (gate) {
            gate.innerHTML =
                '<h3>اکاؤنٹ دیکھنے کے لیے لاگ ان کریں</h3><a href="login.html?redirect=account.html" class="fr-form-submit fr-login-again-btn">لاگ ان کریں</a>';
            gate.hidden = false;
        }
        document.getElementById('accountContent').hidden = true;
    }

    function showAccount() {
        document.getElementById('accountLoginGate').hidden = true;
        document.getElementById('accountContent').hidden = false;
        renderUser();
        renderSubmissions();
    }

    document.addEventListener('DOMContentLoaded', async () => {
        FrLayout.initCommon();
        await OwnerAuth.waitReady();

        if (OwnerAuth.isLoggedIn()) showAccount();
        else showGate();

        document.getElementById('accountLogout')?.addEventListener('click', async () => {
            await OwnerAuth.signOut();
            showGate();
            FrLayout.updateAuthTopbar();
        });

        document.getElementById('accountSubmissions')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-delete-submission]');
            if (!btn) return;
            handleDelete(btn.getAttribute('data-delete-submission'));
        });

        window.addEventListener('auth:change', () => {
            if (OwnerAuth.isLoggedIn()) showAccount();
            else showGate();
        });
        window.addEventListener('owner-auth:change', () => {
            if (OwnerAuth.isLoggedIn()) showAccount();
            else showGate();
        });
        window.addEventListener('localdb-auth:change', () => {
            if (OwnerAuth.isLoggedIn()) showAccount();
            else showGate();
        });
    });
})();
