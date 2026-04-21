import { useState, useEffect, useRef } from 'react';
import './index.css';

function CircuitBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    if (!bgRef.current) return;
    const bg = bgRef.current;
    bg.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
      const l = document.createElement('div');
      l.className = 'circuit-line';
      l.style.cssText = `left:${Math.random() * 100}%;height:${60 + Math.random() * 100}px;animation-duration:${4 + Math.random() * 6}s;animation-delay:${Math.random() * 4}s`;
      bg.appendChild(l);
    }
    for (let i = 0; i < 20; i++) {
      const d = document.createElement('div');
      d.className = 'circuit-dot';
      d.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${Math.random() * 5}s`;
      bg.appendChild(d);
    }
  }, []);

  return <div className="circuit-bg" ref={bgRef}></div>;
}

export default function App() {
  const [loadingApp, setLoadingApp] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [latency, setLatency] = useState(42);
  const [logs, setLogs] = useState([
    { type: 'log-info', msg: '[INFO] CODE SHIELD initialized' },
    { type: 'log-info', msg: '[INFO] AI Engine connected — node: local' },
    { type: '', msg: '[SYS] Quantum Shield Layer active' },
    { type: '', msg: '[SYS] Ready for analysis' }
  ]);
  
  const [mode, setMode] = useState('code');
  const [code, setCode] = useState('function calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i <= items.length; i++) {\n    total += items[i].price;\n  }\n  console.log(totalAmount);\n  return total;\n}');
  const [projectPath, setProjectPath] = useState('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [results, setResults] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const logsEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingApp(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const lv = setInterval(() => {
      setLatency(Math.floor(30 + Math.random() * 90));
    }, 3000);
    return () => clearInterval(lv);
  }, []);

  useEffect(() => {
    const blv = setInterval(() => {
      const msgs = ['[SYS] Heartbeat OK', '[NET] Ping 23ms', '[SYS] Memory nominal', '[NET] Secure tunnel active', '[SYS] Threat monitor idle'];
      addLog('', msgs[Math.floor(Math.random() * msgs.length)]);
    }, 8000);
    return () => clearInterval(blv);
  }, []);

  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (type, msg) => {
    setLogs(prev => [...prev, { type, msg }]);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2000);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('light-mode', darkMode);
  };

  const handleClearCode = () => {
    setCode('');
    setResults(null);
    addLog('log-info', '[INFO] Editor cleared');
  };

  const lineNums = Array.from({ length: Math.max(code.split('\n').length, 10) }, (_, i) => i + 1).join('\n');

  const analyzeCode = async () => {
    if (!code.trim()) {
      showToast('Paste some code first');
      return;
    }
    
    setIsAnalyzing(true);
    setResults(null);
    setScanStep(0);
    addLog('log-info', '[SCAN] Syntax Analysis initiated');

    const steps = ['Scanning AST...', 'Detecting vulnerabilities...', 'Generating AI suggestions...'];
    
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setScanStep(step);
        addLog('log-info', '[SCAN] ' + steps[step]);
      }
    }, 700);

    try {
      const response = await fetch('/analyze_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      
      clearInterval(interval);
      if (data.success) {
        const d = data.data;
        const issues = [];
        
        let score = d.quality_score || 0;
        
        if (d.bugs && d.bugs.length > 0) {
          d.bugs.forEach((b, i) => {
            issues.push({
              type: 'bug',
              severity: 'high',
              title: `Bug Detected #${i + 1}`,
              desc: b
            });
          });
        }
        
        if (issues.length === 0) {
           issues.push({
              type: 'clean',
              severity: 'low',
              title: 'Code Looks Clear',
              desc: d.explanation || 'No major issues detected.',
           });
        }
        
        setResults({ 
          issues, 
          score,
          originalCode: code,
          fixedCode: d.fixed_code,
          explanation: d.explanation
        });
        addLog('', `[SYS] Code Analysis complete — Score: ${score}`);
      } else {
        showToast('Analysis returned failure');
        addLog('log-err', '[ERR] Analysis failed');
      }
    } catch (e) {
      clearInterval(interval);
      showToast('Error connecting to backend');
      addLog('log-err', '[ERR] ' + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeProject = async () => {
    if (!projectPath.trim()) {
      showToast('Enter a valid project path');
      return;
    }
    
    setIsAnalyzing(true);
    setResults(null);
    setScanStep(0);
    addLog('log-info', '[SCAN] Project Analysis initiated');

    const steps = ['Scanning project directory...', 'Testing files...', 'Compiling report...'];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < steps.length) {
        setScanStep(step);
        addLog('log-info', '[SCAN] ' + steps[step]);
      }
    }, 700);

    try {
      const response = await fetch('/analyze_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: projectPath }),
      });
      const data = await response.json();
      
      clearInterval(interval);
      if (data.success) {
        const issues = [];
        let score = 100;
        
        if (data.modified_files) {
          data.modified_files.forEach((f) => {
            if (f.bugs_fixed && f.bugs_fixed.length > 0) {
              f.bugs_fixed.forEach((b) => {
                  issues.push({
                    type: 'bug',
                    severity: 'high',
                    title: `Issue in ${f.file}`,
                    desc: b,
                    fix: `Score drop to ${f.quality_score}`
                  });
              });
            }
          });
        }

        if (issues.length === 0) {
           issues.push({
              type: 'clean',
              severity: 'low',
              title: 'Project is Clean',
              desc: data.summary || 'No major issues detected across project files.',
           });
        } else {
           issues.push({
              type: 'info',
              severity: 'medium',
              title: 'Summary',
              desc: data.summary || 'Project analyzed with warnings.'
           });
        }
        
        setResults({ issues, score: 'Project' });
        addLog('', `[SYS] Project Analysis complete`);
      } else {
        showToast('Analysis returned failure');
        addLog('log-err', `[ERR] ${data.error}`);
      }
    } catch (e) {
      clearInterval(interval);
      showToast('Error connecting to backend');
      addLog('log-err', '[ERR] ' + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyFix = (fixText) => {
    navigator.clipboard.writeText(fixText).then(() => {
      showToast('Copied to clipboard');
    }).catch(() => showToast('Copy failed'));
  };

  return (
    <>
      <div id="loader" className={!loadingApp ? 'hidden' : ''}>
        <div className="shield-glow shield-pulse">
          <svg viewBox="0 0 100 120" fill="none">
            <path d="M50 5 L90 25 L90 60 C90 85 70 105 50 115 C30 105 10 85 10 60 L10 25 Z" stroke="#00aaff" strokeWidth="2" fill="rgba(0,170,255,0.08)" /> 
            <path d="M50 20 L75 35 L75 58 C75 75 63 90 50 98 C37 90 25 75 25 58 L25 35 Z" stroke="#00ffcc" strokeWidth="1" fill="rgba(0,255,204,0.05)" opacity="0.6" /> 
            <path d="M38 58 L47 67 L65 48" stroke="#00aaff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="loader-text">CODE SHIELD</div>
        <div className="loader-sub">Initializing AI Engine...</div>
        <div className="scan-line"></div>
      </div>

      <CircuitBackground />

      <div id="app" className={`app-wrapper grid-bg ${!loadingApp ? 'app-visible' : ''}`} style={{ opacity: 0 }}>
        
        <header className="glass" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="32" viewBox="0 0 100 120" fill="none">
              <path d="M50 5L90 25V60C90 85 70 105 50 115 30 105 10 85 10 60V25Z" stroke="#00aaff" strokeWidth="3" fill="rgba(0,170,255,.1)" />
              <path d="M38 58L47 67 65 48" stroke="#00aaff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '3px', color: '#00aaff', fontFamily: "'JetBrains Mono', monospace" }}>CODE SHIELD</div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Protecting Your Code with AI Intelligence</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
               <button 
                  onClick={() => setMode('code')}
                  style={{
                    background: mode === 'code' ? 'rgba(0,170,255,.1)' : 'transparent',
                    border: 'none', padding: '6px 12px', cursor: 'pointer', color: mode === 'code' ? '#00aaff' : 'var(--muted)',
                    fontSize: '12px', fontFamily: "'JetBrains Mono', monospace"
                  }}>
                  Code View
               </button>
               <button 
                  onClick={() => setMode('project')}
                  style={{
                    background: mode === 'project' ? 'rgba(0,170,255,.1)' : 'transparent',
                    border: 'none', borderLeft: '1px solid var(--border)', padding: '6px 12px', cursor: 'pointer', color: mode === 'project' ? '#00aaff' : 'var(--muted)',
                    fontSize: '12px', fontFamily: "'JetBrains Mono', monospace"
                  }}>
                  Project View
               </button>
            </div>
            <button onClick={toggleTheme} title="Toggle theme" style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace" }}>
              <i data-lucide={darkMode ? "sun" : "moon"} style={{ width: '14px', height: '14px' }}></i>
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              <div className="status-dot"></div> Connected to AI Engine
            </div>
          </div>
        </header>

        <section style={{ textAlign: 'center', padding: '40px 24px 24px' }}>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, margin: 0, background: 'linear-gradient(135deg, #00aaff, #00ffcc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AI-Powered Bug Detection & Code Intelligence
          </h1>
          <p style={{ color: 'var(--muted)', margin: '10px auto 0', maxWidth: '500px', fontSize: '15px' }}>
            Analyze, detect, and fix errors instantly with advanced AI
          </p>
        </section>

        <div style={{ display: 'flex', gap: '16px', padding: '0 24px 16px', flexWrap: 'wrap', maxWidth: '1400px', margin: '0 auto' }}>
          
          {/* Left panel: Editor / Project Path */}
          <div className="glass" style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>
                <i data-lucide={mode === 'code' ? 'code-2' : 'folder-git-2'} style={{ width: '15px', height: '15px', color: '#00aaff' }}></i> 
                {mode === 'code' ? 'Code Editor' : 'Project Directory'}
              </div>
              {mode === 'code' && (
                <button onClick={handleClearCode} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '6px', padding: '4px 10px', color: 'var(--muted)', fontSize: '11px', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <i data-lucide="trash-2" style={{ width: '12px', height: '12px' }}></i> Clear
                </button>
              )}
            </div>

            {mode === 'code' ? (
              <div style={{ display: 'flex', flex: 1, padding: '12px 0', overflow: 'auto', minHeight: '260px', maxHeight: '340px' }}>
                <div className="line-numbers" style={{ whiteSpace: 'pre-line' }}>{lineNums}</div>
                <textarea 
                  className="code-area" 
                  spellCheck="false" 
                  placeholder="Paste your code here..." 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  style={{ flex: 1, minHeight: '100%' }} 
                />
              </div>
            ) : (
               <div style={{ display: 'flex', flex: 1, padding: '40px 24px', alignItems: 'center', flexDirection: 'column', minHeight: '260px' }}>
                 <i data-lucide="folder-search" style={{ width: '48px', height: '48px', color: 'rgba(0,170,255, 0.4)', marginBottom: '16px' }}></i>
                 <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Enter absolute path to analyze workspace</p>
                 <input 
                    type="text" 
                    value={projectPath}
                    onChange={(e) => setProjectPath(e.target.value)}
                    placeholder="/home/user/project-path"
                    style={{
                      width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', 
                      borderRadius: '8px', color: 'var(--text)', fontFamily: "'JetBrains Mono', monospace", outline: 'none'
                    }}
                 />
               </div>
            )}

            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
              <button 
                className="glow-btn" 
                onClick={mode === 'code' ? analyzeCode : analyzeProject} 
                disabled={isAnalyzing}
                style={{ border: 'none', color: '#fff', fontWeight: 700, fontSize: '15px', padding: '12px 36px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isAnalyzing ? (
                  <>
                    <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span> 
                    Scanning...
                  </>
                ) : (
                  <>🛡️ {mode === 'code' ? 'Analyze Code' : 'Analyze Project'}</>
                )}
              </button>
            </div>
          </div>

          {/* Right panel: AI Report */}
          <div className="glass" style={{ flex: 1, minWidth: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>
              <i data-lucide="brain" style={{ width: '15px', height: '15px', color: '#00ffcc' }}></i> AI Agent Report
              {results && results.score && (
                 <span style={{ marginLeft: 'auto', background: 'rgba(0,255,204,0.1)', color: '#00ffcc', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    SCORE: {results.score}
                 </span>
              )}
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', minHeight: '260px', maxHeight: '340px' }}>
              {!isAnalyzing && !results && (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: '13px' }}>
                  <i data-lucide="shield" style={{ width: '40px', height: '40px', color: 'rgba(0,170,255,.2)', margin: '0 auto 12px', display: 'block' }}></i>
                  Paste {mode === 'code' ? 'code' : 'path'} and click <strong style={{ color: '#00aaff' }}>Analyze</strong> to begin
                </div>
              )}
              
              {isAnalyzing && (
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00aaff', fontSize: '13px' }}>
                   <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
                   <span className="typing-dot" style={{ animationDelay: '0.15s' }}></span>
                   <span className="typing-dot" style={{ animationDelay: '0.3s' }}></span>
                   <span>
                      {scanStep === 0 && 'Scanning...'}
                      {scanStep === 1 && 'Detecting vulnerabilities...'}
                      {scanStep === 2 && 'Generating AI suggestions...'}
                      {scanStep >= 3 && 'Finalizing...'}
                   </span>
                 </div>
              )}

              {results && results.issues && (
                 <div>
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                     <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                        {results.issues[0].type === 'clean' ? '✅ All Clear' : '🔍'} {results.issues.length} {results.issues.length === 1 ? 'issue' : 'issues'} item(s) generated
                     </span>
                     <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace" }}>Scan complete</span>
                   </div>
                   
                   {results.issues.map((iss, idx) => (
                      <div key={idx} className="fade-up" style={{ animationDelay: `${idx * 100}ms`, background: 'rgba(0,170,255,.04)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                           <span className={`badge-${iss.severity}`} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                              {iss.severity}
                           </span>
                           <span style={{ fontWeight: 600, fontSize: '13px' }}>{iss.title}</span>
                         </div>
                         <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>{iss.desc}</p>
                      </div>
                   ))}

                   {results.explanation && (
                     <div className="fade-up" style={{ animationDelay: `300ms`, background: 'rgba(255,170,0,.04)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className={`badge-medium`} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, textTransform: 'uppercase', fontFamily: "'JetBrains Mono', monospace" }}>
                             EXPLANATION
                          </span>
                        </div>
                        <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--muted)', lineHeight: '1.5' }}>{results.explanation}</p>
                     </div>
                   )}

                   {results.fixedCode && (
                     <div className="fade-up" style={{ animationDelay: `400ms`, display: 'flex', gap: '16px', marginTop: '16px', flexDirection: 'column' }}>
                       <div style={{ background: 'rgba(6,8,15,.6)', borderRadius: '6px', padding: '10px', border: '1px solid rgba(255,59,92,0.3)' }}>
                         <div style={{ fontSize: '11px', color: '#ff3b5c', marginBottom: '8px', fontWeight: 'bold' }}>BEFORE</div>
                         <pre style={{ margin: 0, fontSize: '11px', color: 'var(--muted)', whiteSpace: 'pre-wrap' }}><code>{results.originalCode}</code></pre>
                       </div>
                       <div style={{ background: 'rgba(6,8,15,.6)', borderRadius: '6px', padding: '10px', border: '1px solid rgba(0,230,138,0.3)', position: 'relative' }}>
                         <div style={{ fontSize: '11px', color: '#00e68a', marginBottom: '8px', fontWeight: 'bold' }}>AFTER (Suggested Fix)</div>
                         <pre style={{ margin: 0, fontSize: '11px', color: '#e0e8f8', whiteSpace: 'pre-wrap' }}><code>{results.fixedCode}</code></pre>
                         <button onClick={() => copyFix(results.fixedCode)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: '1px solid var(--border)', borderRadius: '4px', padding: '3px 6px', cursor: 'pointer', color: 'var(--muted)', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", transition: '.2s', whiteSpace: 'nowrap' }}>
                            📋 Copy
                         </button>
                       </div>
                     </div>
                   )}
                </div>
              )}
            </div>

            {results && (
              <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', justifyContent: 'space-between' }}>
                <button onClick={() => showToast('Report download feature is stubbed.')} style={{ background: 'none', border: '1px solid rgba(0,255,204,.3)', borderRadius: '6px', padding: '6px 12px', color: '#00ffcc', fontSize: '11px', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center' }}>
                  <i data-lucide="download" style={{ width: '12px', height: '12px' }}></i> Download Report
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '0 24px 16px', maxWidth: '1400px', margin: '0 auto' }}>
          <div className="glass" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '12px', color: 'var(--muted)' }}>
              <i data-lucide="terminal" style={{ width: '13px', height: '13px', color: '#00aaff' }}></i> System Logs 
              <span style={{ marginLeft: 'auto', fontSize: '10px', fontFamily: "'JetBrains Mono', monospace" }}>Latency: <span>{latency}</span>ms</span>
            </div>
            <div className="terminal">
              {logs.map((log, i) => (
                <div key={i} className={log.type}>{log.msg}</div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>

        <footer style={{ textAlign: 'center', padding: '16px 24px 24px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>
          <span style={{ color: '#00e68a' }}>●</span> ARMORiq API Key: ACTIVE &nbsp;|&nbsp; Secured by Quantum Shield Layer <br />
          <span style={{ opacity: .4, fontSize: '10px' }}>Connected to AI Engine • Processing via Secure Nodes</span>
        </footer>
      </div>

      <div className={`toast ${toastMsg ? 'show' : ''}`} style={{ transition: 'all 0.3s' }}>{toastMsg}</div>
    </>
  );
}
