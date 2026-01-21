# Troubleshooting: React Hooks Dispatcher Null

> **Documento de referencia** para resolver el error "Cannot read properties of null (reading 'useRef'/'useState'/'useEffect')" en IP-NEXUS.

---

## 🚨 Síntomas

```
TypeError: Cannot read properties of null (reading 'useRef')
TypeError: Cannot read properties of null (reading 'useState')
TypeError: Cannot read properties of null (reading 'useEffect')

Warning: Invalid hook call. Hooks can only be called inside of the body of a function component.
```

- Pantalla **blanca** (blank screen)
- Error aparece en `TooltipProvider`, `QueryClientProvider`, `AuthProvider` u otro provider
- **Intermitente**: a veces funciona, a veces no

---

## 🔍 Causa Root

### Factor A: Vite Chunks Duplicados
Vite crea chunks separados para React y para librerías como `@radix-ui/react-tooltip`. Cuando Radix importa React, puede obtener una **copia diferente** con el dispatcher **no inicializado** (null).

### Factor B: Service Worker Cache
El Service Worker (`/sw.js`) cachea chunks entre builds. Incluso después de arreglar Vite, el caché sirve versiones viejas con React duplicado.

---

## ✅ Solución Completa (4 pasos)

### Paso 1: vite.config.ts
```typescript
export default defineConfig(({ mode }) => ({
  // ...
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Prevenir instancias duplicadas de React
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@tanstack/react-query",
      "@radix-ui/react-tooltip",  // <-- IMPORTANTE
      "@dnd-kit/core",
      "@dnd-kit/sortable",
    ],
  },
}));
```

### Paso 2: src/components/ui/tooltip.tsx
Convertir `TooltipProvider` en un **no-op wrapper**:
```typescript
type TooltipProviderProps = {
  children: React.ReactNode;
  [key: string]: unknown;
};

// No-op wrapper para evitar crash con React dispatcher null
const TooltipProvider = ({ children }: TooltipProviderProps) => <>{children}</>;
```

### Paso 3: src/App.tsx
**NO incluir** `<TooltipProvider>` en el árbol root. Los componentes individuales pueden usarlo sin problemas porque es un no-op.

### Paso 4: Deshabilitar Service Worker en DEV

**src/lib/pwa/register-sw.ts:**
```typescript
export async function registerServiceWorker() {
  // En DEV/preview, deshabilitar SW para evitar caché de chunks mezclados
  if (import.meta.env.DEV) {
    try {
      await unregisterServiceWorker();
    } catch {
      // ignore
    }
    return null;
  }
  // ... resto del código para producción
}
```

**src/main.tsx:**
```typescript
import { unregisterServiceWorker } from "@/lib/pwa/register-sw";

// Limpiar SW al iniciar en DEV
if (import.meta.env.DEV) {
  unregisterServiceWorker().catch(() => {});
}

createRoot(document.getElementById("root")!).render(<App />);
```

---

## 🧹 Si el error persiste

1. **Hard Refresh**: `Ctrl/Cmd + Shift + R`
2. **Limpiar Service Worker**: DevTools → Application → Service Workers → Unregister
3. **Clear Site Data**: DevTools → Application → Storage → Clear site data
4. **Ventana Incógnito**: Probar sin caché

---

## 📋 Checklist de Prevención

- [ ] `vite.config.ts` tiene `dedupe` y `optimizeDeps.include` correctos
- [ ] `TooltipProvider` es un no-op wrapper
- [ ] No hay `<TooltipProvider>` en App.tsx root
- [ ] Service Worker deshabilitado en DEV
- [ ] Todas las librerías con hooks están en `optimizeDeps.include`

---

## 🔗 Referencias

- [React Invalid Hook Call](https://reactjs.org/link/invalid-hook-call)
- [Vite Dep Optimization](https://vitejs.dev/guide/dep-pre-bundling.html)
- [Lovable Troubleshooting](https://docs.lovable.dev/tips-tricks/troubleshooting)

---

**Última actualización**: 2026-01-21
**Autor**: Análisis post-mortem Prompt 72
