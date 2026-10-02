import { useEffect, useRef, useState } from 'react';
import { ApplicationForm, ContactForms, JobBoard } from './Workflows';
import nurseTeam from './assets/nurse-team-hero.png';
import './public.css';
import './experience.css';
import ContactDetails from './ContactDetails';
import { careerPhotos, PhotoPaths, PlacementExplorer, Specialties, PayAndSupport, InternationalPreparation, CareerGuides, PhotoBanner } from './CareerExperience';

function Icon({ name, ...props }) {
  const paths = {
    globe: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18M5 6.5h14M5 17.5h14" /></>,
    heart: <path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z" />,
    cross: <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z" />,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
    case: <><rect x="3" y="7" width="18" height="14" rx="3" /><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.cross}</svg>;
}

function Brand() {
  return <a className="rn-brand" href="/" aria-label="Rapid Nova home"><span className="rn-brand-symbol"><Icon name="cross" /></span><span>rapid<span className="rn-brand-nova">nova</span><span className="rn-brand-plus">+</span><small>MEDICAL ENTERPRISE</small></span></a>;
}

function Header({ menuOpen, setMenuOpen, focusJobs, menuButtonRef }) {
  return <header className="rn-header"><div className="rn-utility"><div className="wrap"><span>People. Care. A healthier tomorrow.</span><nav aria-label="Utility navigation"><a href="/resources">Career resources</a><a href="/contact">Contact our team ↗</a><a href="/admin">Team sign in</a></nav></div></div><div className="wrap rn-navigation"><Brand /><nav className={`rn-menu${menuOpen ? ' is-open' : ''}`} id="menu" aria-label="Main navigation"><a href="/careers">For professionals</a><a href="/international-nursing">International nursing</a><a href="/staffing">For facilities</a><a href="/about">Why Rapid Nova</a><a className="btn btn-capri" href="/apply">Apply Now <Icon name="arrow" /></a><button className="rn-search" type="button" aria-label="Search nursing jobs" onClick={focusJobs}><Icon name="search" /></button></nav><button ref={menuButtonRef} className="rn-menu-toggle" type="button" aria-label="Toggle menu" aria-expanded={menuOpen} aria-controls="menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? '×' : '☰'}</button></div></header>;
}

function Hero() {
  return <section className="rn-hero"><div className="wrap rn-hero-grid"><div className="rn-hero-copy"><span className="rn-label"><span /> CARE THAT CONNECTS US</span><h1>Your calling.<br />Your next chapter.<br /><em>A world of possibility.</em></h1><p>You care for others. Let’s find a career that cares for you. Explore nursing and allied health opportunities, at home and beyond.</p><div className="actions"><a href="/careers#jobs" className="btn btn-capri">Find your opportunity <Icon name="arrow" /></a><a href="/international-nursing" className="rn-secondary">Explore international nursing ↗</a></div><div className="rn-hero-note"><Icon name="heart" /><span>For the people who make better care possible.</span></div></div><div className="rn-hero-visual"><img src={nurseTeam} alt="A smiling nurse with her healthcare team in a bright clinical setting" fetchPriority="high" /><span className="rn-photo-label">YOUR SKILLS. A NEW HORIZON.</span><div className="rn-photo-card"><span className="rn-card-icon"><Icon name="globe" /></span><div><strong>Great care knows no borders.</strong><span>Find where you belong.</span></div><span aria-hidden="true">↗</span></div></div></div></section>;
}

function AudienceLinks() {
  return <div className="rn-audience"><div className="wrap">{[['heart', '/careers', 'I’m a healthcare professional', 'Find work that fits your life'], ['globe', '/international-nursing', 'I’m exploring an international career', 'Understand your next steps'], ['case', '/staffing', 'I’m hiring for a facility', 'Build a stronger care team']].map(([icon, href, title, text]) => <a href={href} key={href}><Icon name={icon} /><span><strong>{title}</strong><small>{text}</small></span><Icon name="arrow" /></a>)}</div></div>;
}

