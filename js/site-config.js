const SiteConfig = {
    baseUrl: '',
    siteName: 'ASK REAL ESTATE FAISALABAD',
    shortName: 'ASK Estate',
    contactEmail: 'abdulsamadkhattak5@gmail.com',

    /** true = ڈیٹا MongoDB Atlas / API سے (dynamic) */
    dynamicBackend: true,

    /** اوپر والا اشتہار بینر */
    adBanner: {
        enabled: true,
        type: 'text',
        text: 'فیصل آباد میں پراپرٹی کرایہ پر لینے یا دینے کے لیے رابطہ کریں',
        contactName: 'حافظ عبدالصمد خٹک',
        phone: '03215315603',
        phoneDisplay: '0321-5315603',
    },

    supabase: {
        enabled: false,
        url: '',
        anonKey: '',
    },

    /** Dynamic API — mongo-atlas-server.js یا لوکل سرور */
    localDatabase: {
        enabled: true,
        apiBaseUrl: '',
    },

    adminProfile: {
        email: 'abdulsamadkhattak5@gmail.com',
        fullName: 'حافظ عبدالصمد خٹک',
        phone: '03215315603',
        secondaryPhone: '03486565603',
    },

    adminEmails: ['abdulsamadkhattak5@gmail.com'],
};
