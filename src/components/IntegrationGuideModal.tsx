import React, { useState } from 'react';
import { 
  X, 
  Server, 
  Check, 
  Copy, 
  ShieldCheck
} from 'lucide-react';

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'nginx' | 'esm' | 'omod' | 'api'>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 border border-indigo-400/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-2xs uppercase tracking-wider font-semibold text-indigo-300">
                Implementation Run Down &amp; Architecture
              </span>
              <h2 className="text-lg font-bold text-white">
                OpenMRS 3.x Integration &amp; Backend Deployment
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 text-xs font-semibold overflow-x-auto shrink-0">
          {[
            { id: 'overview', label: '1. Architecture & Flow' },
            { id: 'nginx', label: '2. Nginx Reverse Proxy (Easiest)' },
            { id: 'esm', label: '3. OpenMRS 3.x ESM Microfrontend' },
            { id: 'omod', label: '4. Embedded OMOD (Java)' },
            { id: 'api', label: '5. OpenMRS REST APIs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-4 border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-indigo-900">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Integration with rs.hayokmedicare.ng
                </h4>
                <p>
                  This React dashboard integrates directly with OpenMRS 3.x by communicating with the{' '}
                  <code className="bg-indigo-100 px-1.5 py-0.5 rounded font-mono">openmrs-module-billing</code> REST API endpoints. Because requests include authentication session cookies (<code className="bg-indigo-100 px-1 py-0.5 rounded font-mono">JSESSIONID</code>), CORS and session sharing are handled via reverse proxy or same-origin deployment.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                <h4 className="font-bold text-slate-900 mb-2">High-Level Data Flow:</h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-2xs overflow-x-auto leading-normal">
{`[ React Finance Dashboard (Vite / SPA) ]
       │
       │ HTTPS REST API Calls (credentials: 'include')
       ▼
[ Nginx Reverse Proxy / Gateway (rs.hayokmedicare.ng) ]
   ├── /finance/                ──> Serves React static build (HTML, JS, CSS)
   ├── /openmrs/spa/            ──> OpenMRS 3.x Microfrontend SPA
   └── /openmrs/ws/rest/v1/     ──> Proxies to Tomcat backend (OpenMRS Core + Billing Module)
       │
       ├── /ws/rest/v1/session                (Authentication & Role Check)
       ├── /ws/rest/v1/billing/bill?v=full    (Bills, Line Items, Amounts, Statuses)
       └── /ws/rest/v1/billing/payment        (Cashier Ledger & Tendered Payments)`}
                </pre>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="font-bold text-slate-900 block mb-1">Option 1: Microfrontend (ESM)</span>
                  <p className="text-slate-500 text-2xs">Integrates directly into OpenMRS 3.x top navigation bar alongside <code className="text-2xs font-mono">openmrs-esm-billing-app</code>.</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="font-bold text-slate-900 block mb-1">Option 2: Embedded OMOD</span>
                  <p className="text-slate-500 text-2xs">Packages compiled React dist into a Java OpenMRS module <code className="text-2xs font-mono">.omod</code> uploaded via System Admin UI.</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <span className="font-bold text-slate-900 block mb-1">Option 3: Nginx Direct (Easiest)</span>
                  <p className="text-slate-500 text-2xs">Serve the <code className="text-2xs font-mono">dist/</code> folder at <code className="text-2xs font-mono">/finance/</code> under the same domain. Zero Java or O3 build tooling required!</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NGINX DIRECT REVERSE PROXY */}
          {activeTab === 'nginx' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Recommended Deployment: Nginx Same-Domain Routing</h4>
                  <p className="text-slate-500 text-xs">Run this React app at <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">https://rs.hayokmedicare.ng/finance/</code></p>
                </div>
                <button
                  onClick={() => copyToClipboard(nginxConfigSnippet, 'nginx')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors"
                >
                  {copiedKey === 'nginx' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'nginx' ? 'Copied!' : 'Copy Nginx Config'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Step 1: Build the production bundle</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-2xs">
                  npm run build
                </pre>
                <p className="text-slate-500 text-2xs">This creates the optimized static files inside the <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">dist/</code> folder.</p>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Step 2: Copy dist/ to your OpenMRS server</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-2xs">
                  scp -r dist/* user@rs.hayokmedicare.ng:/var/www/finance-dashboard/
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Step 3: Update Nginx server block</p>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-2xs overflow-x-auto">
{nginxConfigSnippet}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">Step 4: Reload Nginx</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-2xs">
                  sudo nginx -t &amp;&amp; sudo systemctl reload nginx
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: ESM MICROFRONTEND */}
          {activeTab === 'esm' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Deploying as an OpenMRS 3.x ESM Microfrontend</h4>
              <p>
                If your hospital runs the OpenMRS 3.x SPA frontend (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/openmrs/spa/</code>), you can package this dashboard as an ECMAScript Module (ESM). It will natively adopt the OpenMRS Carbon Design system header and single sign-on.
              </p>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">1. Install OpenMRS ESM CLI tooling:</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-2xs">
                  npm install --save-dev @openmrs/esm-framework openmrs
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">2. Register in your OpenMRS importmap.json:</p>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-2xs">
{`{
  "imports": {
    "@hayok/esm-finance-app": "/openmrs/spa/modules/esm-finance-app.js"
  }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">3. Configure Navigation Pin in spa-assemble-config.json:</p>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-2xs">
{`{
  "app-menu-slot": [
    {
      "name": "Head of Finance",
      "url": "\${openmrsSpaBase}/finance",
      "privilege": "Manage Billing"
    }
  ]
}`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: EMBEDDED OMOD */}
          {activeTab === 'omod' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Deploying as an OpenMRS Java Module (.omod)</h4>
              <p>
                If your OpenMRS installation is managed purely through the legacy OpenMRS Administration UI (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Manage Modules</code>), you can wrap this React build inside a standard OpenMRS module.
              </p>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">1. Copy dist output into Maven module project:</p>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-2xs">
                  cp -r dist/* openmrs-module-financereports/omod/src/main/webapp/resources/finance/
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">2. Spring MVC Controller (Java):</p>
                <pre className="bg-slate-900 text-emerald-300 p-3 rounded-lg font-mono text-2xs">
{`@Controller
public class FinanceDashboardController {
    @RequestMapping(value = "/module/financereports/dashboard", method = RequestMethod.GET)
    public String renderDashboard() {
        return "/module/financereports/index";
    }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="font-semibold text-slate-800">3. Package and upload:</p>
                <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-2xs">
                  mvn clean install
                </pre>
                <p className="text-slate-500 text-2xs">Upload the generated <code className="font-mono text-slate-700">financereports-1.0.0.omod</code> via System Administration &gt; Manage Modules.</p>
              </div>
            </div>
          )}

          {/* TAB 5: REST API ENDPOINTS */}
          {activeTab === 'api' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm">Official OpenMRS Billing REST API Reference</h4>
              
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Endpoint</th>
                      <th className="py-2.5 px-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-2xs">
                    <tr>
                      <td className="py-2 px-3 text-emerald-700 font-bold">GET</td>
                      <td className="py-2 px-3 text-slate-800">/openmrs/ws/rest/v1/session</td>
                      <td className="py-2 px-3 font-sans text-slate-600">Verifies authenticated user and billing role privileges</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-emerald-700 font-bold">GET</td>
                      <td className="py-2 px-3 text-slate-800">/openmrs/ws/rest/v1/billing/bill?v=full&amp;fromDate=&amp;toDate=</td>
                      <td className="py-2 px-3 font-sans text-slate-600">Retrieves bills, itemized line items, patient uuid, amount paid, and status</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-emerald-700 font-bold">GET</td>
                      <td className="py-2 px-3 text-slate-800">/openmrs/ws/rest/v1/billing/payment</td>
                      <td className="py-2 px-3 font-sans text-slate-600">Retrieves cashier transactions, receipt numbers, and payment modes</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 text-emerald-700 font-bold">GET</td>
                      <td className="py-2 px-3 text-slate-800">/openmrs/ws/rest/v1/billing/patientPaymentStatus</td>
                      <td className="py-2 px-3 font-sans text-slate-600">Returns patient billing status (PENDING, PAID, EXEMPTED)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors shadow-2xs"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};

const nginxConfigSnippet = `server {
    listen 443 ssl;
    server_name rs.hayokmedicare.ng;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/rs.hayokmedicare.ng/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rs.hayokmedicare.ng/privkey.pem;

    # 1. Custom Head of Finance React Dashboard
    location /finance/ {
        alias /var/www/finance-dashboard/;
        index index.html;
        try_files $uri $uri/ /finance/index.html;
    }

    # 2. OpenMRS Core & Billing REST APIs (Shares JSESSIONID automatically)
    location /openmrs/ws/ {
        proxy_pass http://localhost:8080/openmrs/ws/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cookie_path / /;
    }

    # 3. OpenMRS 3.x SPA Frontend
    location /openmrs/spa/ {
        proxy_pass http://localhost:8080/openmrs/spa/;
        proxy_set_header Host $host;
    }
}`;
