/**
 * data/ فولڈر میں CSV شیٹ — local server پر خودکار لکھنا
 */
const DataSheet = {
    HEADERS: {
        OwnerSubmissions: [
            'Timestamp',
            'ID',
            'Purpose',
            'Type',
            'Title',
            'Price (PKR)',
            'Area',
            'City',
            'Size',
            'Beds',
            'Baths',
            'Floors',
            'Address',
            'Description',
            'Owner Name',
            'Owner Phone',
            'Owner Email',
            'Photo Count',
            'Status',
        ],
        Inquiries: ['Timestamp', 'Name', 'Phone', 'Inquiry Type', 'Role', 'Property Type', 'Message'],
        Properties: [
            'Timestamp',
            'ID',
            'Title',
            'Purpose',
            'Type',
            'Price (PKR)',
            'City',
            'Area',
            'Size',
            'Beds',
            'Baths',
            'Owner',
            'Phone',
            'Published',
            'Featured',
            'Description',
            'Photo Count',
        ],
        Clients: [
            'Timestamp',
            'ID',
            'Name',
            'Phone',
            'Purpose',
            'Type',
            'Budget Min',
            'Budget Max',
            'City',
            'Areas',
            'Status',
            'Notes',
        ],
    },

    async record(sheetName, row) {
        if (!Array.isArray(row)) return { ok: false };
        try {
            const res = await fetch('/api/sheet/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sheet: sheetName, row }),
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                return { ok: res.ok };
            }
        } catch {
            return { ok: false, offline: true };
        }
    },

    csvLine(row) {
        return row
            .map((cell) => {
                const s = String(cell ?? '');
                return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
            })
            .join(',');
    },

    downloadCsv(filename, headers, rows) {
        const bom = '\uFEFF';
        const lines = [this.csvLine(headers), ...rows.map((r) => this.csvLine(r))];
        const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    },

    async rebuildSheet(sheetName, rows) {
        try {
            const res = await fetch('/api/sheet/rebuild', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sheet: sheetName,
                    headers: this.HEADERS[sheetName],
                    rows,
                }),
            });
            const text = await res.text();
            try {
                return JSON.parse(text);
            } catch {
                return { ok: res.ok };
            }
        } catch {
            return { ok: false, offline: true };
        }
    },

    async syncAllToFolder() {
        const PH = PropertyHub;
        const sheets = [
            [
                'OwnerSubmissions',
                PH.loadOwnerSubmissions().map((s) => PH.ownerSubmissionSheetRow(s)),
            ],
            ['Properties', PH.loadAllProperties().map((p) => PH.propertySheetRow(p))],
            [
                'Inquiries',
                (PH.loadInquiries ? PH.loadInquiries() : []).map((q) => PH.inquirySheetRow(q)),
            ],
            ['Clients', (PH.loadAllClients ? PH.loadAllClients() : []).map((c) => PH.clientSheetRow(c))],
        ];
        let ok = 0;
        let fail = 0;
        for (const [name, rows] of sheets) {
            const r = await this.rebuildSheet(name, rows);
            r.ok ? ok++ : fail++;
        }
        return { ok, fail, rows: sheets.reduce((n, [, r]) => n + r.length, 0) };
    },

    exportAllDownloads() {
        const PH = PropertyHub;
        this.downloadCsv(
            'OwnerSubmissions.csv',
            this.HEADERS.OwnerSubmissions,
            PH.loadOwnerSubmissions().map((s) => PH.ownerSubmissionSheetRow(s))
        );
        this.downloadCsv(
            'Inquiries.csv',
            this.HEADERS.Inquiries,
            (PH.loadInquiries ? PH.loadInquiries() : []).map((q) => PH.inquirySheetRow(q))
        );
        this.downloadCsv(
            'Properties.csv',
            this.HEADERS.Properties,
            PH.loadAllProperties().map((p) => PH.propertySheetRow(p))
        );
        this.downloadCsv(
            'Clients.csv',
            this.HEADERS.Clients,
            (PH.loadAllClients ? PH.loadAllClients() : []).map((c) => PH.clientSheetRow(c))
        );
    },
};
