import { useEffect, useState } from 'react';
import { api, placements } from './api';

function Submission({ item, onAuthError }) {
  const [status, setStatus] = useState(item.status), [notes, setNotes] = useState(item.notes), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const data = item.data;
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await api(`/admin/submissions/${item.id}`, { method: 'PATCH', body: { status, notes } }); setMessage('Changes saved.'); }
    catch (err) { if (err.status === 401) onAuthError(); else setMessage(err.message); } finally { setBusy(false); }
  }
  return <article className="submission-card"><div className="vacancy-heading"><div><span className="kicker">{item.kind}</span><h3>{data.name}</h3></div><span>{new Date(item.created_at).toLocaleString()}</span></div><dl className="submission-details">{Object.entries(data).filter(([key]) => !['consent', 'consentAt', 'consentVersion', 'name', 'message', 'jobId'].includes(key)).map(([key, value]) => <div key={key}><dt>{({ jobTitle: 'Vacancy', headcount: 'Professionals needed' })[key] || key}</dt><dd>{key === 'email' ? <a className="text-link" href={`mailto:${value}`}>{value}</a> : String(value)}</dd></div>)}</dl>{data.message && <p className="preserve-lines">{data.message}</p>}<p className="reference">Reference: {item.id}</p>{item.cv_name && <a className="text-link" href={`/api/admin/submissions/${item.id}/cv`}>Download CV (PDF)</a>}<form onSubmit={save}><fieldset disabled={busy}><div className="form-grid"><label className="form-field"><span>Status</span><select className="field" value={status} onChange={event => setStatus(event.target.value)}>{['new', 'reviewing', 'contacted', 'placed', 'closed'].map(value => <option key={value}>{value}</option>)}</select></label><label className="form-field"><span>Internal notes</span><textarea className="field" value={notes} rows="2" maxLength={10000} onChange={event => setNotes(event.target.value)} /></label></div><button className="btn btn-capri" type="submit">{busy ? 'Saving…' : 'Save Changes'}</button></fieldset><p role="status">{message}</p></form></article>;
}

function JobEditor({ job, onSaved, onCancel, onAuthError }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); const input = new FormData(event.currentTarget), values = Object.fromEntries(input); values.active = input.get('active') === 'on'; setBusy(true); setError('');
    try { await api(job ? `/admin/jobs/${job.id}` : '/admin/jobs', { method: job ? 'PATCH' : 'POST', body: values }); onSaved(); }
    catch (err) { if (err.status === 401) onAuthError(); else setError(err.message); } finally { setBusy(false); }
  }
  return <form className="workflow-form" onSubmit={submit}><h3>{job ? 'Edit Vacancy' : 'Create Vacancy'}</h3><fieldset disabled={busy}><div className="form-grid"><label className="form-field"><span>Job title *</span><input className="field" name="title" defaultValue={job?.title} required maxLength={200} /></label><label className="form-field"><span>Location *</span><input className="field" name="location" defaultValue={job?.location} required maxLength={200} /></label><label className="form-field"><span>Placement *</span><select className="field" name="placement" defaultValue={job?.placement}>{placements.map(value => <option key={value}>{value}</option>)}</select></label></div><label className="form-field"><span>Description and requirements *</span><textarea className="field" name="description" defaultValue={job?.description} required maxLength={10000} rows="6" /></label><label className="consent"><input name="active" type="checkbox" defaultChecked={job ? !!job.active : true} /> Published on the website</label><div className="actions"><button className="btn btn-capri" type="submit">{busy ? 'Saving…' : 'Save Vacancy'}</button><button className="btn" type="button" onClick={onCancel}>Cancel</button></div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}</form>;
}

