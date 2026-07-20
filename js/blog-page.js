(function () {
    const FR = FrLayout;
    const PH = PropertyHub;

    document.addEventListener('DOMContentLoaded', () => {
        FR.initCommon();
        const q = new URLSearchParams(location.search);
        const id = PropertyHub.sanitizeId(q.get('id') || '');
        const cat = q.get('cat');

        if (id) {
            const post = FR.BLOGS.find((b) => String(b.id) === id);
            const grid = document.getElementById('blogGrid');
            const article = document.getElementById('blogArticle');
            if (post && article) {
                grid.hidden = true;
                article.hidden = false;
                document.getElementById('blogTitle').textContent = post.title;
                document.getElementById('blogSub').textContent = FR.BLOG_CATS[post.cat] || '';
                article.innerHTML = `
                    <div class="fr-blog-article-img"><img src="${post.image}" alt="" loading="lazy"></div>
                    <p class="fr-blog-cat">${FR.BLOG_CATS[post.cat] || post.cat} · ${post.date}</p>
                    <h2>${PH.escapeHTML(post.title)}</h2>
                    <p>${PH.escapeHTML(post.excerpt)}</p>
                    <p style="margin-top:1rem;line-height:1.9;color:#555">
                        یہ مضمون ASK REAL ESTATE FAISALABAD کے بلاگ کا حصہ ہے۔ مزید معلومات کے لیے
                        <a href="index.html#contact">رابطہ</a> کریں یا <a href="tel:" data-agency-phone></a> پر کال کریں۔
                    </p>
                    <p style="margin-top:1rem"><a href="blog.html">← تمام مضامین</a></p>`;
                ZameenSite.initHeader();
                FR.initAgencyFields();
            }
            return;
        }

        let blogs = FR.BLOGS;
        if (cat) {
            blogs = blogs.filter((b) => b.cat === cat);
            document.getElementById('blogSub').textContent = FR.BLOG_CATS[cat] || cat;
        }

        const el = document.getElementById('blogGrid');
        el.innerHTML = blogs
            .map(
                (b) => `
            <a href="blog.html?id=${b.id}" class="fr-blog-card">
                <div class="fr-blog-img"><img src="${b.image}" alt="" loading="lazy"></div>
                <div class="fr-blog-body">
                    <span class="fr-blog-cat">${FR.BLOG_CATS[b.cat] || b.cat}</span>
                    <h3>${PH.escapeHTML(b.title)}</h3>
                    <p>${PH.escapeHTML(b.excerpt)}</p>
                    <time>${b.date}</time>
                </div>
            </a>`
            )
            .join('');
    });
})();
