import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../ui/card';
import { Quote } from 'lucide-react';

const QuoteOfDay: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Get day of year (1-365) to use as seed for consistent daily quote
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const quotes = t('component.quoteOfDay.quotes', { returnObjects: true }) as string[];
  const dailyQuote = quotes[dayOfYear % quotes.length];

  return (
    <Card 
      variant="elevated" 
      className={`max-w-3xl ${theme === 'dark' ? 'border-purple-300 bg-purple-950' : 'border-purple-500 bg-purple-50'}`}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Quote className={`w-6 h-6 flex-shrink-0 mt-1 ${theme === 'dark' ? 'text-purple-300' : 'text-purple-700'} `} />
          <div className="flex-1">
            <CardTitle className={theme === 'dark' ? 'text-purple-300' : 'text-purple-700'}>
              {t('component.quoteOfDay.title')}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="loose">
        <div className="space-y-4">
          <blockquote className={`italic text-lg leading-relaxed ${theme === 'dark' ? 'text-purple-200' : 'text-purple-800'}`}>
            "{dailyQuote}"
          </blockquote>
          
          <div className="text-right">
            <span className="text-xs text-muted-foreground">
              {t('component.quoteOfDay.quoteNumber', { number: dayOfYear % quotes.length + 1 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuoteOfDay;