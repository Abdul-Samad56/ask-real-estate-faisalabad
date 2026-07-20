/**
 * Public — owner property listing submission (login required, per-account)
 */
(function () {
    const PH = PropertyHub;
    const L = PH.LABELS;
    let pendingImages = [];

    function renderAreas() {
        const dl = document.getElementById('listAreaList');
        if (!dl || !ZameenSite.FAISALABAD_AREAS) return;
        dl.innerHTML = ZameenSite.FAISALABAD_AREAS.map((a) => `<option value="${a}"></option>`).join('');
    }

    function renderImagePreview() {
        const el = document.getElementById('listImagePreview');
        if (!el) return;
        el.innerHTML = pendingImages
            .map(
                (src, i) =>
                    `<div class="fr-list-preview-thumb"><img src="${src}" alt=""><button type="button" data-remove-list-img="${i}" aria-label="ہٹائیں">&times;</button></div>`
            )
            .join('');
    }

    function buildTitle(purpose, type, area, city) {
        const custom = document.getElementById('listTitle').value.trim();
        if (custom) return custom;
        const parts = [L.type[type] || type, area || city || 'فیصل آباد', L.purpose[purpose] || purpose].filter(Boolean);
        return parts.join(' — ');
    }

    function collectFormData() {
        const purpose = document.getElementById('listPurpose').value;
        const type = document.getElementById('listType').value;
        const area = document.getElementById('listArea').value.trim();
        const city = document.getElementById('listCity').value.trim() || 'فیصل آباد';
        return {
            purpose,
            type,
            area,
            city,
            price: Number(document.getElementById('listPrice').value),
            size: document.getElementById('listSize').value.trim(),
            beds: Number(document.getElementById('listBeds').value) || 0,
            baths: Number(document.getElementById('listBaths').value) || 0,
            floors: Number(document.getElementById('listFloors').value) || 0,
            title: buildTitle(purpose, type, area, city),
            address: document.getElementById('listAddress').value.trim(),
            description: document.getElementById('listDescription').value.trim(),
            ownerName: document.getElementById('listOwnerName').value.trim(),
            ownerPhone: document.getElementById('listOwnerPhone').value.trim(),
            ownerEmail: document.getElementById('listOwnerEmail').value.trim(),
            images: [...pendingImages],
        };
    }

    function prefillFromProfile() {
        if (!OwnerAuth.isLoggedIn()) return;
        const nameEl = document.getElementById('listOwnerName');
        const emailEl = document.getElementById('listOwnerEmail');
        const phoneEl = document.getElementById('listOwnerPhone');
        if (OwnerAuth.usesCloud()) {
            const profile = CloudAuth.getProfile();
            const user = CloudAuth.getUser();
            if (nameEl && !nameEl.value) {
                nameEl.value = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || '';
            }
            if (emailEl && !emailEl.value) emailEl.value = profile?.email || user?.email || '';
            if (phoneEl && !phoneEl.value && profile?.phone) phoneEl.value = profile.phone;
        } else if (OwnerAuth.usesLocalDb()) {
            const profile = LocalDbAuth.getProfile();
            if (nameEl && !nameEl.value) nameEl.value = profile?.full_name || '';
            if (emailEl && !emailEl.value) emailEl.value = profile?.email || '';
            if (phoneEl && !phoneEl.value) phoneEl.value = profile?.phone || '';
        } else {
            const owner = PH.getCurrentOwnerUser();
            if (nameEl && !nameEl.value) nameEl.value = owner?.fullName || '';
            if (emailEl && !emailEl.value) emailEl.value = owner?.email || '';
            if (phoneEl && !phoneEl.value) phoneEl.value = owner?.phone || '';
        }
    }

    function showAuthGate() {
        document.getElementById('authGate').hidden = false;
        document.getElementById('listPropertyContent').hidden = true;
        updateAuthGateMode();
    }

    function showForm() {
        document.getElementById('authGate').hidden = true;
        document.getElementById('listPropertyContent').hidden = false;
        prefillFromProfile();
    }

    function updateAuthGateMode() {
        const cloud = OwnerAuth.usesCloud();
        const localDb = OwnerAuth.usesLocalDb();
        document.getElementById('listAuthCloud')?.toggleAttribute('hidden', !cloud);
        document.getElementById('listAuthLocal')?.toggleAttribute('hidden', cloud);
        document.getElementById('listAuthSetup')?.toggleAttribute('hidden', cloud || localDb);
    }

    function bindAuthButtons() {
        const redirect = 'list-property.html';
        document.getElementById('listBtnGoogle')?.addEventListener('click', async () => {
            try {
                await OwnerAuth.signInWithProvider('google', redirect);
            } catch (e) {
                alert(e.message || 'Google لاگ ان ناکام');
            }
        });
        document.getElementById('listBtnFacebook')?.addEventListener('click', async () => {
            try {
                await OwnerAuth.signInWithProvider('facebook', redirect);
            } catch (e) {
                alert(e.message || 'Facebook لاگ ان ناکام');
            }
        });

        document.getElementById('listLocalLoginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('listLocalEmail').value;
            const password = document.getElementById('listLocalPassword').value;
            try {
                await OwnerAuth.loginLocal(email, password);
                showForm();
                FrLayout.updateAuthTopbar();
            } catch (err) {
                alert(err.message || 'لاگ ان ناکام');
            }
        });

        document.getElementById('listLocalRegisterForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await OwnerAuth.registerLocal({
                    email: document.getElementById('listRegEmail').value,
                    password: document.getElementById('listRegPassword').value,
                    fullName: document.getElementById('listRegName').value,
                    phone: document.getElementById('listRegPhone').value,
                });
                showForm();
                FrLayout.updateAuthTopbar();
            } catch (err) {
                alert(err.message || 'رجسٹر ناکام');
            }
        });

        document.querySelectorAll('[data-auth-tab]').forEach((tab) => {
            tab.addEventListener('click', () => {
                const mode = tab.getAttribute('data-auth-tab');
                document.querySelectorAll('[data-auth-tab]').forEach((t) => t.classList.toggle('active', t === tab));
                document.getElementById('listLocalLoginForm')?.toggleAttribute('hidden', mode !== 'login');
                document.getElementById('listLocalRegisterForm')?.toggleAttribute('hidden', mode !== 'register');
            });
        });
    }

    async function refreshAuthUI() {
        await OwnerAuth.waitReady();
        if (OwnerAuth.isLoggedIn()) showForm();
        else showAuthGate();
    }

    function showSuccess(sheetRes, cloudOk) {
        document.getElementById('ownerPropertyForm').hidden = true;
        const box = document.getElementById('listSuccess');
        box.hidden = false;
        document.querySelector('.fr-list-intro').hidden = true;
        const note = document.getElementById('listSheetNote');
        if (!note) return;
        if (cloudOk) {
            note.innerHTML =
                '✓ Cloud database میں محفوظ — <a href="account.html">میرا اکاؤنٹ</a> میں مکمل ریکارڈ دیکھیں';
            note.style.color = '#2e7d32';
        } else {
            note.innerHTML =
                '✓ آپ کے اکاؤنٹ سے محفوظ — <a href="account.html">میرا اکاؤنٹ</a> میں دیکھیں';
            note.style.color = '#2e7d32';
        }
        if (sheetRes && sheetRes.ok) {
            note.innerHTML += '<br><span style="font-size:0.85rem">✓ Google Sheet میں بھی محفوظ</span>';
        }
    }

    function resetForm() {
        pendingImages = [];
        document.getElementById('ownerPropertyForm').reset();
        document.getElementById('listCity').value = 'فیصل آباد';
        renderImagePreview();
        document.getElementById('ownerPropertyForm').hidden = false;
        document.getElementById('listSuccess').hidden = true;
        document.querySelector('.fr-list-intro').hidden = false;
        prefillFromProfile();
    }

    document.addEventListener('DOMContentLoaded', () => {
        FrLayout.initCommon();
        renderAreas();
        bindAuthButtons();

        OwnerAuth.waitReady().then(() => {
            refreshAuthUI();
            FrLayout.updateAuthTopbar();
        });

        window.addEventListener('auth:change', () => {
            refreshAuthUI();
            FrLayout.updateAuthTopbar();
        });
        window.addEventListener('owner-auth:change', () => {
            refreshAuthUI();
            FrLayout.updateAuthTopbar();
        });
        window.addEventListener('localdb-auth:change', () => {
            refreshAuthUI();
            FrLayout.updateAuthTopbar();
        });

        document.getElementById('listImages')?.addEventListener('change', async (e) => {
            const files = [...e.target.files].slice(0, 3 - pendingImages.length);
            for (const file of files) {
                if (pendingImages.length >= 3) break;
                try {
                    pendingImages.push(await PH.compressImage(file, 900, 0.78));
                    renderImagePreview();
                } catch {
                    alert('تصویر لوڈ نہیں ہو سکی / Could not load image');
                }
            }
            e.target.value = '';
        });

        document.getElementById('listImagePreview')?.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-remove-list-img]');
            if (!btn) return;
            pendingImages.splice(Number(btn.getAttribute('data-remove-list-img')), 1);
            renderImagePreview();
        });

        document.getElementById('ownerPropertyForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!OwnerAuth.isLoggedIn()) {
                showAuthGate();
                return;
            }

            const data = collectFormData();
            let cloudOk = false;
            let saved = null;

            try {
                saved = await OwnerAuth.submitListing(data);
                data.id = saved.id;
                data.status = saved.status || 'pending';
                cloudOk = OwnerAuth.usesCloud();
            } catch (err) {
                alert(err.message || 'محفوظ نہیں ہو سکا');
                return;
            }

            const agency = PH.getAgency();
            const phone = agency.phone || PH.DEFAULT_AGENCY.phone;
            window.open(PH.whatsAppUrl(PH.ownerSubmissionWhatsAppText(data), phone), '_blank', 'noopener,noreferrer');

            const sheetRes = await PH.persistDataRow('OwnerSubmissions', PH.ownerSubmissionSheetRow(data));
            if (window.LocalDbAuth?.isConfigured()) {
                try {
                    await LocalDbAuth.syncPublicListingsToLocal();
                } catch (err) {
                    console.warn('local db public listings', err);
                }
            }
            showSuccess(sheetRes, cloudOk);
        });

        document.getElementById('listAnother')?.addEventListener('click', resetForm);
    });
})();

