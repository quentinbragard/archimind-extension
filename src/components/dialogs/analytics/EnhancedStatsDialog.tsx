// src/components/dialogs/analytics/EnhancedStatsDialog.tsx
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDialog } from '@/components/dialogs/core/DialogContext';
import { DIALOG_TYPES } from '@/core/dialogs/registry';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Clock, 
  Zap, 
  MessageCircle, 
  Award, 
  BrainCircuit, 
  CalendarClock, 
  Star, 
  LightbulbIcon, 
  TrendingUp, 
  Users,
  LinkedinIcon,
  StarIcon,
  LockIcon,
  Construction
} from "lucide-react";
import { useService } from '@/core/hooks/useService';
import { Stats, StatsService } from '@/services/analytics/StatsService';
import { getMessage } from '@/core/utils/i18n';
import { getCurrentLanguage } from '@/core/utils/i18n';
import StatsChart from '@/components/panels/StatsPanel/StatsChart';
import UserInsightCard from './UserInsightCard';
import UsageMetricsGrid, { createMetricsData } from './UsageMetricsGrid';

// Define card types and their properties
interface StatCardInfo {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  suffix?: string;
  description?: string;
  color?: string;
  progress?: number;
  progressColor?: string;
}

/**
 * Coming Soon Card component for locked features
 */
const ComingSoonCard: React.FC<{ title: string }> = ({ title }) => {
  const openLinkedIn = () => {
    window.open('https://www.linkedin.com/company/104914264/admin/dashboard/', '_blank');
  };

  const openRatingPage = () => {
    // For Chrome Store
    const isChrome = navigator.userAgent.indexOf("Chrome") !== -1;
    if (isChrome) {
      window.open('https://chromewebstore.google.com/detail/jaydai-chrome-extension/enfcjmbdbldomiobfndablekgdkmcipd/reviews', '_blank');
    } else {
      // For Firefox Add-ons
      window.open('https://addons.mozilla.org/firefox/addon/your-addon-id/reviews/', '_blank');
    }
  };

  const sendEmail = () => {
    window.open('mailto:contact@jayd.ai?subject=Analytics%20Feature%20Feedback', '_blank');
  };

  return (
    <Card className="w-full h-full flex flex-col justify-center items-center py-12 px-4 text-center border border-muted">
      <div className="mb-6 bg-muted/20 p-4 rounded-full">
        <Construction className="h-12 w-12 text-muted-foreground" />
      </div>
      <CardTitle className="mb-4 text-xl">
        {getMessage('comingSoon', undefined, 'Coming Soon!')}
      </CardTitle>
      <CardDescription className="mb-6 text-center max-w-lg text-base">
        {getMessage('featureInDevelopment', [title], `We're still building this exciting ${title} feature! Your support gives us energy to build faster.`)}
      </CardDescription>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-2 mb-6">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-background border-primary text-primary-foreground hover:bg-primary/10" 
          onClick={openLinkedIn}
        >
          <LinkedinIcon className="h-4 w-4" />
          {getMessage('followUsLinkedIn', undefined, 'Follow Us on LinkedIn')}
        </Button>
        <Button 
          className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90" 
          onClick={openRatingPage}
        >
          <StarIcon className="h-4 w-4" />
          {getMessage('rateUs', undefined, 'Rate Us 5 Stars')}
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4">
        {getMessage('questionsFeedback', undefined, 'Questions or feedback?')} 
        <button 
          onClick={sendEmail} 
          className="text-primary hover:underline ml-1"
        >
          contact@jayd.ai
        </button>
      </p>
    </Card>
  );
};

