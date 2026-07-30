import React, { useState } from 'react';
import './ProposalCFS.css';
import prototypeImage from './image.png';

const ProposalCFS = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');

  const [view, setView] = useState('manual');
  const [activePath, setActivePath] = useState('all');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'OCTX2026TV') {
      setIsAuthenticated(true);
    } else {
      setError('Incorrect password');
    }
  };

  const highlightPath = (pathClass) => {
    setActivePath(pathClass);
  };

  const getPathClass = (classes) => {
    const classList = classes.split(' ');
    if (activePath === 'all') return classes;
    return classes + (classList.includes(activePath) ? '' : ' dimmed');
  };

  if (!isAuthenticated) {
    return (
      <div className="workflow-container" style={{paddingTop: '120px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div style={{background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px', width: '100%'}}>
          <h2 style={{marginTop: '0', color: '#0b1d3a', marginBottom: '8px'}}>Protected Proposal</h2>
          <p style={{color: '#475569', fontSize: '14px', marginBottom: '24px'}}>Please enter the access code to view this document.</p>
          
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setError(''); }}
              placeholder="Enter password"
              style={{width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px', boxSizing: 'border-box', fontSize: '16px'}}
            />
            {error && <p style={{color: '#ef4444', fontSize: '13px', margin: '0 0 16px 0', textAlign: 'left'}}>{error}</p>}
            <button 
              type="submit"
              style={{width: '100%', padding: '12px', background: '#053364', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px'}}
            >
              Access Proposal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="proposal-page-container">
      <div className="proposal-layout-wrapper">
        {/* SIDEBAR */}
        <div className="proposal-sidebar">
          
        <div className="journey-nav">
          <div className="journey-title">
            Discovery
          </div>

          <button 
            className={`sidebar-nav-btn completed-step ${view === 'manual' ? 'active' : ''}`}
            onClick={() => setView('manual')}
          >
            Current Process: Manual
          </button>
          <button 
            className={`sidebar-nav-btn completed-step ${view === 'automated' ? 'active' : ''}`}
            onClick={() => setView('automated')}
          >
            Proposed Process: OptiFlow
          </button>
          <button 
            className={`sidebar-nav-btn completed-step ${view === 'prototype' ? 'active' : ''}`}
            onClick={() => setView('prototype')}
          >
            Prototype
          </button>
          <button 
            className={`sidebar-nav-btn ${view === 'logic' ? 'active' : ''}`}
            onClick={() => setView('logic')}
          >
            Allocation Logic Flow
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="proposal-main-content">
        
        {/* PROPOSAL TOP HEADER */}
        <div className="proposal-top-header" style={{ textAlign: 'center' }}>
          <h1 style={{color: '#053364', fontSize: '36px', margin: '0 0 8px 0', fontWeight: '800', letterSpacing: '-0.5px'}}>Centre For Sight</h1>
          <p style={{color: '#475569', fontSize: '20px', margin: '0', fontWeight: '500'}}>Inventory &amp; Distribution System</p>
        </div>
        
        {view === 'prototype' && (
          <div className="prototype-view-container" style={{
            maxWidth: '1000px',
            margin: '24px auto 40px auto',
            padding: '48px',
            background: 'linear-gradient(145deg, #ffffff, #f8fafc)',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.8)',
            display: 'flex',
            gap: '48px',
            alignItems: 'center',
            textAlign: 'left'
          }}>
            {/* Left Column: Content */}
            <div style={{ flex: '1', minWidth: '350px' }}>
              <h2 style={{
                fontSize: '32px',
                fontWeight: '800',
                color: '#0b1d3a',
                marginBottom: '16px',
                letterSpacing: '-0.5px'
              }}>OptiFlow Interactive Prototype</h2>
              
              <p style={{
                fontSize: '16px',
                color: '#475569',
                lineHeight: '1.6',
                marginBottom: '32px'
              }}>
                Dive into the OptiFlow prototype to see our centralized system for seamless stock allocation and distribution in action.
              </p>
              
              <a 
                href="https://optiflow-poc.vercel.app/allocation" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '14px 32px',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#053364',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  boxShadow: '0 10px 25px -5px rgba(5, 51, 100, 0.4)',
                  transition: 'all 0.3s ease',
                  marginBottom: '32px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(5, 51, 100, 0.5)';
                  e.currentTarget.style.backgroundColor = '#00254d';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(5, 51, 100, 0.4)';
                  e.currentTarget.style.backgroundColor = '#053364';
                }}
              >
                Launch Prototype 
                <span style={{marginLeft: '12px', fontSize: '18px'}}>→</span>
              </a>
              
              <div style={{ padding: '24px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>Demo Access Credentials</div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', minWidth: '130px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>Admin</div>
                    <div style={{ fontSize: '15px', color: '#053364', fontWeight: '800', fontFamily: 'monospace' }}>dekode1234</div>
                  </div>
                  <div style={{ flex: 1, backgroundColor: '#ffffff', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', border: '1px solid #f1f5f9', minWidth: '130px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>User</div>
                    <div style={{ fontSize: '15px', color: '#053364', fontWeight: '800', fontFamily: 'monospace' }}>dekode5678</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Image */}
            <div style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
              <a 
                href="https://optiflow-poc.vercel.app/allocation" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'block', width: '100%' }}
              >
                <img 
                  src={prototypeImage} 
                  alt="OptiFlow Prototype Dashboard" 
                  style={{
                    width: '100%',
                    borderRadius: '16px',
                    boxShadow: '0 15px 35px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }} 
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)';
                  }}
                />
              </a>
            </div>
          </div>
        )}


      {/* DETAILED LOGIC FLOW VIEW */}
      {view === 'logic' && (
        <div id="logic-view">
          <div className="header-section" style={{textAlign: 'center', marginBottom: '40px'}}>
            <h1 style={{fontSize: '36px', fontWeight: '800', color: '#0b1d3a', marginBottom: '12px'}}>OptiFlow Allocation Process Flow</h1>
            <p style={{fontSize: '18px', color: '#475569', fontWeight: '500'}}>Automated Intelligent Allocation Workflow.</p>
            
            <div style={{textAlign: 'left', background: '#f0fdf4', borderLeft: '4px solid #15803d', padding: '24px', borderRadius: '8px', marginTop: '24px', maxWidth: '600px', margin: '24px auto 0 auto'}}>
              <h3 style={{marginTop: 0, marginBottom: '12px', color: '#15803d', fontSize: '18px', fontWeight: '800', textAlign: 'center'}}>Global Constraints Key</h3>
              <ul style={{margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#166534', lineHeight: '1.8'}}>
                <li style={{marginBottom: '8px'}}><strong>Max 3 Colors/Model:</strong> Limits assortment redundancy per model.</li>
                <li style={{marginBottom: '8px'}}><strong>Max 2 Units/SKU:</strong> Caps dispatch depth to control store run.</li>
                <li style={{marginBottom: '0px'}}><strong>Min 85% Brand Uniqueness:</strong> Maintained across active store displays.</li>
              </ul>
            </div>
          </div>

          <div className="flowchart-section">
            <h2 style={{marginTop: '0', marginBottom: '8px'}}>Automated Decision Workflow</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>End-to-end logic for how the system processes store schedules, calculates deficits, and routes exceptions.</p>

            {/* Dynamic Interactive Filters */}
            <div className="filter-btn-group" style={{marginBottom: '30px', display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
              <button className={`filter-btn ${activePath === 'all' ? 'active' : ''}`} onClick={() => highlightPath('all')}>Show Full Workflow</button>
              <button className={`filter-btn ${activePath === 'path-skip' ? 'active' : ''}`} onClick={() => highlightPath('path-skip')}>Target Met (No Deficit)</button>
              <button className={`filter-btn ${activePath === 'path-t1' ? 'active' : ''}`} onClick={() => highlightPath('path-t1')}>T1 Auto-Allocate</button>
              <button className={`filter-btn ${activePath === 'path-t2' ? 'active' : ''}`} onClick={() => highlightPath('path-t2')}>T2 Auto-Allocate</button>
              <button className={`filter-btn ${activePath === 'path-sub' ? 'active' : ''}`} onClick={() => highlightPath('path-sub')}>T3 Substitute Match</button>
            </div>

            <div className="svg-container">
              <svg width="100%" height="1600" viewBox="0 0 1250 1600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <marker id="arrow-logic" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#5a738e" />
                  </marker>
                  <marker id="arrow-orange-logic" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f5a623" />
                  </marker>
                </defs>

                {/* COMMON HEADER & NO-DEFICIT PATHS */}
                <g className={getPathClass("flow-element path-skip path-t1 path-t2 path-sub path-loop")}>
                  <path d="M625 95 V140" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <path d="M625 195 V235" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <path d="M625 290 V310" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>

                  <rect x="495" y="40" width="260" height="55" rx="27.5" fill="#0f3a68" />
                  <text x="625" y="63" className="svg-white-text" textAnchor="middle" fontSize="15" fontWeight="700">Start</text>
                  <text x="625" y="79" className="svg-white-sub" textAnchor="middle" fontSize="11">OptiFlow Allocation Process</text>

                  <rect x="465" y="140" width="320" height="55" rx="8" fill="#ffffff" stroke="#d9e2ec" strokeWidth="2"/>
                  <text x="625" y="163" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Initialize &amp; Rank Stores</text>
                  <text x="625" y="180" className="svg-sub-text" textAnchor="middle" fontSize="11">Grade Priority A, B, C &amp; Inner Lists</text>

                  <rect x="465" y="235" width="320" height="55" rx="8" fill="#ffffff" stroke="#d9e2ec" strokeWidth="2"/>
                  <text x="625" y="258" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Calculate Store Deficits</text>
                  <text x="625" y="275" className="svg-sub-text" textAnchor="middle" fontSize="11">Deficit = Target (Facing+Depth) - SOH</text>

                  <polygon points="625,310 715,360 625,410 535,360" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="625" y="364" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Is Deficit &gt; 0?</text>
                </g>

                {/* YES branch from Deficit Check */}
                <g className={getPathClass("flow-element path-t1 path-t2 path-sub path-loop")}>
                  <path d="M625 410 V500 H230 V555" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="210" y="490" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="230" y="505" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>
                </g>

                {/* Deficit NO Branch */}
                <g className={getPathClass("flow-element path-skip")}>
                  <path d="M535 360 H30 V1510 H525" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="10" y="349" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="30" y="364" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                {/* COLUMN 1: TIER 1 (Center x=230) */}
                <g className={getPathClass("flow-element path-t1 path-t2 path-sub path-loop")}>
                  <rect x="90" y="555" width="280" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="230" y="579" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Tier 1: Recent Sales Match</text>
                  <text x="230" y="598" className="svg-sub-text" textAnchor="middle" fontSize="11">Fetch exact SKUs sold in Last X Days</text>

                  <path d="M230 615 V655" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <polygon points="230,655 305,705 230,755 155,705" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="230" y="709" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">Constraints Met?</text>

                  <path d="M230 755 V795" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="210" y="764" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="230" y="779" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <polygon points="230,795 305,845 230,895 155,845" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="230" y="849" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">In Stock?</text>
                </g>

                {/* NO Stock in T1 -> Go to T2 */}
                <g className={getPathClass("flow-element path-t2 path-sub")}>
                  <path d="M305 845 H415 V585 H485" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="335" y="834" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="355" y="849" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                <g className={getPathClass("flow-element path-t1 path-loop")}>
                  <path d="M230 895 V955" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="210" y="915" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="230" y="930" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <rect x="115" y="955" width="230" height="48" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="230" y="984" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Allocate SKU &amp; Deficit</text>

                  <path d="M230 1003 V1035" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <polygon points="230,1035 305,1085 230,1135 155,1085" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="230" y="1089" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">Filled?</text>

                  <path d="M230 1135 V1210 H465 V1240" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="210" y="1155" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="230" y="1170" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>
                </g>

                <g className={getPathClass("flow-element path-loop")}>
                  <path d="M155 705 H70 V585 H90" stroke="#f5a623" strokeWidth="2.5" strokeDasharray="6 6" fill="none" markerEnd="url(#arrow-orange-logic)"/>
                  <rect x="50" y="630" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="70" y="645" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                  <text x="58" y="595" fill="#f5a623" fontSize="10" fontWeight="700" textAnchor="middle" transform="rotate(-90 58 595)">NEXT SKU</text>

                  <path d="M155 1085 H70 V585 H90" stroke="#f5a623" strokeWidth="2.5" strokeDasharray="6 6" fill="none" markerEnd="url(#arrow-orange-logic)"/>
                  <rect x="50" y="955" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="70" y="970" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                {/* COLUMN 2: TIER 2 (Center x=625) */}
                <g className={getPathClass("flow-element path-t2 path-sub")}>
                  <rect x="485" y="555" width="280" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="625" y="579" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Tier 2: Historical Sales Match</text>
                  <text x="625" y="598" className="svg-sub-text" textAnchor="middle" fontSize="11">Fetch exact SKUs sold in Last 6 Months</text>

                  <path d="M625 615 V655" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <polygon points="625,655 700,705 625,755 550,705" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="625" y="709" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">Constraints Met?</text>

                  <path d="M625 755 V795" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="605" y="764" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="625" y="779" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <polygon points="625,795 700,845 625,895 550,845" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="625" y="849" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">In Stock?</text>
                </g>

                {/* NO Stock in T2 -> Go to T3 */}
                <g className={getPathClass("flow-element path-sub")}>
                  <path d="M700 845 H810 V585 H880" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="730" y="834" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="750" y="849" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                <g className={getPathClass("flow-element path-t2")}>
                  <path d="M625 895 V955" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="605" y="915" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="625" y="930" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <rect x="510" y="955" width="230" height="48" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="625" y="984" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Allocate SKU &amp; Deficit</text>

                  <path d="M625 1003 V1035" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <polygon points="625,1035 700,1085 625,1135 550,1085" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="625" y="1089" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">Filled?</text>

                  <path d="M625 1135 V1240" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="605" y="1155" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="625" y="1170" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>
                </g>

                <g className={getPathClass("flow-element path-loop")}>
                  <path d="M550 705 H465 V585 H485" stroke="#f5a623" strokeWidth="2.5" strokeDasharray="6 6" fill="none" markerEnd="url(#arrow-orange-logic)"/>
                  <rect x="445" y="630" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="465" y="645" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>

                  <path d="M550 1085 H465 V585 H485" stroke="#f5a623" strokeWidth="2.5" strokeDasharray="6 6" fill="none" markerEnd="url(#arrow-orange-logic)"/>
                  <rect x="445" y="955" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="465" y="970" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                {/* COLUMN 3: TIER 3 (Center x=1020) */}
                <g className={getPathClass("flow-element path-sub")}>
                  <rect x="880" y="555" width="280" height="60" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="1020" y="579" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Tier 3: Substitute Cascade</text>
                  <text x="1020" y="598" className="svg-sub-text" textAnchor="middle" fontSize="11">MRP ±20% | Relax: Color➔Mat➔Shape</text>

                  <path d="M1020 615 V655" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <polygon points="1020,655 1095,705 1020,755 945,705" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="1020" y="709" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">Constraints Met?</text>

                  <path d="M1020 755 V795" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="1000" y="764" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="1020" y="779" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <polygon points="1020,795 1095,845 1020,895 945,845" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="1020" y="849" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">In Stock?</text>

                  <path d="M1020 895 V955" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <rect x="1000" y="915" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="1020" y="930" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <rect x="905" y="955" width="230" height="48" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="1020" y="984" className="svg-node-text" textAnchor="middle" fontSize="13" fontWeight="700">Allocate Substitute SKU</text>

                  <path d="M1020 1003 V1035" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                  <polygon points="1020,1035 1095,1085 1020,1135 945,1085" fill="#ffffff" stroke="#f5a623" strokeWidth="2"/>
                  <text x="1020" y="1089" className="svg-node-text" textAnchor="middle" fontSize="12" fontWeight="700">Filled?</text>

                  <path d="M1020 1135 V1210 H785 V1240" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="1000" y="1155" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="1020" y="1170" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">YES</text>

                  <path d="M1095 845 H1210 V1280 H785" stroke="#5a738e" strokeWidth="2.5" fill="none" markerEnd="url(#arrow-logic)"/>
                  <rect x="1135" y="834" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="1155" y="849" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                <g className={getPathClass("flow-element path-loop")}>
                  <path d="M945 705 H860 V585 H880" stroke="#f5a623" strokeWidth="2.5" strokeDasharray="6 6" fill="none" markerEnd="url(#arrow-orange-logic)"/>
                  <rect x="840" y="630" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="860" y="645" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>

                  <path d="M945 1085 H860 V585 H880" stroke="#f5a623" strokeWidth="2.5" strokeDasharray="6 6" fill="none" markerEnd="url(#arrow-orange-logic)"/>
                  <rect x="840" y="955" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="860" y="970" fill="white" fontSize="11" fontWeight="800" textAnchor="middle">NO</text>
                </g>

                {/* COMMON FOOTER SECTION */}
                <g className={getPathClass("flow-element path-t1 path-t2 path-sub path-loop")}>
                  <rect x="465" y="1240" width="320" height="80" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="625" y="1270" className="svg-node-text" textAnchor="middle" fontSize="14" fontWeight="700">Apply FIFO Batch Rule</text>
                  <text x="625" y="1290" className="svg-sub-text" textAnchor="middle" fontSize="12">Pull oldest warehouse stock age first</text>

                  <path d="M625 1320 V1380" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>

                  <rect x="465" y="1380" width="320" height="45" rx="8" fill="#ffffff" stroke="#10b981" strokeWidth="2"/>
                  <text x="625" y="1407" className="svg-node-text" textAnchor="middle" fontSize="14" fontWeight="700">Generate Dispatch Order</text>

                  <path d="M625 1425 V1485" stroke="#5a738e" strokeWidth="2.5" markerEnd="url(#arrow-logic)"/>
                </g>

                {/* END Node */}
                <g className={getPathClass("flow-element path-skip path-t1 path-t2 path-sub path-loop")}>
                  <rect x="525" y="1485" width="200" height="50" rx="25" fill="#0f3a68" />
                  <text x="625" y="1515" className="svg-white-text" textAnchor="middle">END</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* AUTOMATED VIEW */}
      {view === 'automated' && (
        <div id="automated-view">
          
          {/* Header */}
          <div className="header-section" style={{position: 'relative'}}>
            <h1>OptiFlow</h1>
            <p style={{fontSize: '18px', color: '#475569', fontWeight: '500'}}>Transitioning from manual spreadsheet analysis to an automated, intelligent allocation workflow.</p>
            
            <div style={{textAlign: 'left', backgroundColor: '#ecfdf5', borderLeft: '4px solid #10b981', padding: '24px', borderRadius: '8px', marginTop: '24px'}}>
              <h2 style={{color: '#047857', marginTop: '0', marginBottom: '12px', fontSize: '22px'}}>The Automated Solution</h2>
              <p style={{fontSize: '16px', color: '#334155', marginBottom: '16px', lineHeight: '1.6'}}>
                We are deploying a deterministic <strong>Logic Engine</strong> paired with a <strong>Human-in-the-Loop (HITL) Dashboard</strong>. This eliminates manual Excel math and automates 95% of standard replenishment.
              </p>
              <p style={{fontSize: '16px', color: '#334155', marginBottom: '16px', lineHeight: '1.6'}}>
                The user simply uploads the raw store and warehouse CSV data. The system automatically calculates Planogram deficits and executes allocations.
              </p>
              <div style={{backgroundColor: '#d1fae5', padding: '16px', borderRadius: '6px', border: '1px solid #a7f3d0'}}>
                <p style={{margin: '0', fontSize: '15px', color: '#065f46', fontWeight: '500', lineHeight: '1.6'}}>
                  <strong style={{color: '#047857'}}>Exception Handling:</strong> If the exact frame is out of stock, the system automatically finds the closest matching substitute (using heuristics and other metrics). The human manager only has to click "Approve" on these rare exceptions, reducing a 5.5-hour manual process to seconds.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Flowchart */}
          <div className="flowchart-section">
            <h2 style={{marginTop: '0', marginBottom: '8px'}}>Automated Decision Workflow</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '24px'}}>End-to-end logic for how the system processes store schedules, calculates deficits, and routes exceptions.</p>

            {/* Dynamic Filters */}
            <div className="filter-btn-group">
              <button className={`filter-btn ${activePath === 'all' ? 'active' : ''}`} onClick={() => highlightPath('all')}>
                Show Full Workflow
              </button>
              <button className={`filter-btn ${activePath === 'path-skip' ? 'active' : ''}`} onClick={() => highlightPath('path-skip')}>
                Path 1: Stock Adequate
              </button>
              <button className={`filter-btn ${activePath === 'path-match' ? 'active' : ''}`} onClick={() => highlightPath('path-match')}>
                Path 2: Auto-Allocate
              </button>
              <button className={`filter-btn ${activePath === 'path-exception' ? 'active' : ''}`} onClick={() => highlightPath('path-exception')}>
                Path 3: Substitute Match
              </button>
              <button className={`filter-btn ${activePath === 'path-stockout' ? 'active' : ''}`} onClick={() => highlightPath('path-stockout')}>
                Path 4: Total Stockout
              </button>
            </div>

            <div className="svg-container">
              <svg width="100%" height="1300" viewBox="100 0 800 1300" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#053364"/>
                    <stop offset="100%" stopColor="#053364"/>
                  </linearGradient>
                  <linearGradient id="secondaryGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#FEB611"/>
                    <stop offset="100%" stopColor="#FEB611"/>
                  </linearGradient>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
                  </marker>
                </defs>

                {/* COMMON PATH (1-6) */}
                <g className={getPathClass("flow-element path-skip path-match path-exception path-stockout")}>
                  {/* 1. Start */}
                  <rect x="350" y="30" width="200" height="55" rx="27.5" fill="#053364" />
                  <text x="450" y="55" className="svg-white-text" textAnchor="middle">Start</text>
                  <text x="450" y="72" fill="#94a3b8" fontSize="11" textAnchor="middle">(Allocation Day)</text>
                  <path d="M450 85 V120" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 2. Upload Planogram */}
                  <rect x="300" y="120" width="300" height="45" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="450" y="146" className="svg-node-text" textAnchor="middle">Upload/Retrieve Planogram(s)</text>
                  <path d="M450 165 V200" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 3. Upload Sales */}
                  <rect x="300" y="200" width="300" height="45" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="450" y="226" className="svg-node-text" textAnchor="middle">Upload/Retrieve Last 7 Day Sales</text>
                  <path d="M450 245 V280" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 4. Upload Current Stock */}
                  <rect x="300" y="280" width="300" height="45" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="450" y="306" className="svg-node-text" textAnchor="middle">Upload/Retrieve Current Stock(s)</text>
                  <path d="M450 325 V360" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 5. Upload WH Stock */}
                  <rect x="300" y="360" width="300" height="45" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="450" y="386" className="svg-node-text" textAnchor="middle">Upload/Retrieve Warehouse Stock</text>
                  <path d="M450 405 V440" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* OptiFlow Engine */}
                  <rect x="300" y="440" width="300" height="50" rx="8" fill="#FEB611" stroke="#FEB611" strokeWidth="2"/>
                  <text x="450" y="470" className="svg-node-text" textAnchor="middle" fill="#ffffff">OptiFlow Engine Processing</text>
                  <path d="M450 490 V520" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 6. Generate Report */}
                  <rect x="250" y="520" width="400" height="50" rx="8" fill="url(#primaryGrad)"/>
                  <text x="450" y="550" className="svg-white-text" textAnchor="middle">Generate Allocation/Replenishment Report</text>
                  <path d="M450 570 V610" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 7. Diamond: Deficit Exists? */}
                  <polygon points="450,610 560,650 450,690 340,650" fill="var(--bg-card)" stroke="#FEB611" strokeWidth="2"/>
                  <text x="450" y="654" className="svg-node-text" textAnchor="middle">Deficit Exists?</text>
                </g>

                {/* PATH 1: STOCK ADEQUATE (NO) */}
                <g className={getPathClass("flow-element path-skip")}>
                  <path d="M340 650 H180 V1240 H350" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
                  <rect x="240" y="639" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="260" y="654" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">NO</text>
                </g>

                {/* COMMON PATH (Deficit YES) */}
                <g className={getPathClass("flow-element path-match path-exception path-stockout")}>
                  <path d="M450 690 V750" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>
                  <rect x="430" y="709" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="450" y="724" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">YES</text>

                  {/* 8. Diamond: Exact SKU Found? */}
                  <polygon points="450,750 560,790 450,830 340,790" fill="var(--bg-card)" stroke="#FEB611" strokeWidth="2"/>
                  <text x="450" y="794" className="svg-node-text" textAnchor="middle">Exact SKU Found?</text>
                </g>

                {/* PATH 2: AUTO-ALLOCATE (Exact SKU Found YES) */}
                <g className={getPathClass("flow-element path-match")}>
                  <path d="M560 790 H760 V1015" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
                  <rect x="620" y="779" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="640" y="794" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">YES</text>
                </g>

                {/* COMMON PATH (Exact SKU Found NO) */}
                <g className={getPathClass("flow-element path-exception path-stockout")}>
                  <path d="M450 830 V890" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>
                  <rect x="430" y="849" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="450" y="864" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">NO</text>

                  {/* 9. Process: Find Substitute */}
                  <rect x="300" y="890" width="300" height="50" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                  <text x="450" y="913" className="svg-node-text" textAnchor="middle">Find Substitute</text>
                  <text x="450" y="930" fill="#64748b" fontSize="12" textAnchor="middle">Score: Heuristics &amp; Other Metrics</text>
                  <path d="M450 940 V1000" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 10. Diamond: Perfect Substitute? */}
                  <polygon points="450,1000 560,1040 450,1080 340,1040" fill="var(--bg-card)" stroke="#FEB611" strokeWidth="2"/>
                  <text x="450" y="1044" className="svg-node-text" textAnchor="middle">Perfect Substitute?</text>
                </g>

                {/* PATH 3: SUBSTITUTE MATCH (Perfect Substitute YES) */}
                <g className={getPathClass("flow-element path-exception")}>
                  <path d="M560 1040 H660" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
                  <rect x="580" y="1029" width="40" height="22" rx="11" fill="#10b981" />
                  <text x="600" y="1044" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">YES</text>
                </g>

                {/* PATHWAY TO ALLOCATION & DISPATCH (SHARED BY 2 & 3) */}
                <g className={getPathClass("flow-element path-match path-exception")}>
                  {/* 11. Allocate SKU */}
                  <rect x="660" y="1015" width="200" height="50" rx="8" fill="url(#primaryGrad)"/>
                  <text x="760" y="1045" className="svg-white-text" textAnchor="middle">Allocate SKU</text>
                  <path d="M760 1065 V1140" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>

                  {/* 12. Dispatch Order */}
                  <rect x="640" y="1140" width="240" height="50" rx="8" fill="var(--bg-card)" stroke="#10b981" strokeWidth="2"/>
                  <text x="760" y="1170" className="svg-node-text" textAnchor="middle">Dispatch Order Generated</text>
                  <path d="M760 1190 V1240 H550" stroke="#64748b" strokeWidth="2" fill="none" markerEnd="url(#arrow)"/>
                </g>

                {/* PATH 4: STOCKOUT (Perfect Substitute NO) */}
                <g className={getPathClass("flow-element path-stockout")}>
                  <path d="M450 1080 V1140" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>
                  <rect x="430" y="1099" width="40" height="22" rx="11" fill="#ef4444" />
                  <text x="450" y="1114" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">NO</text>
                  <rect x="330" y="1140" width="240" height="45" rx="8" fill="var(--bg-card)" stroke="#ef4444" strokeWidth="2"/>
                  <text x="450" y="1167" className="svg-node-text" textAnchor="middle">Report Generated</text>
                  <path d="M450 1185 V1215" stroke="#64748b" strokeWidth="2" markerEnd="url(#arrow)"/>
                </g>

                {/* COMMON END NODE */}
                <g className={getPathClass("flow-element path-skip path-match path-exception path-stockout")}>
                  {/* 13. END */}
                  <rect x="350" y="1215" width="200" height="50" rx="25" fill="#053364" />
                  <text x="450" y="1245" className="svg-white-text" textAnchor="middle">END</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL VIEW */}
      {view === 'manual' && (
        <div id="manual-view">
          <div className="header-section" style={{position: 'relative'}}>
            <h1>Legacy Process: Manual Distribution</h1>
            
            <div style={{textAlign: 'left', backgroundColor: '#fff8f1', borderLeft: '4px solid #f97316', padding: '24px', borderRadius: '8px', marginTop: '24px'}}>
              <h2 style={{color: '#ea580c', marginTop: '0', marginBottom: '12px', fontSize: '22px'}}>The Legacy Problem</h2>
              <p style={{fontSize: '16px', color: '#334155', marginBottom: '16px', lineHeight: '1.6'}}>
                Currently, inventory replenishment is driven entirely by manual Excel spreadsheets. Merchandisers must export raw data, run complex VLOOKUPs to compare store stock against Planograms, and manually guess which substitute frame to send when the central warehouse has a stockout.
              </p>
              <p style={{fontSize: '16px', color: '#334155', marginBottom: '24px', lineHeight: '1.6', fontWeight: '500'}}>
                This manual process introduces significant operational bottlenecks and subjective decision-making into the supply chain.
              </p>
              
              <h3 style={{color: '#0f172a', marginBottom: '12px', fontSize: '18px'}}>Network Manual Overhead</h3>
              <ul style={{fontSize: '15px', color: '#475569', lineHeight: '1.8', marginBottom: '20px', listStyleType: 'none', paddingLeft: '0'}}>
                <li>• <strong>Grade A Stores (Weekly):</strong> 22 stores = 88 runs/mo</li>
                <li>• <strong>Grade B Stores (Fortnightly):</strong> 30 stores = 60 runs/mo</li>
                <li>• <strong>Grade C Stores (Monthly):</strong> 43 stores = 43 runs/mo</li>
              </ul>
              <div style={{backgroundColor: '#ffedd5', padding: '16px', borderRadius: '6px', border: '1px solid #fdba74'}}>
                <p style={{margin: '0', fontSize: '16px', color: '#9a3412', fontWeight: '600'}}>
                  191 total manual events per month &times; 5.5 hours per store run = <span style={{fontSize: '20px', color: '#dc2626'}}>12,600+ Hours</span> Wasted Annually
                </p>
                <p style={{margin: '8px 0 0 0', fontSize: '14px', color: '#c2410c'}}>
                  <em>(Over ₹16,00,000+ wasted per year assuming standard minimum skilled analyst wages in Delhi)</em>
                </p>
              </div>
            </div>
          </div>
          <div className="flowchart-section">
            
            <div className="svg-container">
              <svg width="100%" height="1100" viewBox="250 0 780 1100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="painGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f97316"/>
                    <stop offset="100%" stopColor="#ea580c"/>
                  </linearGradient>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#94a3b8" />
                  </marker>
                  <marker id="arrow-dash" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
                  </marker>
                </defs>

                {/* 1. Start */}
                <rect x="300" y="30" width="300" height="60" rx="30" fill="#053364" />
                <text x="450" y="55" className="svg-white-text" textAnchor="middle">Start</text>
                <text x="450" y="75" fill="#94a3b8" fontSize="11" textAnchor="middle">(Distribution Day) Allocation</text>

                <path d="M450 90 V140" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 2. Get Planned Stock */}
                <rect x="300" y="140" width="300" height="50" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                <text x="450" y="170" className="svg-node-text" textAnchor="middle">Get Planned Stock for Store</text>

                <path d="M450 190 V240" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 3. Get Sales */}
                <rect x="300" y="240" width="300" height="50" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                <text x="450" y="270" className="svg-node-text" textAnchor="middle">Get Last 7 Day Sales</text>

                <path d="M450 290 V340" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 4. Get Current Stock */}
                <rect x="300" y="340" width="300" height="50" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                <text x="450" y="370" className="svg-node-text" textAnchor="middle">Get Current Stock for Store</text>

                <path d="M450 390 V440" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 5. Get WH Stock */}
                <rect x="300" y="440" width="300" height="50" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                <text x="450" y="470" className="svg-node-text" textAnchor="middle">Get Warehouse Stock</text>

                <path d="M450 490 V540" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 6. Logistics Manager / Analyst manually... */}
                <rect x="280" y="540" width="340" height="60" rx="8" fill="#FEB611" stroke="#FEB611" strokeWidth="2"/>
                <text x="450" y="565" fill="#053364" fontWeight="700" fontSize="14" textAnchor="middle">Logistics Manager / Analyst</text>
                <text x="450" y="582" fill="#053364" fontWeight="500" fontSize="12" textAnchor="middle">Manually cross-references all inputs</text>

                <path d="M450 600 V650" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 7. Dispatch to Store */}
                <rect x="320" y="650" width="260" height="50" rx="8" fill="#053364" stroke="#053364" strokeWidth="2"/>
                <text x="450" y="680" className="svg-white-text" textAnchor="middle">Dispatch to Store</text>

                <path d="M450 700 V750" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 8. Stock Reconciled */}
                <rect x="300" y="750" width="300" height="60" rx="8" fill="var(--bg-card)" stroke="#cbd5e1" strokeWidth="2"/>
                <text x="450" y="775" className="svg-node-text" textAnchor="middle">Stock Reconciled</text>
                <text x="450" y="792" className="svg-sub-text" textAnchor="middle">(Store + Warehouse)</text>

                <path d="M450 810 V860" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>

                {/* 9. Diamond: More Grade A Stores? */}
                <polygon points="450,860 580,900 450,940 320,900" fill="var(--bg-card)" stroke="#FEB611" strokeWidth="2"/>
                <text x="450" y="904" className="svg-node-text" textAnchor="middle">More Grade A Stores?</text>

                {/* YES Path (Next Store Loop) */}
                <path d="M580 900 H980 V60 H600" stroke="#FEB611" strokeWidth="2" strokeDasharray="8 8" fill="none" markerEnd="url(#arrow)"/>
                <rect x="580" y="889" width="40" height="22" rx="11" fill="#10b981" />
                <text x="600" y="904" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">YES</text>
                <text x="970" y="480" fill="#FEB611" fontSize="12" fontWeight="700" textAnchor="middle" transform="rotate(-90 970 480)">NEXT STORE</text>

                {/* NO Path */}
                <path d="M450 940 V990" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrow)"/>
                <rect x="430" y="949" width="40" height="22" rx="11" fill="#ef4444" />
                <text x="450" y="964" fill="white" fontSize="11" fontWeight="600" textAnchor="middle">NO</text>

                {/* 10. END */}
                <rect x="350" y="990" width="200" height="50" rx="25" fill="#053364" />
                <text x="450" y="1020" className="svg-white-text" textAnchor="middle">END</text>
              </svg>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
    </div>
  );
};

export default ProposalCFS;
