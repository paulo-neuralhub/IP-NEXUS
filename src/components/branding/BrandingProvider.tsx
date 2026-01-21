// src/components/branding/BrandingProvider.tsx
import { useEffect } from 'react';
import { useBranding, hexToHSL } from '@/hooks/use-branding';

interface Props {
  children: React.ReactNode;
}

export function BrandingProvider({ children }: Props) {
  const { branding } = useBranding();

  useEffect(() => {
    if (!branding) return;

    const root = document.documentElement;
    
    // Aplicar colores como CSS variables (HSL format for Tailwind)
    if (branding.primary_color) {
      root.style.setProperty('--primary', hexToHSL(branding.primary_color));
    }
    
    if (branding.secondary_color) {
      root.style.setProperty('--secondary', hexToHSL(branding.secondary_color));
    }
    
    if (branding.accent_color) {
      root.style.setProperty('--accent', hexToHSL(branding.accent_color));
    }

    // Colores adicionales del JSONB
    if (branding.colors) {
      const colors = branding.colors as Record<string, string>;
      Object.entries(colors).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.startsWith('#')) {
          root.style.setProperty(`--${key.replace('_', '-')}`, hexToHSL(value));
        }
      });
    }

    // Aplicar fuente
    if (branding.font_family && branding.font_family !== 'Inter') {
      root.style.setProperty('--font-sans', branding.font_family);
      // Cargar fuente de Google Fonts si es necesario
      loadGoogleFont(branding.font_family);
    }

    // Actualizar título de la página
    if (branding.app_name) {
      const currentTitle = document.title;
      if (currentTitle.includes('IP-NEXUS')) {
        document.title = currentTitle.replace('IP-NEXUS', branding.app_name);
      }
    }

    // Actualizar favicon
    if (branding.favicon_url) {
      updateFavicon(branding.favicon_url);
    }

    // Cleanup - restaurar valores por defecto al desmontar
    return () => {
      // No limpiamos aquí para mantener branding durante la sesión
    };
  }, [branding]);

  return <>{children}</>;
}

function loadGoogleFont(fontFamily: string) {
  const existingLink = document.querySelector(`link[data-font="${fontFamily}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@400;500;600;700&display=swap`;
  link.rel = 'stylesheet';
  link.setAttribute('data-font', fontFamily);
  document.head.appendChild(link);
}

function updateFavicon(url: string) {
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}
