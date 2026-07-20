(function () {
    const Z = ZameenSite;
    const PH = PropertyHub;
    const FR = FrLayout;

    function card(p) {
        const L = Z.LABELS;
        const img = p.image ? `<img src="${p.image}" alt="">` : `<img src="${Z.getDefaultImage(p.type)}" alt="" loading="lazy">`;
        return `
        <a href="${Z.propertyUrl(p.id)}" class="fr-prop-card">
            <div class="fr-prop-img">${img}${FR.wishlistBtnHTML(p.id)}</div>
            <div class="fr-prop-body">
                <div class="fr-prop-price">${PH.formatPriceZameen(p.price)}</div>
                <div class="fr-prop-title">${Z.escapeHTML(p.title)}</div>
                <div class="fr-prop-loc">${Z.escapeHTML(p.area || 'فیصل آباد')}</div>
            </div>
        </a>`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        FR.initCommon();
        PH.syncPublicCatalog();
        const ids = PH.getWishlist();
        const list = Z.getListings().filter((p) => ids.includes(p.id));
        const el = document.getElementById('wishlistGrid');
        el.innerHTML = list.length
            ? list.map(card).join('')
            : '<p class="fr-empty-msg">ابھی کوئی پسندیدہ نہیں۔ <a href="search.html">لسٹنگز دیکھیں</a></p>';
        FR.initWishlistButtons(el);
        document.addEventListener('wishlist:change', () => location.reload());
    });
})();
