// ============================================================
// IP-NEXUS HELP - CONTEXTUAL HELP POPUP
// Prompt 48: Knowledge Base & Rules Engine
// ============================================================

import React, { useEffect, useState } from 'react';
import { X, HelpCircle, ExternalLink, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useContextualHelp, HelpRule } from '@/hooks/help/useHelpRules';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ContextualHelpPopupProps {
  className?: string;
}

export const ContextualHelpPopup = React.forwardRef<HTMLDivElement, ContextualHelpPopupProps>(
  function ContextualHelpPopup({ className: _className }, _ref) {
    // DESACTIVADO: Popups de ayuda contextual deshabilitados temporalmente
    return null;
  }
);

interface ContextualHelpContentProps {
  rule: HelpRule;
  onDismiss: () => void;
  onComplete: () => void;
  className?: string;
}

function ContextualHelpContent({ rule, onDismiss, onComplete, className }: ContextualHelpContentProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-dismiss after duration if set
  useEffect(() => {
    if (rule.display_duration_ms) {
      const timer = setTimeout(onDismiss, rule.display_duration_ms);
      return () => clearTimeout(timer);
    }
  }, [rule.display_duration_ms, onDismiss]);

  const handleAction = () => {
    if (rule.target_url) {
      window.open(rule.target_url, '_blank');
    }
    onComplete();
  };

  // Display type determines position and style
  const getPositionClasses = () => {
    switch (rule.display_type) {
      case 'floating':
        return 'fixed bottom-20 right-6 z-50 max-w-sm';
      case 'banner':
        return 'fixed top-16 left-0 right-0 z-50 mx-auto max-w-2xl px-4';
      case 'sidebar':
        return 'fixed top-1/4 right-4 z-50 max-w-xs';
      case 'modal':
        return 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50';
      case 'tooltip':
      default:
        return 'fixed bottom-20 right-6 z-50 max-w-sm';
    }
  };

  const getTypeStyles = () => {
    switch (rule.rule_type) {
      case 'onboarding':
        return 'border-primary bg-primary/5';
      case 'proactive':
        return 'border-amber-500 bg-amber-50 dark:bg-amber-950/20';
      case 'error':
        return 'border-destructive bg-destructive/5';
      case 'contextual':
      default:
        return 'border-border bg-card';
    }
  };

  const getIcon = () => {
    switch (rule.rule_type) {
      case 'onboarding':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'proactive':
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <HelpCircle className="h-5 w-5 text-destructive" />;
      default:
        return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="fixed bottom-20 right-6 z-50"
      >
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full shadow-lg border-primary bg-primary/10 hover:bg-primary/20"
          onClick={() => setIsMinimized(false)}
        >
          <HelpCircle className="h-6 w-6 text-primary" />
        </Button>
      </motion.div>
    );
  }

  if (rule.display_type === 'modal') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={getPositionClasses()}
        onClick={onDismiss}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <Card className={cn('w-full max-w-md shadow-xl', getTypeStyles(), className)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {getIcon()}
                  <CardTitle className="text-lg">{rule.custom_title || rule.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDismiss}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {rule.custom_content || rule.description}
              </p>
              <div className="flex gap-2">
                {rule.target_url && (
                  <Button onClick={handleAction} className="flex-1">
                    Saber más
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                )}
                <Button variant="outline" onClick={onComplete} className={rule.target_url ? '' : 'flex-1'}>
                  Entendido
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  }

  // Floating, tooltip, sidebar, banner
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 50, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(getPositionClasses(), className)}
    >
      <Card className={cn('shadow-xl', getTypeStyles())}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {getIcon()}
              <CardTitle className="text-sm font-medium">{rule.custom_title || rule.name}</CardTitle>
            </div>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6" 
                onClick={() => setIsMinimized(true)}
              >
                <span className="text-xs">−</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rule.custom_content || rule.description}
          </p>
          <div className="flex gap-2">
            {rule.target_url && (
              <Button size="sm" variant="link" className="h-auto p-0 text-xs" onClick={handleAction}>
                Saber más →
              </Button>
            )}
            <Button size="sm" variant="ghost" className="h-auto p-0 text-xs ml-auto" onClick={onComplete}>
              Entendido
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default ContextualHelpPopup;
