import { FileText, Headphones } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ArticlePlaceholder({ title }: { title: string }) {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
        <FileText className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">Contenido en preparación</h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Estamos preparando la guía completa de &ldquo;{title}&rdquo;.
        Mientras tanto, puedes contactar soporte si necesitas ayuda con este tema.
      </p>
      <Link
        to="/app/help/article/contactar-soporte"
        className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
      >
        <Headphones className="w-4 h-4" /> Contactar soporte
      </Link>
    </div>
  );
}
