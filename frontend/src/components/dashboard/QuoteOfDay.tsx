import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card';
import { Quote } from 'lucide-react';

const QuoteOfDay: React.FC = () => {
  const { t } = useTranslation();

  // Get day of year (1-365) to use as seed for consistent daily quote
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const totalQuotes = 47;

  // Get quote number (1-30) based on day of year
  const quoteNumber = (dayOfYear % totalQuotes) + 1;

  return (
    <Card className="card card-purple max-w-3xl relative">
      <div className="card-content flex items-start gap-2">
        <Quote className="icon-md text-purple-400" />
        <div className="flex-1">
          <h3 className="card-title text-purple-400">
            {t('dashboard.quotes.daily')}
          </h3>
          <div className="mt-2 mb-2">
            <p className="text-violet-400 italic">
              {t(`dashboard.quotes.${quoteNumber}`)}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-4 text-xs text-muted">
        #{quoteNumber}
      </div>
    </Card>
  );
};

export default QuoteOfDay;