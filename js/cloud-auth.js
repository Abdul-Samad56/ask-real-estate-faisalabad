/**
 * Google / Facebook OAuth + Supabase database
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const cfg = typeof SupabaseConfig !== 'undefined' ? SupabaseConfig : { enabled: false };

class CloudAuthService {
    constructor() {
        this.client = null;
        this.session = null;
        this.profile = null;
        this.ready = false;
        this.configured = false;
    }

    isConfigured() {
        return this.configured;
    }

    isLoggedIn() {
        return !!(this.session && this.session.user);
    }

    getUser() {
        return this.session?.user || null;
    }

    getProfile() {
        return this.profile;
    }

    isAdmin() {
        return this.profile?.role === 'admin' || this.profile?.role === 'dealer';
    }

    displayName() {
        const u = this.getUser();
        if (!u) return '';
        return (
            this.profile?.full_name ||
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email ||
            'صارف'
        );
    }

    authRedirectUrl(extraParams = {}) {
        const path = cfg.authRedirect || 'auth-callback.html';
        const url = new URL(path, window.location.origin);
        Object.entries(extraParams).forEach(([k, v]) => {
            if (v) url.searchParams.set(k, v);
        });
        return url.href;
    }

    async init() {
        if (!cfg.enabled || !cfg.url || !cfg.anonKey) {
            this.ready = true;
            window.dispatchEvent(new CustomEvent('auth:ready'));
            return;
        }

        this.configured = true;
        this.client = createClient(cfg.url, cfg.anonKey, {
            auth: {
                persistSession: true,
                detectSessionInUrl: true,
                flowType: 'pkce',
                storage: window.localStorage,
            },
        });

        const { data } = await this.client.auth.getSession();
        this.session = data.session;
        if (this.session) await this.loadProfile();

        this.client.auth.onAuthStateChange(async (_event, session) => {
            this.session = session;
            if (session) await this.loadProfile();
            else this.profile = null;
            window.dispatchEvent(
                new CustomEvent('auth:change', {
                    detail: { session: this.session, profile: this.profile },
                })
            );
        });

        this.ready = true;
        window.dispatchEvent(new CustomEvent('auth:ready'));
    }

    async waitReady() {
        if (this.ready) return;
        await new Promise((resolve) => {
            window.addEventListener('auth:ready', resolve, { once: true });
        });
    }

    async loadProfile() {
        if (!this.client || !this.session?.user) return null;
        const uid = this.session.user.id;
        const { data, error } = await this.client.from('profiles').select('*').eq('id', uid).maybeSingle();
        if (error) {
            console.warn('profile load', error.message);
            return null;
        }
        this.profile = data;
        return data;
    }

    async updateProfile(fields) {
        if (!this.client || !this.session?.user) throw new Error('لاگ ان نہیں');
        const uid = this.session.user.id;
        const payload = { ...fields, updated_at: new Date().toISOString() };
        const { data, error } = await this.client.from('profiles').update(payload).eq('id', uid).select().single();
        if (error) throw error;
        this.profile = data;
        return data;
    }

    async signInWithProvider(provider, redirectPath) {
        if (!this.client) throw new Error('Supabase کنفیگر نہیں');
        const redirectTo = this.authRedirectUrl({ redirect: redirectPath || location.pathname.split('/').pop() || 'index.html' });
        const { error } = await this.client.auth.signInWithOAuth({
            provider,
            options: { redirectTo },
        });
        if (error) throw error;
    }

    async signOut() {
        if (this.client) await this.client.auth.signOut();
        this.session = null;
        this.profile = null;
        window.dispatchEvent(new CustomEvent('auth:change', { detail: { session: null, profile: null } }));
    }

    async handleAuthCallback() {
        await this.waitReady();
        if (!this.client) return { ok: false, error: 'not_configured' };
        const { data, error } = await this.client.auth.getSession();
        if (error) return { ok: false, error: error.message };
        this.session = data.session;
        if (this.session) await this.loadProfile();
        return { ok: !!this.session };
    }

    dataUrlToBlob(dataUrl) {
        const [meta, b64] = dataUrl.split(',');
        const mime = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg';
        const bin = atob(b64);
        const arr = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
        return new Blob([arr], { type: mime });
    }

    async uploadImages(userId, submissionId, dataUrls) {
        if (!this.client || !dataUrls?.length) return [];
        const bucket = cfg.storageBucket || 'property-images';
        const urls = [];
        for (let i = 0; i < dataUrls.length; i++) {
            const blob = this.dataUrlToBlob(dataUrls[i]);
            const path = `${userId}/${submissionId}/${i + 1}.jpg`;
            const { error } = await this.client.storage.from(bucket).upload(path, blob, {
                contentType: blob.type,
                upsert: true,
            });
            if (error) throw error;
            const { data } = this.client.storage.from(bucket).getPublicUrl(path);
            if (data?.publicUrl) urls.push(data.publicUrl);
        }
        return urls;
    }

    async submitOwnerListing(data) {
        if (!this.client || !this.session?.user) throw new Error('پہلے لاگ ان کریں');
        const userId = this.session.user.id;
        const submissionId = crypto.randomUUID();

        let imageUrls = [];
        if (data.images?.length) {
            imageUrls = await this.uploadImages(userId, submissionId, data.images);
        }

        const row = {
            id: submissionId,
            user_id: userId,
            purpose: data.purpose,
            type: data.type,
            area: data.area,
            city: data.city,
            price: data.price,
            size: data.size,
            beds: data.beds,
            baths: data.baths,
            floors: data.floors,
            title: data.title,
            address: data.address,
            description: data.description,
            owner_name: data.ownerName,
            owner_phone: data.ownerPhone,
            owner_email: data.ownerEmail,
            image_urls: imageUrls,
            status: 'pending',
        };

        const { data: saved, error } = await this.client.from('owner_submissions').insert(row).select().single();
        if (error) throw error;
        return saved;
    }

    async fetchMySubmissions() {
        if (!this.client || !this.session?.user) return [];
        const { data, error } = await this.client
            .from('owner_submissions')
            .select('*')
            .eq('user_id', this.session.user.id)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    }

    async fetchAllSubmissions() {
        if (!this.client || !this.isAdmin()) return [];
        const { data, error } = await this.client
            .from('owner_submissions')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        const rows = data || [];
        const userIds = [...new Set(rows.map((r) => r.user_id).filter(Boolean))];
        if (!userIds.length) return rows;

        const { data: profiles } = await this.client
            .from('profiles')
            .select('id, full_name, email, phone, avatar_url')
            .in('id', userIds);

        const profileMap = {};
        (profiles || []).forEach((p) => {
            profileMap[p.id] = p;
        });

        return rows.map((r) => ({
            ...r,
            profile: profileMap[r.user_id] || null,
        }));
    }

    async updateSubmissionStatus(id, status) {
        if (!this.client || !this.isAdmin()) throw new Error('اجازت نہیں');
        const { data, error } = await this.client
            .from('owner_submissions')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    async deleteMySubmission(id) {
        if (!this.client || !this.session?.user) throw new Error('لاگ ان نہیں');
        const uid = this.session.user.id;
        const { data: row, error: fetchErr } = await this.client
            .from('owner_submissions')
            .select('*')
            .eq('id', id)
            .eq('user_id', uid)
            .maybeSingle();
        if (fetchErr) throw fetchErr;
        if (!row) throw new Error('یہ پراپرٹی آپ کے اکاؤنٹ میں نہیں');

        const bucket = cfg.storageBucket || 'property-images';
        const imgCount = row.image_urls?.length || 0;
        if (imgCount) {
            const paths = Array.from({ length: imgCount }, (_, i) => `${uid}/${id}/${i + 1}.jpg`);
            await this.client.storage.from(bucket).remove(paths);
        }

        const { error } = await this.client
            .from('owner_submissions')
            .delete()
            .eq('id', id)
            .eq('user_id', uid);
        if (error) throw error;
    }

    async deleteSubmission(id) {
        if (!this.client || !this.isAdmin()) throw new Error('اجازت نہیں');
        const { error } = await this.client.from('owner_submissions').delete().eq('id', id);
        if (error) throw error;
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
            cloud: true,
        };
    }
}

window.CloudAuth = new CloudAuthService();
CloudAuth.init();
