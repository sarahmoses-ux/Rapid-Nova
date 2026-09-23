import { useEffect, useRef, useState } from 'react';
import { api, placements } from './api';

function Field({ label, name, type = 'text', required = true, ...props }) {
  return <label className="form-field"><span>{label}{required && ' *'}</span><input className="field" name={name} type={type} required={required} maxLength={200} {...props} /></label>;
}
function Consent() {
  return <><label className="consent"><input type="checkbox" name="consent" required /> <span>I agree that Rapid Nova may use the information I submit to review and contact me about this request.</span></label><label className="form-trap" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label></>;
}
function Feedback({ result, error }) {
  return <>{error && <p className="form-error" role="alert">{error}</p>}{result && <div className="form-success" role="status"><strong>Thank you. Your submission has been received.</strong><p>Keep your reference: <span className="reference">{result.id}</span></p><p>Our team can now review your details.</p></div>}</>;
}
async function readCV(file) {
  if (!file?.size || file.size > 3 * 1024 * 1024 || !/\.pdf$/i.test(file.name)) throw new Error('Choose a PDF CV under 3 MB.');
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result.split(',')[1]); reader.onerror = () => reject(new Error('Unable to read your CV. Please select it again.')); reader.readAsDataURL(file);
  });
  return { name: file.name, base64 };
}

