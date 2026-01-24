import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { OrganizationProvider } from "@/contexts/organization-context";
import { PortalAuthProvider } from "@/hooks/usePortalAuth";
import { BrandingProvider } from "@/components/branding";

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
import HelpCategoryPage from "./pages/app/help/category/[slug]";
import HelpArticleDetailPage from "./pages/app/help/articles/[slug]";
import HelpArticlesListPage from "./pages/app/help/articles/list";
import MyTicketsPage from "./pages/app/help/tickets";
import NewTicketPage from "./pages/app/help/tickets/new";
import TicketDetailPage from "./pages/app/help/tickets/[id]";
import HelpAnnouncementsPage from "./pages/app/help/announcements";
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
import AgentListPage from "./pages/app/market/agents";
import AgentDetailPage from "./pages/app/market/agents/[id]";
import MarketLandingPage from "./pages/market/MarketLandingPage";
import RfqListPage from "./pages/app/market/rfq";
import CreateRfqRequestPage from "./pages/app/market/rfq/new";
import RfqRequestDetailPage from "./pages/app/market/rfq/[id]";
import WorkDetailPage from "./pages/app/market/work/[id]";
import RankingsPage from "./pages/app/market/RankingsPage";
import DataHubPage from "./pages/app/data-hub";
import ImportExportPage from "./pages/app/data-hub/import-export";
import GeniusLayout from "./pages/app/genius/GeniusLayout";
import GeniusChatPage from "./pages/app/genius";
import GeniusComparatorPage from "./pages/app/genius/comparator";
import GeniusOppositionPage from "./pages/app/genius/opposition";
import GeniusDocumentsPage from "./pages/app/genius/documents";
import SpiderLayout from "./pages/app/spider/SpiderLayout";
import SpiderDashboard from "./pages/app/spider";
import WatchResultList from "./pages/app/spider/results";
import NewWatchlistPage from "./pages/app/spider/watchlists/new";
import WatchlistDetailPage from "./pages/app/spider/watchlists/[id]";
import AnalyzePage from "./pages/app/spider/analyze";
import SpiderLandingPage from "./pages/landing/SpiderLanding";
import DocketLandingPage from "./pages/landing/DocketLanding";
import NexusLandingPage from "./pages/landing/NexusLanding";
import PricingPage from "./pages/pricing";
import ProductLanding from "./pages/products/ProductLanding";
import MatterList from "./pages/app/docket";
import MatterDetail from "./pages/app/docket/MatterDetail";
import MatterForm from "./pages/app/docket/MatterForm";
import DeadlinesPage from "./pages/app/docket/DeadlinesPage";
import CRMLayout from "./pages/app/crm/CRMLayout";
import CRMV2Dashboard from "./pages/app/crm/v2/Dashboard";
import CRMV2AccountsList from "./pages/app/crm/v2/accounts";
import CRMV2AccountDetail from "./pages/app/crm/v2/accounts/AccountDetail";
import CRMV2ContactsList from "./pages/app/crm/v2/contacts";
import CRMV2ContactDetail from "./pages/app/crm/v2/contacts/ContactDetail";
import CRMV2DealsList from "./pages/app/crm/v2/deals";
import CRMV2DealDetail from "./pages/app/crm/v2/deals/DealDetail";
import CRMV2InteractionsList from "./pages/app/crm/v2/interactions";
import CRMV2TasksList from "./pages/app/crm/v2/tasks";
import CRMLeadsPage from "./pages/app/crm/v2/leads";
import CRMPipelinesPage from "./pages/app/crm/v2/pipelines";
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
import TimetrackingLayout from "./pages/app/timetracking/TimetrackingLayout";
import TimesheetPage from "./pages/app/timetracking";
import TimeReportsPage from "./pages/app/timetracking/reports";
import BillingRatesPage from "./pages/app/timetracking/rates";
import FinanceDashboard from "./pages/app/finance/FinanceDashboard";
import InvoiceListPage from "./pages/app/finance/invoices";
import InvoiceDetailPage from "./pages/app/finance/invoices/InvoiceDetailPage";
import RenewalSchedulePage from "./pages/app/finance/renewals";
import CostsPage from "./pages/app/finance/costs";
import QuotesPage from "./pages/app/finance/quotes";
import BillingClientsPage from "./pages/app/finance/clients";
import FinanceSettingsPage from "./pages/app/finance/settings";
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
import DocumentTemplatesPage from "./pages/app/genius/templates";
import GenerateDocumentPage from "./pages/app/genius/templates/generate";
import DocumentViewPage from "./pages/app/genius/templates/document-view";
import GeniusAnalysisPage from "./pages/app/genius/analysis";
import GeniusDocumentsGenPage from "./pages/app/genius/documents-gen";
import GeniusPredictionsPage from "./pages/app/genius/predictions";
import GeniusValuationPage from "./pages/app/genius/valuation";
import ToolsPage from "./pages/app/tools";
import BrandingSettingsPage from "./pages/app/settings/branding";
import SSOSettingsPage from "./pages/app/settings/sso";
import NotFound from "./pages/NotFound";
import ServiceCatalogPage from "./pages/app/settings/ServiceCatalogPage";
import ReportsPage from "./pages/app/reports";
import NewReportPage from "./pages/app/reports/NewReport";
// Migrator pages consolidated into Data Hub
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
import AlertsPage from "./pages/app/alerts";
import AlertsSettingsPage from "./pages/app/alerts/settings";
import AnalyticsChartsPage from "./pages/app/analytics/charts";
import CollabIndexPage from "./pages/app/collab";
import CollabDetailPage from "./pages/app/collab/[id]";
import SearchPage from "./pages/app/SearchPage";

