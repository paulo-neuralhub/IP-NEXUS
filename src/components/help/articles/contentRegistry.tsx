// ============================================================
// IP-NEXUS HELP — CONTENT REGISTRY
// Maps content keys to React components
// ============================================================

import type { ComponentType } from 'react';
import { GS001Content } from './GS001_ConfigurarOrganizacion';
import { GS002Content } from './GS002_InvitarEquipo';
import { GS003Content } from './GS003_PrimerExpediente';
import { GS004Content } from './GS004_ImportarExpedientes';
import { GS005Content } from './GS005_ConfigurarAlertas';
import { Docket001Content } from './Docket001_CrearExpediente';
import { Filing001Content } from './Filing001_ProcesoRegistro';
import { Genius001Content } from './Genius001_QueEsGenius';
import { CRM001Content } from './CRM001_IntroduccionCRM';
import { Fix001Content } from './Fix001_NoAcceso';

export const contentRegistry: Record<string, ComponentType> = {
  GS001Content,
  GS002Content,
  GS003Content,
  GS004Content,
  GS005Content,
  Docket001Content,
  Filing001Content,
  Genius001Content,
  CRM001Content,
  Fix001Content,
};
