// ============================================================
// IP-NEXUS - THEME TOGGLE COMPONENT
// Premium dark mode toggle with animation
// ============================================================

import { Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export function ThemeToggle({ className, variant = 'default' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variant === 'default' 
          ? "h-9 w-9 rounded-xl bg-muted/50 hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/20"
          : "h-8 w-8 rounded-lg",
        className
      )}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-4 w-4 text-yellow-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: -20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-4 w-4 text-amber-500" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
          isDark 
            ? "bg-gradient-to-br from-yellow-400/20 to-orange-400/10" 
            : "bg-gradient-to-br from-blue-400/20 to-purple-400/10",
          "group-hover:opacity-100"
        )} 
      />
    </Button>
  );
}
