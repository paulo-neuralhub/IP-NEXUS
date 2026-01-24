import { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatarUrl?: string;
  rating?: number;
}

interface TestimonialsCarouselProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  sectionTitle?: string;
  sectionSubtitle?: string;
  testimonials: Testimonial[];
}

export function TestimonialsCarousel({
  moduleCode,
  sectionTitle = 'Lo que dicen nuestros clientes',
  sectionSubtitle,
  testimonials,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  // Show 3 testimonials at a time on desktop
  const visibleTestimonials = [];
  for (let i = 0; i < Math.min(3, testimonials.length); i++) {
    const index = (currentIndex + i) % testimonials.length;
    visibleTestimonials.push({ ...testimonials[index], originalIndex: index });
  }

  return (
    <section className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mt-4 text-lg text-slate-600">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Testimonials */}
        <div className="relative">
          {/* Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.originalIndex}
                className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Quote Icon */}
                <Quote className="w-10 h-10 text-slate-200 mb-4" />
                
                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          'w-4 h-4',
                          i < testimonial.rating! 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-slate-200'
                        )}
                      />
                    ))}
                  </div>
                )}

                {/* Quote */}
                <p className="text-slate-700 leading-relaxed mb-6 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <Avatar className="w-12 h-12">
                    {testimonial.avatarUrl && (
                      <AvatarImage src={testimonial.avatarUrl} alt={testimonial.author} />
                    )}
                    <AvatarFallback className="bg-slate-100 text-slate-600 font-medium">
                      {testimonial.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-slate-900">{testimonial.author}</div>
                    <div className="text-sm text-slate-500">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {testimonials.length > 3 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                onClick={goToPrevious}
                className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentIndex 
                        ? 'w-6 bg-slate-900' 
                        : 'bg-slate-300 hover:bg-slate-400'
                    )}
                    aria-label={`Ir a testimonio ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNext}
                className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
