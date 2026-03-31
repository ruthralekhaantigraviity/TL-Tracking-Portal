import React, { useEffect, useState, useRef } from 'react';
import { Phone, Users, MessageSquare, TrendingUp, CheckCircle, Target, Briefcase, Edit3, UserPlus, Download, FileText, Clock, ShieldCheck, FileCheck, Truck, ThumbsUp, ThumbsDown, Trash2, ArrowLeft, Sun, Moon } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';
import { fetchMembers, updateMember, createMember, deleteMember } from '../api/api';
import StatsEntryModal from '../components/StatsEntryModal';
import AddMemberModal from '../components/AddMemberModal';
import TeamPerformanceChart from '../components/TeamPerformanceChart';

const Dashboard = ({ viewMode = 'overview', selectedTeam, setSelectedTeam, user, theme, toggleTheme }) => {
    const [members, setMembers] = useState([]);
    const [stats, setStats] = useState({
        totalCalls: 0,
        totalConverted: 0,
        avgTarget: 0,
        activeHrCount: 0,
        totalPAN: 0,
        totalDetails: 0,
        totalApproved: 0,
        totalDeclined: 0,
        totalPicked: 0,
        totalNotPicked: 0
    });

    const [selectedMember, setSelectedMember] = useState(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [reportType, setReportType] = useState('daily');
    const [adminComment, setAdminComment] = useState('');
    const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
    const reportRef = useRef();
    const adminReportRef = useRef();

    const getStats = async () => {
        try {
            const data = await fetchMembers(selectedTeam);
            if (data) {
                setMembers(data);
                const totalCalls = data.reduce((acc, curr) => acc + (curr.totalCalls || 0), 0);
                const totalConverted = data.reduce((acc, curr) => acc + (curr.convertedCalls || 0), 0);
                
                const totalPAN = data.reduce((acc, curr) => acc + (curr.panVerified || 0), 0);
                const totalDetails = data.reduce((acc, curr) => acc + (curr.detailsVerified || 0), 0);
                const totalApproved = data.reduce((acc, curr) => acc + (curr.approvedCount || 0), 0);
                const totalDeclined = data.reduce((acc, curr) => acc + (curr.declinedCount || 0), 0);
                const totalPicked = data.reduce((acc, curr) => acc + (curr.totalCallsPicked || 0), 0);
                const totalNotPicked = data.reduce((acc, curr) => acc + (curr.totalCallsNotPicked || 0), 0);

                const avgTarget = data.length > 0 ? Math.round(data.reduce((acc, curr) => {
                    const target = curr.dailyTarget || 1;
                    return acc + ((curr.completedTarget || 0) / target * 100);
                }, 0) / data.length) : 0;
                
                setStats({
                    totalCalls,
                    totalConverted,
                    avgTarget,
                    activeHrCount: data.length,
                    totalPAN,
                    totalDetails,
                    totalApproved,
                    totalDeclined,
                    totalPicked,
                    totalNotPicked
                });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    useEffect(() => {
        getStats();
        if (selectedTeam === 'Administration') getAdminActivity();
    }, [selectedTeam, selectedDate]); 

    const getAdminActivity = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/hr/admin/activity/${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setAdminComment(data.content);
            } else {
                setAdminComment('');
            }
        } catch (err) {
            console.error('Failed to fetch admin log:', err);
        }
    };

    const handleAdminSubmit = async () => {
        if (!adminComment.trim()) return toast.error('Please enter activity highlights');
        
        const token = localStorage.getItem('token');
        if (!token) return toast.error('Session expired. Please log in again.');
        
        setIsAdminSubmitting(true);
        try {
            const res = await fetch('/api/hr/admin/activity', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: adminComment, date: selectedDate })
            });

            const data = await res.json().catch(() => ({}));
            
            if (res.ok) {
                toast.success('Activity Log saved successfully!');
                // Automatically redirect to Global Overview after 1.5s
                setTimeout(() => {
                    setSelectedTeam('All');
                }, 1500);
            } else {
                // Determine the best message to show from data or status
                const errorMsg = data.message || data.error || data.details || `Error ${res.status}: Failed to save`;
                throw new Error(errorMsg);
            }
        } catch (err) {
            if (err.message.includes('Session expired')) {
                toast.error('Your session has expired. Redirecting to login...');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }, 2000);
            } else {
                toast.error(err.message || 'Network error saving activity log');
            }
            console.error('Save failed:', err);
        } finally {
            setIsAdminSubmitting(false);
        }
    };

    const downloadAdminPDF = () => {
        const element = adminReportRef.current;
        const opt = {
            margin: [15, 15],
            filename: `Forge_India_Administration_Report_${selectedDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const downloadTeamPDF = () => {
        const element = reportRef.current;
        const opt = {
            margin: [10, 5],
            filename: `Forge_India_Connect_${selectedTeam}_${reportType}_Report_${selectedDate}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                backgroundColor: '#ffffff',
                useCORS: true,
                logging: false,
                width: 1050
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const getReportRows = () => {
        const targetDate = new Date(selectedDate);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        return members.map(m => {
            let history = [];
            const toDateStr = (d) => new Date(d).toISOString().split('T')[0];
            const targetStr = toDateStr(targetDate);

            if (reportType === 'daily') {
                history = m.performanceHistory.filter(h => toDateStr(h.date) === targetStr);
            } else if (reportType === 'weekly') {
                const startDate = new Date(targetDate);
                startDate.setDate(startDate.getDate() - 7);
                history = m.performanceHistory.filter(h => {
                    const d = new Date(h.date);
                    return d >= startDate && d <= endOfDay;
                });
            } else if (reportType === 'monthly') {
                history = m.performanceHistory.filter(h => {
                    const d = new Date(h.date);
                    return d.getMonth() === targetDate.getMonth() && d.getFullYear() === targetDate.getFullYear();
                });
            }
            
            const getUnique = (arr, key) => {
                const unique = [...new Set(arr.map(h => h[key]).filter(v => v && v !== '-'))];
                return unique.length > 0 ? unique.join(', ') : '-';
            };

            return {
                _id: m._id,
                name: m.name,
                designation: m.designation,
                aggCalls: history.reduce((s, h) => s + (h.calls || 0), 0),
                aggCallCat: getUnique(history, 'callCategory'),
                aggConverted: history.reduce((s, h) => s + (h.convertedCalls || 0), 0),
                aggConvSector: getUnique(history, 'conversionSector'),
                aggPaid: history.reduce((s, h) => s + (h.joinees || 0), 0),
                aggPaidSector: getUnique(history, 'paidSector'),
                aggComplaints: history.reduce((s, h) => s + (h.complaints || 0), 0),
                aggCompReason: getUnique(history, 'complaintReason'),
                aggComments: getUnique(history, 'comments'),
                aggTarget: history.length > 0 
                    ? Math.round((history.reduce((s, h) => s + (h.completedTarget || 0), 0) / (history.length * (m.dailyTarget || 1))) * 100) 
                    : 0,
                aggPAN: history.reduce((s, h) => s + (h.panVerified || 0), 0),
                aggDetails: history.reduce((s, h) => s + (h.detailsVerified || 0), 0),
                aggApproved: history.reduce((s, h) => s + (h.approvedCount || 0), 0),
                aggDeclined: history.reduce((s, h) => s + (h.declinedCount || 0), 0),
                aggDispatch: history.reduce((s, h) => s + (h.dispatchCompleted || 0), 0),
                aggPicked: history.reduce((s, h) => s + (h.callsPicked || 0), 0),
                aggNotPicked: history.reduce((s, h) => s + (h.callsNotPicked || 0), 0),
                companyName: m.companyName || '-',
                rolePosition: m.rolePosition || '-'
            };

        });
    };

    const reportRows = getReportRows();

    const getReportStats = (rows) => {
        return {
            totalCalls: rows.reduce((s, r) => s + (r.aggCalls || 0), 0),
            totalConverted: rows.reduce((s, r) => s + (r.aggConverted || 0), 0),
            avgTarget: rows.length > 0 ? Math.round(rows.reduce((s, r) => s + (r.aggTarget || 0), 0) / rows.length) : 0,
            activeHrCount: rows.length,
            totalPAN: rows.reduce((s, r) => s + (r.aggPAN || 0), 0),
            totalDetails: rows.reduce((s, r) => s + (r.aggDetails || 0), 0),
            totalApproved: rows.reduce((s, r) => s + (r.aggApproved || 0), 0),
            totalDeclined: rows.reduce((s, r) => s + (r.aggDeclined || 0), 0),
            totalPicked: rows.reduce((s, r) => s + (r.aggPicked || 0), 0),
            totalNotPicked: rows.reduce((s, r) => s + (r.aggNotPicked || 0), 0)
        };

    };

    const reportStats = getReportStats(reportRows);

    const handleUpdateClick = (member) => {
        setSelectedMember(member);
        setIsUpdateModalOpen(true);
    };

    const handleSaveStats = async (id, updatedData) => {
        try {
            await updateMember(id, updatedData);
            toast.success('Statistics updated successfully!');
            setIsUpdateModalOpen(false);
            setSelectedMember(null);
            getStats();
        } catch (err) {
            console.error('Failed to update stats:', err);
            toast.error('Error updating statistics');
        }
    };

    const handleAddMember = async (newMemberData) => {
        try {
            await createMember(newMemberData);
            toast.success('Member added successfully!');
            setIsAddModalOpen(false);
            getStats();
        } catch (err) {
            console.error('Failed to create member:', err);
            const errorMsg = err.response?.data?.details || err.response?.data?.message || err.message || 'Error creating member';
            toast.error(errorMsg);
        }
    };

    const handleDeleteMember = async (id, name) => {
        toast.custom((t) => (
            <div className={`custom-confirm-toast ${t.visible ? 'animate-enter' : 'animate-leave'} glass`}>
                <div className="confirm-content">
                    <div className="confirm-icon delete-icon-bg">
                        <Trash2 size={20} />
                    </div>
                    <div className="confirm-text">
                        <h4>Remove Team Member?</h4>
                        <p>Are you sure you want to delete <strong>{name}</strong>? This action cannot be undone.</p>
                    </div>
                </div>
                <div className="confirm-actions">
                    <button 
                        className="confirm-btn cancel" 
                        onClick={() => toast.dismiss(t.id)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="confirm-btn confirm-delete" 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteMember(id);
                                toast.success(`${name} removed successfully`);
                                getStats();
                            } catch (err) {
                                console.error('Failed to delete member:', err);
                                const errorMsg = err.response?.data?.details || err.response?.data?.message || err.message || 'Error removing member';
                                toast.error(errorMsg);
                            }
                        }}
                    >
                        Yes, Remove
                    </button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };


    const metricCards = selectedTeam === 'SBI' ? [
        { label: 'Total Calls', value: stats.totalCalls, icon: <Phone size={24} />, color: '#6366f1' },
        { label: 'PAN Verified', value: stats.totalPAN, icon: <ShieldCheck size={24} />, color: '#10b981' },
        { label: 'Approved', value: stats.totalApproved, icon: <ThumbsUp size={24} />, color: '#0ea5e9' },
        { label: 'Declined', value: stats.totalDeclined, icon: <ThumbsDown size={24} />, color: '#ef4444' },
    ] : selectedTeam === 'All' ? [
        { label: 'Network Total Calls', value: stats.totalCalls, icon: <Phone size={24} />, color: '#6366f1' },
        { label: 'Org-wide Conversions', value: stats.totalConverted, icon: <CheckCircle size={24} />, color: '#10b981' },
        { label: 'Global Target Avg', value: `${stats.avgTarget}%`, icon: <Target size={24} />, color: '#f59e0b' },
        { label: 'Total Personnel', value: stats.activeHrCount, icon: <Users size={24} />, color: '#a855f7' },
    ] : [
        { label: 'Total Calls (Live)', value: stats.totalCalls, icon: <Phone size={24} />, color: '#6366f1' },
        { label: 'Converted Calls', value: stats.totalConverted, icon: <CheckCircle size={24} />, color: '#10b981' },
        { label: 'Team Target Avg', value: `${stats.avgTarget}%`, icon: <Target size={24} />, color: '#f59e0b' },
        { label: 'Active Members', value: stats.activeHrCount, icon: <Users size={24} />, color: '#a855f7' },
    ];


    return (
        <div className="dashboard-container">
            <header className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    {selectedTeam === 'Administration' && (
                        <button 
                            className="back-nav-btn glass" 
                            onClick={() => setSelectedTeam('All')}
                            title="Go back to Global Overview"
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                padding: '10px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <div className="team-badge" style={{ background: '#6366f1', color: '#fff', padding: '12px', borderRadius: '16px' }}>
                        <Briefcase size={24} />
                    </div>
                    <div>
                        <h1>{selectedTeam === 'All' ? 'Global Command Center' : `${selectedTeam} Performance Dashboard`}</h1>
                        <p>{selectedTeam === 'All' ? 'Unified organization-wide performance oversight' : `Managing ${selectedTeam} department activities and daily productivity metrics`}</p>
                    </div>
                </div>
                <div className="header-actions">
                    {selectedTeam === 'Administration' ? (
                         <div className="report-selector-group" style={{ display: 'flex', gap: '15px' }}>
                             <div className="report-controls">
                                 <Clock size={16} />
                                 <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                             </div>
                             <button className="btn-primary" onClick={downloadAdminPDF}>
                                 <Download size={18} />
                                 Download Executive Report
                             </button>
                         </div>
                    ) : (user.role === 'Admin' || user.role === 'Manager') && (
                        <div className="admin-controls glass" style={{ marginRight: '15px', display: 'flex', alignItems: 'center', background: 'rgba(99, 102, 241, 0.1)', padding: '5px 15px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                            <ShieldCheck size={16} style={{ color: '#6366f1', marginRight: '10px' }} />
                            <select 
                                value={selectedTeam} 
                                onChange={(e) => setSelectedTeam(e.target.value)} 
                                style={{
                                    background: 'var(--bg-glass)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    padding: '0.75rem 1rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    width: '100%',
                                    resize: 'vertical'
                                }}
                            >
                                <option value="All" style={{ background: '#0f172a' }}>Global Overview</option>
                                <option value="HR" style={{ background: '#0f172a' }}>HR Department</option>
                                <option value="SBI" style={{ background: '#0f172a' }}>SBI Department</option>
                                <option value="BDE" style={{ background: '#0f172a' }}>BDE Department</option>
                                <option value="Administration" style={{ background: '#0f172a' }}>Administration</option>
                            </select>
                        </div>
                    )}




                    {selectedTeam !== 'Administration' && (user.role === 'Admin' || user.role === 'Manager' || user.role === 'TL') && (
                        viewMode === 'overview' ? (
                            <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                                <UserPlus size={18} />
                                Add New Member
                            </button>
                        ) : (
                            <div className="report-selector-group" style={{ display: 'flex', gap: '15px' }}>
                                <div className="report-controls">
                                    <FileText size={16} />
                                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                        <option value="daily">Daily Report</option>
                                        <option value="weekly">Weekly Report</option>
                                        <option value="monthly">Monthly Report</option>
                                    </select>
                                    <div className="divider"></div>
                                    <Clock size={16} />
                                    <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                                </div>
                                <button className="btn-primary" onClick={downloadTeamPDF}>
                                    <Download size={18} />
                                    Download Team Report
                                </button>
                            </div>
                        )
                    )}
                </div>
            </header>

            {selectedTeam === 'Administration' ? (
                <div className="admin-manual-log glass animate-enter">
                    <div className="log-form-header">
                        <div className="log-icon-container">
                            <Edit3 size={24} />
                        </div>
                        <div className="log-title-area">
                            <h3>Daily Activity Log</h3>
                            <p>Manually record organization-wide highlights and administrative updates for <strong>{selectedDate}</strong></p>
                        </div>
                        <div className="log-status">
                            <span className="live-pill">OFFICIAL</span>
                        </div>
                    </div>
                    
                    <div className="log-input-area">
                        <textarea
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            placeholder="Type your manual daily activities, meeting summaries, or organizational updates here..."
                            className="admin-textarea"
                            rows={15}
                        />
                    </div>

                    <div className="log-actions">
                        <p className="log-hint">All entries are securely stored in the executive database.</p>
                        <button 
                            className="btn-primary save-log-btn" 
                            disabled={isAdminSubmitting}
                            onClick={handleAdminSubmit}
                        >
                            {isAdminSubmitting ? 'Saving...' : 'Submit Activity Log'}
                            <FileCheck size={18} />
                        </button>
                    </div>

                    {/* Hidden template for PDF */}
                    <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
                        <div ref={adminReportRef} className="printable-report admin-report">
                            <div className="report-header">
                                <div className="header-left">
                                    <h1>Forge India Connect</h1>
                                    <h2>Administration Executive Summary</h2>
                                </div>
                                <div className="header-right">
                                    <p className="report-date">Date: {selectedDate}</p>
                                    <p className="report-status">Official Log</p>
                                </div>
                            </div>
                            
                            <div className="report-body">
                                <h3 className="section-title">Daily Activity Highlights</h3>
                                <div className="report-content">
                                    {adminComment.split('\n').map((line, i) => (
                                        <p key={i}>{line}</p>
                                    )) || 'No activities recorded for this date.'}
                                </div>
                            </div>

                            <div className="report-footer">
                                <div className="footer-left">
                                    <p>&copy; {new Date().getFullYear()} Forge India Connect</p>
                                </div>
                                <div className="footer-right">
                                    <p className="label">Report Drafted By:</p>
                                    <p className="name">{user.name}</p>
                                    <p className="designation">{user.designation}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                {viewMode === 'overview' && (
                <>
                    <div className="metrics-grid">
                        {metricCards.map((card, index) => (
                            <div key={index} className="metric-card" style={{ '--accent-color': card.color }}>
                                <div className="card-header">
                                    <div className="icon-wrapper" style={{ background: `${card.color}20`, color: card.color }}>
                                        {card.icon}
                                    </div>
                                    <span className="card-label">{card.label}</span>
                                </div>
                                <div className="card-body">
                                    <h2 className="card-value">{card.value}</h2>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="insight-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        <div className="performance-insight glass" style={{ padding: '24px', borderRadius: '24px', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '12px' }}>
                                    <TrendingUp size={24} />
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Performance Insights (Best Performer)</h3>
                            </div>
                            {members.length > 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div className="best-performer-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifySelf: 'center', fontSize: '1.5rem', fontWeight: 'bold', justifyContent: 'center' }}>
                                        {[...members].sort((a,b) => b.achievementRate - a.achievementRate)[0].name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#10b981', fontSize: '1.1rem' }}>
                                            ⭐ {[...members].sort((a,b) => b.achievementRate - a.achievementRate)[0].name}
                                        </h4>
                                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            Achieved <strong>{[...members].sort((a,b) => b.achievementRate - a.achievementRate)[0].achievementRate}%</strong> of target today.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p style={{ color: '#94a3b8' }}>No performance data available yet.</p>
                            )}
                        </div>
                    </div>

                    <TeamPerformanceChart members={members} theme={theme} />
                </>
            )}

            {viewMode === 'performance' && (
                <section className="team-oversight glass">
                    <div className="section-header">
                        <h3>{user.role === 'TL' ? user.assignedTeam : selectedTeam} Performance Oversight</h3>
                        <span className="live-pill">LIVE</span>
                    </div>
                    <div className="table-responsive">
                        <table className="oversight-table detailed">
                            <thead>
                                <tr>
                                    <th>Member</th>
                                    {selectedTeam === 'All' ? (
                                        <>
                                            <th>Team Context</th>
                                            <th>Total Calls</th>
                                            <th>Key Achievement</th>
                                            <th>Secondary Metric</th>
                                        </>
                                    ) : (
                                        <>
                                            <th>Calls (Purpose)</th>
                                            {selectedTeam === 'SBI' ? (
                                                <>
                                                    <th>Verified (PAN/Details)</th>
                                                    <th>Status (Appr/Decl)</th>
                                                    <th>Dispatch</th>
                                                </>
                                            ) : selectedTeam === 'BDE' ? (
                                                <>
                                                    <th>Converted Leads</th>
                                                    <th>No. of Joinings</th>
                                                    <th>Company - Role</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th>Converted (Sector)</th>
                                                    <th>Paid (Sector)</th>
                                                    <th>Complaints (Reason)</th>
                                                </>
                                            )}
                                        </>
                                    )}
                                    <th>Comments</th>
                                    <th>Target Progress</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((member) => {
                                    const latest = member.performanceHistory[member.performanceHistory.length - 1] || {};
                                    return (
                                        <tr key={member._id}>
                                            <td>
                                                <div className="member-cell">
                                                    <div className="member-initial">{member.name.charAt(0)}</div>
                                                    <div className="member-meta">
                                                        <span className="name">{member.name}</span>
                                                        <span className="role">{member.designation}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {selectedTeam === 'All' ? (
                                                <>
                                                    <td>
                                                        <span className={`team-tag ${member.team.toLowerCase()}`}>
                                                            {member.team} Team
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="analytics-cell">
                                                            <span className="count">{latest.calls || 0}</span>
                                                            <span className="category">Unified Activity</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="analytics-cell">
                                                            {member.team === 'SBI' ? (
                                                                <>
                                                                    <span className="count" style={{ color: '#10b981' }}>{latest.approvedCount || 0}</span>
                                                                    <span className="sector">Approved Cards</span>
                                                                </>
                                                            ) : member.team === 'BDE' ? (
                                                                <>
                                                                    <span className="count" style={{ color: '#f59e0b' }}>{member.convertedCalls || 0}</span>
                                                                    <span className="sector">Direct Leads</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="count" style={{ color: '#6366f1' }}>{member.convertedCalls || 0}</span>
                                                                    <span className="sector">Recruitment Conv.</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="analytics-cell">
                                                            {member.team === 'SBI' ? (
                                                                <>
                                                                    <span className="count" style={{ color: '#a855f7' }}>{latest.panVerified || 0}</span>
                                                                    <span className="sector">Verifications</span>
                                                                </>
                                                            ) : member.team === 'BDE' ? (
                                                                <>
                                                                    <span className="count" style={{ color: '#10b981' }}>{member.paidCount || 0}</span>
                                                                    <span className="sector">Joinings</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="count" style={{ color: '#10b981' }}>{member.paidCount || 0}</span>
                                                                    <span className="sector">Paid Closures</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>
                                                        <div className="analytics-cell">
                                                            <span className="count">{latest.calls || 0}</span>
                                                            {selectedTeam === 'SBI' && (
                                                                <div style={{ display: 'flex', gap: '5px', fontSize: '0.7rem', marginTop: '2px' }}>
                                                                    <span style={{ color: '#10b981' }}>P: {latest.callsPicked || 0}</span>
                                                                    <span style={{ color: '#ef4444' }}>M: {latest.callsNotPicked || 0}</span>
                                                                </div>
                                                            )}
                                                            <span className="category">{latest.callCategory || '-'}</span>
                                                        </div>
                                                    </td>

                                                    {selectedTeam === 'SBI' ? (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <span className="count">{latest.panVerified || 0}</span>
                                                                        <span className="count" style={{ color: '#a855f7' }}>{latest.detailsVerified || 0}</span>
                                                                    </div>
                                                                    <span className="category">PAN / Details</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <span className="count" style={{ color: '#10b981' }}>{latest.approvedCount || 0}</span>
                                                                        <span className="count" style={{ color: '#ef4444' }}>{latest.declinedCount || 0}</span>
                                                                    </div>
                                                                    <span className="category">Appr / Decl</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{latest.dispatchCompleted || 0}</span>
                                                                    <span className="category">Items</span>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : selectedTeam === 'BDE' ? (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{member.convertedCalls || 0}</span>
                                                                    <span className="sector">Leads</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{member.paidCount || 0}</span>
                                                                    <span className="sector">Joinings</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold' }}>{member.companyName || '-'}</div>
                                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{member.rolePosition || '-'}</div>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{member.convertedCalls || 0}</span>
                                                                    <span className="sector">{member.conversionSector || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{member.paidCount || 0}</span>
                                                                    <span className="sector">{member.paidSector || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{member.totalComplaints || 0}</span>
                                                                    <span className="reason">{member.complaintReason || '-'}</span>
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                </>
                                            )}

                                            <td>
                                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', maxWidth: '200px', maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', background: 'rgba(255, 255, 255, 0.05)', padding: '6px', borderRadius: '8px' }}>
                                                    {member.comments || '-'}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="target-progress-wrapper">
                                                    <div className="progress-text">
                                                        {member.completedTarget}/{member.dailyTarget}
                                                    </div>
                                                    <div className="progress-bar">
                                                        <div className="progress-fill" style={{ width: `${(member.completedTarget/member.dailyTarget)*100 || 0}%` }}></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {(user.role === 'Admin' || user.role === 'Manager' || user.role === 'TL') && (
                                                        <>
                                                            <button className="action-btn" onClick={() => handleUpdateClick(member)}>
                                                                <Edit3 size={16} /> Update
                                                            </button>
                                                            <button className="action-btn delete" onClick={() => handleDeleteMember(member._id, member.name)}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}
            </>
            )}

            <div style={{ position: 'absolute', left: '-10000px', top: 0 }}>
                <div ref={reportRef} className="printable-report" style={{ padding: '30px', background: '#fff', color: '#334155', width: '1000px', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #6366f1', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div>
                            <h1 style={{ margin: 0, color: '#1e293b', fontSize: '24px' }}>Forge India Connect</h1>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>{selectedTeam} Team Performance Report ({reportType.toUpperCase()})</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontWeight: 'bold' }}>Date: {selectedDate}</p>
                            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>Generated: {new Date().toLocaleString()}</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        {[
                            { label: 'Total Calls', value: reportStats.totalCalls },
                            selectedTeam === 'SBI' ? { label: 'Picked/Not Picked', value: `${reportStats.totalPicked} / ${reportStats.totalNotPicked}` } : { label: 'Total Converted', value: reportStats.totalConverted },
                            selectedTeam === 'SBI' ? { label: 'Total Approved', value: reportStats.totalApproved } : { label: 'Achievement', value: `${reportStats.avgTarget}%` },
                            { label: 'Active Members', value: reportStats.activeHrCount }

                        ].map((stat, i) => (
                            <div key={i} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px' }}>{stat.label}</span>
                                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '15%' }}>MEMBER</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '10%' }}>CALLS</th>
                                {selectedTeam === 'SBI' ? (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '15%' }}>VERIFIED</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '15%' }}>STATUS</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '10%' }}>DISPATCH</th>
                                    </>
                                ) : selectedTeam === 'BDE' ? (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '12%' }}>LEADS</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '12%' }}>JOINEES</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '16%' }}>WORK DETAILS</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '15%' }}>CONV (SEC)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '15%' }}>PAID (SEC)</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '10%' }}>COMPL</th>
                                    </>
                                )}
                                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '20%' }}>COMMENTS</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #cbd5e1', fontSize: '11px', color: '#475569', width: '8%' }}>TARGET%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportRows.map((row, i) => (
                                <tr key={i}>
                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '12px' }}>{row.name || 'Member'}</div>
                                        <div style={{ fontSize: '10px', color: '#64748b' }}>{row.designation}</div>
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                        <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '13px' }}>{row.aggCalls || 0}</div>
                                        {selectedTeam === 'SBI' && (
                                            <div style={{ fontSize: '9px', display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '2px' }}>
                                                <span style={{ color: '#059669' }}>P:{row.aggPicked || 0}</span>
                                                <span style={{ color: '#dc2626' }}>M:{row.aggNotPicked || 0}</span>
                                            </div>
                                        )}
                                    </td>

                                    {selectedTeam === 'SBI' ? (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#334155', fontSize: '11px' }}>PAN: <strong>{row.aggPAN || 0}</strong></div>
                                                <div style={{ color: '#7c3aed', fontSize: '11px' }}>Det: <strong>{row.aggDetails || 0}</strong></div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#059669', fontSize: '11px' }}>Appr: <strong>{row.aggApproved || 0}</strong></div>
                                                <div style={{ color: '#dc2626', fontSize: '11px' }}>Decl: <strong>{row.aggDeclined || 0}</strong></div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>{row.aggDispatch || 0}</div>
                                                <div style={{ fontSize: '9px', color: '#64748b' }}>Items</div>
                                            </td>
                                        </>
                                    ) : selectedTeam === 'BDE' ? (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '13px' }}>{row.aggConverted || 0}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '13px' }}>{row.aggPaid || 0}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '11px' }}>{row.companyName || '-'}</div>
                                                <div style={{ fontSize: '9px', color: '#64748b' }}>{row.rolePosition || '-'}</div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '13px' }}>{row.aggConverted || 0}</div>
                                                <div style={{ fontSize: '9px', color: '#64748b' }}>{row.aggConvSector || '-'}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '13px' }}>{row.aggPaid || 0}</div>
                                                <div style={{ fontSize: '9px', color: '#64748b' }}>{row.aggPaidSector || '-'}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '13px' }}>{row.aggComplaints || 0}</div>
                                                <div style={{ fontSize: '9px', color: '#64748b' }}>{row.aggCompReason || '-'}</div>
                                            </td>
                                        </>
                                    )}

                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', fontSize: '10px', color: '#475569' }}>
                                        {row.aggComments && row.aggComments !== '-' ? row.aggComments : ''}
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', color: '#334155' }}>
                                        {row.aggTarget || 0}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '50px', borderTop: '2px solid #6366f1', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                            &copy; {new Date().getFullYear()} Forge India Connect Management Hub.
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Report Drafted By:</p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#6366f1', fontWeight: 'bold' }}>{user.name}</p>
                            <p style={{ margin: '1px 0 0 0', fontSize: '11px', color: '#64748b' }}>{user.designation}</p>
                        </div>
                    </div>

                </div>
            </div>

            {isUpdateModalOpen && (
                <StatsEntryModal user={user} member={selectedMember} onClose={() => setIsUpdateModalOpen(false)} onSave={handleSaveStats} />
            )}


            {isAddModalOpen && (
                <AddMemberModal 
                    onClose={() => setIsAddModalOpen(false)} 
                    onSave={handleAddMember} 
                    defaultTeam={selectedTeam} 
                />
            )}
        </div>
    );
};

export default Dashboard;
