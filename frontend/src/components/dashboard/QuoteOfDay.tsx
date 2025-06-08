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
    <Card className="border border-purple-300 bg-purple-50 rounded-lg p-4 mx-auto w-full max-w-3xl relative">
      <div className="flex items-start gap-2">
        <Quote className="text-purple-400 w-5 h-5 stroke-[2]" />
        <div>
          <h3 className="text-base font-medium text-purple-800">
            {t('dashboard.quotes.daily')}
          </h3>
          <div className="mt-2 mb-2 text-sm">
            <p className="italic text-purple-600">
              {t(`dashboard.quotes.${quoteNumber}`)}
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-2 right-4 text-xs text-purple-400">
        #{quoteNumber}
      </div>
    </Card>
  );
};

export default QuoteOfDay;