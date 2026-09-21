import { useEffect, useRef, useState } from 'react';
import nurseTeam from './assets/nurse-team-hero.png';

function Header({ menuOpen, setMenuOpen, focusJobs }) {
  return (<header className="site-header">
    <div className="top"><div className="wrap"><nav className="top-links"><a href="#talent">Nurse Staffing Solutions</a><a href="#international">International Nurse Recruitment</a><a href="#resources">Resources</a><a href="#jobs">Nursing Jobs</a></nav><div className="top-tools"><button className="language" type="button" data-notice="English is currently selected.">EN⌄</button></div></div></div>
    <div className="wrap main-nav"><a className="brand" href="#top" aria-label="Rapid Nova home"><span className="brand-mark"><span>+</span></span><span>Rapid Nova<strong>+</strong><small>MEDICAL ENTERPRISE</small><span className="brand-tag">PEOPLE | CARE | A HEALTHIER TOMORROW</span></span></a><nav className={`main-actions${menuOpen ? " open" : ""}`} id="menu"><a href="#jobs">Find Nursing Jobs</a><a href="#talent">Hire Nurses</a><button className="login" type="button" data-notice="The nurse portal is being prepared. You can submit your nursing CV by email from the footer.">Nurse Portal</button><a href="#contact">Contact Us</a><a href="#pricing">Nurse Staffing Pricing</a><button className="search-button" onClick={focusJobs} type="button" aria-label="Search nursing jobs">⌕</button></nav><button className="mobile-btn" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} type="button" aria-label="Toggle menu" aria-controls="menu">☰</button></div>
    <nav className="nav-strip"><div className="wrap"><a href="#talent">Nurse Staffing Solutions</a><a href="#professionals">For Nurses</a><a href="#contact">For Healthcare Facilities</a></div></nav>
  </header>);
}

function Hero() {
  return (<section className="hero"><div className="wrap"><div className="hero-content"><span className="eyebrow">Nurse staffing, simplified</span><h1>Exceptional nurses.<br /><span>Right where you need them.</span></h1><p>Connecting skilled, compassionate nurses with healthcare facilities committed to exceptional patient care.</p><div className="actions"><a href="#jobs" className="btn btn-capri">Find Nursing Jobs →</a><a href="#talent" className="btn btn-outline">Hire Qualified Nurses</a></div><div className="trust"><span><b className="tick">✓</b> Credential-verified nurses</span><span><b className="tick">✓</b> Flexible nurse staffing</span></div></div></div></section>);
}

function NursingCareers() {
  return (<section id="professionals"><div className="wrap"><div className="section-head"><span className="kicker">Opportunities for nurses</span><h2>Nursing careers that fit your life</h2><p>Discover flexible shifts and long-term placements matched to your nursing credentials, experience and preferred care setting.</p></div><div className="cards"><article className="card"><div className="icon">✚</div><h3>Registered Nurses</h3><p>RN opportunities across hospitals, clinics, long-term care and other trusted facilities.</p><a href="#jobs" data-job="Registered Nurse">View RN jobs →</a></article><article className="card"><div className="icon">♡</div><h3>Licensed Practical Nurses</h3><p>LPN and LVN placements suited to your experience, schedule and preferred setting.</p><a href="#jobs" data-job="Licensed Practical Nurse">View LPN jobs →</a></article><article className="card"><div className="icon">⌂</div><h3>Travel &amp; Per Diem Nurses</h3><p>Flexible travel, temporary and per diem nursing opportunities when you want them.</p><a href="#jobs" data-job="Travel or Per Diem Nurse">View flexible nursing jobs →</a></article></div></div></section>);
}

function FacilityStaffing() {
  return (<section className="split" id="talent"><div className="wrap split-grid"><div className="photo"><img src={nurseTeam} alt="A diverse team of professional nurses" /><div className="stat"><b>24/7</b>Responsive nurse staffing support</div></div><div className="copy"><span className="kicker">For healthcare facilities</span><h2>Build the nursing team your patients deserve.</h2><p>From urgent shift coverage to permanent placements, Rapid Nova Medical Enterprise helps you secure qualified nurses without slowing down patient care.</p><div className="points"><div className="point"><span className="roundtick">✓</span><div><b>Credential-first nurse matching</b><span>Nurses screened for licensure, experience and readiness.</span></div></div><div className="point"><span className="roundtick">✓</span><div><b>Flexible nurse staffing options</b><span>Temporary, contract, per diem and direct-hire nursing support.</span></div></div><div className="point"><span className="roundtick">✓</span><div><b>A responsive staffing partner</b><span>Clear communication and timely support from request to nurse placement.</span></div></div></div><a href="#contact" className="btn btn-capri">Request Nursing Staff →</a></div></div></section>);
}

