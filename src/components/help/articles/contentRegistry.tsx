import type { ComponentType } from 'react';
import { GS001Content } from './GS001_ConfigurarOrganizacion';
import { GS002Content } from './GS002_InvitarEquipo';
import { GS003Content } from './GS003_PrimerExpediente';
import { GS004Content } from './GS004_ImportarExpedientes';
import { GS005Content } from './GS005_ConfigurarAlertas';
import { GS006Content } from './GS006_Navegacion';
import { GS007Content } from './GS007_AtajosTeclado';
import { GS008Content } from './GS008_PlanesSuscripcion';
import { Docket001Content } from './Docket001_CrearExpediente';
import { Docket002Content } from './Docket002_TiposExpediente';
import { Docket003Content } from './Docket003_EstructuraExpediente';
import { Docket004Content } from './Docket004_Documentos';
import { Docket005Content } from './Docket005_AsignarExpediente';
import { Docket006Content } from './Docket006_EstadosFlujo';
import { Docket007Content } from './Docket007_PlazosVencimientos';
import { Docket008Content } from './Docket008_AlertasVencimiento';
import { Docket009Content } from './Docket009_BuscarFiltrar';
import { Docket010Content } from './Docket010_Vistas';
import { Docket011Content } from './Docket011_VincularContactos';
import { Docket012Content } from './Docket012_ExportarInformes';
import { Filing001Content } from './Filing001_ProcesoRegistro';
import { Filing002Content } from './Filing002_PrepararSolicitud';
import { Filing003Content } from './Filing003_ClasesNiza';
import { Filing004Content } from './Filing004_Jurisdicciones';
import { Filing005Content } from './Filing005_SeguimientoSolicitud';
import { Filing006Content } from './Filing006_PlantillasSolicitud';
import { Genius001Content } from './Genius001_QueEsGenius';
import { CRM001Content } from './CRM001_IntroduccionCRM';
import { Fix001Content } from './Fix001_NoAcceso';

export const contentRegistry: Record<string, ComponentType> = {
  GS001Content,
  GS002Content,
  GS003Content,
  GS004Content,
  GS005Content,
  GS006Content,
  GS007Content,
  GS008Content,
  Docket001Content,
  Docket002Content,
  Docket003Content,
  Docket004Content,
  Docket005Content,
  Docket006Content,
  Docket007Content,
  Docket008Content,
  Docket009Content,
  Docket010Content,
  Docket011Content,
  Docket012Content,
  Filing001Content,
  Filing002Content,
  Filing003Content,
  Filing004Content,
  Filing005Content,
  Filing006Content,
  Genius001Content,
  CRM001Content,
  Fix001Content,
};
