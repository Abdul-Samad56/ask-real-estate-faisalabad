/**
 * Client-side security helpers (dealer panel)
 */
const AskSecurity = {
    SESSION_HOURS: 8,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_MINUTES: 15,
    PBKDF2_ITERATIONS: 120000,

    STORAGE_ATTEMPTS: 'propertyHub_loginAttempts',

    randomToken(bytes = 16) {
        const arr = new Uint8Array(bytes);
        crypto.getRandomValues(arr);
        return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
    },

    async hashPassword(password, saltB64) {
        if (!crypto?.subtle) {
            throw new Error('Secure context required (HTTPS or localhost)');
        }
        const salt = saltB64
            ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
            : crypto.getRandomValues(new Uint8Array(16));
        const enc = new TextEncoder();
        const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
        const bits = await crypto.subtle.deriveBits(
            { name: 'PBKDF2', salt, iterations: this.PBKDF2_ITERATIONS, hash: 'SHA-256' },
            key,
            256
        );
        return {
            hash: btoa(String.fromCharCode(...new Uint8Array(bits))),
            salt: btoa(String.fromCharCode(...salt)),
        };
    },

    async verifyPassword(password, hashB64, saltB64) {
        if (!hashB64 || !saltB64) return false;
        try {
            const { hash } = await this.hashPassword(password, saltB64);
            return hash === hashB64;
        } catch {
            return false;
        }
    },

    getAttempts() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_ATTEMPTS) || '{}');
        } catch {
            return {};
        }
    },

    saveAttempts(map) {
        localStorage.setItem(this.STORAGE_ATTEMPTS, JSON.stringify(map));
    },

    checkLoginRateLimit(username) {
        const key = (username || '').trim().toLowerCase();
        if (!key) return { ok: false, message: 'لاگ ان نام درج کریں' };
        const entry = this.getAttempts()[key];
        if (entry?.lockedUntil && entry.lockedUntil > Date.now()) {
            const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
            return { ok: false, message: `${mins} منٹ بعد دوبارہ کوشش کریں` };
        }
        return { ok: true };
    },

    recordLoginFail(username) {
        const key = (username || '').trim().toLowerCase();
        const map = this.getAttempts();
        const entry = map[key] || { count: 0 };
        entry.count = (entry.count || 0) + 1;
        if (entry.count >= this.MAX_LOGIN_ATTEMPTS) {
            entry.lockedUntil = Date.now() + this.LOCKOUT_MINUTES * 60 * 1000;
            entry.count = 0;
        }
        map[key] = entry;
        this.saveAttempts(map);
    },

    clearLoginFails(username) {
        const key = (username || '').trim().toLowerCase();
        const map = this.getAttempts();
        if (map[key]) {
            delete map[key];
            this.saveAttempts(map);
        }
    },

    sessionExpiryMs() {
        return Date.now() + this.SESSION_HOURS * 60 * 60 * 1000;
    },
};
