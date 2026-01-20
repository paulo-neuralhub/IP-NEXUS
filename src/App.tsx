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
import HelpLayout from "./pages/app/help/HelpLayout";
import HelpCenterIndex from "./pages/app/help/index";
import VideoTutorialsPage from "./pages/app/help/videos";
import MarketLayout from "./pages/app/market/MarketLayout";
import MarketDashboard from "./pages/app/market";
import MarketListings from "./pages/app/market/listings";
import CreateListingPage from "./pages/app/market/listings/new";
import ListingDetailPage from "./pages/app/market/listings/[id]";
import MarketAssets from "./pages/app/market/assets";
import MarketTransactions from "./pages/app/market/transactions";
import TransactionDetailPage from "./pages/app/market/transactions/[id]";
import MarketMessages from "./pages/app/market/messages";
import MarketFavorites from "./pages/app/market/favorites";
import MarketAlerts from "./pages/app/market/alerts";
import MarketProfile from "./pages/app/market/profile";
import DataHubPage from "./pages/app/data-hub";
import ImportExportPage from "./pages/app/data-hub/import-export";
import GeniusLayout from "./pages/app/genius/GeniusLayout";
import GeniusChatPage from "./pages/app/genius/chat";
import GeniusComparatorPage from "./pages/app/genius/comparator";
import GeniusOppositionPage from "./pages/app/genius/opposition";
import GeniusDocumentsPage from "./pages/app/genius/documents";
import SpiderLayout from "./pages/app/spider/SpiderLayout";
import SpiderDashboard from "./pages/app/spider";
import WatchResultList from "./pages/app/spider/results";
import NewWatchlistPage from "./pages/app/spider/watchlists/new";
import AnalyzePage from "./pages/app/spider/analyze";
import SpiderLandingPage from "./pages/spider-landing";
import PricingPage from "./pages/pricing";
import MatterList from "./pages/app/docket";
import MatterDetail from "./pages/app/docket/MatterDetail";
import MatterForm from "./pages/app/docket/MatterForm";
import DeadlinesPage from "./pages/app/docket/DeadlinesPage";
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
import NewTemplatePage from "./pages/app/marketing/templates/new";
import CampaignList from "./pages/app/marketing/campaigns";
import CampaignWizard from "./pages/app/marketing/campaigns/CampaignWizard";
import CampaignAnalytics from "./pages/app/marketing/campaigns/CampaignAnalytics";
import ContactListPage from "./pages/app/marketing/lists";
import AutomationList from "./pages/app/marketing/automations";
import AutomationEditor from "./pages/app/marketing/automations/AutomationEditor";
import NewAutomationPage from "./pages/app/marketing/automations/new";
import FAQPage from "./pages/app/help/faq";
import GuidesPage from "./pages/app/help/guides";
import FinanceLayout from "./pages/app/finance/FinanceLayout";
import FinanceDashboard from "./pages/app/finance/FinanceDashboard";
import InvoiceListPage from "./pages/app/finance/invoices";
import RenewalSchedulePage from "./pages/app/finance/renewals";
import CostsPage from "./pages/app/finance/costs";
import ValuationDashboardPage from "./pages/app/finance/valuation";
import PortfolioDetailPage from "./pages/app/finance/valuation/[id]";
import SettingsPage from "./pages/app/settings";
import TeamSettingsPage from "./pages/app/settings/team";
import RolesSettingsPage from "./pages/app/settings/roles";
import TeamsSettingsPage from "./pages/app/settings/teams";
import BillingSettingsPage from "./pages/app/settings/billing";
import IntegrationsPage from "./pages/app/settings/integrations";
import EmailHistoryPage from "./pages/app/settings/email-history";
import NotificationSettingsPage from "./pages/app/settings/notifications";
import ApiKeysPage from "./pages/app/settings/api-keys";
import AuditSettingsPage from "./pages/app/settings/audit";
import ComplianceSettingsPage from "./pages/app/settings/compliance";
import IPChainPage from "./pages/app/ip-chain";
import TranslatorPage from "./pages/app/genius/translator";
import ToolsPage from "./pages/app/tools";
import NotFound from "./pages/NotFound";
import ReportsPage from "./pages/app/reports";
import NewReportPage from "./pages/app/reports/NewReport";
import MigratorPage from "./pages/app/migrator";
import NewMigrationPage from "./pages/app/migrator/new";
import MigrationDetailPage from "./pages/app/migrator/MigrationDetail";
import FilingIndexPage from "./pages/app/filing";
import NewFilingPage from "./pages/app/filing/new";
import FilingDetailPage from "./pages/app/filing/[id]";
import EditFilingPage from "./pages/app/filing/[id]/edit";
import WorkflowIndexPage from "./pages/app/workflow";
import NewWorkflowPage from "./pages/app/workflow/new";
import WorkflowTemplatesPage from "./pages/app/workflow/templates";
import WorkflowDetailPage from "./pages/app/workflow/[id]";
import EditWorkflowPage from "./pages/app/workflow/[id]/edit";
import AnalyticsPage from "./pages/app/analytics";
import AnalyticsChartsPage from "./pages/app/analytics/charts";
import CollabIndexPage from "./pages/app/collab";
import CollabDetailPage from "./pages/app/collab/[id]";
import SearchPage from "./pages/app/SearchPage";