function About() {
  return (<section id="about"><div className="wrap"><div className="section-head"><span className="kicker">The Rapid Nova difference</span><h2>Nurse-first staffing. Better care.</h2><p>We bring qualified nurses and healthcare facilities together through a transparent, dependable process built around quality, fit and continuity of care.</p></div><div className="cards"><article className="card"><div className="icon">◎</div><h3>Purposeful matching</h3><p>Every nurse placement considers clinical needs, culture, experience and long-term fit.</p></article><article className="card"><div className="icon">◇</div><h3>Built on trust</h3><p>Responsible credential screening creates confidence for nurses and facilities.</p></article><article className="card"><div className="icon">↗</div><h3>Ready to scale</h3><p>Nurse staffing support that adapts from one urgent shift to ongoing workforce needs.</p></article></div></div></section>);
}

function Resources() {
  return (<section className="info-hub" id="resources"><div className="wrap"><div className="section-head"><span className="kicker">Information hub</span><h2>Nurse staffing information, clearly explained</h2><p>Learn about international nurse recruitment, staffing pricing and the application process.</p></div><div className="info-grid"><article className="info-card" id="international"><h3>International Nurse Recruitment</h3><p>Support for qualified nurses and healthcare facilities navigating international recruitment and direct-hire placement.</p><a className="text-link" href="mailto:hello@rapidnovamed.com?subject=International%20nurse%20recruitment%20enquiry">Ask about international nurse hiring →</a></article><article className="info-card" id="pricing"><h3>Nurse Staffing Pricing</h3><p>Staffing requirements vary by nursing role, schedule and placement type. Request a clear, tailored quote before making a commitment.</p><a className="text-link" href="mailto:hello@rapidnovamed.com?subject=Nurse%20staffing%20pricing%20request">Request transparent pricing →</a></article><article className="info-card" id="faq"><h3>Frequently Asked Questions</h3><p>Need help with nursing applications, licence requirements, visa types or staffing requests? Our team can guide you.</p><a className="text-link" href="mailto:hello@rapidnovamed.com?subject=Nurse%20staffing%20question">Ask a question →</a></article></div></div></section>);
}

function Contact() {
  return (<section className="cta" id="contact"><div className="wrap"><div><h2>Ready to make your next nursing connection?</h2><p>Tell us whether you are a nurse looking for your next role or a facility looking for qualified nurses.</p></div><div className="cta-actions"><a href="mailto:hello@rapidnovamed.com" className="btn btn-white">Talk to Our Team</a><a href="#jobs" className="btn btn-outline">Browse Nursing Jobs</a></div></div></section>);
}

