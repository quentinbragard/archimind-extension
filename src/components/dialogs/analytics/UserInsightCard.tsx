// src/components/dialogs/analytics/UserInsightCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface UserInsightCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'rose' | 'indigo';
}

/**
 * A card component that displays a user insight with an icon and styled background
 */
const UserInsightCard: React.FC<UserInsightCardProps> = ({
  title,
  description,
  icon,
  color = 'blue'
}) => {
  // Map color prop to Tailwind classes
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-900 dark:text-blue-200',
      description: 'text-blue-700 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-900 dark:text-green-200',
      description: 'text-green-700 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400'
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      text: 'text-amber-900 dark:text-amber-200',
      description: 'text-amber-700 dark:text-amber-300',
      icon: 'text-amber-600 dark:text-amber-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-900 dark:text-purple-200',
      description: 'text-purple-700 dark:text-purple-300',
      icon: 'text-purple-600 dark:text-purple-400'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-900/20',
      text: 'text-rose-900 dark:text-rose-200',
      description: 'text-rose-700 dark:text-rose-300',
      icon: 'text-rose-600 dark:text-rose-400'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-900 dark:text-indigo-200',
      description: 'text-indigo-700 dark:text-indigo-300',
      icon: 'text-indigo-600 dark:text-indigo-400'
    }
  };

  const classes = colorClasses[color];

  return (
    <Card className={`${classes.bg} border-0 shadow-none`}>
      <CardContent className="p-4">
        <div className="flex">
          <div className={`flex-shrink-0 mr-3 ${classes.icon}`}>
            {icon}
          </div>
          <div>
            <h4 className={`font-medium ${classes.text} mb-1`}>
              {title}
            </h4>
            <p className={`text-sm ${classes.description}`}>
              {description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserInsightCard;