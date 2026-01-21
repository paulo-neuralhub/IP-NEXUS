// src/pages/app/settings/index.tsx
import { useState } from 'react';
import { 
  Building2, 
  Palette, 
  Globe, 
  Shield, 
  Link, 
  Mail, 
  CreditCard, 
  Boxes,
  User,
  Bell,
  Monitor,
  Key,
  Laptop,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RequirePermission } from '@/components/auth/RequirePermission';

// Settings Section Components
import GeneralSettings from './sections/GeneralSettings';
import BrandingSettings from './sections/BrandingSettings';
import RegionalSettings from './sections/RegionalSettings';
import SecuritySettings from './sections/SecuritySettings';
import ProfileSettings from './sections/ProfileSettings';
import DisplaySettings from './sections/DisplaySettings';
import UserSecuritySettings from './sections/UserSecuritySettings';
import SessionsSettings from './sections/SessionsSettings';
import IntegrationsSettings from './sections/IntegrationsSettings';
import BillingSettings from './sections/BillingSettings';
import TeamSettings from './sections/TeamSettings';
import NotificationsSettings from './sections/NotificationsSettings';

// Tabs for organization settings
const ORG_TABS = [
  { id: 'general', label: 'General', icon: Building2, permission: 'settings.view' },
  { id: 'branding', label: 'Marca', icon: Palette, permission: 'settings.view' },
  { id: 'regional', label: 'Regional', icon: Globe, permission: 'settings.view' },
  { id: 'security', label: 'Seguridad', icon: Shield, permission: 'settings.update' },
  { id: 'integrations', label: 'Integraciones', icon: Link, permission: 'settings.view' },
  { id: 'email', label: 'Email', icon: Mail, permission: 'settings.update' },
  { id: 'billing', label: 'Facturación', icon: CreditCard, permission: 'billing.view' },
  { id: 'modules', label: 'Módulos', icon: Boxes, permission: 'settings.update' },
  { id: 'team', label: 'Equipo', icon: Users, permission: 'team.view' },
];

// Tabs for user settings
const USER_TABS = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'display', label: 'Pantalla', icon: Monitor },
  { id: 'security', label: 'Seguridad', icon: Key },
  { id: 'sessions', label: 'Sesiones', icon: Laptop },
];

export default function SettingsPage() {
  const [settingsType, setSettingsType] = useState<'organization' | 'user'>('organization');
  const [activeTab, setActiveTab] = useState('general');

  const tabs = settingsType === 'organization' ? ORG_TABS : USER_TABS;

  const handleTypeChange = (type: 'organization' | 'user') => {
    setSettingsType(type);
    setActiveTab(type === 'organization' ? 'general' : 'profile');
  };

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">
          Gestiona la configuración de tu organización y preferencias personales
        </p>
      </div>

      {/* Toggle Org/User */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTypeChange('organization')}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            settingsType === 'organization'
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
        >
          <Building2 className="h-4 w-4" />
          Organización
        </button>
        <button
          onClick={() => handleTypeChange('user')}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            settingsType === 'user'
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-foreground"
          )}
        >
          <User className="h-4 w-4" />
          Mi Cuenta
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-3">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="col-span-9">
          {settingsType === 'organization' ? (
            <OrganizationSettingsContent activeTab={activeTab} />
          ) : (
            <UserSettingsContent activeTab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
}

// Organization Settings Content
function OrganizationSettingsContent({ activeTab }: { activeTab: string }) {
  return (
    <>
      {activeTab === 'general' && (
        <RequirePermission permission="settings.view">
          <GeneralSettings />
        </RequirePermission>
      )}
      {activeTab === 'branding' && (
        <RequirePermission permission="settings.view">
          <BrandingSettings />
        </RequirePermission>
      )}
      {activeTab === 'regional' && (
        <RequirePermission permission="settings.view">
          <RegionalSettings />
        </RequirePermission>
      )}
      {activeTab === 'security' && (
        <RequirePermission permission="settings.update">
          <SecuritySettings />
        </RequirePermission>
      )}
      {activeTab === 'integrations' && (
        <RequirePermission permission="settings.view">
          <IntegrationsSettings />
        </RequirePermission>
      )}
      {activeTab === 'email' && (
        <div className="text-muted-foreground">Configuración de Email - Próximamente</div>
      )}
      {activeTab === 'billing' && (
        <RequirePermission permission="billing.view">
          <BillingSettings />
        </RequirePermission>
      )}
      {activeTab === 'modules' && (
        <div className="text-muted-foreground">Configuración de Módulos - Próximamente</div>
      )}
      {activeTab === 'team' && (
        <RequirePermission permission="team.view">
          <TeamSettings />
        </RequirePermission>
      )}
    </>
  );
}

// User Settings Content
function UserSettingsContent({ activeTab }: { activeTab: string }) {
  return (
    <>
      {activeTab === 'profile' && <ProfileSettings />}
      {activeTab === 'notifications' && <NotificationsSettings />}
      {activeTab === 'display' && <DisplaySettings />}
      {activeTab === 'security' && <UserSecuritySettings />}
      {activeTab === 'sessions' && <SessionsSettings />}
    </>
  );
}
