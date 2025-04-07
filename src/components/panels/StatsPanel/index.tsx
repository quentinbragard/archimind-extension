// src/components/panels/StatsPanel/index.tsx
import React, { useState, useEffect } from 'react';
import { BarChart2, Zap, MessageCircle, Award, Activity, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useService } from '@/core/hooks/useService';
import { Stats, StatsService } from '@/services/analytics/StatsService';
import StatsCard from './StatsCard';
import StatsDetailRow from './StatsDetailRow';
import BasePanel from '../BasePanel';
import ErrorBoundary from '../../common/ErrorBoundary';
import { getMessage } from '@/core/utils/i18n';
import { DIALOG_TYPES } from '@/core/dialogs/registry';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface StatsPanelProps {
  showBackButton?: boolean;
  onBack?: () => void;
  onClose?: () => void;
  className?: string;
  maxHeight?: string;
}

/**
 * Panel that displays AI usage statistics with visualizations
 */
const StatsPanel: React.FC<StatsPanelProps> = ({ 
  showBackButton,
  onBack,
  onClose, 
  className, 
  maxHeight = '75vh'
}) => {
  // Get stats service
  const statsService = useService<StatsService>('stats');
  
  // Initialize stats state with defaults
  const [stats, setStats] = useState<Stats>({
    totalChats: 0,
    recentChats: 0,
    totalMessages: 0,
    avgMessagesPerChat: 0,
    messagesPerDay: {},
    tokenUsage: {
      recent: 0,
      recentInput: 0,
      recentOutput: 0,
      total: 0,
      totalInput: 0,
      totalOutput: 0
    },
    energyUsage: {
      recentWh: 0,
      totalWh: 0,
      perMessageWh: 0,
      equivalent: ""
    },
    thinkingTime: {
      total: 0,
      average: 0
    },
    efficiency: 0
  });

  // Get stats on mount and subscribe to updates
  useEffect(() => {
    if (statsService) {
      // Initial stats
      const initialStats = statsService.getStats();
      setStats(initialStats);
      
      // Subscribe to updates
      const unsubscribe = statsService.onUpdate((newStats) => {
        console.log('Stats updated:', newStats);
        setStats(newStats);
      });
      
      // Manually trigger a refresh
      statsService.refreshStats();
      
      // Cleanup subscription on unmount
      return unsubscribe;
    }
  }, [statsService]);

  // Format helpers
  const formatEnergy = (value: number) => value.toFixed(3);
  const formatEfficiency = (value: number) => Math.round(value);

  // Get color based on efficiency score
  const getEfficiencyColor = (value: number) => {
    // Ensure value is between 0-100
    const validValue = Math.min(100, Math.max(0, value));
    
    if (validValue >= 80) return "text-green-500";
    if (validValue >= 60) return "text-amber-500";
    return "text-red-500";
  };
  
  const efficiencyValue = Math.min(100, Math.max(0, stats.efficiency || 0));
  const efficiencyColor = getEfficiencyColor(efficiencyValue);

  // Handle opening enhanced stats dialog
  const handleOpenEnhancedStats = () => {
    if (window.dialogManager) {
      window.dialogManager.openDialog(DIALOG_TYPES.ENHANCED_STATS);
    }
  };

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <BasePanel
          title={getMessage('aiStats', undefined, "AI Stats")}
          icon={BarChart2}
          showBackButton={showBackButton}
          onBack={onBack}
          onClose={onClose}
          className={`stats-panel w-80 ${className || ''}`}
          maxHeight={maxHeight}
        >
          {stats.totalChats === 0 && stats.totalMessages === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <BarChart2 className="h-10 w-10 text-muted-foreground mb-3 opacity-30" />
              <p className="text-muted-foreground font-medium">No stats available yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                {getMessage('noStatsAvailable', undefined, 'Start a conversation to see your usage analytics')}
              </p>
            </div>
          ) : (
            <>
              {/* Top cards */}
              <div className="flex items-center justify-between mb-4 px-8 gap-4 w-full">
              <StatsCard 
                  icon={<MessageCircle className="h-3.5 w-3.5" />} 
                  value={stats.totalChats > 20 ? "20+" : stats.totalChats} 
                  color="text-blue-500"
                  title="Conversations"
                />
                {stats.efficiency !== undefined && (
                  <StatsCard 
                    icon={<Award className="h-3.5 w-3.5" />} 
                    value={formatEfficiency(efficiencyValue)} 
                    unit="%" 
                    color={efficiencyColor}
                    title="Efficiency"
                  />
                )}
                <StatsCard 
                  icon={<Zap className="h-3.5 w-3.5" />} 
                  value={formatEnergy(stats.energyUsage?.totalWh ?? 0)}
                  unit="Wh" 
                  color="text-amber-500"
                  title="Energy"
                />
              </div>

              {/* Stats detail rows */}
              <div className="px-2 py-3 border-t mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <StatsDetailRow 
                  label={getMessage('recentActivity', undefined, 'Recent Activity')}
                  value={`${stats.recentChats} chats`} 
                  icon={<Activity className="h-3.5 w-3.5" />} 
                  progress={stats.totalChats ? stats.recentChats / (stats.totalChats * 0.2) * 100 : 0}
                  progressColor="#3b82f6"
                  tooltip="Conversations in the last 7 days"
                />
                
                {/* Improved Energy Equivalent Display 
                {stats.energyUsage?.equivalent && (
                  <div className="mb-3 last:mb-1 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 rounded-md px-3 py-2.5">
                    <div className="flex items-start">
                      <Zap className="h-4 w-4 mr-2 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center">
                          <span className="text-xs font-medium text-green-800 dark:text-green-300 mr-1">
                            {getMessage('energyEquivalent', undefined, 'Energy Equivalent')}
                          </span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-green-600 dark:text-green-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs text-xs">{getMessage('energyEquivalentHelp', undefined, 'This shows what your AI energy usage is equivalent to in everyday terms')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <p className="text-sm text-green-800 dark:text-green-200 mt-1 font-medium">
                          {stats.energyUsage.equivalent}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                  */}
                
                <StatsDetailRow 
                  label={getMessage('messagingEfficiency', undefined, 'Messages Per Conversation')} 
                  value={stats.avgMessagesPerChat.toFixed(1)} 
                  icon={<MessageCircle className="h-3.5 w-3.5" />} 
                  progress={Math.min(100, stats.avgMessagesPerChat * 10)}
                  progressColor="#3b82f6"
                  tooltip="Average number of messages exchanged per conversation"
                />
                
                <StatsDetailRow 
                  label={getMessage('thinkingTime', undefined, 'Average Response Time')} 
                  value={`${stats.thinkingTime.average.toFixed(1)}s`} 
                  icon={<Award className="h-3.5 w-3.5" />} 
                  progress={Math.min(100, 100 - (stats.thinkingTime.average * 5))}
                  progressColor="#10b981"
                  tooltip="Average time it takes to get a response"
                />
                
                <StatsDetailRow 
                  label={getMessage('tokenUsage', undefined, 'Token Usage')} 
                  value={`${(stats.tokenUsage.recentInput + stats.tokenUsage.recentOutput).toLocaleString()}`} 
                  icon={<BarChart2 className="h-3.5 w-3.5" />} 
                  progress={stats.tokenUsage.total ? Math.min(100, (stats.tokenUsage.recentInput + stats.tokenUsage.recentOutput) / (stats.tokenUsage.total * 0.1) * 100) : 0}
                  progressColor="#6366f1"
                  tooltip="Tokens used in the last 7 days"
                />
                
                <div className="flex justify-between items-center mt-4 pt-1 border-t text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <span className="inline-block h-1 w-1 rounded-full bg-green-500 mr-1 animate-pulse"></span>
                    <span className="text-[10px]">
                      {getMessage('updated', undefined, 'Updated')} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </span>
                  
                  <Button 
                    className="text-[10px] text-blue-500 px-1 hover:underline p-0 h-auto bg-transparent flex items-center gap-1"
                    variant="ghost"
                    onClick={handleOpenEnhancedStats}
                  >
                    {getMessage('viewEnhancedStats', undefined, 'View Enhanced Analytics')}
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </BasePanel>
      </TooltipProvider>
    </ErrorBoundary>
  );
};

export default StatsPanel;