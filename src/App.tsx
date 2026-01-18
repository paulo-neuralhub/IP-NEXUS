import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { OrganizationProvider } from "@/contexts/organization-context";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Onboarding from "./pages/app/Onboarding";
import Dashboard from "./pages/app/Dashboard";
import {
  MarketPlaceholder,
  HelpPlaceholder
} from "./pages/app/placeholders";
import DataHubPage from "./pages/app/data-hub";
import GeniusPage from "./pages/app/genius";
import SpiderLayout from "./pages/app/spider/SpiderLayout";
import SpiderDashboard from "./pages/app/spider";
import WatchResultList from "./pages/app/spider/results";
import NewWatchlistPage from "./pages/app/spider/watchlists/new";
import AnalyzePage from "./pages/app/spider/analyze";
import MatterList from "./pages/app/docket";
import MatterDetail from "./pages/app/docket/MatterDetail";
import MatterForm from "./pages/app/docket/MatterForm";
import CRMLayout from "./pages/app/crm/CRMLayout";
import CRMDashboard from "./pages/app/crm/CRMDashboard";
import ContactList from "./pages/app/crm/contacts";
import ContactDetail from "./pages/app/crm/contacts/ContactDetail";
import DealList from "./pages/app/crm/deals";
import PipelineList from "./pages/app/crm/pipelines";
import MarketingLayout from "./pages/app/marketing/MarketingLayout";
import MarketingDashboard from "./pages/app/marketing/MarketingDashboard";
import TemplateList from "./pages/app/marketing/templates";
import TemplateEditor from "./pages/app/marketing/templates/TemplateEditor";
import CampaignList from "./pages/app/marketing/campaigns";
import CampaignWizard from "./pages/app/marketing/campaigns/CampaignWizard";
import CampaignAnalytics from "./pages/app/marketing/campaigns/CampaignAnalytics";
import ContactListPage from "./pages/app/marketing/lists";
import AutomationList from "./pages/app/marketing/automations";
import AutomationEditor from "./pages/app/marketing/automations/AutomationEditor";
import FinanceLayout from "./pages/app/finance/FinanceLayout";
import FinanceDashboard from "./pages/app/finance/FinanceDashboard";
import InvoiceListPage from "./pages/app/finance/invoices";
import RenewalSchedulePage from "./pages/app/finance/renewals";
import CostsPage from "./pages/app/finance/costs";
import TeamSettingsPage from "./pages/app/settings/team";
import BillingSettingsPage from "./pages/app/settings/billing";
import IntegrationsPage from "./pages/app/settings/integrations";
import EmailHistoryPage from "./pages/app/settings/email-history";
import NotificationSettingsPage from "./pages/app/settings/notifications";
import ApiKeysPage from "./pages/app/settings/api-keys";
import IPChainPage from "./pages/app/ip-chain";
import ToolsPage from "./pages/app/tools";
import NotFound from "./pages/NotFound";
import ReportsPage from "./pages/app/reports";
import NewReportPage from "./pages/app/reports/NewReport";
import MigratorPage from "./pages/app/migrator";
import NewMigrationPage from "./pages/app/migrator/new";
import MigrationDetailPage from "./pages/app/migrator/MigrationDetail";

// Admin Pages
import AdminLayout from "./layouts/admin-layout";
import AdminDashboard from "./pages/admin";
import AdminOrganizationsPage from "./pages/admin/organizations";
import AdminUsersPage from "./pages/admin/users";
import AdminSubscriptionsPage from "./pages/admin/subscriptions";
import FeatureFlagsPage from "./pages/admin/feature-flags";
import AnnouncementsPage from "./pages/admin/announcements";
import AdminFeedbackPage from "./pages/admin/feedback";
import AdminAuditLogsPage from "./pages/admin/audit-logs";
import AdminSettingsPage from "./pages/admin/settings";
import AdminApiKeysPage from "./pages/admin/api-keys";

// Layout
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <OrganizationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Landing */}
              <Route path="/" element={<Landing />} />
              
              {/* Auth - Public */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Onboarding - Protected but no org required */}
              <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />
              
              {/* APP - Protected with org */}
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="docket" element={<MatterList />} />
                <Route path="docket/new" element={<MatterForm />} />
                <Route path="docket/:id" element={<MatterDetail />} />
                <Route path="docket/:id/edit" element={<MatterForm />} />
                <Route path="data-hub" element={<DataHubPage />} />
                <Route path="spider" element={<SpiderLayout />}>
                  <Route index element={<SpiderDashboard />} />
                  <Route path="results" element={<WatchResultList />} />
                  <Route path="watchlists/new" element={<NewWatchlistPage />} />
                  <Route path="analyze" element={<AnalyzePage />} />
                </Route>
                <Route path="crm" element={<CRMLayout />}>
                  <Route index element={<CRMDashboard />} />
                  <Route path="contacts" element={<ContactList />} />
                  <Route path="contacts/:id" element={<ContactDetail />} />
                  <Route path="deals" element={<DealList />} />
                  <Route path="pipelines" element={<PipelineList />} />
                </Route>
                <Route path="marketing" element={<MarketingLayout />}>
                  <Route index element={<MarketingDashboard />} />
                  <Route path="templates" element={<TemplateList />} />
                  <Route path="templates/:id" element={<TemplateEditor />} />
                  <Route path="campaigns" element={<CampaignList />} />
                  <Route path="campaigns/new" element={<CampaignWizard />} />
                  <Route path="campaigns/:id/edit" element={<CampaignWizard />} />
                  <Route path="campaigns/:id/analytics" element={<CampaignAnalytics />} />
                  <Route path="lists" element={<ContactListPage />} />
                  <Route path="automations" element={<AutomationList />} />
                  <Route path="automations/new" element={<AutomationEditor />} />
                  <Route path="automations/:id" element={<AutomationEditor />} />
                </Route>
                <Route path="market/*" element={<MarketPlaceholder />} />
                <Route path="genius/*" element={<GeniusPage />} />
                <Route path="finance" element={<FinanceLayout />}>
                  <Route index element={<FinanceDashboard />} />
                  <Route path="costs" element={<CostsPage />} />
                  <Route path="invoices" element={<InvoiceListPage />} />
                  <Route path="renewals" element={<RenewalSchedulePage />} />
                </Route>
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/new" element={<NewReportPage />} />
                <Route path="help/*" element={<HelpPlaceholder />} />
                <Route path="settings/team" element={<TeamSettingsPage />} />
                <Route path="settings/billing" element={<BillingSettingsPage />} />
                <Route path="settings/integrations" element={<IntegrationsPage />} />
                <Route path="settings/emails" element={<EmailHistoryPage />} />
                <Route path="settings/notifications" element={<NotificationSettingsPage />} />
                <Route path="settings/api-keys" element={<ApiKeysPage />} />
                <Route path="ip-chain" element={<IPChainPage />} />
                <Route path="tools" element={<ToolsPage />} />
                <Route path="migrator" element={<MigratorPage />} />
                <Route path="migrator/new" element={<NewMigrationPage />} />
                <Route path="migrator/:id" element={<MigrationDetailPage />} />
              </Route>
              
              {/* ADMIN PANEL */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="organizations" element={<AdminOrganizationsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="api-keys" element={<AdminApiKeysPage />} />
                <Route path="feature-flags" element={<FeatureFlagsPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="feedback" element={<AdminFeedbackPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </OrganizationProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
