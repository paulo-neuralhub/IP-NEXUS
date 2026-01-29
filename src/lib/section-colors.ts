// Section color schemes for visual identification
export const sectionColors = {
  // Datos de contacto/empresa - Azul
  contact: {
    icon: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-l-4 border-l-blue-500',
  },
  // Finanzas - Verde
  financial: {
    icon: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-l-4 border-l-emerald-500',
  },
  // Comercial/Ventas - Púrpura
  commercial: {
    icon: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-l-4 border-l-purple-500',
  },
  // Notas/Comentarios - Ámbar
  notes: {
    icon: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-l-4 border-l-amber-500',
  },
  // Relaciones/Vínculos - Rosa
  relations: {
    icon: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-l-4 border-l-pink-500',
  },
  // Intereses/Tags - Cyan
  interests: {
    icon: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-l-4 border-l-cyan-500',
  },
  // Acciones/Tareas - Rojo
  actions: {
    icon: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-l-4 border-l-red-500',
  },
  // Documentos - Índigo
  documents: {
    icon: 'text-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-l-4 border-l-indigo-500',
  },
  // Timeline - Slate (neutral)
  timeline: {
    icon: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-l-4 border-l-slate-500',
  },
} as const;

export type SectionColorScheme = keyof typeof sectionColors;

// Timeline activity colors
export const timelineColors = {
  email_inbound: 'bg-blue-100 text-blue-600',
  email_outbound: 'bg-green-100 text-green-600',
  whatsapp: 'bg-emerald-100 text-emerald-600',
  call_inbound: 'bg-purple-100 text-purple-600',
  call_outbound: 'bg-amber-100 text-amber-600',
  task: 'bg-red-100 text-red-600',
  note: 'bg-gray-100 text-gray-600',
  meeting: 'bg-indigo-100 text-indigo-600',
  deadline: 'bg-rose-100 text-rose-600',
  document: 'bg-cyan-100 text-cyan-600',
} as const;