// Legal Ops Pages
import LegalOpsAssistantPage from "./pages/app/legal-ops/assistant";
import LegalOpsClient360Page from "./pages/app/legal-ops/client-360";
import LegalOpsCommunicationsPage from "./pages/app/legal-ops/communications";
// Backoffice Pages
import BackofficeLayout from "./layouts/backoffice-layout";
import BackofficeDashboard from "./pages/backoffice";
import TenantsPage from "./pages/backoffice/tenants";
import BackofficeUsersPage from "./pages/backoffice/users";
import BillingPage from "./pages/backoffice/billing";
import IPORegistryPage from "./pages/backoffice/ipo";
import IPOOfficeDetailPage from "./pages/backoffice/ipo/[officeId]";
import NewIPOOfficePage from "./pages/backoffice/ipo/new";
import EditIPOOfficePage from "./pages/backoffice/ipo/edit";
import FeatureFlagsPage from "./pages/backoffice/feature-flags";
import BackofficeApiKeysPage from "./pages/backoffice/api-keys";
import AnnouncementsPage from "./pages/backoffice/announcements";
import BackofficeFeedbackPage from "./pages/backoffice/feedback";
import BackofficeAuditPage from "./pages/backoffice/audit";
import BackofficeSettingsPage from "./pages/backoffice/settings";
import KycReviewPage from "./pages/backoffice/kyc-review";
import ModerationPage from "./pages/backoffice/moderation";
import ComplianceDashboardPage from "./pages/backoffice/compliance";
import AIBrainPage from "./pages/backoffice/ai-brain";
import KillSwitchPage from "./pages/backoffice/kill-switch";
import BackofficeCalendarPage from "./pages/backoffice/calendar";

