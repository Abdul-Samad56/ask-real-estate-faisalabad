/**
 * Unified owner auth — Supabase OAuth (cloud) or local email accounts
 */
(function () {
    const PH = PropertyHub;

    const OwnerAuth = {
        async waitReady() {
            if (window.CloudAuth) await CloudAuth.waitReady();
        },

        usesCloud() {
            return !!(window.CloudAuth && CloudAuth.isConfigured());
        },

        usesLocalDb() {
            return !this.usesCloud() && !!(window.LocalDbAuth && LocalDbAuth.isConfigured());
        },

        isLoggedIn() {
            if (this.usesCloud()) return CloudAuth.isLoggedIn();
            if (this.usesLocalDb()) return LocalDbAuth.isLoggedIn();
            return !!PH.getOwnerSession();
        },

        getUserId() {
            if (this.usesCloud() && CloudAuth.isLoggedIn()) return CloudAuth.getUser()?.id || null;
            if (this.usesLocalDb() && LocalDbAuth.isLoggedIn()) return LocalDbAuth.getUser()?.id || null;
            return PH.getOwnerSession()?.userId || null;
        },

        getEmail() {
            if (this.usesCloud() && CloudAuth.isLoggedIn()) return CloudAuth.getUser()?.email || '';
            if (this.usesLocalDb() && LocalDbAuth.isLoggedIn()) return LocalDbAuth.getUser()?.email || '';
            return PH.getCurrentOwnerUser()?.email || '';
        },

        displayName() {
            if (this.usesCloud() && CloudAuth.isLoggedIn()) return CloudAuth.displayName();
            if (this.usesLocalDb() && LocalDbAuth.isLoggedIn()) return LocalDbAuth.displayName();
            const u = PH.getCurrentOwnerUser();
            return u?.fullName || u?.email || 'صارف';
        },

        async signInWithProvider(provider, redirectPath) {
            if (!this.usesCloud()) throw new Error('Cloud login فعال نہیں');
            await CloudAuth.signInWithProvider(provider, redirectPath);
        },

        async registerLocal({ email, password, fullName, phone }) {
            if (this.usesLocalDb()) return LocalDbAuth.registerLocal({ email, password, fullName, phone });
            return PH.registerOwner({ email, password, fullName, phone });
        },

        async loginLocal(email, password) {
            if (this.usesLocalDb()) return LocalDbAuth.loginLocal(email, password);
            return PH.loginOwner(email, password);
        },

        async signOut() {
            if (this.usesCloud() && CloudAuth.isLoggedIn()) await CloudAuth.signOut();
            if (this.usesLocalDb() && LocalDbAuth.isLoggedIn()) await LocalDbAuth.signOut();
            PH.logoutOwner();
            window.dispatchEvent(new CustomEvent('owner-auth:change'));
        },

        async submitListing(data) {
            if (this.usesCloud()) {
                if (!CloudAuth.isLoggedIn()) throw new Error('پہلے لاگ ان کریں');
                const saved = await CloudAuth.submitOwnerListing(data);
                const user = CloudAuth.getUser();
                PH.upsertOwnerSubmission({
                    ...data,
                    id: saved.id,
                    userId: user?.id,
                    submitterEmail: user?.email || data.ownerEmail,
                    submitterName: CloudAuth.displayName() || data.ownerName,
                    images: saved.image_urls?.length ? saved.image_urls : data.images,
                    status: saved.status,
                    createdAt: saved.created_at,
                    cloud: true,
                });
                return saved;
            }
            if (this.usesLocalDb()) {
                if (!LocalDbAuth.isLoggedIn()) throw new Error('پہلے لاگ ان کریں');
                const saved = await LocalDbAuth.submitOwnerListing(data);
                const user = LocalDbAuth.getUser();
                PH.upsertOwnerSubmission({
                    ...data,
                    id: saved.id,
                    userId: user?.id,
                    submitterEmail: user?.email || data.ownerEmail,
                    submitterName: LocalDbAuth.displayName() || data.ownerName,
                    images: saved.image_urls?.length ? saved.image_urls : data.images,
                    status: saved.status,
                    createdAt: saved.created_at,
                    localDb: true,
                });
                return saved;
            }
            if (!this.isLoggedIn()) throw new Error('پہلے لاگ ان کریں');
            const owner = PH.getCurrentOwnerUser();
            return PH.addOwnerSubmission({
                ...data,
                userId: owner?.id,
                submitterEmail: owner?.email,
                submitterName: owner?.fullName,
            });
        },

        async fetchMySubmissions() {
            if (this.usesCloud() && CloudAuth.isLoggedIn()) {
                return CloudAuth.fetchMySubmissions();
            }
            if (this.usesLocalDb() && LocalDbAuth.isLoggedIn()) {
                return LocalDbAuth.fetchMySubmissions();
            }
            const uid = this.getUserId();
            return PH.loadSubmissionsForOwner(uid).map((s) => ({
                id: s.id,
                status: s.status,
                created_at: s.createdAt,
                purpose: s.purpose,
                type: s.type,
                area: s.area,
                city: s.city,
                price: s.price,
                size: s.size,
                beds: s.beds,
                baths: s.baths,
                floors: s.floors,
                title: s.title,
                address: s.address,
                description: s.description,
                owner_name: s.ownerName,
                owner_phone: s.ownerPhone,
                owner_email: s.ownerEmail,
                image_urls: s.images || [],
            }));
        },

        async deleteMySubmission(id) {
            if (this.usesCloud() && CloudAuth.isLoggedIn()) {
                await CloudAuth.deleteMySubmission(id);
                PH.deleteOwnerSubmission(id);
                return;
            }
            if (this.usesLocalDb() && LocalDbAuth.isLoggedIn()) {
                await LocalDbAuth.deleteMySubmission(id);
                PH.deleteOwnerSubmission(id);
                return;
            }
            const uid = this.getUserId();
            const sub = PH.loadOwnerSubmissions().find((s) => s.id === id);
            if (!sub || sub.userId !== uid) throw new Error('یہ پراپرٹی آپ کے اکاؤنٹ میں نہیں');
            PH.deleteOwnerSubmission(id);
        },

        mirrorCloudSubmissionsToLocal(rows) {
            rows.forEach((row) => {
                const local = CloudAuth.toLocalSubmission(row);
                PH.upsertOwnerSubmission(local);
            });
        },
    };

    window.OwnerAuth = OwnerAuth;
})();