function Footer() {
  return (<footer><div className="wrap"><div className="footer-grid">
    <div className="footer-brand"><a className="brand" href="#top"><span className="mark">+</span><span style={{ color: "white" }}>Rapid Nova Med+<small>MEDICAL ENTERPRISE</small></span></a><p>A nurse staffing partner connecting exceptional nurses with healthcare facilities committed to exceptional patient care.</p><div className="footer-controls"><button className="footer-language" type="button" data-notice="English is currently selected.">EN⌄</button><a className="meeting-button" href="mailto:hello@rapidnovamed.com?subject=Meeting%20request">Book a Meeting</a></div></div>
    <div><details className="footer-group" open><summary>Nurse Staffing Solutions</summary><div className="footer-links"><a href="#international">International Nurse Recruitment</a><a href="#about">Facilities We Serve</a><a href="#faq">Nurse &amp; Visa Requirements</a></div></details><div className="footer-title">For Nurses</div><div className="footer-links"><a href="#jobs">Search Nursing Jobs</a><a href="mailto:hello@rapidnovamed.com?subject=Nursing%20CV%20submission">Upload Your Nursing CV</a><a href="#faq">Nurse FAQs</a></div></div>
    <div><details className="footer-group"><summary>WorldWide Way</summary><div className="footer-links"><a href="#about">About Rapid Nova</a><a href="#about">Our Placement Process</a><a href="#international">International Nurse Recruitment</a></div></details><details className="footer-group"><summary>Resources</summary><div className="footer-links"><a href="#jobs">Nursing Opportunities</a><a href="#pricing">Facility Resources</a><a href="#faq">Frequently Asked Questions</a></div></details></div>
    <div><div className="footer-title">Connect With Us</div><div className="footer-links"><a href="mailto:hello@rapidnovamed.com">Contact Us</a><a href="mailto:hello@rapidnovamed.com?subject=Meeting%20request">Schedule a Meeting</a><a href="#talent">Find Talent</a><button type="button" data-notice="The privacy policy page is being prepared. Contact us with any privacy question.">Privacy Policy</button><button type="button" data-notice="The terms of use page is being prepared. Contact us with any terms question.">Terms of Use</button></div></div>
  </div><div className="legal"><span>© 2026 Rapid Nova Medical Enterprise. All rights reserved.</span><div className="social"><a href="https://www.linkedin.com/search/results/companies/?keywords=Rapid%20Nova%20Medical%20Enterprise" target="_blank" rel="noopener" aria-label="Find Rapid Nova on LinkedIn">in</a><a href="mailto:hello@rapidnovamed.com?subject=Social%20media%20enquiry" aria-label="Contact Rapid Nova about Facebook">f</a><a href="mailto:hello@rapidnovamed.com?subject=Social%20media%20enquiry" aria-label="Contact Rapid Nova about Instagram">◎</a></div></div></div></footer>);
}

function JobSearch({ keyword, setKeyword, keywordRef }) {
  const [location, setLocation] = useState('');
  const [enquiry, setEnquiry] = useState(null);
  function submit(event) {
    event.preventDefault();
    setEnquiry({ role: keyword.trim() || 'nursing', location: location.trim() });
  }
  return (
    <form className="wrap search-panel" id="jobs" onSubmit={submit}>
      <input className="field" id="job-keyword" ref={keywordRef} aria-label="Nursing role or specialty" placeholder="Nursing role or specialty" value={keyword} onChange={event => setKeyword(event.target.value)} />
      <input className="field" id="job-location" aria-label="City, state or ZIP code" placeholder="City, state or ZIP code" value={location} onChange={event => setLocation(event.target.value)} />
      <button className="btn btn-capri" type="submit">Search Nursing Jobs</button>
      <p className="search-status" role="status">{enquiry && <>For current <strong>{enquiry.role}</strong> opportunities{enquiry.location && <> near <strong>{enquiry.location}</strong></>}, <a className="text-link" href={'mailto:hello@rapidnovamed.com?subject=' + encodeURIComponent(enquiry.role + ' job enquiry') + '&body=' + encodeURIComponent('I am interested in ' + enquiry.role + ' opportunities' + (enquiry.location ? ' near ' + enquiry.location : '') + '.')}>contact nurse recruitment to apply →</a>.</>}</p>
    </form>
  );
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [notice, setNotice] = useState(null);
  const keywordRef = useRef(null);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 5000);
    return () => clearTimeout(timer);
  }, [notice]);
  function focusJobs() {
    setMenuOpen(false);
    keywordRef.current?.focus();
    document.getElementById('jobs')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function handleClick(event) {
    const link = event.target.closest('a[href^="#"]');
    if (link) setMenuOpen(false);
    const trigger = event.target.closest('[data-notice]');
    if (trigger) setNotice({ message: trigger.dataset.notice });
    const job = event.target.closest('[data-job]');
    if (job) {
      event.preventDefault();
      setKeyword(job.dataset.job);
      focusJobs();
    }
  }
  return (
    <div onClick={handleClick} onKeyDown={event => { if (event.key === 'Escape') { setMenuOpen(false); setNotice(null); } }}>
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} focusJobs={focusJobs} />
      <main>
        <Hero />
        <JobSearch keyword={keyword} setKeyword={setKeyword} keywordRef={keywordRef} />
        <NursingCareers />
        <FacilityStaffing />
        <About />
        <Resources />
        <Contact />
      </main>
      <Footer />
      {notice && <div className="notice show" role="status"><button type="button" aria-label="Close message" onClick={() => setNotice(null)}>×</button><span>{notice.message}</span></div>}
    </div>
  );
}
