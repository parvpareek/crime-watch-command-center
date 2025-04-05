
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  title: string;
  value: string | number;
  description?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  changeValue?: string;
  icon?: React.ReactNode;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  description,
  changeType,
  changeValue,
  icon,
  className,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(changeType || description) && (
          <div className="flex items-center text-xs text-muted-foreground">
            {changeType && (
              <>
                <div className={cn(
                  "mr-1",
                  changeType === 'increase' && "text-green-500",
                  changeType === 'decrease' && "text-red-500"
                )}>
                  {changeType === 'increase' && <ArrowUp className="h-3 w-3" />}
                  {changeType === 'decrease' && <ArrowDown className="h-3 w-3" />}
                  {changeType === 'neutral' && <Minus className="h-3 w-3" />}
                </div>
                <span className={cn(
                  changeType === 'increase' && "text-green-500",
                  changeType === 'decrease' && "text-red-500"
                )}>
                  {changeValue}
                </span>
                <span className="mx-1">•</span>
              </>
            )}
            <span>{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KpiCard;
