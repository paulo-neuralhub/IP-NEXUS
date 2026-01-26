/**
 * Hook para obtener el menú del sidebar dinámicamente desde la BD
 * Agrupa módulos por secciones y respeta licencias
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";

// Datos estáticos de fallback mientras se arregla la BD
const STATIC_SIDEBAR_DATA: SidebarSection[] = [
  {
    sectionCode: "gestion",
    sectionName: "Gestión",
    sectionLabel: "Gestión Principal",
    sectionIcon: "LayoutGrid",
    sectionOrder: 10,
    sectionAlwaysVisible: true,
    modules: [
      {
        moduleCode: "dashboard",
        moduleName: "Dashboard",
        moduleShortName: "Panel",
        moduleIcon: "LayoutDashboard",
        moduleIconLucide: "LayoutDashboard",
        moduleColor: "#3B82F6",
        moduleOrder: 1,
        moduleCategory: "core",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "docket",
        moduleName: "Docket",
        moduleShortName: "Expedientes",
        moduleIcon: "FileText",
        moduleIconLucide: "FileText",
        moduleColor: "#0EA5E9",
        moduleOrder: 2,
        moduleCategory: "core",
        moduleExpanded: false,
        moduleMenuItems: [
          { label: "Todos", path: "/app/docket", icon: "List" },
          { label: "Crear nuevo", path: "/app/docket/new", icon: "Plus" },
        ],
        moduleRequires: [],
        modulePopular: true,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "datahub",
        moduleName: "Data Hub",
        moduleShortName: "Conectores",
        moduleIcon: "Database",
        moduleIconLucide: "Database",
        moduleColor: "#1E293B",
        moduleOrder: 3,
        moduleCategory: "core",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
    ],
  },
  {
    sectionCode: "operaciones",
    sectionName: "Operaciones",
    sectionLabel: "Operaciones Diarias",
    sectionIcon: "Briefcase",
    sectionOrder: 20,
    sectionAlwaysVisible: false,
    modules: [
      {
        moduleCode: "spider",
        moduleName: "Spider",
        moduleShortName: "Vigilancia",
        moduleIcon: "Radar",
        moduleIconLucide: "Radar",
        moduleColor: "#8B5CF6",
        moduleOrder: 10,
        moduleCategory: "core",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "finance",
        moduleName: "Finance",
        moduleShortName: "Finanzas",
        moduleIcon: "DollarSign",
        moduleIconLucide: "DollarSign",
        moduleColor: "#14B8A6",
        moduleOrder: 11,
        moduleCategory: "core",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "collab",
        moduleName: "Colaboración",
        moduleShortName: "Equipos",
        moduleIcon: "Users2",
        moduleIconLucide: "Users2",
        moduleColor: "#EC4899",
        moduleOrder: 12,
        moduleCategory: "addon",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "communications",
        moduleName: "Comunicaciones",
        moduleShortName: "Comms",
        moduleIcon: "MessageSquare",
        moduleIconLucide: "MessageSquare",
        moduleColor: "#F97316",
        moduleOrder: 13,
        moduleCategory: "addon",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
    ],
  },
  {
    sectionCode: "inteligencia",
    sectionName: "Inteligencia",
    sectionLabel: "IA y Análisis",
    sectionIcon: "Brain",
    sectionOrder: 30,
    sectionAlwaysVisible: false,
    modules: [
      {
        moduleCode: "genius",
        moduleName: "Genius",
        moduleShortName: "IA Legal",
        moduleIcon: "Brain",
        moduleIconLucide: "Brain",
        moduleColor: "#F59E0B",
        moduleOrder: 20,
        moduleCategory: "addon",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: true,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "alerts",
        moduleName: "Alertas IA",
        moduleShortName: "Predicción",
        moduleIcon: "Bell",
        moduleIconLucide: "Bell",
        moduleColor: "#EF4444",
        moduleOrder: 21,
        moduleCategory: "core",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
    ],
  },
  {
    sectionCode: "extensiones",
    sectionName: "Extensiones",
    sectionLabel: "Módulos Avanzados",
    sectionIcon: "Puzzle",
    sectionOrder: 40,
    sectionAlwaysVisible: false,
    modules: [
      {
        moduleCode: "crm",
        moduleName: "CRM",
        moduleShortName: "Clientes",
        moduleIcon: "Users",
        moduleIconLucide: "Users",
        moduleColor: "#EC4899",
        moduleOrder: 30,
        moduleCategory: "addon",
        moduleExpanded: false,
        moduleMenuItems: [
          { label: "Contactos", path: "/app/crm/contacts", icon: "Users" },
          { label: "Deals", path: "/app/crm/deals", icon: "TrendingUp" },
        ],
        moduleRequires: [],
        modulePopular: true,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "marketing",
        moduleName: "Marketing",
        moduleShortName: "Marketing",
        moduleIcon: "Megaphone",
        moduleIconLucide: "Megaphone",
        moduleColor: "#F97316",
        moduleOrder: 31,
        moduleCategory: "addon",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
      {
        moduleCode: "market",
        moduleName: "Market",
        moduleShortName: "Mercado",
        moduleIcon: "Globe",
        moduleIconLucide: "Globe",
        moduleColor: "#10B981",
        moduleOrder: 32,
        moduleCategory: "addon",
        moduleExpanded: false,
        moduleMenuItems: [],
        moduleRequires: [],
        modulePopular: false,
        moduleComingSoon: false,
        isLicensed: true,
        isTrial: false,
        trialEndsAt: null,
      },
    ],
  },
];

export interface SidebarMenuItem {
  label: string;
  path: string;
  icon: string;
  badge?: string;
}

export interface SidebarModule {
  moduleCode: string;
  moduleName: string;
  moduleShortName: string | null;
  moduleIcon: string;
  moduleIconLucide: string;
  moduleColor: string;
  moduleOrder: number;
  moduleCategory: string;
  moduleExpanded: boolean;
  moduleMenuItems: SidebarMenuItem[];
  moduleRequires: string[];
  modulePopular: boolean;
  moduleComingSoon: boolean;
  isLicensed: boolean;
  isTrial: boolean;
  trialEndsAt: string | null;
}

export interface SidebarSection {
  sectionCode: string;
  sectionName: string;
  sectionLabel: string;
  sectionIcon: string;
  sectionOrder: number;
  sectionAlwaysVisible: boolean;
  modules: SidebarModule[];
}

export function useSidebarMenu() {
  const { currentOrganization } = useOrganization();
  const orgId = currentOrganization?.id;

  return useQuery({
    queryKey: ["sidebar-menu", orgId],
    queryFn: async (): Promise<SidebarSection[]> => {
      if (!orgId) return [];

      // Temporalmente retornamos datos estáticos mientras se arregla la BD
      // TODO: Implementar llamada RPC cuando la estructura de BD esté lista
      return STATIC_SIDEBAR_DATA;
    },
    enabled: !!orgId,
    staleTime: Infinity, // Cache infinito para datos estáticos
  });
}