export default function Admin() {
  const [user, setUser] = useState(null), [checking, setChecking] = useState(true), [busy, setBusy] = useState(false), [error, setError] = useState(''), [tab, setTab] = useState('submissions'), [submissions, setSubmissions] = useState([]), [jobs, setJobs] = useState([]), [editor, setEditor] = useState(undefined), [page, setPage] = useState(1), [total, setTotal] = useState(0);
  function signedOut() { setUser(null); setSubmissions([]); setJobs([]); setEditor(undefined); setError('Please sign in to continue.'); }
  useEffect(() => { api('/admin/session').then(setUser).catch(err => { if (err.status !== 401) setError(err.message); }).finally(() => setChecking(false)); }, []);
  async function refresh() {
    setBusy(true); setError('');
    try { const [inbox, listings] = await Promise.all([api(`/admin/submissions?page=${page}`), api('/admin/jobs')]); setSubmissions(inbox.submissions); setTotal(inbox.total); setJobs(listings.jobs); }
    catch (err) { if (err.status === 401) signedOut(); else setError(err.message); } finally { setBusy(false); }
  }
  useEffect(() => { if (user) refresh(); }, [user, page]);
  async function login(event) {
    event.preventDefault(); setBusy(true); setError('');
    try { setUser(await api('/admin/login', { method: 'POST', body: Object.fromEntries(new FormData(event.currentTarget)) })); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  async function logout() {
    try { await api('/admin/logout', { method: 'POST' }); signedOut(); setError(''); }
    catch (err) { setError(err.message); }
  }
  return <main className="admin-page"><div className="wrap"><header className="admin-header"><div><a className="text-link" href="/">← Back to website</a><h1>Rapid Nova Admin</h1><p>Manage applications, enquiries, and vacancies.</p></div>{user && <button type="button" className="btn" onClick={logout}>Sign Out</button>}</header>{checking ? <p role="status">Checking your session…</p> : !user ? <form className="workflow-form admin-login" onSubmit={login}><h2>Team Sign In</h2><label className="form-field"><span>Email address</span><input className="field" name="email" type="email" required autoComplete="username" /></label><label className="form-field"><span>Password</span><input className="field" name="password" type="password" required maxLength={256} autoComplete="current-password" /></label><button className="btn btn-capri" disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign In'}</button></form> : <><div className="admin-toolbar"><div className="form-tabs"><button className={tab === 'submissions' ? 'active' : ''} onClick={() => setTab('submissions')}>Inbox ({total})</button><button className={tab === 'jobs' ? 'active' : ''} onClick={() => setTab('jobs')}>Vacancies ({jobs.length})</button></div><button className="btn" disabled={busy} onClick={refresh}>Refresh</button></div>{busy && <p role="status">Loading dashboard…</p>}{tab === 'submissions' ? <><div className="submission-list">{submissions.map(item => <Submission key={`${item.id}-${item.status}-${item.notes}`} item={item} onAuthError={signedOut} />)}</div>{!busy && !submissions.length && <p className="empty-state">No submissions yet. New applications and requests will appear here.</p>}<div className="pagination"><button className="btn" disabled={page === 1 || busy} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {Math.max(1, Math.ceil(total / 50))}</span><button className="btn" disabled={page * 50 >= total || busy} onClick={() => setPage(page + 1)}>Next</button></div></> : <>{editor !== undefined ? <JobEditor key={editor?.id || 'new'} job={editor} onAuthError={signedOut} onCancel={() => setEditor(undefined)} onSaved={() => { setEditor(undefined); refresh(); }} /> : <button className="btn btn-capri" onClick={() => setEditor(null)}>Create Vacancy</button>}<div className="submission-list">{jobs.map(job => <article className="submission-card" key={job.id}><span className="kicker">{job.active ? 'Published' : 'Unpublished'}</span><h3>{job.title}</h3><p>{job.location} · {job.placement}</p><button className="btn" onClick={() => setEditor(job)}>Edit Vacancy</button></article>)}</div>{!busy && !jobs.length && <p className="empty-state">No vacancies yet. Create one to publish it on the website.</p>}</>}</>}{error && <p className="form-error" role="alert">{error}</p>}</div></main>;
}
