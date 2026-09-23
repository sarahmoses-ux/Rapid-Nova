import { useEffect, useState } from 'react';
import { api, placements } from './api';

export function Submission({ item, onAuthError, onSaved }) {
  const [status, setStatus] = useState(item.status), [notes, setNotes] = useState(item.notes), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const data = item.data;
  useEffect(() => { setStatus(item.status); setNotes(item.notes); }, [item.status, item.notes]);
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try { await api(`/admin/submissions/${item.id}`, { method: 'PATCH', body: { status, notes } }); onSaved({ status, notes }); setMessage('Changes saved.'); }
    catch (err) { if (err.status === 401) onAuthError(); else setMessage(err.message); } finally { setBusy(false); }
  }
  return <article className="submission-card"><div className="vacancy-heading"><div><span className="kicker">{item.kind}</span><h3>{data.name}</h3></div><div className="submission-meta"><span className={`status-badge status-${item.status}`}>{item.status}</span><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</time></div></div><p className="submission-preview">{data.role || data.facility || "General enquiry"}{data.location && <> · {data.location}</>}</p><details className="submission-review"><summary>Review submission <span>Details &amp; notes →</span></summary><dl className="submission-details">{Object.entries(data).filter(([key]) => !['consent', 'consentAt', 'consentVersion', 'name', 'message', 'jobId'].includes(key)).map(([key, value]) => <div key={key}><dt>{({ jobTitle: 'Vacancy', headcount: 'Professionals needed' })[key] || key}</dt><dd>{key === 'email' ? <a className="text-link" href={`mailto:${value}`}>{value}</a> : String(value)}</dd></div>)}</dl>{data.message && <p className="preserve-lines">{data.message}</p>}<p className="reference">Reference: {item.id}</p>{item.cv_name && <a className="text-link" href={`/api/admin/submissions/${item.id}/cv`}>Download CV (PDF)</a>}<form onSubmit={save}><fieldset disabled={busy}><div className="form-grid"><label className="form-field"><span>Status</span><select className="field" value={status} onChange={event => setStatus(event.target.value)}>{['new', 'reviewing', 'contacted', 'placed', 'closed'].map(value => <option key={value}>{value}</option>)}</select></label><label className="form-field"><span>Internal notes</span><textarea className="field" value={notes} rows="2" maxLength={10000} onChange={event => setNotes(event.target.value)} /></label></div><button className="btn btn-capri" type="submit">{busy ? 'Saving…' : 'Save Changes'}</button></fieldset><p role="status">{message}</p></form></details></article>;
}

export function JobEditor({ job, onSaved, onCancel, onAuthError }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); const input = new FormData(event.currentTarget), values = Object.fromEntries(input); values.active = input.get('active') === 'on'; setBusy(true); setError('');
    try { await api(job ? `/admin/jobs/${job.id}` : '/admin/jobs', { method: job ? 'PATCH' : 'POST', body: values }); onSaved(); }
    catch (err) { if (err.status === 401) onAuthError(); else setError(err.message); } finally { setBusy(false); }
  }
  return <form className="workflow-form" onSubmit={submit}><h3>{job ? 'Edit Vacancy' : 'Create Vacancy'}</h3><fieldset disabled={busy}><div className="form-grid"><label className="form-field"><span>Job title *</span><input className="field" name="title" defaultValue={job?.title} required maxLength={200} /></label><label className="form-field"><span>Location *</span><input className="field" name="location" defaultValue={job?.location} required maxLength={200} /></label><label className="form-field"><span>Placement *</span><select className="field" name="placement" defaultValue={job?.placement}>{placements.map(value => <option key={value}>{value}</option>)}</select></label></div><label className="form-field"><span>Description and requirements *</span><textarea className="field" name="description" defaultValue={job?.description} required maxLength={10000} rows="6" /></label><label className="consent"><input name="active" type="checkbox" defaultChecked={job ? !!job.active : true} /> Published on the website</label><div className="actions"><button className="btn btn-capri" type="submit">{busy ? 'Saving…' : 'Save Vacancy'}</button><button className="btn" type="button" onClick={onCancel}>Cancel</button></div></fieldset>{error && <p className="form-error" role="alert">{error}</p>}</form>;
}