export function ApplicationForm({ job, onClearJob }) {
  const [busy, setBusy] = useState(false), [result, setResult] = useState(null), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget, data = new FormData(form);
    setBusy(true); setError(''); setResult(null);
    try {
      const payload = Object.fromEntries(data); payload.consent = data.get('consent') === 'on'; payload.cv = await readCV(data.get('cv')); if (job) payload.jobId = job.id;
      const saved = await api('/applications', { method: 'POST', body: payload });
      setResult(saved); form.reset(); onClearJob();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <section className="application-section" id="apply"><div className="wrap"><div className="section-head"><span className="kicker">Take the next step</span><h2>Apply with Rapid Nova</h2><p>Share your experience and a PDF CV. You can apply for a vacancy or submit a general application.</p></div><form className="workflow-form" onSubmit={submit}>
    {job && <div className="selected-job"><strong>Applying for {job.title} · {job.location}</strong><button type="button" onClick={onClearJob}>Switch to a general application</button></div>}
    <fieldset disabled={busy}><div className="form-grid"><Field label="Full name" name="name" autoComplete="name" maxLength={120} /><Field label="Email address" name="email" type="email" autoComplete="email" maxLength={254} /><Field label="Phone number" name="phone" type="tel" autoComplete="tel" required={false} maxLength={50} /><Field label="Preferred location" name="location" /><Field key={job?.id || 'general'} label="Role or specialty" name="role" defaultValue={job?.title || ''} /><Field label="Your CV (PDF, maximum 3 MB)" name="cv" type="file" accept=".pdf,application/pdf" /></div><label className="form-field"><span>Tell us about your experience or availability</span><textarea className="field" name="message" rows="4" maxLength={5000} /></label><Consent /><button className="btn btn-capri" type="submit">{busy ? 'Submitting application…' : 'Submit Application'}</button></fieldset>
    <Feedback result={result} error={error} />
  </form></div></section>;
}

export function ContactForms() {
  const [kind, setKind] = useState('staffing'), [busy, setBusy] = useState(false), [result, setResult] = useState(null), [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault(); const form = event.currentTarget, data = new FormData(form), payload = Object.fromEntries(data);
    payload.consent = data.get('consent') === 'on'; if (kind === 'staffing') payload.headcount = Number(payload.headcount);
    setBusy(true); setError(''); setResult(null);
    try { setResult(await api(kind === 'staffing' ? '/staffing-requests' : '/contact', { method: 'POST', body: payload })); form.reset(); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <section className="contact-section" id="contact"><div className="wrap"><div className="section-head"><span className="kicker">Let’s work together</span><h2>Tell us how we can help</h2><p>Request healthcare staff or send a message directly to our team.</p></div><div className="form-tabs" aria-label="Enquiry type">{[['staffing', 'Request Staff'], ['contact', 'General Enquiry']].map(([value, label]) => <button key={value} className={kind === value ? 'active' : ''} type="button" disabled={busy} aria-pressed={kind === value} onClick={() => { setKind(value); setResult(null); setError(''); }}>{label}</button>)}</div><form className="workflow-form" onSubmit={submit} key={kind}><fieldset disabled={busy}><div className="form-grid"><Field label="Your name" name="name" autoComplete="name" maxLength={120} /><Field label="Email address" name="email" type="email" autoComplete="email" maxLength={254} /><Field label="Phone number" name="phone" type="tel" autoComplete="tel" required={false} maxLength={50} />{kind === 'staffing' && <><Field label="Facility or organisation" name="facility" autoComplete="organization" /><Field label="Role needed" name="role" /><Field label="Facility location" name="location" /><label className="form-field"><span>Placement type *</span><select className="field" name="placement" required>{placements.map(item => <option key={item}>{item}</option>)}</select></label><Field label="Number of professionals" name="headcount" type="number" min="1" max="1000" defaultValue="1" /></>}</div><label className="form-field"><span>{kind === 'staffing' ? 'Schedule, start date, or other requirements' : 'Your message *'}</span><textarea className="field" name="message" rows="4" maxLength={5000} required={kind === 'contact'} /></label><Consent /><button className="btn btn-capri" type="submit">{busy ? 'Sending…' : kind === 'staffing' ? 'Submit Staffing Request' : 'Send Message'}</button></fieldset><Feedback result={result} error={error} /></form></div></section>;
}

export function JobBoard({ keyword, setKeyword, keywordRef, onApply }) {
  const [location, setLocation] = useState(''), [jobs, setJobs] = useState([]), [busy, setBusy] = useState(true), [error, setError] = useState('');
  const request = useRef(null);
  async function search(q = '', place = '') {
    request.current?.abort(); const controller = new AbortController(); request.current = controller;
    setBusy(true); setError('');
    try { const result = await api(`/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(place)}`, { signal: controller.signal }); setJobs(result.jobs); }
    catch (err) { if (err.name !== 'AbortError') setError(err.message); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }
  useEffect(() => { search(); return () => request.current?.abort(); }, []);
  return <div id="jobs"><form className="wrap search-panel" onSubmit={event => { event.preventDefault(); search(keyword, location); }}><input className="field" ref={keywordRef} aria-label="Healthcare role or specialty" placeholder="Healthcare role or specialty" value={keyword} onChange={event => setKeyword(event.target.value)} maxLength={200} /><input className="field" aria-label="Preferred location" placeholder="Preferred location" value={location} onChange={event => setLocation(event.target.value)} maxLength={200} /><button className="btn btn-capri" type="submit" disabled={busy}>{busy ? 'Loading…' : 'Search Vacancies'}</button></form><div className="wrap vacancies"><div className="vacancy-heading"><h2>Current opportunities</h2><a className="text-link" href="#apply" onClick={() => onApply(null)}>Submit a general application →</a></div>{error ? <p className="form-error" role="alert">{error} <button type="button" onClick={() => search(keyword, location)}>Retry</button></p> : busy ? <p role="status">Loading vacancies…</p> : jobs.length ? <div className="cards">{jobs.map(job => <article className="card" key={job.id}><span className="kicker">{job.placement}</span><h3>{job.title}</h3><p>{job.location}</p><p className="job-description">{job.description}</p><a href="#apply" onClick={() => onApply(job)}>Apply for this role →</a></article>)}</div> : <div className="empty-state"><h3>No matching vacancies are listed right now.</h3><p>Send a general application so our team can consider your experience for future opportunities.</p><a className="text-link" href="#apply" onClick={() => onApply(null)}>Apply with your CV →</a></div>}</div></div>;
}