// KYC Pages
import MarketKycPage from "./pages/app/market/kyc";
import KycVerificationPage from "./pages/app/market/kyc/[type]";

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
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/spider-pro" element={<SpiderLandingPage />} />
              
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
                <Route path="docket/deadlines" element={<DeadlinesPage />} />
                <Route path="docket/new" element={<MatterForm />} />
                <Route path="docket/:id" element={<MatterDetail />} />
                <Route path="docket/:id/edit" element={<MatterForm />} />
                <Route path="data-hub" element={<DataHubPage />} />
                <Route path="data-hub/import-export" element={<ImportExportPage />} />
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
                  <Route path="templates/new" element={<NewTemplatePage />} />
                  <Route path="templates/:id/edit" element={<TemplateEditor />} />
                  <Route path="templates/:id" element={<TemplateEditor />} />
                  <Route path="campaigns" element={<CampaignList />} />
                  <Route path="campaigns/new" element={<CampaignWizard />} />
                  <Route path="campaigns/:id/edit" element={<CampaignWizard />} />
                  <Route path="campaigns/:id/analytics" element={<CampaignAnalytics />} />
                  <Route path="lists" element={<ContactListPage />} />
                  <Route path="automations" element={<AutomationList />} />
                  <Route path="automations/new" element={<NewAutomationPage />} />
                  <Route path="automations/new/editor" element={<AutomationEditor />} />
                  <Route path="automations/:id" element={<AutomationEditor />} />
                </Route>
                <Route path="market" element={<MarketLayout />}>
                  <Route index element={<MarketDashboard />} />
                  <Route path="listings" element={<MarketListings />} />
                  <Route path="listings/new" element={<CreateListingPage />} />
                  <Route path="listings/:id" element={<ListingDetailPage />} />
                  <Route path="assets" element={<MarketAssets />} />
                  <Route path="transactions" element={<MarketTransactions />} />
                  <Route path="transactions/:id" element={<TransactionDetailPage />} />
                  <Route path="messages" element={<MarketMessages />} />
                  <Route path="favorites" element={<MarketFavorites />} />
                  <Route path="alerts" element={<MarketAlerts />} />
                  <Route path="profile" element={<MarketProfile />} />
                  <Route path="kyc" element={<MarketKycPage />} />
                  <Route path="kyc/:type" element={<KycVerificationPage />} />
                </Route>
                <Route path="genius" element={<GeniusLayout />}>
                  <Route index element={<GeniusChatPage />} />
                  <Route path="comparator" element={<GeniusComparatorPage />} />
                  <Route path="opposition" element={<GeniusOppositionPage />} />
                  <Route path="translator" element={<TranslatorPage />} />
                  <Route path="documents" element={<GeniusDocumentsPage />} />
                </Route>
                <Route path="finance" element={<FinanceLayout />}>
                  <Route index element={<FinanceDashboard />} />
                  <Route path="costs" element={<CostsPage />} />
                  <Route path="invoices" element={<InvoiceListPage />} />
                  <Route path="renewals" element={<RenewalSchedulePage />} />
                  <Route path="valuation" element={<ValuationDashboardPage />} />
                  <Route path="valuation/:id" element={<PortfolioDetailPage />} />
                </Route>
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/new" element={<NewReportPage />} />
                <Route path="help" element={<HelpLayout />}>
                  <Route index element={<HelpCenterIndex />} />
                  <Route path="videos" element={<VideoTutorialsPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="guides" element={<GuidesPage />} />
                </Route>
                <Route path="settings" element={<SettingsPage />} />
                <Route path="settings/team" element={<TeamSettingsPage />} />
                <Route path="settings/roles" element={<RolesSettingsPage />} />
                <Route path="settings/teams" element={<TeamsSettingsPage />} />
                <Route path="settings/billing" element={<BillingSettingsPage />} />
                <Route path="settings/integrations" element={<IntegrationsPage />} />
                <Route path="settings/emails" element={<EmailHistoryPage />} />
                <Route path="settings/notifications" element={<NotificationSettingsPage />} />
                <Route path="settings/api-keys" element={<ApiKeysPage />} />
                <Route path="settings/audit" element={<AuditSettingsPage />} />
                <Route path="settings/compliance" element={<ComplianceSettingsPage />} />
                <Route path="ip-chain" element={<IPChainPage />} />
                <Route path="tools" element={<ToolsPage />} />
                <Route path="migrator" element={<MigratorPage />} />
                <Route path="migrator/new" element={<NewMigrationPage />} />
                <Route path="migrator/:id" element={<MigrationDetailPage />} />
                <Route path="filing" element={<FilingIndexPage />} />
                <Route path="filing/new" element={<NewFilingPage />} />
                <Route path="filing/:id" element={<FilingDetailPage />} />
                <Route path="filing/:id/edit" element={<EditFilingPage />} />
                <Route path="workflow" element={<WorkflowIndexPage />} />
                <Route path="workflow/new" element={<NewWorkflowPage />} />
                <Route path="workflow/templates" element={<WorkflowTemplatesPage />} />
                <Route path="workflow/:id" element={<WorkflowDetailPage />} />
                <Route path="workflow/:id/edit" element={<EditWorkflowPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="analytics/charts" element={<AnalyticsChartsPage />} />
                <Route path="collab" element={<CollabIndexPage />} />
                <Route path="collab/:id" element={<CollabDetailPage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="onboarding" element={<Onboarding />} />
                {/* Legal Ops */}
                <Route path="legal-ops" element={<Navigate to="/app/legal-ops/assistant" replace />} />
                <Route path="legal-ops/assistant" element={<LegalOpsAssistantPage />} />
                <Route path="legal-ops/client-360" element={<LegalOpsClient360Page />} />
                <Route path="legal-ops/communications" element={<LegalOpsCommunicationsPage />} />
              </Route>
              
              {/* BACKOFFICE - Panel de administración consolidado */}
              <Route path="/backoffice" element={<AuthGuard><BackofficeLayout /></AuthGuard>}>
                <Route index element={<BackofficeDashboard />} />
                {/* Core */}
                <Route path="tenants" element={<TenantsPage />} />
                <Route path="users" element={<BackofficeUsersPage />} />
                <Route path="billing" element={<BillingPage />} />
                {/* IPO Registry */}
                <Route path="ipo" element={<IPORegistryPage />} />
                <Route path="ipo/new" element={<NewIPOOfficePage />} />
                <Route path="ipo/:officeId" element={<IPOOfficeDetailPage />} />
                <Route path="ipo/:officeId/edit" element={<EditIPOOfficePage />} />
                {/* AI Brain */}
                <Route path="ai" element={<AIBrainPage />} />
                {/* Tools */}
                <Route path="feature-flags" element={<FeatureFlagsPage />} />
                <Route path="api-keys" element={<BackofficeApiKeysPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                {/* Compliance */}
                <Route path="kyc-review" element={<KycReviewPage />} />
                <Route path="moderation" element={<ModerationPage />} />
                <Route path="compliance" element={<ComplianceDashboardPage />} />
                {/* System */}
                <Route path="audit" element={<BackofficeAuditPage />} />
                <Route path="feedback" element={<BackofficeFeedbackPage />} />
                <Route path="settings" element={<BackofficeSettingsPage />} />
                <Route path="calendar" element={<BackofficeCalendarPage />} />
                <Route path="kill-switch" element={<KillSwitchPage />} />
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