// Communications (Frontend + Backoffice)
import CommunicationsUnifiedPage from "./pages/app/communications";
import WhatsAppInboxPage from "./pages/app/communications/whatsapp";
import EmailInboxPage from "./pages/app/communications/email";
import CommunicationDetailPage from "./pages/app/communications/CommunicationDetail";
import BackofficeWhatsAppCommunicationsPage from "./pages/backoffice/communications/whatsapp";
import BackofficeEmailCommunicationsPage from "./pages/backoffice/communications/email";

// Legal Ops Pages
import LegalOpsAssistantPage from "./pages/app/legal-ops/assistant";
import LegalOpsClient360Page from "./pages/app/legal-ops/client-360";
import LegalOpsCommunicationsPage from "./pages/app/legal-ops/communications";
import SignaturesListPage from "./pages/app/legal-ops/signatures";
import SignatureDetailPage from "./pages/app/legal-ops/signatures/[id]";

// Public Signing Page
import SignDocumentPage from "./pages/sign/SignDocument";
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
import BackofficeIntegrationsPage from "./pages/backoffice/integrations";
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
import BackofficeProductAnalyticsPage from "./pages/backoffice/product-analytics";
import KnowledgeBasesPage from "./pages/backoffice/knowledge-bases";
import DemoDataPage from "./pages/backoffice/demo-data";
import VoipManagementPage from "./pages/backoffice/voip/VoipManagementPage";
import EventLogPage from "./pages/backoffice/events/EventLogPage";
import SystemLogsPage from "./pages/backoffice/logs";
import BackofficeAlertsPage from "./pages/backoffice/alerts/BackofficeAlertsPage";

// Landings Backoffice
import LandingsDashboard from "./pages/backoffice/landings";
import LandingPagesListPage from "./pages/backoffice/landings/pages";
import LeadsListPage from "./pages/backoffice/landings/leads";
import LeadDetailPage from "./pages/backoffice/landings/lead-detail";

// KYC Pages
import MarketKycPage from "./pages/app/market/kyc";
import KycVerificationPage from "./pages/app/market/kyc/[type]";

// Portal Pages (Client Portal)
import PortalIndex from "./pages/portal/PortalIndex";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalLayout from "./components/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalMatters from "./pages/portal/PortalMatters";
import PortalMatterDetail from "./pages/portal/PortalMatterDetail";
import PortalDocuments from "./pages/portal/PortalDocuments";
import PortalInvoices from "./pages/portal/PortalInvoices";
import PortalCatalog from "./pages/portal/PortalCatalog";
import PortalMessages from "./pages/portal/PortalMessages";

