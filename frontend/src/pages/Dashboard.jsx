import React, { useEffect, useState, useRef } from 'react';
import { Phone, Users, MessageSquare, TrendingUp, CheckCircle, Target, Briefcase, User, DollarSign, AlertTriangle, Edit3, UserPlus, Download, FileText, Clock, ShieldCheck, FileCheck, Truck, ThumbsUp, ThumbsDown, Trash2, ArrowLeft, Sun, Moon, Plus } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';
import { fetchMembers, updateMember, createMember, deleteMember, fetchTeams, deleteTeam, createTeam, getAdminActivity, saveAdminActivity, seedData } from '../api/api';
import StatsEntryModal from '../components/StatsEntryModal';
import AddMemberModal from '../components/AddMemberModal';
import AddTeamModal from '../components/AddTeamModal';
import AddUserModal from '../components/AddUserModal';
import TeamPerformanceChart from '../components/TeamPerformanceChart';

const Dashboard = ({ 
    viewMode = 'overview', 
    selectedTeam, 
    setSelectedTeam, 
    user, 
    theme, 
    toggleTheme,
    isAddTeamModalOpen,
    setIsAddTeamModalOpen,
    isAddModalOpen,
    setIsAddModalOpen
}) => {
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
    const [teams, setTeams] = useState([]);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
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
                
                const filteredHistory = data.map(m => {
                    const entries = (m.performanceHistory || []).filter(h => {
                        const hDate = new Date(h.date).toISOString().split('T')[0];
                        return hDate >= startDate && hDate <= endDate;
                    });
                    return { ...m, currentHistory: entries };
                });

                const totalCalls = filteredHistory.reduce((acc, m) => acc + m.currentHistory.reduce((s, h) => s + (h.calls || 0), 0), 0);
                const totalConverted = filteredHistory.reduce((acc, m) => acc + m.currentHistory.reduce((s, h) => s + (h.convertedCalls || 0), 0), 0);
                
                const avgTarget = filteredHistory.length > 0 ? Math.round(filteredHistory.reduce((acc, m) => {
                    if (m.currentHistory.length === 0) return acc;
                    const hAcc = m.currentHistory.reduce((s, h) => s + ((h.completedTarget || 0) / (h.dailyTarget || 1) * 100), 0);
                    return acc + (hAcc / m.currentHistory.length);
                }, 0) / filteredHistory.length) : 0;
                
                setStats({
                    totalCalls,
                    totalConverted,
                    avgTarget,
                    activeHrCount: data.length
                });
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const getTeams = async () => {
        try {
            const data = await fetchTeams();
            if (data) {
                setTeams(data);
            }
        } catch (err) {
            console.error('Failed to fetch teams:', err);
        }
    };

    useEffect(() => {
        getStats();
        getTeams();
        if (selectedTeam === 'Administration') getAdminLog();
    }, [selectedTeam, startDate, endDate, selectedDate]); 

    const getAdminLog = async () => {
        try {
            const data = await getAdminActivity(selectedDate);
            if (data) {
                setAdminComment(data.content || '');
            }
        } catch (err) {
            console.error('Failed to fetch admin log:', err);
            setAdminComment('');
        }
    };

    const handleAdminSubmit = async () => {
        if (!adminComment.trim()) return toast.error('Please enter activity highlights');
        
        setIsAdminSubmitting(true);
        try {
            await saveAdminActivity(adminComment, selectedDate);
            toast.success('Activity Log saved successfully!');
            // Automatically redirect to Global Overview after 1.5s
            setTimeout(() => {
                setSelectedTeam('All');
            }, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Error saving activity log';
            toast.error(errorMsg);
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
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return members.map(m => {
            const history = (m.performanceHistory || []).filter(h => {
                const d = new Date(h.date);
                return d >= start && d <= end;
            });
            
            const getUnique = (arr, key) => {
                const unique = [...new Set(arr.map(h => h[key]).filter(v => v && v !== '-'))];
                return unique.length > 0 ? unique.join(', ') : '-';
            };

            return {
                _id: m._id,
                name: m.name,
                designation: m.designation,
                aggCalls: history.reduce((s, h) => s + (h.calls || 0), 0),
                aggConverted: history.reduce((s, h) => s + (h.convertedCalls || 0), 0),
                aggVisits: history.reduce((s, h) => s + (h.officeVisits || 0), 0),
                aggInterview: history.reduce((s, h) => s + (h.underInterview || 0), 0),
                aggPayment: history.reduce((s, h) => s + (h.paymentProgress || 0), 0),
                aggPartial: history.reduce((s, h) => s + (h.partialPaid || 0), 0),
                aggJoined: history.reduce((s, h) => s + (h.joinedCompany || 0), 0),
                aggRNR: history.reduce((s, h) => s + (h.rnr || 0), 0),
                aggOD: history.reduce((s, h) => s + (h.od || 0), 0),
                aggProcessing: history.reduce((s, h) => s + (h.cardProcessing || 0), 0),
                aggReceived: history.reduce((s, h) => s + (h.cardReceived || 0), 0),
                aggInsConverted: history.reduce((s, h) => s + (h.insuranceConverted || 0), 0),
                aggInsPartial: history.reduce((s, h) => s + (h.partialPaymentDone || 0), 0),
                aggInsFull: history.reduce((s, h) => s + (h.fullyPaid || 0), 0),
                aggComments: getUnique(history, 'comments'),
                aggTarget: history.length > 0 
                    ? Math.round(history.reduce((s, h) => s + ((h.completedTarget || 0) / (h.dailyTarget || 1) * 100), 0) / history.length) 
                    : 0
            };
        });
    };

    const reportRows = getReportRows();

    const getReportStats = (rows) => {
        return {
            totalCalls: rows.reduce((s, r) => s + (r.aggCalls || 0), 0),
            totalConverted: rows.reduce((s, r) => s + (r.aggConverted || 0), 0),
            avgTarget: rows.length > 0 ? Math.round(rows.reduce((s, r) => s + (r.aggTarget || 0), 0) / rows.length) : 0,
            activeHrCount: rows.length
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

    const handleAddTeam = async (newTeamData) => {
        try {
            await createTeam(newTeamData);
            toast.success('Team created successfully!');
            setIsAddTeamModalOpen(false);
            getTeams();
        } catch (err) {
            console.error('Failed to create team:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error creating team';
            toast.error(errorMsg);
        }
    };

    const handleSeedData = async () => {
        const loadingToast = toast.loading('Seeding portal data...');
        try {
            await seedData();
            toast.success('Portal seeded with test data!', { id: loadingToast });
            getStats();
            getTeams();
        } catch (err) {
            console.error('Seed failed:', err);
            toast.error('Failed to seed data', { id: loadingToast });
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

    const handleDeleteTeam = async (id, name) => {
        if (name === 'All' || name === 'Administration') return toast.error('Standard system units cannot be deleted.');
        
        toast.custom((t) => (
            <div className={`custom-confirm-toast ${t.visible ? 'animate-enter' : 'animate-leave'} glass`}>
                <div className="confirm-content">
                    <div className="confirm-icon delete-icon-bg">
                        <Trash2 size={20} />
                    </div>
                    <div className="confirm-text">
                        <h4>Delete Department?</h4>
                        <p>Are you sure you want to delete the <strong>{name}</strong> team? This will remove the team from oversight but keep member data.</p>
                    </div>
                </div>
                <div className="confirm-actions">
                    <button className="confirm-btn cancel" onClick={() => toast.dismiss(t.id)}>Cancel</button>
                    <button 
                        className="confirm-btn confirm-delete" 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await deleteTeam(id);
                                toast.success(`${name} team deleted successfully`);
                                setSelectedTeam('All');
                                getTeams();
                                getStats();
                            } catch (err) {
                                console.error('Failed to delete team:', err);
                                toast.error(err.response?.data?.message || 'Error deleting team');
                            }
                        }}
                    >
                        Yes, Delete Team
                    </button>
                </div>
            </div>
        ), { duration: Infinity, position: 'top-center' });
    };


    const metricCards = selectedTeam === 'All' ? [
        { label: 'Network Total Calls', value: stats.totalCalls, icon: <Phone size={24} />, color: '#6366f1' },
        { label: 'Org-wide Conversions', value: stats.totalConverted, icon: <CheckCircle size={24} />, color: '#10b981' },
        { label: 'Global Target Avg', value: `${stats.avgTarget}%`, icon: <Target size={24} />, color: '#f59e0b' },
        { label: 'Total Personnel', value: stats.activeHrCount, icon: <Users size={24} />, color: '#a855f7' },
    ] : [
        { label: 'Total Calls (Live)', value: stats.totalCalls, icon: <Phone size={24} />, color: '#6366f1' },
        { label: 'Connected Calls', value: stats.totalConverted, icon: <CheckCircle size={24} />, color: '#10b981' },
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
                    {(selectedTeam !== 'Administration' && (user.role === 'Admin' || user.role === 'Manager')) && (
                        <div className="admin-controls glass" style={{ marginRight: '15px', display: 'flex', alignItems: 'center', background: 'var(--bg-glass)', padding: '5px 15px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                            <ShieldCheck size={16} style={{ color: '#6366f1', marginRight: '10px' }} />
                            <select 
                                value={selectedTeam} 
                                onChange={(e) => setSelectedTeam(e.target.value)} 
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '0.4rem 0.6rem',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem',
                                    fontWeight: '600',
                                    outline: 'none',
                                    cursor: 'pointer',
                                    width: 'auto',
                                    minWidth: '160px'
                                }}
                            >
                                <option value="All">Global Overview</option>
                                {teams.map(team => (
                                    <option key={team._id} value={team.name}>{team.name} Department</option>
                                ))}
                            </select>
                            {(selectedTeam !== 'All' && selectedTeam !== 'Administration') && (user.role === 'Admin' || user.role === 'Manager') && (
                                <button 
                                    className="delete-team-shortcut"
                                    onClick={() => {
                                        const teamObj = teams.find(t => t.name === selectedTeam);
                                        if (teamObj) handleDeleteTeam(teamObj._id, teamObj.name);
                                    }}
                                    title="Delete this team"
                                    style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        color: '#ef4444',
                                        padding: '4px',
                                        borderRadius: '6px',
                                        marginLeft: '5px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    )}
                    <div className="action-center-group" style={{ display: 'flex', gap: '12px' }}>
                        {(viewMode !== 'overview' || selectedTeam === 'Administration') && (
                            <div className="report-selector-group" style={{ display: 'flex', gap: '15px' }}>
                                <div className="report-controls">
                                    <FileText size={16} />
                                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                                        <option value="daily">Daily Report</option>
                                        <option value="weekly">Weekly Report</option>
                                        <option value="monthly">Monthly Report</option>
                                    </select>
                                </div>
                                <button 
                                    className="btn-primary" 
                                    onClick={selectedTeam === 'Administration' ? downloadAdminPDF : downloadTeamPDF}
                                >
                                    <Download size={18} />
                                    {selectedTeam === 'Administration' ? 'Executive Report' : 'Report'}
                                </button>
                            </div>
                        )}
                    </div>
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
                        <div className="admin-guidance-card glass" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                            padding: '15px 20px',
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            flex: 1
                        }}>
                            <ShieldCheck size={24} style={{ color: '#6366f1' }} />
                            <div>
                                <strong style={{ display: 'block', color: '#6366f1', marginBottom: '2px' }}>Administrative Policy</strong>
                                <p style={{ margin: 0, opacity: 0.8 }}>Access to management controls for teams and user accounts has been moved to the sidebar for better accessibility.</p>
                            </div>
                        </div>
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
                            {members.length > 0 ? (() => {
                                const sortedMembers = [...members].sort((a,b) => {
                                    const aRate = a.achievementRate || 0;
                                    const bRate = b.achievementRate || 0;
                                    return bRate - aRate;
                                });
                                const best = sortedMembers[0];
                                if (!best) return <p style={{ color: '#94a3b8' }}>No performance data available.</p>;

                                 return (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div className="best-performer-avatar" style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#6366f1', color: '#fff', display: 'flex', alignItems: 'center', justifySelf: 'center', fontSize: '1.5rem', fontWeight: 'bold', justifyContent: 'center' }}>
                                        {best.name ? String(best.name).charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, color: '#10b981', fontSize: '1.1rem' }}>
                                            ⭐ {best.name || 'Anonymous'}
                                        </h4>
                                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                                            Achieved <strong>{best.achievementRate || 0}%</strong> of target today.
                                        </p>
                                    </div>
                                </div>
                                );
;
                            })() : (
                                <p style={{ color: '#94a3b8' }}>No performance data available yet.</p>
                            )}
                        </div>
                    </div>

                    <TeamPerformanceChart members={members} theme={theme} />
                </>
            )}

            {/* Always show Management Table in Performance mode, OR also show it in Overview mode for Admin/Manager */}
            {(viewMode === 'performance' || ((user.role === 'Admin' || user.role === 'Manager') && viewMode === 'overview')) && (
                <section className="team-oversight glass animate-enter" style={{ marginTop: '2rem' }}>
                    <div className="section-header">
                        <h3>{selectedTeam === 'All' ? 'Organization-Wide' : selectedTeam} Management Oversight</h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {viewMode === 'overview' && (user.role === 'Admin' || user.role === 'Manager') && (
                                <button className="action-btn" onClick={() => (window.location.href = '#')} title="Deep Analytics Coming Soon">
                                    Full Analytics Preview
                                </button>
                            )}
                            <span className="live-pill">LIVE</span>
                        </div>
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
                                            <th>Calls (Conn)</th>
                                            {selectedTeam === 'SBI' ? (
                                                <>
                                                    <th>RNR / OD</th>
                                                    <th>Processing</th>
                                                    <th>Received</th>
                                                </>
                                            ) : selectedTeam === 'BDE' ? (
                                                <>
                                                    <th>Project</th>
                                                    <th>Visits</th>
                                                    <th>Interv/Paym</th>
                                                    <th>Part/Joined</th>
                                                </>
                                            ) : selectedTeam === 'Insurance' ? (
                                                <>
                                                    <th>RNR</th>
                                                    <th>Converted</th>
                                                    <th>Payments</th>
                                                </>
                                            ) : (
                                                <>
                                                    <th>Converted</th>
                                                    <th>Paid</th>
                                                    <th>Complaints</th>
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
                                    const history = member.performanceHistory || [];
                                    const latest = history.length > 0 ? history[history.length - 1] : {};
                                    return (
                                        <tr key={member._id}>
                                            <td>
                                                <div className="member-cell">
                                                    <div className="member-initial">{member.name ? String(member.name).charAt(0) : '?'}</div>
                                                    <div className="member-meta">
                                                        <span className="name">{member.name || 'N/A'}</span>
                                                        <span className="role">{member.designation || 'Staff'}</span>
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
                                                            <span className="category">({latest.convertedCalls || 0})</span>
                                                        </div>
                                                    </td>

                                                    {selectedTeam === 'SBI' ? (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <span className="count">{latest.rnr || 0}</span>
                                                                        <span className="count" style={{ color: '#a855f7' }}>{latest.od || 0}</span>
                                                                    </div>
                                                                    <span className="category">RNR / OD</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count" style={{ color: '#0ea5e9' }}>{latest.cardProcessing || 0}</span>
                                                                    <span className="category">Processing</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count" style={{ color: '#10b981' }}>{latest.cardReceived || 0}</span>
                                                                    <span className="category">Items</span>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : selectedTeam === 'BDE' ? (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="reason" style={{ fontSize: '0.75rem' }}>{member.project || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{latest.officeVisits || 0}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <span className="count">{latest.underInterview || 0}</span>
                                                                        <span className="count" style={{ color: '#f59e0b' }}>{latest.paymentProgress || 0}</span>
                                                                    </div>
                                                                    <span className="category">Int / Pay</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <span className="count" style={{ color: '#ec4899' }}>{latest.partialPaid || 0}</span>
                                                                        <span className="count" style={{ color: '#10b981' }}>{latest.joinedCompany || 0}</span>
                                                                    </div>
                                                                    <span className="category">Part / Join</span>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : selectedTeam === 'Insurance' ? (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{latest.rnr || 0}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count" style={{ color: '#10b981' }}>{latest.insuranceConverted || 0}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                                        <span className="count">{latest.partialPaymentDone || 0}</span>
                                                                        <span className="count" style={{ color: '#10b981' }}>{latest.fullyPaid || 0}</span>
                                                                    </div>
                                                                    <span className="category">Part / Full</span>
                                                                </div>
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{latest.convertedCalls || 0}</span>
                                                                    <span className="sector">{latest.conversionSector || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{latest.paidCount || 0}</span>
                                                                    <span className="sector">{latest.paidSector || '-'}</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="analytics-cell">
                                                                    <span className="count">{latest.totalComplaints || 0}</span>
                                                                    <span className="reason">{latest.complaintReason || '-'}</span>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ width: '60px', height: '60px', background: '#1e293b', color: '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold' }}>F</div>
                            <div>
                                <h1 style={{ margin: 0, color: '#1e293b', fontSize: '28px', textTransform: 'uppercase', letterSpacing: '1px' }}>Forge India Connect</h1>
                                <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '14px' }}>Professional Business Solutions & Recruitment</p>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, color: '#1e293b', fontWeight: 'bold', fontSize: '16px' }}>OFFICIAL PERFORMANCE REPORT</p>
                            <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '12px' }}>{startDate} to {endDate}</p>
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px', background: '#f8fafc', padding: '20px', borderRadius: '12px', borderLeft: '5px solid #1e293b' }}>
                        <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Executive Summary: {selectedTeam} Team</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                            This report provides a comprehensive performance analysis of the {selectedTeam} team during the period from <strong>{startDate}</strong> to <strong>{endDate}</strong>. 
                            The following data reflects individual and collective achievements against organizational targets.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                        {[
                            { label: 'Total Calls', value: reportStats.totalCalls },
                            { label: 'Avg Connections', value: reportStats.totalConverted },
                            { label: 'Achievement Rate', value: `${reportStats.avgTarget}%` },
                            { label: 'Team Size', value: reportStats.activeHrCount }

                        ].map((stat, i) => (
                            <div key={i} style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>{stat.label}</span>
                                <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e293b' }}>{stat.value}</span>
                            </div>
                        ))}
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #cbd5e1', tableLayout: 'fixed' }}>
                        <thead>
                            <tr style={{ background: '#1e293b' }}>
                                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '14%', textTransform: 'uppercase' }}>Member</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '8%', textTransform: 'uppercase' }}>Calls</th>
                                {selectedTeam === 'SBI' ? (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>RNR/OD</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '12%', textTransform: 'uppercase' }}>Processing</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Received</th>
                                    </>
                                ) : selectedTeam === 'BDE' ? (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Visits</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '12%', textTransform: 'uppercase' }}>Int/Pay</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Joined</th>
                                    </>
                                ) : selectedTeam === 'Insurance' ? (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '12%', textTransform: 'uppercase' }}>RNR</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '12%', textTransform: 'uppercase' }}>Converted</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Paid</th>
                                    </>
                                ) : (
                                    <>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Conv</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Paid</th>
                                        <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '10%', textTransform: 'uppercase' }}>Compl</th>
                                    </>
                                )}
                                <th style={{ padding: '12px 8px', textAlign: 'left', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '20%', textTransform: 'uppercase' }}>Comments</th>
                                <th style={{ padding: '12px 8px', textAlign: 'center', border: '1px solid #334155', fontSize: '10px', color: '#fff', width: '8%', textTransform: 'uppercase' }}>Target%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reportRows.map((row, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1' }}>
                                        <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '11px' }}>{row.name}</div>
                                        <div style={{ fontSize: '9px', color: '#64748b' }}>{row.designation}</div>
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                        <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}>{row.aggCalls}</div>
                                        <div style={{ fontSize: '9px', color: '#64748b' }}>({row.aggConverted})</div>
                                    </td>

                                    {selectedTeam === 'SBI' ? (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontSize: '11px' }}>RNR: <strong>{row.aggRNR}</strong></div>
                                                <div style={{ color: '#a855f7', fontSize: '11px' }}>OD: <strong>{row.aggOD}</strong></div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#0ea5e9', fontSize: '12px', fontWeight: 'bold' }}>{row.aggProcessing}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#10b981', fontSize: '12px', fontWeight: 'bold' }}>{row.aggReceived}</div>
                                            </td>
                                        </>
                                    ) : selectedTeam === 'BDE' ? (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}>{row.aggVisits}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontSize: '10px' }}>I: <strong>{row.aggInterview}</strong></div>
                                                <div style={{ color: '#f59e0b', fontSize: '10px' }}>P: <strong>{row.aggPayment}</strong></div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>{row.aggJoined}</div>
                                            </td>
                                        </>
                                    ) : selectedTeam === 'Insurance' ? (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}>{row.aggRNR}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px' }}>{row.aggInsConverted}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontSize: '10px' }}>P: <strong>{row.aggInsPartial}</strong></div>
                                                <div style={{ color: '#10b981', fontSize: '10px' }}>F: <strong>{row.aggInsFull}</strong></div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}>{row.aggConverted}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#1e293b', fontWeight: 'bold', fontSize: '12px' }}>{row.aggPaid}</div>
                                            </td>
                                            <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', textAlign: 'center' }}>
                                                <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>{row.aggComplaints}</div>
                                            </td>
                                        </>
                                    )}

                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', fontSize: '9px', color: '#475569' }}>
                                        {row.aggComments}
                                    </td>
                                    <td style={{ padding: '10px 8px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 'bold', textAlign: 'center', color: row.aggTarget >= 80 ? '#10b981' : '#f59e0b' }}>
                                        {row.aggTarget}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ marginTop: '50px', borderTop: '2px solid #1e293b', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                            &copy; {new Date().getFullYear()} Forge India Connect Management Hub.
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#1e293b' }}>Report Drafted By:</p>
                            <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#1e293b', fontWeight: 'bold' }}>{user.name}</p>
                            <p style={{ margin: '1px 0 0 0', fontSize: '11px', color: '#64748b' }}>{user.designation}</p>
                        </div>
                    </div>
                </div>
            </div>

            {isUpdateModalOpen && selectedMember && (
                <StatsEntryModal user={user} member={selectedMember} onClose={() => { setIsUpdateModalOpen(false); setSelectedMember(null); }} onSave={handleSaveStats} />
            )}

            {isAddTeamModalOpen && (
                <AddTeamModal
                    isOpen={isAddTeamModalOpen}
                    onClose={() => setIsAddTeamModalOpen(false)}
                    onAdd={handleAddTeam}
                    theme={theme}
                />
            )}

            {isAddModalOpen && (
                <AddMemberModal 
                    isOpen={isAddModalOpen} 
                    onClose={() => setIsAddModalOpen(false)} 
                    onAdd={handleAddMember}
                    defaultTeam={selectedTeam}
                    teams={teams}
                />
            )}

        </div>
    );
};

export default Dashboard;
