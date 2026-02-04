import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth-context";
import { OrganizationProvider } from "@/contexts/organization-context";
import { ModulesProvider } from "@/contexts/ModulesContext";
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
import MarketAssetDetailPage from "./pages/app/market/assets/[id]";
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
// Expedientes V2
import ExpedientesPage from "./pages/app/expedientes";
import MatterDetailPageV2 from "./pages/app/expedientes/[id]";
import EditMatterPage from "./pages/app/expedientes/[id]/editar";
import NewMatterPage from "./pages/app/expedientes/nuevo";
// Calendario Unificado
import CalendarioPage from "./pages/app/calendario";
// Tareas Unificadas
import TareasPage from "./pages/app/tareas";
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
import CRMKanbanPage from "./pages/app/crm/CRMKanbanPage";
import CRMDashboardNew from "./pages/app/crm/CRMDashboardNew";
import CRMPipelinePage from "./pages/app/crm/CRMPipelinePage";
import CRMLeadDetailPage from "./pages/app/crm/leads/LeadDetailPage";
import CRMDealDetailPage from "./pages/app/crm/deals/DealDetailPage";
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
import DocumentGeneratorPage from "./pages/app/documents/DocumentGeneratorPage";
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
import InvoiceEditorPage from "./pages/app/finance/invoices/InvoiceEditorPage";
import ExpensesPage from "./pages/app/finance/ExpensesPage";
import ProvisionsPage from "./pages/app/finance/provisions";
import ProvisionDetailPage from "./pages/app/finance/provisions/ProvisionDetailPage";
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
import SubscriptionPage from "./pages/app/settings/subscription";
import SubscriptionInvoicesPage from "./pages/app/settings/subscription/invoices";
import SubscriptionPlansPage from "./pages/app/settings/subscription/plans";
import TenantTelephonySettingsPage from "./pages/app/settings/telephony";
import TenantTelephonyPacksPage from "./pages/app/settings/telephony/packs";
import TenantTelephonyHistoryPage from "./pages/app/settings/telephony/historial";
import IPChainPage from "./pages/app/ip-chain";
import TranslatorPage from "./pages/app/genius/translator";
import DocumentTemplatesPage from "./pages/app/genius/templates";
import DocumentTemplatesDashboard from "./pages/app/settings/templates";
import DocumentTemplateBrandingPage from "./pages/app/settings/templates/branding";
import DocumentTemplateListPage from "./pages/app/settings/templates/[type]";
import DocumentTemplateEditPage from "./pages/app/settings/templates/[id]/edit";
import GenerateDocumentPage from "./pages/app/genius/templates/generate";
import TemplateEditorPage from "./pages/app/genius/templates/editor";
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
import ServicesPage from "./pages/app/settings/services";
import ModulesManagementPage from "./pages/app/settings/modules";
import SignaturesPage from "./pages/app/settings/signatures";

import DeadlineConfigPage from "./pages/app/settings/deadlines";
import InternalReferenceConfigPage from "./pages/app/settings/internal-reference";
import AutomationsPage from "./pages/app/settings/automations";
import AutomationRulesPage from "./pages/app/settings/automations/rules";
import LegalDeadlinesPage from "./pages/app/settings/automations/legal-deadlines";
import ExecutionHistoryPage from "./pages/app/settings/automations/history";
import ReportsPage from "./pages/app/reports";
import NewReportPage from "./pages/app/reports/NewReport";
// Reportes V2 (L94)
import ReportesPage from "./pages/app/reportes";
import ReporteExpedientesPage from "./pages/app/reportes/expedientes";
import ReportePlazosPage from "./pages/app/reportes/plazos";
import MyOfficesPage from "./pages/app/settings/offices";
import SyncPreferencesPage from "./pages/app/settings/offices/sync";
import SyncHistoryPage from "./pages/app/settings/offices/history";
import ImportDataPage from "./pages/app/docket/ImportDataPage";
import ReviewQueuePage from "./pages/app/docket/ReviewQueuePage";
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
import WorkflowHistoryRoute from "./pages/app/workflow/[id]/history";
import WorkflowApprovalsPage from "./pages/app/workflow/approvals";
import AnalyticsPage from "./pages/app/analytics";
import AlertsPage from "./pages/app/alerts";
import AlertsSettingsPage from "./pages/app/alerts/settings";
import AnalyticsChartsPage from "./pages/app/analytics/charts";
import AdvancedAnalyticsPage from "./pages/app/analytics/dashboard";
import CollabIndexPage from "./pages/app/collab";
import CollabDetailPage from "./pages/app/collab/[id]";
import SearchPage from "./pages/app/SearchPage";

// Communications (Frontend + Backoffice)
import CommunicationsLayout from "./pages/app/communications/Layout";
import CommunicationsUnifiedPage from "./pages/app/communications";
import WhatsAppInboxPage from "./pages/app/communications/whatsapp";
import EmailInboxPage from "./pages/app/communications/email";
import CommunicationsTemplatesPage from "./pages/app/communications/templates";
import CommunicationsSettingsPage from "./pages/app/communications/settings";
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
import PlansManagementPage from "./pages/backoffice/plans";
import AdminModulesPage from "./pages/backoffice/modules";
import AdminAddonsPage from "./pages/backoffice/addons";
import IPORegistryPage from "./pages/backoffice/ipo";
import IPOOfficeDetailPage from "./pages/backoffice/ipo/[officeId]";
import NewIPOOfficePage from "./pages/backoffice/ipo/new";
import EditIPOOfficePage from "./pages/backoffice/ipo/edit";
import IPOListPage from "./pages/backoffice/ipo/lista";
import IPOMappingsPage from "./pages/backoffice/ipo/mappings";
import IPOFeesPage from "./pages/backoffice/ipo/fees";
import IPOMonitorPage from "./pages/backoffice/ipo/monitor";
import IPOLogsPage from "./pages/backoffice/ipo/logs";
import NiceClassesAdminPage from "./pages/backoffice/nice-classes";
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
import LegalDocumentsPage from "./pages/backoffice/legal/LegalDocumentsPage";
import AIBrainPage from "./pages/backoffice/ai-brain";
import KillSwitchPage from "./pages/backoffice/kill-switch";
import BackofficeCalendarPage from "./pages/backoffice/calendar";
import BackofficeProductAnalyticsPage from "./pages/backoffice/product-analytics";
import KnowledgeBasesPage from "./pages/backoffice/knowledge-bases";
import DemoDataPage from "./pages/backoffice/demo-data";
import DemoModePage from "./pages/backoffice/demo-mode";
import SystemTestsPage from "./pages/backoffice/system-tests";
import VoipManagementPage from "./pages/backoffice/voip/VoipManagementPage";
import { 
  TelephonyDashboard, 
  TelephonyProviderPage, 
  TelephonyPacksPage, 
  TelephonyConsumptionPage, 
  TelephonyAlertsPage 
} from "./pages/backoffice/telephony";
import EventLogPage from "./pages/backoffice/events/EventLogPage";
import SystemLogsPage from "./pages/backoffice/logs";
import BackofficeAlertsPage from "./pages/backoffice/alerts/BackofficeAlertsPage";
import BackofficeProductsPage from "./pages/backoffice/products";

// Stripe Backoffice
import StripeDashboard from "./pages/backoffice/stripe";
import StripeConfigPage from "./pages/backoffice/stripe/config";
import StripeProductsPage from "./pages/backoffice/stripe/products";
import StripeSubscriptionsPage from "./pages/backoffice/stripe/subscriptions";
import StripeInvoicesPage from "./pages/backoffice/stripe/invoices";
import StripeWebhooksPage from "./pages/backoffice/stripe/webhooks";

// Analytics Backoffice
import AnalyticsOverviewPage from "./pages/backoffice/analytics";
import AnalyticsRevenuePage from "./pages/backoffice/analytics/revenue";
import AnalyticsSubscriptionsPage from "./pages/backoffice/analytics/subscriptions";
import AnalyticsUsagePage from "./pages/backoffice/analytics/usage";
import AnalyticsCohortsPage from "./pages/backoffice/analytics/cohorts";
import AnalyticsTenantsPage from "./pages/backoffice/analytics/tenants";

// Landings Backoffice
import LandingsDashboard from "./pages/backoffice/landings";
import LandingPagesListPage from "./pages/backoffice/landings/pages";
import LeadsListPage from "./pages/backoffice/landings/leads";
import LeadDetailPage from "./pages/backoffice/landings/lead-detail";

// External API Connections
import ExternalApiConnectionsPage from "./pages/backoffice/external-api-connections";

// Automation Engine
import MasterAutomationTemplatesPage from "./pages/backoffice/master-automation-templates";
import AutomationTemplatesPage from "./pages/backoffice/automations";
import AutomationExecutionsPage from "./pages/backoffice/automations/executions";
import AutomationVariablesPage from "./pages/backoffice/automations/variables";

// KYC Pages
import MarketKycPage from "./pages/app/market/kyc";
import KycVerificationPage from "./pages/app/market/kyc/[type]";

// Portal Pages (Client Portal)
import PortalIndex from "./pages/portal/PortalIndex";
import PortalLogin from "./pages/portal/PortalLogin";
import PortalResetPassword from "./pages/portal/PortalResetPassword";
import PortalUpdatePassword from "./pages/portal/PortalUpdatePassword";
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
        <ModulesProvider>
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
                {/* Legacy Docket redirects to Expedientes V2 */}
                <Route path="docket" element={<Navigate to="/app/expedientes" replace />} />
                <Route path="docket/deadlines" element={<DeadlinesPage />} />
                <Route path="docket/new" element={<Navigate to="/app/expedientes/nuevo" replace />} />
                <Route path="docket/:id" element={<Navigate to="/app/expedientes" replace />} />
                <Route path="docket/:id/edit" element={<Navigate to="/app/expedientes" replace />} />
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
                  <Route index element={<CRMDashboardNew />} />
                  <Route path="kanban" element={<CRMPipelinePage />} />
                  <Route path="pipeline" element={<Navigate to="/app/crm/kanban" replace />} />
                  <Route path="leads" element={<Navigate to="/app/crm/kanban?view=leads" replace />} />
                  <Route path="leads/:id" element={<CRMLeadDetailPage />} />
                  <Route path="deals" element={<Navigate to="/app/crm/kanban?view=deals" replace />} />
                  <Route path="negocios" element={<Navigate to="/app/crm/kanban?view=deals" replace />} />
                  <Route path="deals/:id" element={<CRMDealDetailPage />} />
                  <Route path="settings" element={<CRMPipelinesPage />} />
                  <Route path="pipelines" element={<CRMPipelinesPage />} />
                  <Route path="clients" element={<CRMV2AccountsList />} />
                  <Route path="accounts" element={<Navigate to="/app/crm/clients" replace />} />
                  <Route path="accounts/:id" element={<CRMV2AccountDetail />} />
                  <Route path="clients/:id" element={<CRMV2AccountDetail />} />
                  <Route path="contacts" element={<CRMV2ContactsList />} />
                  <Route path="activities" element={<CRMV2InteractionsList />} />
                  <Route path="interactions" element={<Navigate to="/app/crm/activities" replace />} />
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
                {/* Expedientes V2 */}
                <Route path="expedientes" element={<ExpedientesPage />} />
                <Route path="expedientes/nuevo" element={<NewMatterPage />} />
                <Route path="expedientes/:id" element={<MatterDetailPageV2 />} />
                <Route path="expedientes/:id/editar" element={<EditMatterPage />} />
                {/* Calendario Unificado */}
                <Route path="calendario" element={<CalendarioPage />} />
                {/* Tareas Unificadas */}
                <Route path="tareas" element={<TareasPage />} />
                <Route path="market" element={<MarketLayout />}>
                  <Route index element={<MarketDashboard />} />
                  <Route path="listings" element={<MarketListings />} />
                  <Route path="listings/new" element={<CreateListingPage />} />
                  <Route path="listings/:id" element={<ListingDetailPage />} />
                  <Route path="assets" element={<MarketAssets />} />
                  <Route path="assets/:id" element={<MarketAssetDetailPage />} />
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
                  <Route path="templates/new" element={<TemplateEditorPage />} />
                  <Route path="templates/edit/:id" element={<TemplateEditorPage />} />
                  <Route path="templates/generate/:id" element={<GenerateDocumentPage />} />
                  <Route path="templates/view/:documentId" element={<DocumentViewPage />} />
                </Route>
                {/* Document Generator */}
                <Route path="documents/new" element={<DocumentGeneratorPage />} />
                <Route path="documents/generator" element={<DocumentGeneratorPage />} />
                <Route path="finance" element={<FinanceLayout />}>
                  <Route index element={<FinanceDashboard />} />
                  <Route path="costs" element={<CostsPage />} />
                  <Route path="quotes" element={<QuotesPage />} />
                  <Route path="invoices" element={<InvoiceListPage />} />
                  <Route path="invoices/new" element={<InvoiceEditorPage />} />
                  <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                  <Route path="invoices/:id/edit" element={<InvoiceEditorPage />} />
                  <Route path="expenses" element={<ExpensesPage />} />
                  <Route path="provisions" element={<ProvisionsPage />} />
                  <Route path="provisions/:id" element={<ProvisionDetailPage />} />
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
                {/* Reportes V2 (L94) */}
                <Route path="reportes" element={<ReportesPage />} />
                <Route path="reportes/expedientes" element={<ReporteExpedientesPage />} />
                <Route path="reportes/plazos" element={<ReportePlazosPage />} />
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
                <Route path="settings/servicios" element={<ServicesPage />} />
                
                <Route path="settings/deadlines" element={<DeadlineConfigPage />} />
                <Route path="settings/internal-reference" element={<InternalReferenceConfigPage />} />
                {/* Automations */}
                <Route path="settings/automations" element={<AutomationsPage />} />
                <Route path="settings/automations/rules" element={<AutomationRulesPage />} />
                <Route path="settings/automations/legal-deadlines" element={<LegalDeadlinesPage />} />
                <Route path="settings/automations/history" element={<ExecutionHistoryPage />} />
                <Route path="settings/offices" element={<MyOfficesPage />} />
                <Route path="settings/offices/sync" element={<SyncPreferencesPage />} />
                <Route path="settings/offices/history" element={<SyncHistoryPage />} />
                <Route path="settings/subscription" element={<SubscriptionPage />} />
                <Route path="settings/subscription/invoices" element={<SubscriptionInvoicesPage />} />
                <Route path="settings/subscription/plans" element={<SubscriptionPlansPage />} />
                <Route path="settings/modules" element={<ModulesManagementPage />} />
                {/* Telephony Settings */}
                <Route path="settings/telephony" element={<TenantTelephonySettingsPage />} />
                <Route path="settings/telephony/packs" element={<TenantTelephonyPacksPage />} />
                <Route path="settings/telephony/historial" element={<TenantTelephonyHistoryPage />} />
                {/* Document Templates */}
                <Route path="settings/templates" element={<DocumentTemplatesDashboard />} />
                <Route path="settings/templates/branding" element={<DocumentTemplateBrandingPage />} />
                <Route path="settings/templates/:type" element={<DocumentTemplateListPage />} />
                <Route path="settings/templates/:id/edit" element={<DocumentTemplateEditPage />} />
                <Route path="settings/signatures" element={<SignaturesPage />} />
                <Route path="expedientes/importar" element={<ImportDataPage />} />
                <Route path="expedientes/revision" element={<ReviewQueuePage />} />
                <Route path="ip-chain" element={<IPChainPage />} />
                <Route path="tools" element={<ToolsPage />} />
                <Route path="tools/ocr" element={<Navigate to="/app/tools" replace />} />
                <Route path="tools/comparador" element={<Navigate to="/app/tools" replace />} />
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
                <Route path="workflow/approvals" element={<WorkflowApprovalsPage />} />
                <Route path="workflow/:id" element={<WorkflowDetailPage />} />
                <Route path="workflow/:id/edit" element={<EditWorkflowPage />} />
                <Route path="workflow/:id/history" element={<WorkflowHistoryRoute />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="analytics/charts" element={<AnalyticsChartsPage />} />
                <Route path="analytics/dashboard" element={<AdvancedAnalyticsPage />} />
                <Route path="collab" element={<CollabIndexPage />} />
                <Route path="collab/:id" element={<CollabDetailPage />} />
                <Route path="search" element={<SearchPage />} />
                {/* Communications con Layout */}
                <Route path="communications" element={<CommunicationsLayout />}>
                  <Route index element={<CommunicationsUnifiedPage />} />
                  <Route path=":id" element={<CommunicationDetailPage />} />
                  <Route path="whatsapp" element={<WhatsAppInboxPage />} />
                  <Route path="whatsapp/:id" element={<CommunicationDetailPage />} />
                  <Route path="email" element={<EmailInboxPage />} />
                  <Route path="email/:id" element={<CommunicationDetailPage />} />
                  <Route path="templates" element={<CommunicationsTemplatesPage />} />
                  <Route path="settings" element={<CommunicationsSettingsPage />} />
                </Route>
                <Route path="onboarding" element={<Onboarding />} />
                {/* Legal Ops */}
                <Route path="legal-ops" element={<Navigate to="/app/legal-ops/assistant" replace />} />
                <Route path="legal-ops/assistant" element={<LegalOpsAssistantPage />} />
                <Route path="legal-ops/client-360/:clientId" element={<LegalOpsClient360Page />} />
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
                <Route path="plans" element={<PlansManagementPage />} />
                <Route path="modules" element={<AdminModulesPage />} />
                <Route path="addons" element={<AdminAddonsPage />} />
                {/* Communications */}
                <Route path="communications/whatsapp" element={<BackofficeWhatsAppCommunicationsPage />} />
                <Route path="communications/email" element={<BackofficeEmailCommunicationsPage />} />
                {/* IPO Registry */}
                <Route path="ipo" element={<IPORegistryPage />} />
                <Route path="ipo/lista" element={<IPOListPage />} />
                <Route path="ipo/new" element={<NewIPOOfficePage />} />
                <Route path="ipo/:officeId" element={<IPOOfficeDetailPage />} />
                <Route path="ipo/:officeId/edit" element={<EditIPOOfficePage />} />
                <Route path="ipo/mappings" element={<IPOMappingsPage />} />
                <Route path="ipo/fees" element={<IPOFeesPage />} />
                <Route path="ipo/monitor" element={<IPOMonitorPage />} />
                <Route path="ipo/logs" element={<IPOLogsPage />} />
                {/* Nice Classes Admin */}
                <Route path="nice-classes" element={<NiceClassesAdminPage />} />
                {/* AI Brain */}
                <Route path="ai" element={<AIBrainPage />} />
                {/* Automations */}
                <Route path="automations" element={<AutomationTemplatesPage />} />
                <Route path="automations/executions" element={<AutomationExecutionsPage />} />
                <Route path="automations/variables" element={<AutomationVariablesPage />} />
                {/* Tools */}
                <Route path="feature-flags" element={<FeatureFlagsPage />} />
                <Route path="integrations" element={<BackofficeIntegrationsPage />} />
                <Route path="api-connections" element={<ExternalApiConnectionsPage />} />
                <Route path="api-keys" element={<BackofficeApiKeysPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                {/* Compliance */}
                <Route path="kyc-review" element={<KycReviewPage />} />
                <Route path="moderation" element={<ModerationPage />} />
                <Route path="compliance" element={<ComplianceDashboardPage />} />
                <Route path="legal-documents" element={<LegalDocumentsPage />} />
                {/* System */}
                <Route path="audit" element={<BackofficeAuditPage />} />
                <Route path="feedback" element={<BackofficeFeedbackPage />} />
                <Route path="settings" element={<BackofficeSettingsPage />} />
                <Route path="calendar" element={<BackofficeCalendarPage />} />
                <Route path="product-analytics" element={<BackofficeProductAnalyticsPage />} />
                <Route path="knowledge-bases" element={<KnowledgeBasesPage />} />
                <Route path="demo-data" element={<DemoDataPage />} />
                <Route path="demo-mode" element={<DemoModePage />} />
                <Route path="system-tests" element={<SystemTestsPage />} />
                <Route path="voip" element={<VoipManagementPage />} />
                <Route path="telephony" element={<TelephonyDashboard />} />
                <Route path="telephony/provider" element={<TelephonyProviderPage />} />
                <Route path="telephony/packs" element={<TelephonyPacksPage />} />
                <Route path="telephony/consumption" element={<TelephonyConsumptionPage />} />
                <Route path="telephony/alerts" element={<TelephonyAlertsPage />} />
                <Route path="events" element={<EventLogPage />} />
                <Route path="logs" element={<SystemLogsPage />} />
                <Route path="alerts" element={<BackofficeAlertsPage />} />
                <Route path="products" element={<BackofficeProductsPage />} />
                <Route path="kill-switch" element={<KillSwitchPage />} />
                {/* Stripe */}
                <Route path="stripe" element={<StripeDashboard />} />
                <Route path="stripe/config" element={<StripeConfigPage />} />
                <Route path="stripe/products" element={<StripeProductsPage />} />
                <Route path="stripe/subscriptions" element={<StripeSubscriptionsPage />} />
                <Route path="stripe/invoices" element={<StripeInvoicesPage />} />
                <Route path="stripe/webhooks" element={<StripeWebhooksPage />} />
                {/* Analytics */}
                <Route path="analytics" element={<AnalyticsOverviewPage />} />
                <Route path="analytics/revenue" element={<AnalyticsRevenuePage />} />
                <Route path="analytics/subscriptions" element={<AnalyticsSubscriptionsPage />} />
                <Route path="analytics/usage" element={<AnalyticsUsagePage />} />
                <Route path="analytics/cohorts" element={<AnalyticsCohortsPage />} />
                <Route path="analytics/tenants" element={<AnalyticsTenantsPage />} />
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
              <Route path="/portal/:slug/reset-password" element={<PortalResetPassword />} />
              <Route path="/portal/:slug/update-password" element={<PortalUpdatePassword />} />
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
      </ModulesProvider>
      </OrganizationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
