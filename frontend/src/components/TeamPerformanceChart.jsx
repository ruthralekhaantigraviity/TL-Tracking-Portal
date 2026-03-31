import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TeamPerformanceChart = ({ members, theme }) => {
    // Aggregating last 7 days of data from members' performance history
    const aggregateData = () => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            let dailyCalls = 0;
            let dailyConversions = 0;

            members.forEach(member => {
                const historyEntry = member.performanceHistory?.find(h => 
                    new Date(h.date).toDateString() === date.toDateString()
                );
                if (historyEntry) {
                    dailyCalls += historyEntry.calls || 0;
                    dailyConversions += historyEntry.joinees || 0; // joinees mapped to conversions
                }
            });

            last7Days.push({
                name: dateStr,
                calls: dailyCalls,
                conversions: dailyConversions
            });
        }
        return last7Days;
    };

    const chartData = aggregateData();

    return (
        <div className="chart-container glass" style={{ height: '350px', padding: '20px', borderRadius: '24px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Weekly Team Productivity Trend</h3>
            <ResponsiveContainer width="100%" height="90%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)'} />
                    <XAxis 
                        dataKey="name" 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <YAxis 
                        stroke="#94a3b8" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', 
                            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: '12px',
                            color: theme === 'dark' ? '#fff' : '#000'
                        }} 
                    />
                    <Legend iconType="circle" />
                    <Area 
                        type="monotone" 
                        dataKey="calls" 
                        name="Total Calls"
                        stroke="#6366f1" 
                        fillOpacity={1} 
                        fill="url(#colorCalls)" 
                        strokeWidth={3}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="conversions" 
                        name="Converted Calls"
                        stroke="#10b981" 
                        fillOpacity={1} 
                        fill="url(#colorConv)" 
                        strokeWidth={3}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TeamPerformanceChart;
