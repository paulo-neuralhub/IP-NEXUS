import { ListOrdered, Search, HelpCircle } from 'lucide-react';
import { ArticleLayout } from '../ArticleLayout';
import { ArticleSection } from '../ArticleSection';
import { StepByStep } from '../StepByStep';
import { InfoCallout } from '../InfoCallout';
import { DataTable } from '../DataTable';
import { IllustrationSearch } from '../illustrations';
const ACCENT = '#14B8A6';
export function Filing003Content() {
  return (
    <ArticleLayout title="Elegir las clases Niza correctas" subtitle="Guía práctica para seleccionar las clases de la Clasificación de Niza." icon={ListOrdered} accentColor={ACCENT} category="Registro y Filing" categorySlug="filing" readTime="7 min" lastUpdated="Febrero 2026" tags={['clases','niza','clasificación','productos','servicios']} tocSections={[{id:'que-es',title:'¿Qué es Niza?'},{id:'comunes',title:'Clases comunes'},{id:'elegir',title:'Cómo elegir'}]} relatedArticles={[{title:'Preparar solicitud',path:'/app/help/article/preparar-solicitud',readTime:'6 min'}]}>
      <div className="flex justify-center mb-8"><IllustrationSearch size={150} /></div>
      <p className="text-[15px] text-foreground/80 leading-relaxed">La <strong>Clasificación de Niza</strong> organiza los productos y servicios en 45 clases. Elegir las correctas es fundamental para la protección de tu marca.</p>
      <ArticleSection id="que-es" title="¿Qué es la Clasificación de Niza?" icon={HelpCircle} accentColor={ACCENT}>
        <InfoCallout type="info">La Clasificación de Niza es un sistema internacional que agrupa productos (clases 1-34) y servicios (clases 35-45). Se usa en la mayoría de oficinas de PI del mundo.</InfoCallout>
      </ArticleSection>
      <ArticleSection id="comunes" title="Clases más comunes" icon={ListOrdered} accentColor={ACCENT} variant="highlighted">
        <DataTable headers={['Clase','Tipo','Descripción','Ejemplo']} rows={[['9','Producto','Tecnología, software, apps','Apps móviles'],['25','Producto','Ropa, calzado, sombrerería','Camisetas'],['35','Servicio','Publicidad, gestión empresarial','Tienda online'],['41','Servicio','Educación, entretenimiento','Cursos online'],['42','Servicio','Servicios tecnológicos','Desarrollo software'],['43','Servicio','Restauración, alojamiento','Restaurante']]} />
      </ArticleSection>
      <ArticleSection id="elegir" title="Cómo elegir las clases" icon={Search} accentColor={ACCENT}>
        <StepByStep accentColor={ACCENT} steps={[
          {title:'Lista tus productos/servicios',description:'Haz una lista completa de todo lo que ofreces o planeas ofrecer bajo esta marca.'},
          {title:'Usa el buscador de IP-NEXUS',description:'En el formulario de solicitud, escribe la descripción y el sistema sugerirá las clases.',tip:'NEXUS Genius puede analizar tu descripción y sugerir las clases más adecuadas.'},
          {title:'Revisa las headings oficiales',description:'Cada clase tiene una lista de "términos aceptados" por las oficinas. Usar estos términos acelera el proceso.'},
        ]} />
        <InfoCallout type="warning">Cada clase adicional <strong>aumenta las tasas</strong> de solicitud. Incluye solo las clases donde realmente necesitas protección.</InfoCallout>
      </ArticleSection>
    </ArticleLayout>
  );
}
