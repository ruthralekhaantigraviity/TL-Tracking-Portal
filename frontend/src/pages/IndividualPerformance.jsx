import React, { useRef } from 'react';
import { 
    Phone, Users, MessageSquare, Clock, Trophy, 
    Download, ChevronLeft, Briefcase, 
    ArrowUpRight, Target, CheckCircle, User, DollarSign, Activity,
    ShieldCheck, ThumbsUp, ThumbsDown, Truck, FileCheck
} from 'lucide-react';
import { 
    XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import html2pdf from 'html2pdf.js';
import '../styles/IndividualPerformance.css';

const IndividualPerformance = ({ member, onBack }) => {
    const reportRef = useRef();

    if (!member) return null;

    const isSBI = member.team === 'SBI';
    const isBDE = member.team === 'BDE';


    const downloadPDF = () => {
        const element = reportRef.current;
        const opt = {
            margin: 10,
            filename: `${member.name}_Performance_Report.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#0f172a' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const chartData = member.performanceHistory.map(item => ({
        date: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' }),
        primary: isSBI ? (item.panVerified || 0) : (item.convertedCalls || 0),
        secondary: isSBI ? (item.approvedCount || 0) : (item.joinees || 0),
    }));


    return (
        <div className="performance-view-container">
            <header className="page-header">
                <button className="back-btn" onClick={onBack}>
                    <ChevronLeft size={20} />
                    Back to Team
                </button>
                <div className="header-actions">
                </div>

            </header>

            <div ref={reportRef} className="report-content">
                <section className="profile-banner glass">
                    <div className="profile-header">
                        <div className="profile-title">
                            <h1>{member.name}</h1>
                            <span className="designation">{member.designation}</span>
                            <div className="tags">
                                <span className="tag domain">
                                    <Briefcase size={14} />
                                    {isBDE ? member.companyName || member.domain : member.domain}
                                </span>
                                {isBDE && member.rolePosition && (
                                    <span className="tag role-pos" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}>
                                        <User size={14} />
                                        {member.rolePosition}
                                    </span>
                                )}
                                <span className="tag active-status">Active Today</span>
                            </div>
                        </div>
                    </div>

                    <div className="daily-status-card glass">
                        <div className="status-label">Today's Task</div>
                        <div className="status-value">{member.dailyTask}</div>
                        <div className="status-progress">
                            <div className="progress-info">
                                <span>Overall Achievement</span>
                                <span>{member.achievementRate}%</span>
                            </div>
                            <div className="progress-bar-small">
                                <div className="progress-fill" style={{ width: `${member.achievementRate}%` }}></div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="performance-grid">
                    <div className="main-stats-grid">
                        <div className="stat-box glass">
                            <div className="stat-icon calls" style={{ background: (isSBI || isBDE) ? '#6366f120' : '#6366f120', color: '#6366f1' }}>
                                {(isSBI || isBDE) ? <ShieldCheck size={24} /> : <Phone size={24} />}
                            </div>
                            <div className="stat-content">
                                <span className="label">{isSBI ? 'PAN Verified' : isBDE ? 'Converted Leads' : 'Calls Converted'}</span>
                                <h2 className="value">{isSBI ? member.panVerified : member.convertedCalls}</h2>
                                <span className="trend positive">Total Progress</span>
                            </div>

                        </div>
                        <div className="stat-box glass">
                            <div className="stat-icon approved" style={{ background: '#10b98120', color: '#10b981' }}>
                                {isSBI ? <ThumbsUp size={24} /> : <DollarSign size={24} />}
                            </div>
                            <div className="stat-content">
                                <span className="label">{isSBI ? 'Total Approved' : isBDE ? 'Number of Joinings' : 'Paid (Conversions)'}</span>
                                <h2 className="value">{isSBI ? member.approvedCount : member.paidCount}</h2>
                                <span className="trend positive">{isSBI ? 'Verified' : isBDE ? 'Recruitments' : 'High Value'}</span>
                            </div>

                        </div>
                        <div className="stat-box glass">
                            <div className="stat-icon connectivity" style={{ background: isSBI ? '#8b5cf620' : '#f59e0b20', color: isSBI ? '#8b5cf6' : '#f59e0b' }}>
                                {isSBI ? <Phone size={24} /> : <Clock size={24} />}
                            </div>
                            <div className="stat-content">
                                <span className="label">{isSBI ? 'Calls Picked / Missed' : 'Work Duration'}</span>
                                <h2 className="value" style={{ fontSize: isSBI ? '1.4rem' : '2rem' }}>
                                    {isSBI ? `${member.totalCallsPicked} / ${member.totalCallsNotPicked}` : member.workDuration}
                                </h2>
                                <span className="trend">{isSBI ? 'Outreach Ratio' : 'Effective Hours'}</span>
                            </div>
                        </div>
                        <div className="stat-box glass">
                            <div className="stat-icon special" style={{ background: isSBI ? '#a855f720' : '#f43f5e20', color: isSBI ? '#a855f7' : '#f43f5e' }}>
                                {isSBI ? <Truck size={24} /> : <Activity size={24} />}
                            </div>
                            <div className="stat-content">
                                <span className="label">{isSBI ? 'Dispatch Completed' : 'Total Complaints'}</span>
                                <h2 className="value">{isSBI ? member.dispatchCompleted : member.totalComplaints}</h2>
                                <span className="trend positive">{isSBI ? 'Operational' : 'Response Active'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="charts-section">
                        <div className="chart-card glass">
                            <div className="chart-header">
                                <h3>{isSBI ? 'Verification & Approval Trends' : 'Conversion Trends'} (Last 5 Days)</h3>
                                <div className="chart-legend">
                                    <span className="legend-item"><div className="dot primary"></div> {isSBI ? 'PAN Verified' : 'Conversions'}</span>
                                    <span className="legend-item"><div className="dot secondary"></div> {isSBI ? 'Approvals' : 'Paid'}</span>
                                </div>
                            </div>
                            <div className="chart-wrapper">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        />
                                        <Area type="monotone" dataKey="primary" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                                        <Area type="monotone" dataKey="secondary" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSecondary)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IndividualPerformance;
