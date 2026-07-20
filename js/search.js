/**
 * zameen.com style search page — Faisalabad listings
 */
(function () {
    const Z = ZameenSite;
    const L = Z.LABELS;
    let allListings = [];
    let activeType = '';
    let currentPage = 1;
    let viewMode = localStorage.getItem('askSearchView') || 'list';

    const SORT_LABELS = {
        featured: 'Popular',
        newest: 'Newest',
        'price-asc': 'Lowest Price',
        'price-desc': 'Highest Price',
    };

    function getSortValue() {
        return document.getElementById('sortSelect')?.value || 'featured';
    }

    function setSortValue(value) {
        const hidden = document.getElementById('sortSelect');
        const label = document.getElementById('sortLabel');
        if (hidden) hidden.value = value;
        if (label) label.textContent = SORT_LABELS[value] || value;
        document.querySelectorAll('.zm-sort-option').forEach((opt) => {
            opt.classList.toggle('active', opt.getAttribute('data-value') === value);
        });
    }

    function closeSortMenu() {
        const menu = document.getElementById('sortMenu');
        const trigger = document.getElementById('sortTrigger');
        if (menu) menu.hidden = true;
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
        document.getElementById('sortDropdown')?.classList.remove('open');
    }

    function openSortMenu() {
        const menu = document.getElementById('sortMenu');
        const trigger = document.getElementById('sortTrigger');
        if (menu) menu.hidden = false;
        if (trigger) trigger.setAttribute('aria-expanded', 'true');
        document.getElementById('sortDropdown')?.classList.add('open');
    }

    function bindSortDropdown() {
        const dropdown = document.getElementById('sortDropdown');
        const trigger = document.getElementById('sortTrigger');
        const menu = document.getElementById('sortMenu');
        if (!dropdown || !trigger || !menu) return;

        const saved = localStorage.getItem('askSearchSort');
        if (saved && SORT_LABELS[saved]) setSortValue(saved);

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menu.hidden) openSortMenu();
            else closeSortMenu();
        });

        menu.querySelectorAll('.zm-sort-option').forEach((opt) => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.getAttribute('data-value');
                setSortValue(value);
                localStorage.setItem('askSearchSort', value);
                closeSortMenu();
                currentPage = 1;
                renderList();
            });
        });

        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target)) closeSortMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeSortMenu();
        });
    }

    function syncViewToggleUI() {
        document.querySelectorAll('.zm-view-btn').forEach((b) => {
            const on = b.getAttribute('data-view') === viewMode;
            b.classList.toggle('active', on);
            b.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    const TYPES = [
        { type: '', label: 'سب' },
        { type: 'house', label: 'مکانات' },
        { type: 'flat', label: 'فلیٹ' },
        { type: 'plot', label: 'پلاٹ' },
        { type: 'shop', label: 'دکان' },
        { type: 'office', label: 'آفس' },
    ];

    function getFilters() {
        return {
            purpose: document.getElementById('filterPurpose')?.value || '',
            type: activeType || document.getElementById('pubType')?.value || '',
            city: document.getElementById('pubCity')?.value || document.getElementById('filterCity')?.value || '',
            min: document.getElementById('filterMin')?.value,
            max: document.getElementById('filterMax')?.value,
            beds: document.getElementById('filterBeds')?.value,
            baths: document.getElementById('filterBaths')?.value,
            keywords: document.getElementById('filterKeywords')?.value?.trim().toLowerCase(),
        };
    }

    function getFilteredList() {
        const f = getFilters();
        let list = Z.filterListings(allListings, f);
        if (f.beds) list = list.filter((p) => (p.beds || 0) >= Number(f.beds));
        if (f.baths) list = list.filter((p) => (p.baths || 0) >= Number(f.baths));
        if (f.keywords) {
            list = list.filter(
                (p) =>
                    (p.title && p.title.toLowerCase().includes(f.keywords)) ||
                    (p.description && p.description.toLowerCase().includes(f.keywords)) ||
                    (p.area && p.area.toLowerCase().includes(f.keywords))
            );
        }
        const sort = getSortValue();
        return Z.sortListings(list, sort);
    }

    function purposeLabel(purpose) {
        if (purpose === 'rent') return 'کرایہ پر';
        if (purpose === 'sale') return 'فروخت';
        return '';
    }

    function typeLabel(type) {
        if (!type) return 'گھر';
        return L.type[type] || type;
    }

    function updatePageTitle(count, f) {
        const pLabel = purposeLabel(f.purpose);
        const tLabel = typeLabel(f.type);
        const area = f.city ? f.city + ' ' : '';
        let title = count + ' ';
        title += area + 'فیصل آباد میں ';
        title += tLabel + ' ';
        title += pLabel ? pLabel + ' دستیاب' : 'دستیاب';
        document.getElementById('pageTitle').textContent = title;
        document.getElementById('breadcrumbCurrent').textContent = pLabel || 'لسٹنگز';
    }

    function renderCategoryBar(list, f) {
        const el = document.getElementById('categoryBar');
        if (!el) return;
        const purpose = f.purpose;
        const base = allListings.filter((p) => !purpose || p.purpose === purpose);
        const byType = Z.countByType(base, purpose);
        const total = base.length;

        let html = `<span class="zm-cat-label">${typeLabel(f.type)} تمام (${total})</span>`;
        Object.entries(byType).forEach(([type, count]) => {
            const active = f.type === type ? ' active' : '';
            html += `<a href="${Z.searchUrl({ purpose, type, city: f.city })}" class="zm-cat-link${active}">فیصل آباد میں ${L.type[type]} ${purposeLabel(purpose)} (${count})</a>`;
        });
        el.innerHTML = html;
    }

    function renderAreaSidebar() {
        const el = document.getElementById('areaSidebar');
        const dl = document.getElementById('areaList');
        const counts = {};
        Z.countByArea(allListings).forEach((a) => {
            counts[a.name] = a.count;
        });

        const areas = Z.FAISALABAD_AREAS.map((name) => ({
            name,
            count: counts[name] || 0,
        })).sort((a, b) => a.name.localeCompare(b.name, 'en'));

        if (dl) {
            dl.innerHTML = Z.FAISALABAD_AREAS.map((a) => `<option value="${a}"></option>`).join('');
        }

        el.innerHTML = areas
            .map(
                (a) =>
                    `<a href="${Z.searchUrl({ ...getFilters(), city: a.name })}" class="zm-loc-item">${Z.escapeHTML(a.name)} <span>(${a.count})</span></a>`
            )
            .join('');
    }

    function renderTypeChips() {
        document.getElementById('typeChips').innerHTML = TYPES.map(
            (t) =>
                `<button type="button" class="zm-type-chip ${activeType === t.type ? 'active' : ''}" data-type="${t.type}">${t.label}</button>`
        ).join('');
        document.querySelectorAll('.zm-type-chip').forEach((chip) => {
            chip.addEventListener('click', () => {
                activeType = chip.getAttribute('data-type');
                document.getElementById('pubType').value = activeType;
                currentPage = 1;
                renderTypeChips();
                renderList();
            });
        });
    }

    function renderList() {
        const f = getFilters();
        const fullList = getFilteredList();
        const pageInfo = Z.paginate(fullList, currentPage, 25);

        updatePageTitle(fullList.length, f);
        const rc = document.getElementById('resultCount');
        if (rc) {
            if (pageInfo.total) {
                rc.textContent = `${pageInfo.from} to ${pageInfo.to} of ${pageInfo.total} Homes`;
            } else {
                rc.textContent = '0 Homes';
            }
        }

        renderCategoryBar(fullList, f);
        renderAreaSidebar();

        const grid = document.getElementById('publicGrid');
        const empty = document.getElementById('publicEmpty');

        if (!fullList.length) {
            grid.innerHTML = '';
            empty.classList.remove('hidden');
            Z.renderPagination('pagination', { pages: 0, total: 0 }, () => {});
            return;
        }
        empty.classList.add('hidden');
        grid.className = viewMode === 'grid' ? 'zm-listings-grid zm-listings-grid--grid' : 'zm-listings-grid';
        grid.innerHTML = pageInfo.items.map((p) => Z.listingCardHTML(p, { grid: viewMode === 'grid' })).join('');
        Z.bindListingWraps(grid);
        FrLayout.initWishlistButtons(grid);
        bindShareButtons(grid);
        Z.renderPagination('pagination', pageInfo, (p) => {
            currentPage = p;
            renderList();
            document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
        });

        history.replaceState(null, '', Z.searchUrl({ ...f, page: currentPage > 1 ? currentPage : undefined }));
    }

    function applyUrlParams() {
        const q = Z.parseQuery();
        if (q.purpose) {
            document.getElementById('filterPurpose').value = q.purpose;
            document.querySelectorAll('#megaTabs .zm-search-tab').forEach((t) => {
                t.classList.toggle('active', t.getAttribute('data-purpose') === q.purpose);
            });
        }
        if (q.type) {
            activeType = q.type;
            document.getElementById('pubType').value = q.type;
        }
        if (q.city) document.getElementById('pubCity').value = q.city;
        if (q.min) document.getElementById('filterMin').value = q.min;
        if (q.max) document.getElementById('filterMax').value = q.max;
        if (q.beds) document.getElementById('filterBeds').value = q.beds;
        if (q.baths) document.getElementById('filterBaths').value = q.baths;
        if (q.page) currentPage = Number(q.page) || 1;
    }

    function bindShareButtons(root) {
        root.querySelectorAll('[data-share-id]').forEach((btn) => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const id = btn.getAttribute('data-share-id');
                const url = new URL(Z.propertyUrl(id), location.href).href;
                const title = 'ASK REAL ESTATE — Property';
                try {
                    if (navigator.share) {
                        await navigator.share({ title, url });
                    } else {
                        await navigator.clipboard.writeText(url);
                        alert('Link copied');
                    }
                } catch {
                    /* cancelled */
                }
            });
        });
    }

    function bindViewToggle() {
        syncViewToggleUI();
        document.querySelectorAll('.zm-view-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                viewMode = btn.getAttribute('data-view') || 'list';
                localStorage.setItem('askSearchView', viewMode);
                syncViewToggleUI();
                renderList();
            });
        });
    }

    function bindMegaTabs() {
        document.querySelectorAll('#megaTabs .zm-search-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('#megaTabs .zm-search-tab').forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('filterPurpose').value = tab.getAttribute('data-purpose');
                currentPage = 1;
                renderList();
            });
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        FrLayout.initCommon();
        PropertyHub.syncPublicCatalog();
        if (window.LocalDbAuth?.isConfigured()) {
            try {
                await LocalDbAuth.syncPublicListingsToLocal();
            } catch (e) {
                console.warn('local db public listings', e);
            }
        }
        allListings = Z.getListings();
        applyUrlParams();
        renderTypeChips();
        bindMegaTabs();
        bindSortDropdown();
        bindViewToggle();
        renderList();

        document.getElementById('megaSearchForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            currentPage = 1;
            renderList();
        });

        ['filterPurpose', 'pubType', 'filterMin', 'filterMax', 'filterBeds', 'filterBaths'].forEach((id) => {
            document.getElementById(id)?.addEventListener('change', () => {
                currentPage = 1;
                renderList();
            });
        });

        document.getElementById('pubCity')?.addEventListener('input', () => {
            currentPage = 1;
            renderList();
        });
    });
})();