const careers = [
  ['cross', '01', 'Registered nurses', 'Bring your clinical expertise to hospital, clinic, and long-term care opportunities.', 'Registered Nurse'],
  ['heart', '02', 'Practical & vocational nurses', 'Explore LPN and LVN roles suited to your experience and preferred care setting.', 'Licensed Practical Nurse'],
  ['globe', '03', 'Travel & per diem nursing', 'Discover assignments and flexible shifts that fit the way you want to work.', 'Travel'],
  ['case', '04', 'Allied health professionals', 'Find your next chapter in therapy, diagnostics, and clinical support.', 'Allied Health'],
];
function NursingCareers() {
  return <section id="professionals" className="rn-careers"><div className="wrap"><div className="rn-heading-row"><div><span className="kicker">FIND YOUR PATH</span><h2>Different paths.<br /><em>One purpose.</em></h2></div><p>Whatever your specialty, your work matters. Discover opportunities built around your skills, goals, and the care you want to give.</p></div><div className="rn-career-grid">{careers.map(([icon, number, title, description, query]) => <a className="rn-career-card" href="/careers#jobs" data-job={query} key={number}><div className="rn-career-top"><Icon name={icon} /><span>{number}</span></div><h3>{title}</h3><p>{description}</p><span className="rn-card-link">Explore opportunities <Icon name="arrow" /></span></a>)}</div></div></section>;
}

function International() {
  return <section id="international" className="rn-international"><div className="wrap rn-international-grid"><div className="rn-world-panel"><Icon name="globe" className="rn-world-icon" /><span className="rn-orbit rn-orbit-one" /><span className="rn-orbit rn-orbit-two" /><span className="rn-world-dot rn-dot-one" /><span className="rn-world-dot rn-dot-two" /><span className="rn-world-caption">A NEW PLACE.<br />THE SAME PASSION FOR CARE.</span><div className="rn-world-bottom"><span>INTERNATIONAL NURSING</span><span aria-hidden="true">↗</span></div></div><div className="rn-international-copy"><span className="kicker">YOUR CAREER, BEYOND BORDERS</span><h2>A bigger world.<br /><em>A meaningful next step.</em></h2><p>Thinking about nursing in a new country? Start with your experience, your goals, and a clear understanding of what comes next.</p><p>Share your background with Rapid Nova to discuss international recruitment enquiries and potential opportunities. Each destination and employer has its own requirements.</p><ul className="rn-checklist">{[['shield', 'Know your requirements', 'Discuss role eligibility, professional registration, and documents relevant to your destination.'], ['case', 'Explore the right placement', 'Ask about contract, permanent, and temporary-to-permanent roles when available.'], ['globe', 'Plan with clarity', 'Confirm employer support, relocation arrangements, and any visa sponsorship for the specific role.']].map(([icon, title, text]) => <li key={title}><Icon name={icon} /><div><strong>{title}</strong><span>{text}</span></div></li>)}</ul><a href="/apply" className="btn btn-capri">Start your international enquiry <Icon name="arrow" /></a><p className="rn-small-note">Available destinations and support depend on the vacancy and your eligibility.</p></div></div></section>;
}

function GettingStarted() {
  return <section className="rn-process" id="process"><div className="wrap"><div className="section-head"><span className="kicker">FROM POSSIBILITY TO YOUR NEXT STEP</span><h2>Let’s move your career <em>forward.</em></h2><p>A simple start. A thoughtful conversation. A clearer path.</p></div><div className="rn-process-grid">{[
    ['01', 'Introduce yourself', 'Send your CV, preferred role, location, and a little about your experience.'],
    ['02', 'Explore your options', 'Our team reviews your background and discusses relevant openings and requirements.'],
    ['03', 'Prepare for what’s next', 'For a suitable opportunity, clarify documents, employer expectations, and placement details.'],
    ['04', 'Take the next step', 'Review the specific offer and agreed arrangements before making your decision.'],
  ].map(([number, title, description]) => <article key={number}><span className="rn-step-number">{number}</span><h3>{title}</h3><p>{description}</p></article>)}</div><div className="rn-centered"><a href="/apply" className="btn btn-capri">Take the first step <Icon name="arrow" /></a></div></div></section>;
}

function FacilityStaffing() {
  return <section id="talent" className="rn-facilities"><div className="wrap rn-facility-grid"><div><span className="kicker">FOR HEALTHCARE FACILITIES</span><h2>Better teams.<br /><em>Better care.</em></h2><p>Your patients depend on the people around them. Tell us about your workforce needs, and let’s discuss the professionals and placement options that fit.</p><a href="/contact" className="btn btn-capri">Request healthcare staff <Icon name="arrow" /></a><a href="/staffing#pricing" className="rn-facility-pricing">Explore staffing pricing →</a></div><div className="rn-service-list">{[
    ['travel-nursing', '01', 'Travel nursing', 'Nursing assignments for short-term needs and changing workforce demands.'],
    ['allied-health', '02', 'Allied health', 'Professionals supporting therapy, diagnostics, and clinical care teams.'],
    ['temporary-to-permanent', '03', 'Temporary-to-permanent', 'Explore a placement before discussing a longer-term employment arrangement.'],
  ].map(([id, number, title, description]) => <article id={id} key={id}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><Icon name="arrow" /></article>)}</div></div></section>;
}

function About() {
  return <section id="about" className="rn-about"><div className="wrap"><div className="rn-heading-row"><div><span className="kicker">THE RAPID NOVA APPROACH</span><h2>People first.<br /><em>Always.</em></h2></div><p>A career is more than a placement. A care team is more than a roster. We bring people and facilities together with attention to what makes a good fit.</p></div><div className="rn-values">{[['heart', 'Your goals matter', 'Your experience, preferred setting, and career ambitions start the conversation.'], ['shield', 'Clarity builds confidence', 'Discuss role requirements and placement details before you take the next step.'], ['case', 'Fit makes the difference', 'Clinical needs, experience, and working preferences help shape the match.']].map(([icon, title, description]) => <article key={title}><Icon name={icon} /><h3>{title}</h3><p>{description}</p></article>)}</div></div></section>;
}

function Resources() {
  return <section id="resources" className="rn-resources"><div className="wrap"><div className="rn-heading-row"><div><span className="kicker">A LITTLE PREPARATION GOES A LONG WAY</span><h2>Good information.<br /><em>Confident decisions.</em></h2></div><a href="/resources#faq" className="text-link">Explore common questions →</a></div><div className="rn-resource-grid"><article><span className="rn-resource-category">01 / YOUR APPLICATION</span><h3>Put your experience in focus.</h3><p>Prepare a PDF CV with your recent clinical experience, specialties, qualifications, and preferred location. Our application accepts files up to 3 MB.</p><a href="/apply" className="text-link">Apply with your CV →</a></article><article><span className="rn-resource-category">02 / INTERNATIONAL CAREERS</span><h3>Start with the right questions.</h3><p>Ask about destination-specific registration, language requirements, employer arrangements, and work authorisation. Confirm the details for each opportunity.</p><a href="/international-nursing" className="text-link">Explore international nursing →</a></article><article id="pricing"><span className="rn-resource-category">03 / FACILITY PLANNING</span><h3>A quote built around your needs.</h3><p>Role, location, placement type, headcount, and schedule all help define a staffing request. Share your requirements to discuss tailored pricing.</p><a href="/contact" className="text-link">Request a staffing quote →</a></article></div></div></section>;
}

