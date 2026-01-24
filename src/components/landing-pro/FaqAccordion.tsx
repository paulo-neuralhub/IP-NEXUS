import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

interface Faq {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  moduleCode: 'spider' | 'market' | 'docket' | 'nexus';
  sectionTitle?: string;
  sectionSubtitle?: string;
  faqs: Faq[];
}

export function FaqAccordion({
  moduleCode,
  sectionTitle = 'Preguntas frecuentes',
  sectionSubtitle,
  faqs,
}: FaqAccordionProps) {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="mt-4 text-lg text-slate-600">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-slate-200 last:border-0"
            >
              <AccordionTrigger className="text-left text-lg font-medium text-slate-900 hover:text-slate-700 py-5 hover:no-underline [&[data-state=open]>svg]:rotate-180">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Additional Help */}
        <div className="mt-12 text-center p-6 bg-slate-50 rounded-2xl">
          <p className="text-slate-600">
            ¿No encuentras lo que buscas?{' '}
            <a href="/contact" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
              Contacta con nosotros
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
