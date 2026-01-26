/**
 * Hook para obtener el menú del sidebar dinámicamente desde la BD
 * Agrupa módulos por secciones y respeta licencias
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/contexts/organization-context";

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

      const { data, error } = await supabase.rpc("get_tenant_sidebar_menu", {
        p_organization_id: orgId,
      });

      if (error) {
        console.error("Error fetching sidebar menu:", error);
        throw error;
      }

      if (!data || !Array.isArray(data)) return [];

      // Agrupar por sección
      const sectionsMap = new Map<string, SidebarSection>();

      for (const row of data) {
        const sectionCode = row.section_code || "otros";
        
        if (!sectionsMap.has(sectionCode)) {
          sectionsMap.set(sectionCode, {
            sectionCode,
            sectionName: row.section_name || "Otros",
            sectionLabel: row.section_label || row.section_name || "Otros",
            sectionIcon: row.section_icon || "Folder",
            sectionOrder: row.section_order ?? 99,
            sectionAlwaysVisible: row.section_always_visible ?? false,
            modules: [],
          });
        }

        // Solo agregar módulos válidos (no null)
        if (row.module_code) {
          const menuItems = parseMenuItems(row.module_menu_items);
          
          sectionsMap.get(sectionCode)!.modules.push({
            moduleCode: row.module_code,
            moduleName: row.module_name,
            moduleShortName: row.module_short_name,
            moduleIcon: row.module_icon || row.module_icon_lucide || "Package",
            moduleIconLucide: row.module_icon_lucide || row.module_icon || "Package",
            moduleColor: row.module_color || "#6B7280",
            moduleOrder: row.module_order ?? 99,
            moduleCategory: row.module_category || "general",
            moduleExpanded: row.module_expanded ?? false,
            moduleMenuItems: menuItems,
            moduleRequires: row.module_requires || [],
            modulePopular: row.module_popular ?? false,
            moduleComingSoon: row.module_coming_soon ?? false,
            isLicensed: row.is_licensed ?? false,
            isTrial: row.is_trial ?? false,
            trialEndsAt: row.trial_ends_at,
          });
        }
      }

      // Ordenar secciones y módulos
      const sections = Array.from(sectionsMap.values())
        .sort((a, b) => a.sectionOrder - b.sectionOrder)
        .map(section => ({
          ...section,
          modules: section.modules.sort((a, b) => a.moduleOrder - b.moduleOrder),
        }));

      return sections;
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

function parseMenuItems(items: unknown): SidebarMenuItem[] {
  if (!items) return [];
  if (!Array.isArray(items)) return [];
  
  return items.map((item: Record<string, unknown>) => ({
    label: String(item.label || ""),
    path: String(item.path || ""),
    icon: String(item.icon || "Circle"),
    badge: item.badge ? String(item.badge) : undefined,
  })).filter(item => item.path);
}