const questions = [
  ['How do I start my application?', 'Choose a listed vacancy or submit a general application. Share your preferred location, role or specialty, and a PDF CV of up to 3 MB. A listed vacancy is not required to introduce yourself.'],
  ['Can internationally educated nurses enquire?', 'Yes. Share your qualifications, clinical experience, current location, and preferred destination in your application. Our team can review your background and discuss relevant requirements and potential opportunities.'],
  ['What should I prepare for an international role?', 'Start with an up-to-date CV and details of your nursing qualification and current registration. Registration, language, and work authorisation requirements vary by destination and role; confirm the requirements for the specific vacancy before making arrangements.'],
  ['Are visa sponsorship and relocation included?', 'These arrangements depend on the employer, vacancy, destination, and your eligibility. Ask our team to confirm what is available for the specific role, including who is responsible for costs and each stage of the process.'],
  ['What happens after I submit my CV?', 'Your application is saved for our team to review. Keep the reference displayed after submission. The team can then contact you about your background or relevant opportunities; submitting an application does not guarantee a placement.'],
  ['How can a facility request staff?', 'Use the Request Staff form with your facility name, location, role, number of professionals, and placement type. Add the proposed schedule, start date, and other requirements so our team can discuss your needs and pricing.'],
  ['How long are nursing assignments?', 'Length depends on the specific vacancy and placement type. Per diem opportunities are shift-based, contracts have agreed dates, and permanent roles involve ongoing employment. Ask about the commitment and schedule for your selected role.'],
  ['What should I ask about pay and benefits?', 'Confirm the rate, expected hours, payment schedule, and any overtime arrangements. Ask which benefits apply to your employment type and whether travel or housing assistance is included. Review the details of the specific employer offer.'],
  ['Can I search by clinical specialty?', 'Yes. On the careers page, choose a specialty or enter your preferred specialty in the vacancy search. Published openings depend on current facility needs. You can also submit a general application with your clinical experience.'],
];
function FrequentlyAskedQuestions() {
  return <section id="faq" className="rn-faq"><div className="wrap faq-layout"><div className="faq-intro"><span className="kicker">LET’S MAKE THINGS CLEAR</span><h2>Questions?<br /><em>You’re in the right place.</em></h2><p>Helpful answers before you take your next step.</p><a href="/contact" className="text-link">Ask our team →</a></div><div className="faq-list">{questions.map(([question, answer]) => <details className="faq-item" key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></div></section>;
}

function Footer() {
  return <footer className="rn-footer"><div className="wrap"><div className="rn-footer-invitation"><div><span className="kicker">YOUR NEXT CHAPTER IS WAITING</span><h2>Let’s find it. <em>Together.</em></h2></div><a href="/apply" className="btn btn-capri">Start your application <Icon name="arrow" /></a></div><div className="rn-footer-grid"><div><Brand /><p>Connecting the people who care<br />with the places that need them.</p><ContactDetails /></div><nav aria-label="Footer careers"><h3>For professionals</h3><a href="/careers#jobs">Current opportunities</a><a href="/international-nursing">International nursing</a><a href="/apply">Apply with your CV</a><a href="/careers#process">Your placement journey</a></nav><nav aria-label="Footer facilities"><h3>For facilities</h3><a href="/staffing">Staffing solutions</a><a href="/staffing#travel-nursing">Travel nursing</a><a href="/staffing#allied-health">Allied health</a><a href="/staffing#pricing">Staffing pricing</a></nav><nav aria-label="Footer company"><h3>Rapid Nova</h3><a href="/about">Our approach</a><a href="/resources">Resources</a><a href="/resources#faq">Frequently asked questions</a><a href="/contact">Contact us</a><a href="/admin">Team sign in</a></nav></div><div className="rn-footer-legal"><span>© {new Date().getFullYear()} Rapid Nova Medical Enterprise.</span><span>People. Care. A healthier tomorrow.</span></div></div></footer>;
}

export default function App() {
  const [route, setRoute] = useState(() => window.location.pathname.replace(/\/$/, '') || '/');
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [searchPreset, setSearchPreset] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const keywordRef = useRef(null);
  const menuButtonRef = useRef(null);
  const mainRef = useRef(null);
  function navigate(href) {
    const url = new URL(href, window.location.origin);
    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setRoute(url.pathname.replace(/\/$/, '') || '/');
    setMenuOpen(false);
    window.dispatchEvent(new Event('rn:navigation'));
  }
  useEffect(() => {
    const sync = () => { setRoute(window.location.pathname.replace(/\/$/, '') || '/'); setMenuOpen(false); };
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);
  useEffect(() => {
    const titles = { '/': 'Healthcare Staffing & Recruitment', '/careers': 'Healthcare Careers', '/international-nursing': 'International Nursing', '/staffing': 'Healthcare Staffing', '/about': 'About Rapid Nova', '/resources': 'Career Resources', '/apply': 'Apply with Rapid Nova', '/contact': 'Contact Our Houston Team' };
    document.title = `${titles[route] || 'Page Not Found'} | Rapid Nova Medical Enterprise`;
    document.querySelectorAll('.rn-menu a').forEach(link => {
      if (new URL(link.href).pathname === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    function position() {
      const target = window.location.hash && document.getElementById(window.location.hash.slice(1));
      if (target) target.scrollIntoView({ behavior: 'instant' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
      if (window.location.hash === '#jobs') keywordRef.current?.focus({ preventScroll: true });
      else mainRef.current?.focus({ preventScroll: true });
    }
    const frame = requestAnimationFrame(position);
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('rn-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.08 });
    const targets = mainRef.current?.querySelectorAll('section, .rn-career-card, .rn-values article, .rn-process-grid article, .rn-resource-grid article, .rn-photo-path, .rn-guide-grid article') || [];
    targets.forEach((node, index) => { node.classList.add('rn-reveal'); node.style.setProperty('--reveal-delay', `${(index % 4) * 65}ms`); observer.observe(node); });
    window.addEventListener('rn:navigation', position);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener('rn:navigation', position); };
  }, [route]);
  useEffect(() => {
    if (!menuOpen) return;
    const close = event => { if (event.key === 'Escape') { setMenuOpen(false); menuButtonRef.current?.focus(); } };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [menuOpen]);
  function focusJobs() {
    navigate('/careers#jobs');
    requestAnimationFrame(() => { document.getElementById('jobs')?.scrollIntoView(); keywordRef.current?.focus({ preventScroll: true }); });
  }
  function handleClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a');
    const job = event.target.closest('[data-job]');
    if (job) { event.preventDefault(); setKeyword(job.dataset.job); setSearchPreset({ keyword: job.dataset.job }); focusJobs(); return; }
    if (!link || link.target || link.hasAttribute('download')) return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || !url.pathname.startsWith('/') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/api')) return;
    if (link.getAttribute('href').startsWith('#')) return;
    event.preventDefault(); navigate(url.pathname + url.search + url.hash);
  }
  const pageHead = (label, title, description) => {
    const photo = route === '/international-nursing' ? careerPhotos.internationalTeam : route === '/about' || route === '/contact' ? careerPhotos.patientCare : careerPhotos.hospitalNurses;
    return <section className="rn-page-heading rn-photo-heading"><div className="wrap"><div className="rn-page-heading-copy"><nav aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true"> / </span><span>{label}</span></nav><span className="kicker">{label}</span><h1>{title}</h1><p>{description}</p></div><div className="rn-heading-photo"><img src={photo} alt="Healthcare professionals and patient care in a bright clinical setting" fetchPriority="high" width="1536" height="1024" /><span>PEOPLE. CARE. POSSIBILITY.</span></div></div></section>;
  };
  let content;
  switch (route) {
    case '/': content = <><Hero /><AudienceLinks /><PhotoPaths /><NursingCareers /><About /><PhotoBanner /></>; break;
    case '/careers': content = <>{pageHead('Healthcare careers', 'Your next chapter starts here.', 'Explore opportunities that fit your skills, your goals, and your life.')}<PhotoPaths /><Specialties /><div className="rn-job-section"><div className="wrap rn-job-intro"><span className="kicker">CURRENT OPPORTUNITIES</span><h2>Find a role that <em>feels right.</em></h2></div><JobBoard searchPreset={searchPreset} keyword={keyword} setKeyword={setKeyword} keywordRef={keywordRef} onApply={setSelectedJob} /></div><PlacementExplorer /><NursingCareers /><PayAndSupport /><GettingStarted /><CareerGuides /><FrequentlyAskedQuestions /></>; break;
    case '/international-nursing': content = <>{pageHead('International nursing', 'Your care can go further.', 'Explore your next steps toward a nursing career beyond borders.')}<International /><InternationalPreparation /><GettingStarted /><CareerGuides /><FrequentlyAskedQuestions /></>; break;
    case '/staffing': content = <>{pageHead('Healthcare staffing', 'The right people. Better care.', 'Discuss travel nursing, allied health, and placements that fit your facility.')}<FacilityStaffing /><PhotoBanner facility /><Resources /></>; break;
    case '/about': content = <>{pageHead('About Rapid Nova', 'People are at the heart of it.', 'From our Houston office, we connect healthcare professionals and facilities around the care they give.')}<About /><PhotoBanner /><AudienceLinks /></>; break;
    case '/resources': content = <>{pageHead('Career resources', 'Clarity for the journey ahead.', 'Practical information for your application, international enquiry, or staffing request.')}<CareerGuides /><Resources /><PayAndSupport /><FrequentlyAskedQuestions /></>; break;
    case '/apply': content = <>{pageHead('Apply with Rapid Nova', 'Let’s find your next opportunity.', 'Introduce yourself or apply for a selected vacancy.')}<ApplicationForm job={selectedJob} onClearJob={() => setSelectedJob(null)} /></>; break;
    case '/contact': content = <>{pageHead('Contact our team', 'A conversation can change everything.', 'Talk to our Houston team about your career goals or healthcare staffing needs.')}<ContactForms /></>; break;
    default: content = <>{pageHead('Page not found', 'Let’s get you back on track.', 'The page you requested could not be found.')}<div className="wrap rn-not-found"><a href="/" className="btn btn-capri">Back to home</a></div></>;
  }
  return <div className="rn-site" onClick={handleClick}><a className="skip-link" href="#main-content">Skip to content</a><Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} focusJobs={focusJobs} menuButtonRef={menuButtonRef} /><main ref={mainRef} key={route} id="main-content" tabIndex={-1} className="rn-page">{content}</main><Footer /></div>;
}
