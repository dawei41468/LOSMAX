import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Quote } from 'lucide-react';

const QuoteOfDay: React.FC = () => {
  const { t } = useTranslation();

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
      variant="quoteOD"
      border="family"
      className="w-full max-w-3xl mx-auto"
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Quote className="w-6 h-6 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <CardTitle>
              {t('component.quoteOfDay.title')}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="loose">
        <div className="space-y-4">
          <blockquote className="italic text-lg leading-relaxed">
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