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
  DataHubPlaceholder, SpiderPlaceholder,
  MarketingPlaceholder, MarketPlaceholder,
  GeniusPlaceholder, FinancePlaceholder, HelpPlaceholder
} from "./pages/app/placeholders";
import MatterList from "./pages/app/docket";
import MatterDetail from "./pages/app/docket/MatterDetail";
import MatterForm from "./pages/app/docket/MatterForm";
import CRMLayout from "./pages/app/crm/CRMLayout";
import CRMDashboard from "./pages/app/crm/CRMDashboard";
import ContactList from "./pages/app/crm/contacts";
import ContactDetail from "./pages/app/crm/contacts/ContactDetail";
import DealList from "./pages/app/crm/deals";
import PipelineList from "./pages/app/crm/pipelines";
import BackofficePlaceholder from "./pages/backoffice/BackofficePlaceholder";
import NotFound from "./pages/NotFound";

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
                <Route path="data-hub/*" element={<DataHubPlaceholder />} />
                <Route path="spider/*" element={<SpiderPlaceholder />} />
                <Route path="crm" element={<CRMLayout />}>
                  <Route index element={<CRMDashboard />} />
                  <Route path="contacts" element={<ContactList />} />
                  <Route path="contacts/:id" element={<ContactDetail />} />
                  <Route path="deals" element={<DealList />} />
                  <Route path="pipelines" element={<PipelineList />} />
                </Route>
                <Route path="marketing/*" element={<MarketingPlaceholder />} />
                <Route path="market/*" element={<MarketPlaceholder />} />
                <Route path="genius/*" element={<GeniusPlaceholder />} />
                <Route path="finance/*" element={<FinancePlaceholder />} />
                <Route path="help/*" element={<HelpPlaceholder />} />
              </Route>
              
              {/* BACKOFFICE */}
              <Route path="/backoffice/*" element={<BackofficePlaceholder />} />
              
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
