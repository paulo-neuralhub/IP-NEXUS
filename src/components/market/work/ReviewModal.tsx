// src/components/market/work/ReviewModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Star, Loader2 } from 'lucide-react';
import { useSubmitReview } from '@/hooks/market/useWorkflow';

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId: string;
  reviewedId: string;
  reviewedName: string;
}

function StarRating({
  value,
  onChange,
  size = 'md',
}: {
  value: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}) {
  const [hovered, setHovered] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="focus:outline-none"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground'
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function ReviewModal({
  open,
  onOpenChange,
  transactionId,
  reviewedId,
  reviewedName,
}: ReviewModalProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [accuracyRating, setAccuracyRating] = useState(0);
  const [review, setReview] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const submitReview = useSubmitReview();

  const handleSubmit = async () => {
    if (overallRating === 0 || review.length < 20) return;

    await submitReview.mutateAsync({
      transactionId,
      reviewedId,
      overallRating,
      communicationRating: communicationRating || overallRating,
      professionalismRating: professionalismRating || overallRating,
      accuracyRating: accuracyRating || overallRating,
      review,
      isPublic,
    });

    onOpenChange(false);
    
    // Reset form
    setOverallRating(0);
    setCommunicationRating(0);
    setProfessionalismRating(0);
    setAccuracyRating(0);
    setReview('');
    setIsPublic(true);
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const isValid = overallRating > 0 && review.length >= 20;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Calificar a {reviewedName}
          </DialogTitle>
          <DialogDescription>
            Tu opinión ayuda a otros usuarios a encontrar los mejores profesionales
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Calificación General *</Label>
            <StarRating value={overallRating} onChange={setOverallRating} size="lg" />
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-3 border-t pt-4">
            <Label className="text-sm text-muted-foreground">Calificaciones detalladas (opcional)</Label>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Comunicación</span>
              <StarRating value={communicationRating} onChange={setCommunicationRating} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Profesionalismo</span>
              <StarRating value={professionalismRating} onChange={setProfessionalismRating} size="sm" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Precisión</span>
              <StarRating value={accuracyRating} onChange={setAccuracyRating} size="sm" />
            </div>
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="review">Tu opinión *</Label>
            <Textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Describe tu experiencia trabajando con este profesional..."
              rows={4}
              className="resize-none"
            />
            <p className={cn(
              'text-xs',
              review.length < 20 ? 'text-muted-foreground' : 'text-emerald-600'
            )}>
              {review.length}/20 caracteres mínimo
            </p>
          </div>

          {/* Public Checkbox */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="public"
              checked={isPublic}
              onCheckedChange={(checked) => setIsPublic(checked === true)}
            />
            <Label htmlFor="public" className="text-sm font-normal cursor-pointer">
              Mostrar review públicamente
            </Label>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={handleSkip}>
            Omitir
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!isValid || submitReview.isPending}
          >
            {submitReview.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enviar Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
