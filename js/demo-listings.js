/**
 * فیصل آباد — 50 فروخت + 50 کرایہ فرضی پراپرٹیز
 * Dynamic (MongoDB) موڈ میں یہ ڈیمو بند رہتا ہے — حقیقی ڈیٹا API سے آتا ہے۔
 */
(function () {
    if (typeof PropertyHub === 'undefined') return;
    if (typeof SiteConfig !== 'undefined' && SiteConfig.dynamicBackend) return;

    const PH = PropertyHub;
    const DEMO_VERSION = '3';
    const existing = PH.loadAllProperties();
    const storedVer = localStorage.getItem('propertyHub_demoVersion');

    if (storedVer === DEMO_VERSION && existing.length >= 100) return;
    if (storedVer === 'atlas-dynamic') return;
    if (existing.length > 25) return;

    const img = (id) =>
        `https://images.unsplash.com/photo-${id}?w=800&auto=format&fit=crop&q=80`;

    const IMAGE_IDS = [
        '1600596542815-ffad4c1539a9',
        '1500382017468-9049fed747ef',
        '1449844908441-8829872d2607',
        '1486406146926-c627a92ad1ab',
        '1545324418-cc1a3fa10c00',
        '1586528116311-ad8dd3c8310d',
        '1600585154340-be6161a56a0c',
        '1560518883-ce09059eeffa',
        '1497366216548-37526070297c',
        '1522708323590-d24dbb6b0267',
        '1553413077-1906030a9936',
        '1502672265066-763c1409eba8',
        '1512917774080-9991f1c4c750',
        '1600210492486-724fe5c67fb0',
        '1416879595882-3373a0480b5b',
        '1479839672679-a68583c829e',
        '1600607687939-ce8a6c25118c',
        '1600047509807-ba139309c693',
        '1605276374105-de8862a5a961',
        '1564013799919-ab6000271286',
    ];

    const AREAS =
        typeof ZameenSite !== 'undefined' && ZameenSite.FAISALABAD_AREAS
            ? ZameenSite.FAISALABAD_AREAS
            : [
                  'Wapda City',
                  'Canal Road',
                  'D Ground',
                  'Millat Town',
                  'Eden Garden',
                  'Madina Town',
                  'Peoples Colony',
                  'Susan Road',
                  'Kohinoor City',
                  'Civil Lines',
              ];

    const SALE_TYPES = [
        { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '7 مرلہ', '10 مرلہ', '1 کنال'], beds: [3, 4, 5, 6], price: [8500000, 45000000] },
        { type: 'flat', label: 'فلیٹ', sizes: ['2 مرلہ', '3 مرلہ', '5 مرلہ'], beds: [1, 2, 3], price: [4500000, 12000000] },
        { type: 'shop', label: 'دکان', sizes: ['200 sq ft', '350 sq ft', '500 sq ft'], beds: [0, 0, 0], price: [8000000, 28000000] },
        { type: 'office', label: 'آفس', sizes: ['800 sq ft', '1200 sq ft', '2000 sq ft'], beds: [0, 0, 0], price: [6000000, 22000000] },
        { type: 'residential_plot', label: 'رہائشی پلاٹ', sizes: ['3 مرلہ', '5 مرلہ', '10 مرلہ'], beds: [0, 0, 0], price: [2500000, 15000000] },
        { type: 'commercial_plot', label: 'کمرشل پلاٹ', sizes: ['4 مرلہ', '8 مرلہ', '2 کنال'], beds: [0, 0, 0], price: [5000000, 35000000] },
        { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '10 مرلہ'], beds: [4, 5], price: [12000000, 38000000] },
        { type: 'industrial', label: 'صنعتی زمین', sizes: ['1 کنال', '2 کنال'], beds: [0, 0], price: [25000000, 65000000] },
    ];

    const RENT_TYPES = [
        { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '7 مرلہ', '10 مرلہ'], beds: [3, 4, 5], price: [35000, 95000] },
        { type: 'flat', label: 'فلیٹ', sizes: ['2 مرلہ', '3 مرلہ'], beds: [1, 2], price: [18000, 45000] },
        { type: 'shop', label: 'دکان', sizes: ['150 sq ft', '300 sq ft'], beds: [0, 0], price: [40000, 120000] },
        { type: 'office', label: 'آفس', sizes: ['600 sq ft', '1000 sq ft'], beds: [0, 0], price: [25000, 75000] },
        { type: 'room', label: 'کمرہ', sizes: ['1 کمرہ'], beds: [1, 1], price: [12000, 22000] },
        { type: 'warehouse', label: 'گودام', sizes: ['3000 sq ft', '6000 sq ft'], beds: [0, 0], price: [80000, 200000] },
        { type: 'house', label: 'مکان', sizes: ['5 مرلہ', '8 مرلہ'], beds: [4, 5], price: [45000, 85000] },
        { type: 'flat', label: 'فلیٹ', sizes: ['3 مرلہ', '4 مرلہ'], beds: [2, 3], price: [28000, 55000] },
    ];

    const DESCRIPTIONS = {
        sale: [
            'بہترین لوکیشن، فوری قبضہ، تمام سہولیات موجود',
            'کورنر پراپرٹی، پارک فیسنگ، سیکیورٹی گیٹ',
            'نیا تعمیر، ماڈرن ڈیزائن، ویل مینٹینڈ',
            'سرمایہ کاری کے لیے بہترین موقع',
            'قریب مسجد، اسکول اور مارکیٹ',
            'ڈبل روڈ، وسیع پارکنگ، بجلی گیس دستیاب',
        ],
        rent: [
            'خاندانی ماحول، پانی بجلی گیس دستیاب',
            'فرنشڈ / سیمی فرنشڈ، فوری کرایہ',
            'سیکیورٹی والی سوسائٹی، بچوں کے لیے محفوظ',
            'مرکزی لوکیشن، ٹرانسپورٹ قریب',
            'AC، WiFi، پارکنگ شامل',
            'Bachelors / فیملی دونوں کے لیے موزوں',
        ],
    };

    function pick(arr, i) {
        return arr[i % arr.length];
    }

    function randBetween(min, max, seed) {
        const x = Math.sin(seed * 9999) * 10000;
        const r = x - Math.floor(x);
        return Math.floor(min + r * (max - min + 1));
    }

    function daysAgo(n) {
        const d = new Date();
        d.setDate(d.getDate() - n);
        d.setHours(randBetween(1, 20, n), randBetween(0, 59, n + 7), 0, 0);
        return d.toISOString();
    }

    function buildProperty(purpose, index, typeDef) {
        const area = pick(AREAS, index + (purpose === 'rent' ? 17 : 3));
        const size = pick(typeDef.sizes, index);
        const beds = typeDef.beds[index % typeDef.beds.length] ?? 0;
        const baths = beds > 0 ? Math.max(1, beds - 1) : typeDef.type === 'shop' ? 1 : 0;
        const price = randBetween(typeDef.price[0], typeDef.price[1], index + (purpose === 'sale' ? 1 : 2));
        const purposeUr = purpose === 'sale' ? 'فروخت' : 'کرایہ';
        const title = `${size} ${typeDef.label} — ${area} (${purposeUr})`;
        const desc = pick(DESCRIPTIONS[purpose], index);
        const imageCount = 1 + (index % 3);
        const images = Array.from({ length: imageCount }, (_, j) => img(pick(IMAGE_IDS, index + j)));

        return {
            id: PH.uid(),
            title,
            purpose,
            type: typeDef.type,
            price,
            city: 'فیصل آباد',
            area,
            size,
            beds,
            baths,
            floors: typeDef.type === 'house' ? randBetween(1, 3, index) : 0,
            owner: 'حافظ عبدالصمد خٹک',
            phone: '0321-5315603',
            description: `${desc} — ${area}، فیصل آباد۔ ASK REAL ESTATE کے ذریعے رابطہ کریں۔`,
            featured: index % 7 === 0,
            published: true,
            images,
            image: images[0],
            createdAt: daysAgo(randBetween(1, 45, index)),
        };
    }

    const props = [];

    for (let i = 0; i < 50; i++) {
        props.push(buildProperty('sale', i, pick(SALE_TYPES, i)));
    }
    for (let i = 0; i < 50; i++) {
        props.push(buildProperty('rent', i, pick(RENT_TYPES, i)));
    }

    PH._saveRaw(PH.STORAGE.properties, props);
    localStorage.setItem('propertyHub_demoVersion', DEMO_VERSION);
    PH.syncPublicCatalog();
})();
