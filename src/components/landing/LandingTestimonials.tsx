// ============================================
// src/components/landing/LandingTestimonials.tsx
// ============================================

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { LandingTestimonial } from '@/hooks/useLandingPage';

interface LandingTestimonialsProps {
  testimonials: LandingTestimonial[];
}

export function LandingTestimonials({ testimonials }: LandingTestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profesionales de PI de todo el mundo confían en nosotros
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-4 right-4 text-muted-foreground/10">
                <Quote className="w-16 h-16" />
              </div>
              <CardContent className="p-6 pt-8">
                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <blockquote className="text-lg mb-6 relative z-10">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    {testimonial.avatar_url && (
                      <AvatarImage src={testimonial.avatar_url} alt={testimonial.name} />
                    )}
                    <AvatarFallback>
                      {testimonial.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
