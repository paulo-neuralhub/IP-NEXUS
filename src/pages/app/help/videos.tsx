import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Play, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Sample video tutorials
const VIDEO_TUTORIALS = [
  {
    id: "intro",
    title: "Introducción a IP-NEXUS",
    description: "Conoce la plataforma y sus principales funcionalidades",
    duration: "5:30",
    thumbnail: "/placeholder.svg",
    category: "getting-started",
    completed: true
  },
  {
    id: "first-matter",
    title: "Crear tu primer expediente",
    description: "Aprende a registrar expedientes de marcas y patentes",
    duration: "8:15",
    thumbnail: "/placeholder.svg",
    category: "docket",
    completed: true
  },
  {
    id: "deadlines",
    title: "Configurar alertas de plazos",
    description: "Configura notificaciones para no perder ningún vencimiento",
    duration: "4:45",
    thumbnail: "/placeholder.svg",
    category: "docket",
    completed: false
  },
  {
    id: "genius-search",
    title: "Búsquedas con Genius",
    description: "Usa la IA para buscar anterioridades y analizar riesgos",
    duration: "10:20",
    thumbnail: "/placeholder.svg",
    category: "genius",
    completed: false
  },
  {
    id: "crm-basics",
    title: "CRM: Gestión de clientes",
    description: "Organiza tus contactos y oportunidades de negocio",
    duration: "7:00",
    thumbnail: "/placeholder.svg",
    category: "crm",
    completed: false
  },
  {
    id: "import-data",
    title: "Importar datos existentes",
    description: "Migra tu información desde Excel u otros sistemas",
    duration: "6:30",
    thumbnail: "/placeholder.svg",
    category: "integrations",
    completed: false
  }
];

const CATEGORIES = [
  { id: "all", label: "Todos" },
  { id: "getting-started", label: "Primeros Pasos" },
  { id: "docket", label: "Docket" },
  { id: "genius", label: "Genius" },
  { id: "crm", label: "CRM" },
  { id: "integrations", label: "Integraciones" }
];

export default function VideoTutorialsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  const completedCount = VIDEO_TUTORIALS.filter(v => v.completed).length;
  const progressPercent = (completedCount / VIDEO_TUTORIALS.length) * 100;

  const filteredVideos = VIDEO_TUTORIALS.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          video.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/app/help")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Video Tutoriales</h1>
          <p className="text-muted-foreground">Aprende a usar IP-NEXUS paso a paso</p>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Tu progreso</span>
            <span className="text-sm text-muted-foreground">
              {completedCount} de {VIDEO_TUTORIALS.length} completados
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tutoriales..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card 
            key={video.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 text-primary ml-1" />
                </div>
              </div>
              {video.completed && (
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary">
                    <Check className="h-3 w-3 mr-1" />
                    Visto
                  </Badge>
                </div>
              )}
              <div className="absolute bottom-2 right-2">
                <Badge variant="secondary" className="bg-black/60 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  {video.duration}
                </Badge>
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base line-clamp-1">{video.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription className="line-clamp-2">{video.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron tutoriales</p>
        </div>
      )}
    </div>
  );
}