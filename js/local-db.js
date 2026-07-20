/**
 * Local SQLite API auth/listings.
 * Works when the site is opened through local-server.py (http://localhost:8000).
 */
(function () {
    const cfg =
        typeof SiteConfig !== 'undefined' && SiteConfig.localDatabase
            ? SiteConfig.localDatabase
            : { enabled: false, apiBaseUrl: '' };

    class LocalDbAuthService {
        constructor() {
            this.tokenKey = 'propertyHub_localDbToken';
            this.userKey = 'propertyHub_localDbUser';
            this.ready = true;
            this.user = this.loadUser();
        }

        isConfigured() {
            if (!cfg.enabled || location.protocol === 'file:') return false;
            const host = location.hostname;
            const isLocalHost = host === 'localhost' || host === '127.0.0.1';
            const dynamic =
                typeof SiteConfig !== 'undefined' && SiteConfig.dynamicBackend;
            return !!(isLocalHost || cfg.apiBaseUrl || dynamic);
        }

        async waitReady() {
            return true;
        }

        apiUrl(path) {
            const base = (cfg.apiBaseUrl || '').replace(/\/$/, '');
            return base + path;
        }

        getToken() {
            return localStorage.getItem(this.tokenKey) || '';
        }

        loadUser() {
            try {
                return JSON.parse(localStorage.getItem(this.userKey) || 'null');
            } catch {
                return null;
            }
        }

        saveSession(token, user) {
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user || null));
            this.user = user || null;
            window.dispatchEvent(new CustomEvent('localdb-auth:change'));
        }

        clearSession() {
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            this.user = null;
            window.dispatchEvent(new CustomEvent('localdb-auth:change'));
        }

        async request(path, options = {}) {
            if (!this.isConfigured()) {
                throw new Error('Local database کے لیے start-local-server.bat چلائیں');
            }
            const headers = { ...(options.headers || {}) };
            if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
            const token = this.getToken();
            if (token) headers.Authorization = `Bearer ${token}`;
            const res = await fetch(this.apiUrl(path), { ...options, headers });
            const text = await res.text();
            let data = {};
            try {
                data = text ? JSON.parse(text) : {};
            } catch {
                data = { error: text || res.statusText };
            }
            if (!res.ok) throw new Error(data.error || 'Local database request ناکام');
            return data;
        }

        isLoggedIn() {
            return !!(this.getToken() && this.user);
        }

        getUser() {
            return this.user;
        }

        getProfile() {
            return this.user;
        }

        isAdmin() {
            return this.user?.role === 'admin' || this.user?.role === 'dealer';
        }

        displayName() {
            return this.user?.full_name || this.user?.email || 'صارف';
        }

        async registerLocal({ email, password, fullName, phone }) {
            const data = await this.request('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, fullName, phone }),
            });
            this.saveSession(data.token, data.user);
            return data.user;
        }

        async loginLocal(email, password) {
            const data = await this.request('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });
            this.saveSession(data.token, data.user);
            return data.user;
        }

        async loginAdmin(loginName, password) {
            const adminEmail =
                (typeof SiteConfig !== 'undefined' && SiteConfig.adminProfile?.email) ||
                (typeof SiteConfig !== 'undefined' && SiteConfig.adminEmails?.[0]) ||
                '';
            const email = String(loginName || '').includes('@') ? loginName : adminEmail;
            const user = await this.loginLocal(email, password);
            if (!this.isAdmin()) {
                await this.signOut();
                throw new Error('یہ account admin نہیں ہے');
            }
            return user;
        }

        async signOut() {
            try {
                await this.request('/api/auth/logout', { method: 'POST' });
            } catch {
                /* local logout should still clear the browser session */
            }
            this.clearSession();
        }

        async submitOwnerListing(data) {
            return this.request('/api/submissions', {
                method: 'POST',
                body: JSON.stringify(data),
            });
        }

        async fetchMySubmissions() {
            return this.request('/api/submissions');
        }

        async deleteMySubmission(id) {
            await this.request(`/api/submissions/${encodeURIComponent(id)}`, { method: 'DELETE' });
        }

        async fetchAllSubmissions() {
            return this.request('/api/admin/submissions');
        }

        async fetchPublicListings() {
            return this.request('/api/public/listings');
        }

        async watermarkImageDataUrl(src) {
            if (!src || !String(src).startsWith('data:image/')) return src;
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        if (typeof PropertyHub !== 'undefined' && PropertyHub.drawImageWatermark) {
                            PropertyHub.drawImageWatermark(ctx, canvas.width, canvas.height);
                        }
                        resolve(canvas.toDataURL('image/jpeg', 0.78));
                    } catch {
                        resolve(src);
                    }
                };
                img.onerror = () => resolve(src);
                img.src = src;
            });
        }

        async watermarkListing(listing) {
            const images = await Promise.all((listing.images || []).map((src) => this.watermarkImageDataUrl(src)));
            return {
                ...listing,
                images,
                image: images[0] || listing.image || null,
            };
        }

        async syncPublicListingsToLocal() {
            if (typeof PropertyHub === 'undefined') return [];
            const rows = await this.fetchPublicListings();
            const listings = await Promise.all(
                rows.map(async (p) => {
                    const watermarked = await this.watermarkListing({
                        ...p,
                        images: p.images || [],
                        image: p.image || p.images?.[0] || null,
                        published: true,
                        localDb: true,
                    });
                    return watermarked;
                })
            );
            // Dynamic mode: Atlas listings replace browser demos/localStorage cache
            PropertyHub._saveRaw(PropertyHub.STORAGE.properties, listings);
            PropertyHub.syncPublicCatalog();
            localStorage.setItem('propertyHub_demoVersion', 'atlas-dynamic');
            return listings;
        }

        async updateSubmissionStatus(id, status) {
            return this.request(`/api/admin/submissions/${encodeURIComponent(id)}`, {
                method: 'PATCH',
                body: JSON.stringify({ status }),
            });
        }

        async deleteSubmission(id) {
            await this.request(`/api/admin/submissions/${encodeURIComponent(id)}`, { method: 'DELETE' });
        }

        toLocalSubmission(row) {
            const profile = row.profile || {};
            return {
                id: row.id,
                status: row.status,
                createdAt: row.created_at,
                userId: row.user_id,
                submitterEmail: profile.email || row.owner_email || '',
                submitterName: profile.full_name || row.owner_name || '',
                submitterPhone: profile.phone || row.owner_phone || '',
                purpose: row.purpose,
                type: row.type,
                area: row.area,
                city: row.city,
                price: row.price,
                size: row.size,
                beds: row.beds,
                baths: row.baths,
                floors: row.floors,
                title: row.title,
                address: row.address,
                description: row.description,
                ownerName: row.owner_name,
                ownerPhone: row.owner_phone,
                ownerEmail: row.owner_email,
                images: row.image_urls || [],
                localDb: true,
            };
        }
    }

    window.LocalDbAuth = new LocalDbAuthService();
})();