// Layout
import { AppLayout } from "@/components/layout/app-layout";
import { AuthGuard } from "@/components/layout/auth-guard";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <OrganizationProvider>
        <BrandingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TooltipProvider delayDuration={0}>
              <AnalyticsProvider>
              <Routes>
                {/* Landing Pages */}
                <Route path="/" element={<Landing />} />
                <Route path="/spider" element={<SpiderLandingPage />} />
                <Route path="/docket" element={<DocketLandingPage />} />
                <Route path="/nexus" element={<NexusLandingPage />} />
                <Route path="/market" element={<MarketLandingPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/spider-pro" element={<SpiderLandingPage />} />
                <Route path="/products/:slug" element={<ProductLanding />} />
              
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
                  <Route path="watchlists/:id" element={<WatchlistDetailPage />} />
                  <Route path="analyze" element={<AnalyzePage />} />
                </Route>
                <Route path="crm" element={<CRMLayout />}>
                  <Route index element={<CRMV2Dashboard />} />
                  <Route path="accounts" element={<CRMV2AccountsList />} />
                  <Route path="accounts/:id" element={<CRMV2AccountDetail />} />
                  <Route path="contacts" element={<CRMV2ContactsList />} />
                  <Route path="contacts/:id" element={<CRMV2ContactDetail />} />
                  <Route path="leads" element={<CRMLeadsPage />} />
                  <Route path="deals" element={<CRMV2DealsList />} />
                  <Route path="deals/:id" element={<CRMV2DealDetail />} />
                  <Route path="pipelines" element={<CRMPipelinesPage />} />
                  <Route path="interactions" element={<CRMV2InteractionsList />} />
                  <Route path="tasks" element={<CRMV2TasksList />} />
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
                  <Route path="agents" element={<AgentListPage />} />
                  <Route path="agents/:id" element={<AgentDetailPage />} />
                  <Route path="rfq" element={<RfqListPage />} />
                  <Route path="rfq/new" element={<CreateRfqRequestPage />} />
                  <Route path="rfq/:id" element={<RfqRequestDetailPage />} />
                  <Route path="work/:id" element={<WorkDetailPage />} />
                  <Route path="rankings" element={<RankingsPage />} />
                </Route>
                <Route path="genius" element={<GeniusLayout />}>
                  <Route index element={<GeniusChatPage />} />
                  <Route path="analysis" element={<GeniusAnalysisPage />} />
                  <Route path="documents-gen" element={<GeniusDocumentsGenPage />} />
                  <Route path="predictions" element={<GeniusPredictionsPage />} />
                  <Route path="valuation" element={<GeniusValuationPage />} />
                  <Route path="comparator" element={<GeniusComparatorPage />} />
                  <Route path="opposition" element={<GeniusOppositionPage />} />
                  <Route path="translator" element={<TranslatorPage />} />
                  <Route path="documents" element={<GeniusDocumentsPage />} />
                  <Route path="templates" element={<DocumentTemplatesPage />} />
                  <Route path="templates/generate/:templateId" element={<GenerateDocumentPage />} />
                  <Route path="templates/view/:documentId" element={<DocumentViewPage />} />
                </Route>
                <Route path="finance" element={<FinanceLayout />}>
                  <Route index element={<FinanceDashboard />} />
                  <Route path="costs" element={<CostsPage />} />
                  <Route path="quotes" element={<QuotesPage />} />
                  <Route path="invoices" element={<InvoiceListPage />} />
                  <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="clients" element={<BillingClientsPage />} />
                  <Route path="renewals" element={<RenewalSchedulePage />} />
                  <Route path="valuation" element={<ValuationDashboardPage />} />
                  <Route path="valuation/:id" element={<PortfolioDetailPage />} />
                  <Route path="settings" element={<FinanceSettingsPage />} />
                </Route>
                <Route path="timetracking" element={<TimetrackingLayout />}>
                  <Route index element={<TimesheetPage />} />
                  <Route path="reports" element={<TimeReportsPage />} />
                  <Route path="rates" element={<BillingRatesPage />} />
                </Route>
                <Route path="reports" element={<ReportsPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="alerts/settings" element={<AlertsSettingsPage />} />
                <Route path="reports/new" element={<NewReportPage />} />
                <Route path="help" element={<HelpLayout />}>
                  <Route index element={<HelpCenterIndex />} />
                  <Route path="articles" element={<HelpArticlesListPage />} />
                  <Route path="articles/:slug" element={<HelpArticleDetailPage />} />
                  <Route path="category/:slug" element={<HelpCategoryPage />} />
                  <Route path="videos" element={<VideoTutorialsPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="guides" element={<GuidesPage />} />
                  <Route path="tickets" element={<MyTicketsPage />} />
                  <Route path="tickets/new" element={<NewTicketPage />} />
                  <Route path="tickets/:id" element={<TicketDetailPage />} />
                  <Route path="announcements" element={<HelpAnnouncementsPage />} />
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
                <Route path="settings/branding" element={<BrandingSettingsPage />} />
                <Route path="settings/sso" element={<SSOSettingsPage />} />
                <Route path="settings/catalogo-servicios" element={<ServiceCatalogPage />} />
                <Route path="ip-chain" element={<IPChainPage />} />
                <Route path="tools" element={<ToolsPage />} />
                {/* Migrator redirect to Data Hub */}
                <Route path="migrator" element={<Navigate to="/app/data-hub?tab=migrator" replace />} />
                <Route path="migrator/new" element={<Navigate to="/app/data-hub?tab=migrator" replace />} />
                <Route path="migrator/:id" element={<Navigate to="/app/data-hub?tab=migrator" replace />} />
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
                {/* Communications */}
                <Route path="communications" element={<CommunicationsUnifiedPage />} />
                <Route path="communications/:id" element={<CommunicationDetailPage />} />
                <Route path="communications/whatsapp" element={<WhatsAppInboxPage />} />
                <Route path="communications/whatsapp/:id" element={<CommunicationDetailPage />} />
                <Route path="communications/email" element={<EmailInboxPage />} />
                <Route path="communications/email/:id" element={<CommunicationDetailPage />} />
                <Route path="onboarding" element={<Onboarding />} />
                {/* Legal Ops */}
                <Route path="legal-ops" element={<Navigate to="/app/legal-ops/assistant" replace />} />
                <Route path="legal-ops/assistant" element={<LegalOpsAssistantPage />} />
                <Route path="legal-ops/client-360" element={<LegalOpsClient360Page />} />
                <Route path="legal-ops/communications" element={<LegalOpsCommunicationsPage />} />
                <Route path="legal-ops/signatures" element={<SignaturesListPage />} />
                <Route path="legal-ops/signatures/:id" element={<SignatureDetailPage />} />
              </Route>
              
              {/* BACKOFFICE - Panel de administración consolidado */}
              <Route path="/backoffice" element={<AuthGuard><BackofficeLayout /></AuthGuard>}>
                <Route index element={<BackofficeDashboard />} />
                {/* Core */}
                <Route path="tenants" element={<TenantsPage />} />
                <Route path="users" element={<BackofficeUsersPage />} />
                <Route path="billing" element={<BillingPage />} />
                {/* Communications */}
                <Route path="communications/whatsapp" element={<BackofficeWhatsAppCommunicationsPage />} />
                <Route path="communications/email" element={<BackofficeEmailCommunicationsPage />} />
                {/* IPO Registry */}
                <Route path="ipo" element={<IPORegistryPage />} />
                <Route path="ipo/new" element={<NewIPOOfficePage />} />
                <Route path="ipo/:officeId" element={<IPOOfficeDetailPage />} />
                <Route path="ipo/:officeId/edit" element={<EditIPOOfficePage />} />
                {/* AI Brain */}
                <Route path="ai" element={<AIBrainPage />} />
                {/* Tools */}
                <Route path="feature-flags" element={<FeatureFlagsPage />} />
                <Route path="integrations" element={<BackofficeIntegrationsPage />} />
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
                <Route path="product-analytics" element={<BackofficeProductAnalyticsPage />} />
                <Route path="knowledge-bases" element={<KnowledgeBasesPage />} />
                <Route path="demo-data" element={<DemoDataPage />} />
                <Route path="voip" element={<VoipManagementPage />} />
                <Route path="events" element={<EventLogPage />} />
                <Route path="logs" element={<SystemLogsPage />} />
                <Route path="alerts" element={<BackofficeAlertsPage />} />
                <Route path="kill-switch" element={<KillSwitchPage />} />
                {/* Landings */}
                <Route path="landings" element={<LandingsDashboard />} />
                <Route path="landings/paginas" element={<LandingPagesListPage />} />
                <Route path="landings/leads" element={<LeadsListPage />} />
                <Route path="landings/leads/:id" element={<LeadDetailPage />} />
              </Route>
              
              {/* PUBLIC SIGNATURE PAGE - No auth required */}
              <Route path="/sign/:token" element={<SignDocumentPage />} />
              
              {/* CLIENT PORTAL - Public facing for external clients */}
              <Route path="/portal" element={<PortalIndex />} />
              <Route path="/portal/:slug" element={<PortalAuthProvider><PortalLogin /></PortalAuthProvider>} />
              <Route path="/portal/:slug" element={<PortalAuthProvider><PortalLayout /></PortalAuthProvider>}>
                <Route path="dashboard" element={<PortalDashboard />} />
                <Route path="matters" element={<PortalMatters />} />
                <Route path="matters/:id" element={<PortalMatterDetail />} />
                <Route path="documents" element={<PortalDocuments />} />
                <Route path="invoices" element={<PortalInvoices />} />
                <Route path="catalog" element={<PortalCatalog />} />
                <Route path="messages" element={<PortalMessages />} />
              </Route>
              
                {/* 404 */}
              <Route path="*" element={<NotFound />} />
              </Routes>
              </AnalyticsProvider>
            </TooltipProvider>
          </BrowserRouter>
        </BrandingProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