// Define the enhanced stats dialog component
export const EnhancedStatsDialog: React.FC = () => {
  const { isOpen, dialogProps } = useDialog(DIALOG_TYPES.ENHANCED_STATS);
  const statsService = useService<StatsService>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>('en');

  // Load stats data
  useEffect(() => {
    if (isOpen && statsService) {
      setLoading(true);
      setStats(statsService.getStats());
      
      // Set current language
      setLanguage(getCurrentLanguage());
      
      // Subscribe to stats updates
      const unsubscribe = statsService.onUpdate((newStats) => {
        setStats(newStats);
        setLoading(false);
      });
      
      return unsubscribe;
    }
  }, [isOpen, statsService]);

  // Helper function to format numbers
  const formatNumber = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // Render loading state
  if (loading || !stats) {
    return (
      <Dialog {...dialogProps}>
        <DialogContent className="sm:max-w-3xl">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Build overview cards
  const overviewCards: StatCardInfo[] = [
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: getMessage('totalConversations', undefined, 'Total Conversations'),
      value: formatNumber(stats.totalChats),
      suffix: stats.recentChats > 0 ? `+${stats.recentChats} ${getMessage('lastWeek', undefined, 'last week')}` : '',
      color: 'bg-blue-500'
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: getMessage('messagesExchanged', undefined, 'Messages Exchanged'),
      value: formatNumber(stats.totalMessages),
      suffix: `~${stats.avgMessagesPerChat.toFixed(1)} ${getMessage('perChat', undefined, 'per chat')}`,
      color: 'bg-indigo-500'
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: getMessage('efficiencyScore', undefined, 'Efficiency Score'),
      value: Math.min(Math.round(stats.efficiency || 0), 100),
      suffix: '/100',
      description: getMessage('basedOnUsage', undefined, 'Based on your usage patterns'),
      progress: Math.min(stats.efficiency || 0, 100),
      progressColor: 
        (stats.efficiency || 0) >= 80 ? '#22c55e' : 
        (stats.efficiency || 0) >= 60 ? '#eab308' : '#ef4444',
      color: 'bg-amber-500'
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: getMessage('avgResponseTime', undefined, 'Avg. Response Time'),
      value: stats.thinkingTime.average.toFixed(1),
      suffix: getMessage('seconds', undefined, 'seconds'),
      color: 'bg-purple-500'
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: getMessage('energyUsage', undefined, 'Energy Usage'),
      value: stats.energyUsage.totalWh.toFixed(3),
      suffix: 'Wh',
      description: getMessage('consumptionEquivalent', undefined, 'Consumption equivalent'),
      color: 'bg-green-500'
    },
    {
      icon: <BrainCircuit className="h-5 w-5" />,
      title: getMessage('tokensProcessed', undefined, 'Tokens Processed'),
      value: formatNumber(stats.tokenUsage.total),
      description: getMessage('inputOutput', undefined, 'Input + Output'),
      color: 'bg-rose-500'
    }
  ];

  // Format messages per day data for chart
  const messagesPerDayData = {
    labels: Object.keys(stats.messagesPerDay || {}),
    values: Object.values(stats.messagesPerDay || {})
  };

  // Format token usage data for chart
  const tokenUsageData = {
    labels: [
      getMessage('input', undefined, 'Input'), 
      getMessage('output', undefined, 'Output')
    ],
    values: [stats.tokenUsage.totalInput, stats.tokenUsage.totalOutput],
    colors: ['#3b82f6', '#f59e0b']
  };

  // Model usage data for chart (if available)
  const modelUsageData = stats.modelUsage ? {
    labels: Object.keys(stats.modelUsage).map(key => key === 'unknown' ? getMessage('unknown', undefined, 'Unknown') : key),
    values: Object.values(stats.modelUsage).map(model => model.count),
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  } : { labels: [], values: [] };

  // Energy equivalent explanation
  const energyEquivalent = stats.energyUsage.equivalent || 
    getMessage('noEquivalent', undefined, 'No equivalent available');
  
  // Get efficiency description based on score
  const getEfficiencyDescription = (score: number): string => {
    if (score >= 85) return getMessage('expertLevel', undefined, 'Expert AI user - highly efficient');
    if (score >= 75) return getMessage('advancedLevel', undefined, 'Advanced AI user - good conversation flow');
    if (score >= 65) return getMessage('proficientLevel', undefined, 'Proficient AI user - effective usage');
    if (score >= 50) return getMessage('developingLevel', undefined, 'Developing AI user - learning patterns');
    return getMessage('noviceLevel', undefined, 'Novice AI user - beginning your journey');
  };

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {getMessage('enhancedAiAnalytics', undefined, 'Enhanced AI Analytics')}
          </DialogTitle>
          <DialogDescription>
            {getMessage('analyticsDescription', undefined, 'Detailed insights about your AI interactions and usage patterns')}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">
              <Star className="h-4 w-4 mr-2" />
              {getMessage('overview', undefined, 'Overview')}
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center justify-center">
              <div className="flex items-center">
                <BarChart className="h-4 w-4 mr-2" />
                {getMessage('usageMetrics', undefined, 'Usage Metrics')}
              </div>
              <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
            </TabsTrigger>
            <TabsTrigger value="efficiency" className="flex items-center justify-center">
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2" />
                {getMessage('efficiency', undefined, 'Efficiency')}
              </div>
              <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center justify-center">
              <div className="flex items-center">
                <LightbulbIcon className="h-4 w-4 mr-2" />
                {getMessage('insights', undefined, 'Insights')}
              </div>
              <LockIcon className="h-3.5 w-3.5 ml-2 text-muted-foreground" />
            </TabsTrigger>
          </TabsList>
          
          {/* Warning message about beta features */}
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md p-3 mb-4 text-yellow-800 dark:text-yellow-200 text-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="font-medium">{getMessage('betaFeatureWarning', undefined, 'Beta Feature Warning')}</h3>
                <div className="mt-1">
                  {getMessage('betaFeatureWarningMessage', undefined, 'We are still building and refining our analytics features. If you encounter any issues, please email us at')} <a href="mailto:contact@jayd.ai" className="font-medium underline">contact@jayd.ai</a>
                </div>
              </div>
            </div>
          </div>

          {/* Overview Tab - The only tab that is actually functional */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overviewCards.map((card, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className={`flex flex-row items-center justify-between py-2 ${card.color} bg-opacity-10`}>
                    <CardTitle className="text-sm font-medium">
                      {card.title}
                    </CardTitle>
                    <div className={`p-1 rounded-full ${card.color} bg-opacity-20`}>
                      {card.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex flex-col">
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold">{card.value}</span>
                        {card.suffix && (
                          <span className="ml-1 text-muted-foreground text-sm">{card.suffix}</span>
                        )}
                      </div>
                      {card.description && (
                        <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                      )}
                      {card.progress !== undefined && (
                        <div className="mt-3">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500 ease-out" 
                              style={{
                                width: `${Math.min(100, Math.max(0, card.progress))}%`,
                                backgroundColor: card.progressColor || '#3b82f6'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {getMessage('dailyActivity', undefined, 'Daily Activity')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <StatsChart 
                    data={messagesPerDayData} 
                    type="bar" 
                    color="#3b82f6" 
                    showGrid={true}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {getMessage('tokenDistribution', undefined, 'Token Distribution')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-60">
                  <StatsChart 
                    data={tokenUsageData} 
                    type="pie" 
                    showLegend={true}
                  />
                </CardContent>
              </Card>
            </div>
            
            {/* Energy equivalent card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  {getMessage('energyDetails', undefined, 'Energy Consumption Details')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="flex justify-between mb-4">
                  <div>
                    <span className="text-sm font-medium">
                      {getMessage('totalEnergy', undefined, 'Total Energy')}
                    </span>
                    <div className="text-2xl font-bold mt-1">{stats.energyUsage.totalWh.toFixed(4)} Wh</div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">
                      {getMessage('perMessage', undefined, 'Per Message')}
                    </span>
                    <div className="text-lg font-medium mt-1">{stats.energyUsage.perMessageWh.toFixed(6)} Wh</div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                {/*
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">
                    {getMessage('equivalent', undefined, 'Equivalent to')}
                  </h4>
                  <div className="flex p-4 bg-green-100 dark:bg-green-900/20 text-background rounded-md">
                    <Zap className="h-5 w-5 mr-2 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-base text-green-800 dark:text-green-300">
                      {energyEquivalent}
                    </p>
                  </div>
                </div>
                */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All other tabs show the Coming Soon card */}
          <TabsContent value="usage" className="h-[400px]">
            <ComingSoonCard title={getMessage('usageMetrics', undefined, 'Usage Metrics')} />
          </TabsContent>

          <TabsContent value="efficiency" className="h-[400px]">
            <ComingSoonCard title={getMessage('efficiency', undefined, 'Efficiency')} />
          </TabsContent>

          <TabsContent value="insights" className="h-[400px]">
            <ComingSoonCard title={getMessage('insights', undefined, 'Insights')} />
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button onClick={() => dialogProps.onOpenChange(false)}>
            {getMessage('close', undefined, 'Close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};