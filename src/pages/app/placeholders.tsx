import { ModulePlaceholder } from "@/components/layout/module-placeholder";
import { FileText, Database, Radar, Users, Megaphone, Globe, Brain, DollarSign, HelpCircle } from "lucide-react";
import { MODULE_COLORS } from "@/lib/constants";

export const DocketPlaceholder = () => (
  <ModulePlaceholder
    title="Gestión de Expedientes"
    description="Gestiona todas tus marcas, patentes y diseños en un solo lugar"
    icon={FileText}
    color={MODULE_COLORS.docket}
  />
);

export const DataHubPlaceholder = () => (
  <ModulePlaceholder
    title="Centro de Datos"
    description="Conecta con oficinas de PI de todo el mundo y sincroniza información"
    icon={Database}
    color={MODULE_COLORS.datahub}
  />
);

export const SpiderPlaceholder = () => (
  <ModulePlaceholder
    title="Vigilancia Inteligente"
    description="Monitorea el mercado 24/7 para proteger tus derechos de PI"
    icon={Radar}
    color={MODULE_COLORS.spider}
  />
);

export const CRMPlaceholder = () => (
  <ModulePlaceholder
    title="CRM"
    description="Gestiona tus clientes y oportunidades comerciales"
    icon={Users}
    color={MODULE_COLORS.crm}
  />
);

export const MarketingPlaceholder = () => (
  <ModulePlaceholder
    title="Marketing"
    description="Crea campañas y comunica con tus clientes"
    icon={Megaphone}
    color={MODULE_COLORS.marketing}
  />
);

export const MarketPlaceholder = () => (
  <ModulePlaceholder
    title="Marketplace"
    description="Encuentra y contrata agentes de PI verificados"
    icon={Globe}
    color={MODULE_COLORS.market}
  />
);

export const GeniusPlaceholder = () => (
  <ModulePlaceholder
    title="NEXUS Genius"
    description="Tu asistente de IA especializado en Propiedad Intelectual"
    icon={Brain}
    color={MODULE_COLORS.genius}
  />
);

export const FinancePlaceholder = () => (
  <ModulePlaceholder
    title="Control Financiero"
    description="Controla costes y gestiona la facturación de tu cartera"
    icon={DollarSign}
    color={MODULE_COLORS.finance}
  />
);

export const HelpPlaceholder = () => (
  <ModulePlaceholder
    title="Centro de Ayuda"
    description="Encuentra respuestas y aprende a usar IP-NEXUS"
    icon={HelpCircle}
    color={MODULE_COLORS.help}
  />
);
