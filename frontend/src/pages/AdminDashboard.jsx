import { Button } from "../components/Button";
import "../styles/enterprise.css";
// src/pages/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardIcon as Icon } from "../components/DashboardIcon";
import conference from "../assets/community-conference.jpg";
import axios from "../api/axios"; // your axios instance

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState('');
  const [kpiLoading, setKpiLoading] = useState(true);
  const [kpiError, setKpiError] = useState('');
  const [kpis, setKpis] = useState({
    totalUsers: 0,
    totalEvents: 0,
    participationCounts: [],
  });

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const token =
    localStorage.getItem("token") ||
    (localStorage.getItem("user") &&
      JSON.parse(localStorage.getItem("user")).token);

  // ✅ FIXED: Removed extra "/api"
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const res = await axios.get("/analytics/kpis", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setKpis(res.data || {});
      } catch (err) {
        setKpiError('Overview totals could not be loaded.');
      } finally {
        setKpiLoading(false);
      }
    };
    fetchKpis();
  }, [token]);

  // ✅ FIXED: Removed extra "/api"
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/admin/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (mounted) setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
    const id = setInterval(fetchNotifications, 5000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        "/admin/notifications/mark-read",
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // locally mark read
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error("Error marking notifications read", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    window.location.href = "/login";
  }
  useEffect(() => {
    let mounted = true;
    axios.get("/admin/events", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { if (mounted) setEvents(Array.isArray(res.data) ? res.data : []); })
      .catch(() => { if (mounted) setEventError('Events could not be loaded.'); })
      .finally(() => { if (mounted) setEventLoading(false); });
    return () => { mounted = false; };
  }, [token]);
  const counts = Array.isArray(kpis.participationCounts) ? kpis.participationCounts : [];
  const total = counts.reduce((sum, row) => sum + (Number(row.count) || 0), 0);
  const pending = counts.find(row => row._id === 'Pending')?.count || 0;
  const nextEvents = events.filter(event => event.status !== 'Completed')
    .sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
  const nav = [ ['grid','Overview','/admin'], ['calendar','Events','/admin/events'], ['users','People','/admin/users'], ['check','Participants','/admin/participants'], ['chart','Analytics','/admin/analytics'] ];
  const formatDate = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString(undefined, {month:'short',day:'numeric',year:'numeric'});
  };
  return <div className="eh-screen eh-command">
    <aside className="ec-sidebar">
      <div className="ec-brand"><span className="ec-brand-mark"><Icon name="calendar"/></span><div>Event Hub<small>ENTERPRISE WORKSPACE</small></div></div>
      <span className="ec-nav-label">WORKSPACE</span>
      <nav aria-label="Dashboard navigation">{nav.map(([icon,label,path]) => <Button key={path} className={`ec-nav ${path === '/admin' ? 'ec-nav-active' : ''}`} onClick={() => navigate(path)}><Icon name={icon}/>{label}{label==='Overview' && <span className="ec-active-dot"/>}</Button>)}</nav>
      <div className="ec-sidebar-bottom"><span className="ec-avatar">A</span><div>Administrator<small>Workspace admin</small></div></div>
      <Button className="ec-nav ec-logout" onClick={handleLogout}><Icon name="logout"/>Sign out</Button>
    </aside>
    <div className="ec-main">
      <header className="ec-topbar"><span>Workspace <span className="ec-separator">/</span> <strong>Overview</strong></span><div className="ec-top-actions"><span className="ec-live"><i/> Workspace overview</span><div className="ec-notification-wrap"><Button className="ec-icon-button" aria-label="Notifications" aria-expanded={showNotifications} onClick={() => setShowNotifications(value=>!value)}><Icon name="bell"/>{unreadCount>0 && <span className="ec-notification-count">{unreadCount}</span>}</Button>{showNotifications && <div className="ec-notifications"><div className="ec-section-heading"><h2>Notifications</h2><Button className="ec-link" onClick={handleMarkAllRead}>Mark all read</Button></div>{notifications.length===0 ? <p>No notifications yet.</p> : notifications.map(n=><article key={n._id}><p>{n.message}</p><small>{formatDate(n.createdAt)}</small></article>)}</div>}</div><span className="ec-avatar">A</span></div></header>
      <main className="ec-content">
        <div className="ec-heading"><div><span className="ec-eyebrow">YOUR WORKSPACE, AT A GLANCE</span><h1>Admin Dashboard<span className="ec-title-dot">.</span></h1><p>Events, people, and participation.</p></div><Button className="ec-primary" onClick={()=>navigate('/admin/create-event')}><Icon name="plus"/>Create event</Button></div>
        {kpiError && <p role="alert" className="ec-error">{kpiError}</p>}
        <div className="ec-stats">{[
          ['users','Total users',kpis.totalUsers,'Workspace members','people'],
          ['calendar','Total events',kpis.totalEvents,'Across your workspace','events'],
          ['check','Participations',total,'All registration statuses','participations'],
          ['clock','Pending approvals',pending,'Awaiting a decision','pending'],
        ].map(([icon,label,value,caption,role])=><article className={`ec-stat ec-stat-${role}`} key={label}><div className="ec-stat-label"><span>{label}</span><span className="ec-stat-icon"><Icon name={icon}/></span></div><strong>{kpiLoading ? '—' : kpiError ? '—' : value ?? 0}</strong><small>{caption}</small></article>)}</div>
        <div className="ec-main-grid">
          <section className="ec-events-section"><div className="ec-section-heading"><div><span className="ec-eyebrow">ON THE SCHEDULE</span><h2>Upcoming & ongoing events</h2></div><Button className="ec-link" onClick={()=>navigate('/admin/events')}>All events<Icon name="arrow"/></Button></div>
            {eventLoading ? <p className="ec-empty">Loading events…</p> : eventError ? <p role="alert" className="ec-error">{eventError}</p> : nextEvents.length===0 ? <div className="ec-empty"><Icon name="calendar"/><h3>No upcoming events</h3><Button className="ec-link" onClick={()=>navigate('/admin/create-event')}>Create event<Icon name="plus"/></Button></div> : <div className="ec-event-list">{nextEvents.map(event=>{
              const approved = (event.participants || []).filter(p=>p.status==='Approved').length;
              const capacity = Number(event.maxParticipants);
              return <article className="ec-event-row" key={event._id}><div className="ec-date-block"><Icon name="calendar"/><span>{formatDate(event.date).split(',')[0]}</span></div><div className="ec-event-info"><span className={`ec-status ec-status-${event.status?.toLowerCase() || 'upcoming'}`}>{event.status || 'Upcoming'}</span><h3>{event.title}</h3><div className="ec-event-meta"><span><Icon name="pin"/>{event.location || 'Location unavailable'}</span><span><Icon name="users"/>{capacity ? `${approved} / ${capacity} confirmed` : `${approved} confirmed`}</span></div>{capacity>0 && <progress aria-label={`${event.title} capacity`} value={approved} max={capacity}/>}</div><Button className="ec-icon-button ec-event-open" aria-label={`Participants for ${event.title}`} title="View participants" onClick={()=>navigate(`/admin/events/${event._id}/participants`)}><Icon name="arrow"/></Button></article>;
            })}</div>}
            <div className="ec-photo-strip"><img src={conference} alt="An audience gathered at a conference"/><div><span>PEOPLE. IDEAS. EXPERIENCES.</span><strong>Make room for what’s next.</strong></div><Button className="ec-photo-button" aria-label="Create an event" title="Create an event" onClick={()=>navigate('/admin/create-event')}><Icon name="plus"/></Button></div>
          </section>
          <div className="ec-right-column"><section className="ec-participation"><div className="ec-section-heading"><div><span className="ec-eyebrow">REGISTRATIONS</span><h2>Participation breakdown</h2></div><Icon name="chart"/></div>{kpiLoading ? <p>Loading registrations…</p> : kpiError ? <p>Registration totals unavailable.</p> : counts.length===0 ? <p className="ec-empty">No registrations yet.</p> : <div className="ec-breakdown">{counts.map(row=><div key={row._id}><div><span><i className={`ec-dot ec-dot-${String(row._id).toLowerCase()}`}/>{row._id}</span><strong>{row.count}</strong></div><progress aria-label={`${row._id} registrations`} value={Number(row.count)||0} max={total || 1}/></div>)}</div>}<Button className="ec-link" onClick={()=>navigate('/admin/analytics')}>Open analytics<Icon name="arrow"/></Button></section>
          <section className="ec-activity"><div className="ec-section-heading"><div><span className="ec-eyebrow">LATEST UPDATES</span><h2>Recent activity</h2></div><Icon name="bell"/></div>{notifications.length===0 ? <p className="ec-empty">No recent activity.</p> : notifications.slice(0,4).map(n=><article key={n._id}><span className="ec-activity-icon"><Icon name="check"/></span><div><p>{n.message}</p><small>{formatDate(n.createdAt)}</small></div></article>)}</section></div>
        </div><footer className="ec-footer"><span>Event Hub / Enterprise Workspace</span><span>Administrator overview</span></footer>
      </main>
    </div>
  </div>;
}
