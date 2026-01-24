/**
 * IP-MARKET Terminal Dashboard
 * Financial terminal style marketplace for IP agents
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Bell, 
  User, 
  Plus, 
  Filter,
  RefreshCw,
  Settings,
  TrendingUp
} from 'lucide-react';
import { 
  MarketTicker, 
  TopAgents, 
  RecentRequests, 
  MarketStats, 
  JurisdictionGrid 
} from '@/components/market/terminal';
import { cn } from '@/lib/utils';

export default function MarketTerminalDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white -m-6 -mt-4">
      {/* Terminal Header */}
      <header className="border-b border-white/10 bg-[#0d0d12]">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="font-bold text-lg font-mono tracking-tight">IP-MARKET</h1>
              <p className="text-[10px] text-white/40 font-mono">REAL-TIME MARKETPLACE</p>
            </div>
            <div className="ml-4 flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              LIVE
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <Input
                placeholder="Buscar agentes, solicitudes, jurisdicciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10 relative"
              asChild
            >
              <Link to="/app/market/alerts">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] rounded-full flex items-center justify-center">
                  3
                </span>
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/60 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link to="/app/market/profile">
                <User className="h-4 w-4" />
              </Link>
            </Button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              asChild
            >
              <Link to="/app/market/rfq/new">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Solicitud
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Ticker */}
      <MarketTicker />

      {/* Stats Bar */}
      <div className="p-4 border-b border-white/10">
        <MarketStats />
      </div>

      {/* Main Content Grid */}
      <div className="p-4 grid grid-cols-12 gap-4">
        {/* Left Column - Top Agents */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <TopAgents />
          <JurisdictionGrid />
        </div>

        {/* Right Column - Recent Requests */}
        <div className="col-span-12 lg:col-span-8">
          <RecentRequests showBidButton />
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="fixed bottom-0 left-64 right-0 border-t border-white/10 bg-[#0d0d12]/95 backdrop-blur px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-6 text-white/50 font-mono">
            <span>Última actualización: hace 2 min</span>
            <span>•</span>
            <span>Mercado: <span className="text-emerald-400">Activo</span></span>
            <span>•</span>
            <span>Latencia: <span className="text-emerald-400">24ms</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/50 hover:text-white text-xs h-7"
              asChild
            >
              <Link to="/app/market/rankings">
                🏆 Rankings
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/50 hover:text-white text-xs h-7"
              asChild
            >
              <Link to="/app/market/transactions">
                📊 Transacciones
              </Link>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white/50 hover:text-white text-xs h-7"
              asChild
            >
              <Link to="/app/market/listings">
                📦 Listings
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
