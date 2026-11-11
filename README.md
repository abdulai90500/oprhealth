# oprhealth

# OpenMRS Executive Finance & Billing Dashboard

A modern, production-grade **Head of Finance Executive Dashboard** designed specifically for **OpenMRS 3.x (O3)** deployments (tested and configured for `rs.hayokmedicare.ng`).

Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Lucide Icons**, and **Recharts**.

---

## 🎯 Executive Capabilities

1. **Executive KPI Cards**:
   - **Total Amount Paid**: Net collected revenue in the selected date range.
   - **Total Amount Owed**: Outstanding debt & accounts receivable across pending/partially paid bills.
   - **Total Invoiced**: Gross clinical and pharmaceutical billing.
   - **Collection Rate & Debtor Count**: Percentage of invoiced charges recovered and average patient balance.

2. **Date Range & Filter Controls**:
   - Custom Start Date & End Date pickers.
   - One-click presets: *Today*, *Yesterday*, *Last 7 Days*, *Last 30 Days*, *This Month*, *All Records*.
   - Filter by status: *All Invoices*, *Outstanding Debts Only*, *Fully Paid*, *Partially Paid*, *Pending*, *Exemptions/Waivers*.

3. **Debtor Ledger (Patients with Outstanding Balances)**:
   - Ranked list of patients who owe money, sorted by highest balance due.
   - Search by patient name, OpenMRS Identifier, or phone number.
   - Minimum debt threshold filter.
   - One-click **"Export Debtors to CSV"**.

4. **Patient Debt Drilldown Modal ("View What Patient Owes")**:
   - Complete itemized breakdown per patient.
   - Line items table: Service / Medication / Procedure, Department, Quantity, Unit Price, Line Total.
   - Tendered payment receipts and remaining balance.
   - Printable Patient Debt Statement view.

5. **Daily Aggregation Ledger (Pay Per Day vs Owed Per Day)**:
   - Date-by-date breakdown of Total Invoiced, Total Collected, and Total Owed.
   - Visual collection rate progress bars.
   - Chronological and reverse-chronological sorting.
   - One-click **"Export Daily Summary to CSV"**.

6. **Visual Financial Analytics**:
   - Interactive Bar / Trend Chart comparing daily revenue collection vs outstanding receivables.
   - Status distribution breakdown (*Paid*, *Partially Paid*, *Pending*, *Exempted*).
   - Cash Point revenue breakdown (*Main Cashier*, *Pharmacy Counter*, *Emergency Desk*, *Outpatient Clinic*).

7. **Dual-Mode Operation**:
   - **Live OpenMRS Mode**: Direct HTTP REST integration with OpenMRS backend via reverse proxy (`/openmrs/ws/rest/v1/billing/bill?v=full`).
   - **Demo / Simulation Mode**: Offline hospital dataset with realistic Nigerian patient names, clinical concepts, and billing transactions.

---

## 🏗️ High-Level Architecture

```
[ Head of Finance React Dashboard (Vite / React 19) ]
       │
       │ HTTPS REST API Requests (credentials: 'include')
       ▼
[ Nginx Reverse Proxy Gateway (rs.hayokmedicare.ng) ]
   ├── /finance/                ──> React Dashboard SPA bundle
   ├── /openmrs/spa/            ──> OpenMRS 3.x Microfrontend Core
   └── /openmrs/ws/rest/v1/     ──> OpenMRS Tomcat Backend (/ws/rest/v1/...)
       │
       ├── /ws/rest/v1/session                (Authentication & Role Check)
       ├── /ws/rest/v1/billing/bill?v=full    (Bills, Line Items, Amounts, Statuses)
       └── /ws/rest/v1/billing/payment        (Cashier Ledger & Tendered Payments)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn

### 1. Run Locally (Development)
```bash
# Install dependencies
npm install

# Start Vite local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

> Requests to `/openmrs/*` are automatically proxied to `https://rs.hayokmedicare.ng` as configured in `vite.config.ts`.

### 2. Build for Production
```bash
npm run build
```
This produces an optimized production bundle in the `dist/` folder.

---

## 🚢 Deployment Strategies

### Option 1: Direct Nginx Reverse Proxy (Easiest & Recommended)
Host the static build directly on your existing OpenMRS server:

1. Build the React project:
   ```bash
   npm run build
   ```
2. Copy `dist/` to the server:
   ```bash
   scp -r dist/* user@rs.hayokmedicare.ng:/var/www/finance-dashboard/
   ```
3. Add the following location block to `/etc/nginx/sites-available/openmrs`:
   ```nginx
   server {
       server_name rs.hayokmedicare.ng;

       # Finance Dashboard SPA
       location /finance/ {
           alias /var/www/finance-dashboard/;
           index index.html;
           try_files $uri $uri/ /finance/index.html;
       }

       # OpenMRS REST API
       location /openmrs/ws/ {
           proxy_pass http://localhost:8080/openmrs/ws/;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_cookie_path / /;
       }

       # OpenMRS 3.x SPA
       location /openmrs/spa/ {
           proxy_pass http://localhost:8080/openmrs/spa/;
       }
   }
   ```
4. Reload Nginx:
   ```bash
   sudo systemctl reload nginx
   ```
5. Access your dashboard directly at:
   `https://rs.hayokmedicare.ng/finance/`

---

### Option 2: OpenMRS 3.x Frontend Microfrontend (ESM)
Deploy as an OpenMRS 3.x frontend module using `@openmrs/esm-framework`:
1. Build module using ESM framework tooling.
2. Register the module in `/openmrs/spa/importmap.json`:
   ```json
   {
     "imports": {
       "@hayok/esm-finance-app": "/openmrs/spa/modules/esm-finance-app.js"
     }
   }
   ```
3. Register the navigation menu item in `spa-assemble-config.json` under `app-menu-slot`.

---

### Option 3: Embedded OpenMRS Java Module (.omod)
If your deployment uses Tomcat module management:
1. Copy `dist/` files into `openmrs-module-financereports/omod/src/main/webapp/resources/finance/`.
2. Map a Spring MVC controller in Java to serve the index.
3. Package with `mvn clean install` and upload `financereports-1.0.0.omod` via **System Administration > Manage Modules**.

---

## 📊 OpenMRS REST Endpoints Used

| Endpoint | Method | Purpose |
|---|---|---|
| `/openmrs/ws/rest/v1/session` | GET | Verify user login session & privileges |
| `/openmrs/ws/rest/v1/billing/bill?v=full&fromDate={}&toDate={}` | GET | Fetch bills with line items, patient, amounts, and statuses |
| `/openmrs/ws/rest/v1/billing/payment` | GET | Fetch payment transactions and payment modes |
| `/openmrs/ws/rest/v1/billing/patientPaymentStatus` | GET | Check patient financial clearance status |
