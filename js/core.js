/**
 * پراپرٹی ہب — Core (storage, auth, export, images)
 */
const PropertyHub = {
    BRAND_NAME: 'ASK REAL ESTATE FAISALABAD',

    DEFAULT_AGENCY: {
        name: 'ASK REAL ESTATE FAISALABAD',
        contactName: 'حافظ عبدالصمد خٹک',
        phone: '0321-5315603',
        whatsapp: '+923215315603',
        email: 'abdulsamadkhattak5@gmail.com',
        address: 'فیصل آباد، پاکستان',
        city: 'Faisalabad',
        contactNote: 'مزید معلومات کے لیے رابطہ کیجئے',
        ceoPhoto: '',
    },

    STORAGE: {
        properties: 'propertyHub_properties',
        clients: 'propertyHub_clients',
        users: 'propertyHub_users',
        session: 'propertyHub_session',
        publicCatalog: 'propertyHub_publicCatalog',
        agency: 'propertyHub_agency',
        wishlist: 'propertyHub_wishlist',
        cookiesOk: 'propertyHub_cookiesOk',
        ownerSubmissions: 'propertyHub_ownerSubmissions',
        ownerUsers: 'propertyHub_ownerUsers',
        ownerSession: 'propertyHub_ownerSession',
        inquiries: 'propertyHub_inquiries',
        sheetsSettings: 'propertyHub_sheetsSettings',
    },

    OWNER_SUBMISSION_STATUS: {
        pending: 'نئی درخواست',
        reviewed: 'دیکھ لی گئی',
        converted: 'لسٹنگ بن گئی',
    },

    LABELS: {
        purpose: { sale: 'فروخت', rent: 'کرایہ' },
        clientPurpose: {
            buy: 'خریدنا',
            rent: 'کرایہ پر لینا',
            sell: 'بیچنا',
            lease_out: 'کرایہ پر دینا',
        },
        type: {
            house: 'مکان',
            room: 'کمرہ',
            flat: 'فلیٹ',
            penthouse: 'penthouse',
            farmhouse: 'فارم ہاؤس',
            shop: 'دکان',
            office: 'آفس',
            hall: 'ہال',
            building: 'عمارت',
            factory: 'فیکٹری',
            warehouse: 'گودام',
            plot: 'پلاٹ',
            residential_plot: 'رہائشی پلاٹ',
            commercial_plot: 'کمرشل پلاٹ',
            agricultural: 'زرعی زمین',
            industrial: 'صنعتی زمین',
            lower_portion: 'لوئر پورشن',
            other: 'دیگر',
        },
        status: { active: 'فعال', matched: 'میچ ہو گیا', closed: 'بند' },
        icons: {
            house: '🏠',
            room: '🛏️',
            flat: '🏘️',
            penthouse: '🏙️',
            farmhouse: '🌾',
            shop: '🏪',
            office: '🏢',
            hall: '🏛️',
            building: '🏬',
            factory: '🏭',
            warehouse: '📦',
            plot: '📐',
            residential_plot: '📐',
            commercial_plot: '🗺️',
            agricultural: '🌾',
            industrial: '🏭',
            lower_portion: '🏠',
            other: '📋',
        },
    },

    uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },

    escapeHTML(str) {
        if (!str) return '';
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    },

    sanitizeId(id) {
        if (id == null) return '';
        return String(id).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    },

    formatPrice(n) {
        if (n == null || n === '') return '—';
        return 'Rs ' + Number(n).toLocaleString('en-PK');
    },

    /** zameen.com style — لاکھ / ہزار */
    formatPriceZameen(n) {
        if (n == null || n === '') return '—';
        const num = Number(n);
        const fmt = (v) => (v % 1 === 0 ? v.toFixed(0) : v.toFixed(2).replace(/\.?0+$/, ''));
        if (num >= 10000000) return 'PKR ' + fmt(num / 10000000) + ' کروڑ';
        if (num >= 100000) return 'PKR ' + fmt(num / 100000) + ' لاکھ';
        if (num >= 1000) return 'PKR ' + fmt(num / 1000) + ' ہزار';
        return 'PKR ' + num.toLocaleString('en-PK');
    },

    formatRelativeUrdu(iso) {
        if (!iso) return '';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return 'ابھی شامل';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + ' گھنٹے پہلے';
        const days = Math.floor(hrs / 24);
        if (days < 7) return days + ' دن پہلے';
        const weeks = Math.floor(days / 7);
        if (weeks < 5) return weeks + ' ہفتے پہلے';
        return new Date(iso).toLocaleDateString('ur-PK');
    },

    formatRelativeEn(iso) {
        if (!iso) return 'recently';
        const diff = Date.now() - new Date(iso).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return 'just now';
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return hrs + ' hour' + (hrs === 1 ? '' : 's') + ' ago';
        const days = Math.floor(hrs / 24);
        if (days < 7) return days + ' day' + (days === 1 ? '' : 's') + ' ago';
        const weeks = Math.floor(days / 7);
        if (weeks < 5) return weeks + ' week' + (weeks === 1 ? '' : 's') + ' ago';
        return new Date(iso).toLocaleDateString('en-GB');
    },

    formatDate(iso) {
        if (!iso) return '';
        return new Date(iso).toLocaleDateString('ur-PK');
    },

    getSession() {
        try {
            const session = JSON.parse(localStorage.getItem(this.STORAGE.session) || 'null');
            if (!session) return null;
            if (session.expiresAt && session.expiresAt < Date.now()) {
                this.logout();
                return null;
            }
            return session;
        } catch {
            return null;
        }
    },

    setSession(user) {
        if (user) {
            const token =
                typeof AskSecurity !== 'undefined' ? AskSecurity.randomToken() : String(Date.now());
            const expiresAt =
                typeof AskSecurity !== 'undefined'
                    ? AskSecurity.sessionExpiryMs()
                    : Date.now() + 8 * 60 * 60 * 1000;
            localStorage.setItem(
                this.STORAGE.session,
                JSON.stringify({
                    userId: user.id,
                    name: user.name,
                    role: user.role,
                    token,
                    expiresAt,
                })
            );
        } else {
            localStorage.removeItem(this.STORAGE.session);
        }
    },

    loadUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE.users) || '[]');
        } catch {
            return [];
        }
    },

    saveUsers(list) {
        localStorage.setItem(this.STORAGE.users, JSON.stringify(list));
    },

    ensureDefaultAgency() {
        const defaults = this.DEFAULT_AGENCY;
        const agency = this.getAgency();
        if (!agency || !agency.name) {
            this.saveAgency({ ...defaults });
            return;
        }
        const merged = { ...defaults, ...agency };
        let changed = false;
        ['phone', 'contactName', 'whatsapp', 'contactNote', 'email', 'address'].forEach((key) => {
            if (!agency[key] && defaults[key]) {
                merged[key] = defaults[key];
                changed = true;
            }
        });
        if (changed) this.saveAgency(merged);
    },

    ensureDefaultAdmin() {
        /* sync fallback — prefer ensureDefaultAdminAsync */
        if (this.loadUsers().length > 0) return;
        this.saveUsers([
            {
                id: 'admin',
                name: 'حافظ عبدالصمد خٹک',
                username: 'admin',
                password: '1234',
                phone: '0321-5315603',
                email: 'abdulsamadkhattak5@gmail.com',
                role: 'admin',
                mustChangePassword: true,
            },
        ]);
    },

    async ensureDefaultAdminAsync() {
        const users = this.loadUsers();
        if (users.length > 0) return;
        if (typeof AskSecurity === 'undefined') {
            this.ensureDefaultAdmin();
            return;
        }
        const { hash, salt } = await AskSecurity.hashPassword('1234');
        this.saveUsers([
            {
                id: 'admin',
                name: 'حافظ عبدالصمد خٹک',
                username: 'admin',
                passwordHash: hash,
                passwordSalt: salt,
                phone: '0321-5315603',
                email: 'abdulsamadkhattak5@gmail.com',
                role: 'admin',
                mustChangePassword: true,
            },
        ]);
    },

    async upgradePlainPasswords() {
        if (typeof AskSecurity === 'undefined') return;
        const users = this.loadUsers();
        let changed = false;
        for (const u of users) {
            if (u.password && !u.passwordHash) {
                const { hash, salt } = await AskSecurity.hashPassword(u.password);
                u.passwordHash = hash;
                u.passwordSalt = salt;
                delete u.password;
                changed = true;
            }
        }
        if (changed) this.saveUsers(users);
    },

    async setUserPassword(user, password) {
        if (typeof AskSecurity === 'undefined') {
            user.password = password;
            delete user.passwordHash;
            delete user.passwordSalt;
            return user;
        }
        const { hash, salt } = await AskSecurity.hashPassword(password);
        user.passwordHash = hash;
        user.passwordSalt = salt;
        delete user.password;
        user.mustChangePassword = false;
        return user;
    },

    async verifyUserPassword(user, password) {
        if (!user) return false;
        if (user.passwordHash && user.passwordSalt && typeof AskSecurity !== 'undefined') {
            return AskSecurity.verifyPassword(password, user.passwordHash, user.passwordSalt);
        }
        if (user.password) return user.password === password;
        return false;
    },

    async loginAsync(username, password) {
        const name = (username || '').trim();
        if (typeof AskSecurity !== 'undefined') {
            const limit = AskSecurity.checkLoginRateLimit(name);
            if (!limit.ok) return { error: limit.message };
        }
        const user = this.loadUsers().find((u) => u.username === name);
        if (!user) {
            if (typeof AskSecurity !== 'undefined') AskSecurity.recordLoginFail(name);
            return { error: 'غلط لاگ ان یا پاس ورڈ' };
        }
        const valid = await this.verifyUserPassword(user, password);
        if (!valid) {
            if (typeof AskSecurity !== 'undefined') AskSecurity.recordLoginFail(name);
            return { error: 'غلط لاگ ان یا پاس ورڈ' };
        }
        if (user.password && !user.passwordHash) {
            await this.setUserPassword(user, password);
            const users = this.loadUsers().map((u) => (u.id === user.id ? user : u));
            this.saveUsers(users);
        }
        if (typeof AskSecurity !== 'undefined') AskSecurity.clearLoginFails(name);
        this.setSession(user);
        return { user };
    },

    login(username, password) {
        const user = this.loadUsers().find(
            (u) => u.username === username.trim() && u.password === password
        );
        if (!user) return null;
        this.setSession(user);
        return user;
    },

    logout() {
        this.setSession(null);
    },

    getCurrentUser() {
        const session = this.getSession();
        if (!session) return null;
        return this.loadUsers().find((u) => u.id === session.userId) || null;
    },

    isAdmin() {
        const s = this.getSession();
        return s?.role === 'admin';
    },

    getAgency() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE.agency) || '{}');
        } catch {
            return {};
        }
    },

    saveAgency(data) {
        localStorage.setItem(this.STORAGE.agency, JSON.stringify(data));
    },

    _loadRaw(key) {
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
            return [];
        }
    },

    _saveRaw(key, list) {
        localStorage.setItem(key, JSON.stringify(list));
    },

    loadProperties() {
        const session = this.getSession();
        const all = this._loadRaw(this.STORAGE.properties);
        if (!session) return all;
        return all.filter((p) => !p.dealerId || p.dealerId === session.userId);
    },

    loadAllProperties() {
        return this._loadRaw(this.STORAGE.properties);
    },

    saveProperties(list) {
        const session = this.getSession();
        if (!session) {
            this._saveRaw(this.STORAGE.properties, list);
            return;
        }
        const all = this.loadAllProperties().filter((p) => p.dealerId && p.dealerId !== session.userId);
        const mine = list.map((p) => ({ ...p, dealerId: p.dealerId || session.userId }));
        this._saveRaw(this.STORAGE.properties, [...all, ...mine]);
    },

    loadClients() {
        const session = this.getSession();
        const all = this._loadRaw(this.STORAGE.clients);
        if (!session) return all;
        return all.filter((c) => !c.dealerId || c.dealerId === session.userId);
    },

    loadAllClients() {
        return this._loadRaw(this.STORAGE.clients);
    },

    saveClients(list) {
        const session = this.getSession();
        if (!session) {
            this._saveRaw(this.STORAGE.clients, list);
            return;
        }
        const all = this.loadAllClients().filter((c) => c.dealerId && c.dealerId !== session.userId);
        const mine = list.map((c) => ({ ...c, dealerId: c.dealerId || session.userId }));
        this._saveRaw(this.STORAGE.clients, [...all, ...mine]);
    },

    loadOwnerSubmissions() {
        return this._loadRaw(this.STORAGE.ownerSubmissions);
    },

    saveOwnerSubmissions(list) {
        this._saveRaw(this.STORAGE.ownerSubmissions, list);
    },

    loadOwnerUsers() {
        return this._loadRaw(this.STORAGE.ownerUsers);
    },

    saveOwnerUsers(list) {
        this._saveRaw(this.STORAGE.ownerUsers, list);
    },

    getOwnerSession() {
        try {
            const raw = localStorage.getItem(this.STORAGE.ownerSession);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (session.expiresAt && Date.now() > session.expiresAt) {
                this.clearOwnerSession();
                return null;
            }
            return session;
        } catch {
            return null;
        }
    },

    setOwnerSession(userId) {
        const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem(this.STORAGE.ownerSession, JSON.stringify({ userId, expiresAt }));
    },

    clearOwnerSession() {
        localStorage.removeItem(this.STORAGE.ownerSession);
    },

    getOwnerUserById(id) {
        return this.loadOwnerUsers().find((u) => u.id === id) || null;
    },

    getOwnerUserByEmail(email) {
        const e = (email || '').trim().toLowerCase();
        return this.loadOwnerUsers().find((u) => u.email === e) || null;
    },

    async registerOwner({ email, password, fullName, phone }) {
        const normalized = (email || '').trim().toLowerCase();
        if (!normalized || !password || password.length < 6) {
            throw new Error('درست ای میل اور کم از کم 6 حروف کا پاس ورڈ درکار');
        }
        if (this.getOwnerUserByEmail(normalized)) {
            throw new Error('یہ ای میل پہلے سے رجسٹر ہے — لاگ ان کریں');
        }
        const user = {
            id: this.uid(),
            email: normalized,
            fullName: (fullName || '').trim(),
            phone: (phone || '').trim(),
            createdAt: new Date().toISOString(),
        };
        await this.setUserPassword(user, password);
        const list = this.loadOwnerUsers();
        list.push(user);
        this.saveOwnerUsers(list);
        this.setOwnerSession(user.id);
        return user;
    },

    async loginOwner(email, password) {
        const normalized = (email || '').trim().toLowerCase();
        if (typeof AskSecurity !== 'undefined') {
            const limit = AskSecurity.checkLoginRateLimit('owner:' + normalized);
            if (!limit.ok) throw new Error(limit.message);
        }
        const user = this.getOwnerUserByEmail(normalized);
        if (!user || !(await this.verifyUserPassword(user, password))) {
            if (typeof AskSecurity !== 'undefined') AskSecurity.recordLoginFail('owner:' + normalized);
            throw new Error('غلط ای میل یا پاس ورڈ');
        }
        if (typeof AskSecurity !== 'undefined') AskSecurity.clearLoginFails('owner:' + normalized);
        this.setOwnerSession(user.id);
        return user;
    },

    logoutOwner() {
        this.clearOwnerSession();
    },

    getCurrentOwnerUser() {
        const session = this.getOwnerSession();
        if (!session?.userId) return null;
        return this.getOwnerUserById(session.userId);
    },

    loadSubmissionsForOwner(userId) {
        if (!userId) return [];
        return this.loadOwnerSubmissions().filter((s) => s.userId === userId);
    },

    upsertOwnerSubmission(data) {
        const list = this.loadOwnerSubmissions();
        const idx = list.findIndex((s) => s.id === data.id);
        const entry = {
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...data,
        };
        if (idx >= 0) list[idx] = { ...list[idx], ...entry };
        else list.unshift(entry);
        this.saveOwnerSubmissions(list);
        return entry;
    },

    addOwnerSubmission(data) {
        const owner = this.getCurrentOwnerUser();
        const entry = {
            id: this.uid(),
            status: 'pending',
            createdAt: new Date().toISOString(),
            userId: data.userId || owner?.id || null,
            submitterEmail: data.submitterEmail || owner?.email || data.ownerEmail || '',
            submitterName: data.submitterName || owner?.fullName || data.ownerName || '',
            ...data,
        };
        const list = this.loadOwnerSubmissions();
        list.unshift(entry);
        this.saveOwnerSubmissions(list);
        return entry;
    },

    loadInquiries() {
        return this._loadRaw(this.STORAGE.inquiries);
    },

    addInquiry(data) {
        const entry = { id: this.uid(), createdAt: new Date().toISOString(), ...data };
        const list = this.loadInquiries();
        list.unshift(entry);
        this._saveRaw(this.STORAGE.inquiries, list);
        return entry;
    },

    setLastSheetsResult(result) {
        try {
            localStorage.setItem('propertyHub_lastSheetsResult', JSON.stringify({ ...result, at: new Date().toISOString() }));
        } catch {
            /* ignore */
        }
    },

    getLastSheetsResult() {
        try {
            return JSON.parse(localStorage.getItem('propertyHub_lastSheetsResult') || 'null');
        } catch {
            return null;
        }
    },

    sheetsStatusMessage() {
        if (!this.sheetsEnabled()) {
            const c = this.sheetsConfig();
            if (!c.webAppUrl) return 'Google Sheets بند — dealer میں Web App URL محفوظ کریں';
            if (!c.enabled) return 'Google Sheets بند — «Google Sheets فعال» چیک کریں اور محفوظ کریں';
            return 'Google Sheets ترتیب نامکمل';
        }
        const last = this.getLastSheetsResult();
        if (last && last.ok) return 'آخری بھیجائی: کامیاب (' + (last.sheet || '') + ')';
        if (last && !last.ok && !last.skipped) return 'آخری بھیجائی: ناکام — ' + (last.error || last.raw || 'Unauthorized');
        return 'Google Sheets فعال — نیا ڈیٹا بھیجا جائے گا';
    },

    async persistDataRow(sheetName, row) {
        if (typeof DataSheet !== 'undefined') {
            await DataSheet.record(sheetName, row);
        }
        const result = await this.submitToGoogleSheet(sheetName, row);
        result.sheet = sheetName;
        this.setLastSheetsResult(result);
        return result;
    },

    updateOwnerSubmission(id, patch) {
        const list = this.loadOwnerSubmissions();
        const idx = list.findIndex((s) => s.id === id);
        if (idx < 0) return null;
        list[idx] = { ...list[idx], ...patch };
        this.saveOwnerSubmissions(list);
        return list[idx];
    },

    deleteOwnerSubmission(id) {
        const list = this.loadOwnerSubmissions().filter((s) => s.id !== id);
        this.saveOwnerSubmissions(list);
    },

    ownerSubmissionWhatsAppText(sub) {
        const L = this.LABELS;
        const lines = [
            '🏠 *نئی پراپرٹی — ویب سائٹ سے*',
            `مقصد: ${L.purpose[sub.purpose] || sub.purpose}`,
            `قسم: ${L.type[sub.type] || sub.type}`,
            sub.title ? `عنوان: ${sub.title}` : '',
            `قیمت: ${this.formatPrice(sub.price)}${sub.purpose === 'rent' ? ' / ماہ' : ''}`,
            `علاقہ: ${sub.area || '—'}${sub.city ? '، ' + sub.city : ''}`,
            sub.size ? `سائز: ${sub.size}` : '',
            sub.beds ? `بیڈروم: ${sub.beds}` : '',
            sub.baths ? `باتھ: ${sub.baths}` : '',
            sub.floors ? `منزلیں: ${sub.floors}` : '',
            sub.address ? `پتہ: ${sub.address}` : '',
            sub.description ? `\nتفصیل:\n${sub.description}` : '',
            `\nمالک: ${sub.ownerName}`,
            `فون: ${sub.ownerPhone}`,
            sub.ownerEmail ? `ای میل: ${sub.ownerEmail}` : '',
        ].filter(Boolean);
        return lines.join('\n');
    },

    sheetsConfig() {
        const base =
            typeof GoogleSheetsConfig !== 'undefined'
                ? { ...GoogleSheetsConfig }
                : { enabled: false, webAppUrl: '', secret: '' };
        try {
            const saved = JSON.parse(localStorage.getItem(this.STORAGE.sheetsSettings) || '{}');
            return { ...base, ...saved };
        } catch {
            return base;
        }
    },

    normalizeSheetsWebAppUrl(url) {
        let u = String(url || '').trim();
        if (!u) return '';
        if (/\/dev\s*$/i.test(u)) {
            return { error: 'یہ /dev URL ہے — صرف ٹیسٹ کے لیے۔ Deploy سے /exec والا URL کاپی کریں۔' };
        }
        if (u.includes('/dev?')) {
            return { error: '/dev URL ویب سائٹ میں نہیں چلے گا۔ Manage deployments سے /exec URL لیں۔' };
        }
        if (!u.endsWith('/exec')) {
            if (u.includes('/macros/s/')) {
                u = u.replace(/\/(dev|exec)?\s*$/i, '') + '/exec';
            }
        }
        return { url: u };
    },

    saveSheetsSettings(cfg) {
        if (cfg.webAppUrl != null) {
            const norm = this.normalizeSheetsWebAppUrl(cfg.webAppUrl);
            if (norm.error) return { error: norm.error };
            cfg.webAppUrl = norm.url;
        }
        const merged = { ...this.sheetsConfig(), ...cfg };
        localStorage.setItem(this.STORAGE.sheetsSettings, JSON.stringify(merged));
        if (typeof GoogleSheetsConfig !== 'undefined') {
            Object.assign(GoogleSheetsConfig, merged);
        }
        return { ok: true, config: merged };
    },

    sheetsEnabled() {
        const c = this.sheetsConfig();
        return !!(c.enabled && c.webAppUrl && String(c.webAppUrl).startsWith('http'));
    },

    sheetsApiUrl(params = {}) {
        const cfg = this.sheetsConfig();
        const u = new URL(cfg.webAppUrl);
        Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
        if (cfg.secret) u.searchParams.set('secret', cfg.secret);
        return u.toString();
    },

    ownerSubmissionSheetRow(sub) {
        const L = this.LABELS;
        return [
            new Date().toISOString(),
            sub.id || '',
            L.purpose[sub.purpose] || sub.purpose || '',
            L.type[sub.type] || sub.type || '',
            sub.title || '',
            sub.price ?? '',
            sub.area || '',
            sub.city || '',
            sub.size || '',
            sub.beds ?? '',
            sub.baths ?? '',
            sub.floors ?? '',
            sub.address || '',
            sub.description || '',
            sub.ownerName || '',
            sub.ownerPhone || '',
            sub.ownerEmail || '',
            (sub.images && sub.images.length) || 0,
            sub.status || 'pending',
        ];
    },

    inquirySheetRow(data) {
        return [
            new Date().toISOString(),
            data.name || '',
            data.phone || '',
            data.inquiryType || '',
            data.role || '',
            data.propertyType || '',
            data.message || '',
        ];
    },

    propertySheetRow(p) {
        const L = this.LABELS;
        return [
            new Date().toISOString(),
            p.id || '',
            p.title || '',
            L.purpose[p.purpose] || p.purpose || '',
            L.type[p.type] || p.type || '',
            p.price ?? '',
            p.city || '',
            p.area || '',
            p.size || '',
            p.beds ?? '',
            p.baths ?? '',
            p.owner || '',
            p.phone || '',
            p.published ? 'Yes' : 'No',
            p.featured ? 'Yes' : 'No',
            (p.description || '').slice(0, 5000),
            (p.images && p.images.length) || 0,
        ];
    },

    async submitToGoogleSheet(sheetName, row) {
        if (!this.sheetsEnabled()) {
            return { ok: false, skipped: true, reason: 'sheets_disabled' };
        }
        const cfg = this.sheetsConfig();
        const payload = JSON.stringify({
            secret: cfg.secret || '',
            action: 'append',
            sheet: sheetName,
            row,
        });
        try {
            let res = await fetch(cfg.webAppUrl, {
                method: 'POST',
                mode: 'cors',
                redirect: 'follow',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: payload,
            });
            let text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                data = { ok: res.ok, raw: text.slice(0, 200) };
            }
            if (data.ok) return data;
            if (data.error === 'Unauthorized') {
                return { ok: false, error: 'Secret غلط — Code.gs میں API_SECRET اور dealer میں Secret ایک جیسے رکھیں' };
            }
            return data;
        } catch (err) {
            if (location.protocol === 'file:') {
                return { ok: false, error: 'file:// سے Sheets نہیں چلتا — start-local-server.bat استعمال کریں' };
            }
            console.warn('Google Sheets:', err);
            return { ok: false, error: err.message || String(err) };
        }
    },

    async rebuildGoogleSheet(sheetName, rows) {
        if (!this.sheetsEnabled()) {
            return { ok: false, skipped: true };
        }
        const cfg = this.sheetsConfig();
        try {
            const res = await fetch(cfg.webAppUrl, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    secret: cfg.secret || '',
                    action: 'rebuild',
                    sheet: sheetName,
                    rows: rows || [],
                }),
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                return { ok: res.ok, raw: text };
            }
        } catch (err) {
            return { ok: false, error: err.message || String(err) };
        }
    },

    clientSheetRow(c) {
        const L = this.LABELS;
        return [
            new Date().toISOString(),
            c.id || '',
            c.name || '',
            c.phone || '',
            L.clientPurpose[c.purpose] || c.purpose || '',
            L.type[c.type] || c.type || '',
            c.budgetMin ?? '',
            c.budgetMax ?? '',
            c.city || '',
            c.areas || '',
            L.status[c.status] || c.status || '',
            (c.notes || '').slice(0, 3000),
        ];
    },

    async setupGoogleSheets() {
        if (!this.sheetsEnabled()) return { ok: false, skipped: true };
        try {
            const res = await fetch(this.sheetsApiUrl({ action: 'setup' }), { mode: 'cors' });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                return { ok: res.ok, raw: text };
            }
        } catch (err) {
            return { ok: false, error: err.message || String(err) };
        }
    },

    async syncAllToGoogleSheets() {
        if (!this.sheetsEnabled()) return { ok: false, skipped: true };
        await this.setupGoogleSheets();
        const jobs = [
            ['OwnerSubmissions', this.loadOwnerSubmissions().map((s) => this.ownerSubmissionSheetRow(s))],
            ['Inquiries', this.loadInquiries().map((q) => this.inquirySheetRow(q))],
            ['Properties', this.loadAllProperties().map((p) => this.propertySheetRow(p))],
            ['Clients', this.loadAllClients().map((c) => this.clientSheetRow(c))],
        ];
        let ok = 0;
        let fail = 0;
        let rows = 0;
        for (const [name, data] of jobs) {
            const r = await this.rebuildGoogleSheet(name, data);
            if (r.ok) {
                ok++;
                rows += data.length;
            } else fail++;
        }
        return { ok, fail, rows };
    },

    syncPublicCatalog() {
        const agency = this.getAgency();
        const published = this.loadAllProperties()
            .filter((p) => p.published)
            .map((p) => ({
                id: p.id,
                title: p.title,
                purpose: p.purpose,
                type: p.type,
                price: p.price,
                city: p.city,
                area: p.area,
                size: p.size,
                beds: p.beds || 0,
                baths: p.baths || 0,
                floors: p.floors || 0,
                description: p.description,
                featured: p.featured,
                image: p.images?.[0] || null,
                phone: agency.phone || p.phone,
                contactName: agency.contactName || '',
                agencyName: agency.name || this.BRAND_NAME,
                createdAt: p.createdAt,
            }));
        localStorage.setItem(this.STORAGE.publicCatalog, JSON.stringify({ agency, listings: published }));
        return published.length;
    },

    getPublicCatalog() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE.publicCatalog) || '{"listings":[]}');
        } catch {
            return { listings: [] };
        }
    },

    getWishlist() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE.wishlist) || '[]');
        } catch {
            return [];
        }
    },

    saveWishlist(ids) {
        localStorage.setItem(this.STORAGE.wishlist, JSON.stringify([...new Set(ids)]));
        document.dispatchEvent(new CustomEvent('wishlist:change', { detail: { count: ids.length } }));
    },

    isWishlisted(id) {
        return this.getWishlist().includes(id);
    },

    toggleWishlist(id) {
        const list = this.getWishlist();
        const idx = list.indexOf(id);
        if (idx >= 0) list.splice(idx, 1);
        else list.push(id);
        this.saveWishlist(list);
        return idx < 0;
    },

    updateWishlistBadge() {
        const count = this.getWishlist().length;
        document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
            el.textContent = count;
        });
    },

    drawImageWatermark(ctx, w, h) {
        const brand = 'ASK REAL ESTATE';
        const shortBrand = 'ASK';
        const diagonalFont = Math.max(24, Math.round(w / 18));
        const stampFont = Math.max(18, Math.round(w / 28));

        ctx.save();
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = Math.max(2, Math.round(w / 360));
        ctx.font = `700 ${diagonalFont}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.translate(w / 2, h / 2);
        ctx.rotate((-28 * Math.PI) / 180);
        const stepX = Math.max(260, w / 2.4);
        const stepY = Math.max(150, h / 3.2);
        for (let y = -h; y <= h; y += stepY) {
            for (let x = -w; x <= w; x += stepX) {
                ctx.strokeText(brand, x, y);
                ctx.fillText(brand, x, y);
            }
        }
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.9;
        const pad = Math.max(12, Math.round(w / 45));
        const badgeH = Math.max(42, Math.round(h / 12));
        ctx.fillStyle = 'rgba(10, 37, 64, 0.72)';
        ctx.fillRect(0, h - badgeH, w, badgeH);
        ctx.fillStyle = '#ffffff';
        ctx.font = `800 ${stampFont}px Arial, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${shortBrand} REAL ESTATE FAISALABAD`, pad, h - badgeH / 2);
        ctx.restore();
    },

    compressImage(file, maxW = 800, quality = 0.75) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width;
                    let h = img.height;
                    if (w > maxW) {
                        h = (h * maxW) / w;
                        w = maxW;
                    }
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, w, h);
                    this.drawImageWatermark(ctx, w, h);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    },

    propertyShareText(p) {
        const L = this.LABELS;
        const agency = this.getAgency();
        const contact = agency.contactName ? `${agency.contactName}\n` : '';
        const lines = [
            `🏠 *${p.title}*`,
            `${L.purpose[p.purpose]} | ${L.type[p.type]}`,
            `💰 ${this.formatPrice(p.price)}${p.purpose === 'rent' ? ' / ماہ' : ''}`,
            `📍 ${p.city}${p.area ? '، ' + p.area : ''}`,
            p.size ? `📐 ${p.size}` : '',
            p.beds ? `🛏 ${p.beds} بیڈروم` : '',
            p.description ? `\n${p.description}` : '',
            `\n${agency.contactNote || 'مزید معلومات کے لیے رابطہ کیجئے'}`,
            contact + `📞 WhatsApp: ${agency.phone || p.phone || '—'}`,
            agency.name ? `🏢 ${agency.name}` : '',
        ].filter(Boolean);
        if (p.id && typeof this.getSiteUrl === 'function') {
            const base = this.getSiteUrl();
            if (base && String(base).startsWith('http')) {
                lines.push(`🔗 ${base}/property.html?id=${encodeURIComponent(p.id)}`);
            }
        }
        return lines.filter(Boolean).join('\n');
    },

    whatsAppUrl(text, phone) {
        let num = String(phone || this.getAgency()?.whatsapp || this.getAgency()?.phone || this.DEFAULT_AGENCY.whatsapp || '')
            .replace(/\D/g, '');
        // پاکستان: 03xxxxxxxxx → 923xxxxxxxxx (+92)
        if (num.startsWith('00')) num = num.slice(2);
        if (num.startsWith('0')) num = '92' + num.slice(1);
        if (!num.startsWith('92') && num.length === 10) num = '92' + num;
        const base = num ? `https://wa.me/${num}?text=` : 'https://wa.me/?text=';
        return base + encodeURIComponent(text || '');
    },

    exportJSON() {
        const session = this.getSession();
        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            dealer: session?.name,
            properties: this.loadProperties(),
            clients: this.loadClients(),
            ownerSubmissions: this.loadOwnerSubmissions(),
            inquiries: this.loadInquiries(),
            agency: this.getAgency(),
        };
    },

    importJSON(data, merge = true) {
        if (!data || !data.version) throw new Error('غلط فائل');
        const session = this.getSession();
        const dealerId = session?.userId;

        if (data.agency) this.saveAgency(data.agency);

        if (data.properties?.length) {
            let props = merge ? this.loadAllProperties() : [];
            const incoming = data.properties.map((p) => ({
                ...p,
                id: p.id || this.uid(),
                dealerId: p.dealerId || dealerId,
            }));
            if (merge) {
                const ids = new Set(incoming.map((p) => p.id));
                props = props.filter((p) => !ids.has(p.id));
                props = [...props, ...incoming];
            } else {
                props = incoming;
            }
            this._saveRaw(this.STORAGE.properties, props);
        }

        if (data.clients?.length) {
            let clients = merge ? this.loadAllClients() : [];
            const incoming = data.clients.map((c) => ({
                ...c,
                id: c.id || this.uid(),
                dealerId: c.dealerId || dealerId,
            }));
            if (merge) {
                const ids = new Set(incoming.map((c) => c.id));
                clients = clients.filter((c) => !ids.has(c.id));
                clients = [...clients, ...incoming];
            } else {
                clients = incoming;
            }
            this._saveRaw(this.STORAGE.clients, clients);
        }

        if (data.ownerSubmissions?.length) {
            let subs = merge ? this.loadOwnerSubmissions() : [];
            const incoming = data.ownerSubmissions.map((s) => ({
                ...s,
                id: s.id || this.uid(),
            }));
            if (merge) {
                const ids = new Set(incoming.map((s) => s.id));
                subs = subs.filter((s) => !ids.has(s.id));
                subs = [...subs, ...incoming];
            } else {
                subs = incoming;
            }
            this.saveOwnerSubmissions(subs);
        }

        if (data.inquiries?.length) {
            let inq = merge ? this.loadInquiries() : [];
            const incoming = data.inquiries.map((q) => ({ ...q, id: q.id || this.uid() }));
            if (merge) {
                const ids = new Set(incoming.map((q) => q.id));
                inq = inq.filter((q) => !ids.has(q.id));
                inq = [...inq, ...incoming];
            } else {
                inq = incoming;
            }
            this._saveRaw(this.STORAGE.inquiries, inq);
        }
    },

    exportCSV() {
        const props = this.loadProperties();
        const clients = this.loadClients();
        const L = this.LABELS;
        const bom = '\uFEFF';

        const propRows = [
            ['عنوان', 'مقصد', 'قسم', 'قیمت', 'شہر', 'علاقہ', 'سائز', 'بیڈ', 'باتھ', 'مالک', 'فون', 'تفصیل', 'شائع', 'تاریخ'].join(','),
            ...props.map((p) =>
                [
                    p.title,
                    L.purpose[p.purpose],
                    L.type[p.type],
                    p.price,
                    p.city,
                    p.area,
                    p.size,
                    p.beds,
                    p.baths,
                    p.owner,
                    p.phone,
                    (p.description || '').replace(/,/g, ' '),
                    p.published ? 'ہاں' : 'نہیں',
                    p.createdAt,
                ]
                    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                    .join(',')
            ),
        ].join('\n');

        const clientRows = [
            ['نام', 'فون', 'مقصد', 'قسم', 'بجٹ از', 'بجٹ تک', 'شہر', 'علاقے', 'نوٹس', 'حیثیت'].join(','),
            ...clients.map((c) =>
                [
                    c.name,
                    c.phone,
                    L.clientPurpose[c.purpose],
                    L.type[c.type],
                    c.budgetMin,
                    c.budgetMax,
                    c.city,
                    c.areas,
                    (c.notes || '').replace(/,/g, ' '),
                    L.status[c.status],
                ]
                    .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
                    .join(',')
            ),
        ].join('\n');

        return {
            properties: bom + propRows,
            clients: bom + clientRows,
        };
    },

    downloadFile(content, filename, mime = 'text/plain') {
        const blob = new Blob([content], { type: mime });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    },
};
