'use client';

import React from 'react';
import { X, TrendingDown, ArrowDown } from 'lucide-react';
import { format } from 'date-fns';
import { ClientListItem } from '@/lib/types/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Legend,
  Dot
} from 'recharts';

interface OutcomesModalProps {
  client: ClientListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// PHQ-9 severity levels
const severityLevels = [
  { name: 'Minimal', min: 0, max: 4, color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' },
  { name: 'Mild', min: 5, max: 9, color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' },
  { name: 'Moderate', min: 10, max: 14, color: '#f97316', bgColor: 'rgba(249, 115, 22, 0.1)' },
  { name: 'Moderately Severe', min: 15, max: 19, color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' },
  { name: 'Severe', min: 20, max: 27, color: '#991b1b', bgColor: 'rgba(153, 27, 27, 0.1)' },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const prevScore = data.prevScore;
    const change = prevScore !== null ? data.score - prevScore : null;
    
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3">
        <p className="font-medium">{format(new Date(data.date), 'MMM d, yyyy')}</p>
        <p className="text-sm">Score: <span className="font-bold">{data.score}</span></p>
        {change !== null && (
          <p className="text-sm">
            Change: <span className={`font-bold ${change < 0 ? 'text-green-600' : change > 0 ? 'text-red-600' : ''}`}>
              {change > 0 ? '+' : ''}{change}
            </span>
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">{data.severity}</p>
      </div>
    );
  }
  return null;
};

// Custom dot component with animation
const CustomDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle 
        cx={cx} 
        cy={cy} 
        r={5} 
        fill="#3b82f6" 
        stroke="#fff" 
        strokeWidth={2}
        className="animate-pulse"
      />
      <circle 
        cx={cx} 
        cy={cy} 
        r={8} 
        fill="rgba(59, 130, 246, 0.2)"
        className="animate-ping"
      />
    </g>
  );
};

export function OutcomesModal({ client, open, onOpenChange }: OutcomesModalProps) {
  if (!open || !client) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  // Prepare chart data
  const chartData = client.outcomes?.phq9?.map((assessment, index, array) => {
    const score = assessment.score;
    const severity = severityLevels.find(level => score >= level.min && score <= level.max)?.name || 'Unknown';
    
    return {
      date: assessment.date,
      score: assessment.score,
      severity,
      prevScore: index > 0 ? array[index - 1].score : null,
      formattedDate: format(new Date(assessment.date), 'MMM dd'),
    };
  }) || [];

  // Calculate metrics
  const hasData = chartData.length > 0;
  const startingScore = hasData ? chartData[0].score : 0;
  const currentScore = hasData ? chartData[chartData.length - 1].score : 0;
  const improvement = startingScore - currentScore;
  const improvementPercent = startingScore > 0 ? Math.round((improvement / startingScore) * 100) : 0;

  // Modal backdrop and content
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-[90vw] h-[90vh] max-w-[1200px] bg-background border rounded-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold">Outcome Trends</h2>
            <p className="text-muted-foreground mt-1">
              {client.firstName} {client.lastName} - PHQ-9 Progress
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto h-[calc(90vh-88px)] p-6">
          <div className="space-y-6">
            {/* Key Metrics Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="transition-all hover:shadow-lg hover:scale-105 duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Starting Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {startingScore}
                  </p>
                  <p className="text-sm text-muted-foreground">Baseline</p>
                </CardContent>
              </Card>
              
              <Card className="transition-all hover:shadow-lg hover:scale-105 duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Current Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {currentScore}
                  </p>
                  <p className="text-sm text-muted-foreground">Latest</p>
                </CardContent>
              </Card>
              
              <Card className="transition-all hover:shadow-lg hover:scale-105 duration-300 border-green-200 dark:border-green-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-5 w-5 text-green-600 animate-bounce" />
                    <p className="text-3xl font-bold text-green-600">{improvement}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">{improvementPercent}%</span> improvement
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* PHQ-9 Progress Chart */}
            <Card className="transition-all hover:shadow-xl duration-300">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">PHQ-9 Score Trend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Patient Health Questionnaire - Depression Severity
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {hasData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        {/* Severity band backgrounds */}
                        {severityLevels.map((level) => (
                          <ReferenceArea
                            key={level.name}
                            y1={level.min}
                            y2={level.max}
                            fill={level.bgColor}
                            fillOpacity={1}
                            label={{
                              value: level.name,
                              position: 'right',
                              style: { 
                                fontSize: 12, 
                                fill: level.color,
                                fontWeight: 'bold',
                                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))'
                              }
                            }}
                          />
                        ))}
                        
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        
                        <XAxis 
                          dataKey="formattedDate"
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#e5e7eb' }}
                        />
                        
                        <YAxis 
                          domain={[0, 27]}
                          ticks={[0, 5, 10, 15, 20, 27]}
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#e5e7eb' }}
                          label={{ 
                            value: 'PHQ-9 Score', 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { fontSize: 14 }
                          }}
                        />
                        
                        <Tooltip content={<CustomTooltip />} />
                        
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="url(#colorGradient)"
                          strokeWidth={3}
                          dot={<CustomDot />}
                          animationDuration={2000}
                          animationEasing="ease-out"
                        />
                        
                        {/* Gradient definition */}
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#22c55e" />
                          </linearGradient>
                        </defs>
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No PHQ-9 data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Future: Additional outcome measures can be added here */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Outcome Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Future enhancement: GAD-7, AUDIT, and other outcome measures will be displayed here.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
