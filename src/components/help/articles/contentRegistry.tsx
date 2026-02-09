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
import { Genius002Content } from './Genius002_PrimerChat';
import { Genius003Content } from './Genius003_Anterioridades';
import { Genius004Content } from './Genius004_InformesAutomaticos';
import { Genius005Content } from './Genius005_AnalisisDocumentos';
import { Genius006Content } from './Genius006_ConsultasLegales';
import { CRM001Content } from './CRM001_IntroduccionCRM';
import { CRM002Content } from './CRM002_GestionarContactos';
import { CRM003Content } from './CRM003_PipelineVentas';
import { CRM004Content } from './CRM004_Actividades';
import { CRM005Content } from './CRM005_PortalCliente';
import { CRM006Content } from './CRM006_FirmaDigital';
import { Fin001Content } from './Fin001_PanelFinanciero';
import { Fin002Content } from './Fin002_CrearFacturas';
import { Fin003Content } from './Fin003_Honorarios';
import { Fin004Content } from './Fin004_CobrosPendientes';
import { Fin005Content } from './Fin005_TasasOficinas';
import { Config001Content } from './Config001_AjustesOrganizacion';
import { Config002Content } from './Config002_EquipoPermisos';
import { Config003Content } from './Config003_Suscripcion';
import { Config004Content } from './Config004_Plantillas';
import { Config005Content } from './Config005_Notificaciones';
import { Config006Content } from './Config006_Seguridad';
import { Int001Content } from './Int001_IntegracionesDisponibles';
import { Int002Content } from './Int002_GoogleWorkspace';
import { Int003Content } from './Int003_ApiWebhooks';
import { Int004Content } from './Int004_AutomatizacionesN8n';
import { Bill001Content } from './Bill001_PlanesPrecios';
import { Bill002Content } from './Bill002_CambiarPlan';
import { Bill003Content } from './Bill003_MetodosPago';
import { Bill004Content } from './Bill004_FacturasRecibos';
import { Fix001Content } from './Fix001_NoAcceso';
import { Fix002Content } from './Fix002_PaginaLenta';
import { Fix003Content } from './Fix003_ErrorSubirDocumentos';
import { Fix004Content } from './Fix004_NoReciboEmails';
import { Fix005Content } from './Fix005_ProblemasPagosMarket';
import { Fix006Content } from './Fix006_ContactarSoporte';

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
  Genius002Content,
  Genius003Content,
  Genius004Content,
  Genius005Content,
  Genius006Content,
  CRM001Content,
  CRM002Content,
  CRM003Content,
  CRM004Content,
  CRM005Content,
  CRM006Content,
  Fin001Content,
  Fin002Content,
  Fin003Content,
  Fin004Content,
  Fin005Content,
  Config001Content,
  Config002Content,
  Config003Content,
  Config004Content,
  Config005Content,
  Config006Content,
  Int001Content,
  Int002Content,
  Int003Content,
  Int004Content,
  Bill001Content,
  Bill002Content,
  Bill003Content,
  Bill004Content,
  Fix001Content,
  Fix002Content,
  Fix003Content,
  Fix004Content,
  Fix005Content,
  Fix006Content,
};
