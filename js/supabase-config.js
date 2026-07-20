/**
 * Supabase — Google / Facebook لاگ ان + cloud database
 * Supabase Dashboard → Project Settings → API سے url اور anonKey لگائیں
 * Authentication → Providers میں Google اور Facebook فعال کریں
 * Redirect URL: https://YOUR-SITE.netlify.app/auth-callback.html
 */
const SupabaseConfig = {
    enabled: false,
    url: '',
    anonKey: '',
    authRedirect: 'auth-callback.html',
    storageBucket: 'property-images',
    ...(typeof SiteConfig !== 'undefined' && SiteConfig.supabase ? SiteConfig.supabase : {}),
};
