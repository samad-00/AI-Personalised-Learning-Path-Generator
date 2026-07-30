import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMockInterview, executeCode as apiExecuteCode } from '../services/api';
import { useAuth } from '../store/AuthContext';
import AnimatedBackground from '../components/AnimatedBackground';
import ThemeToggle from '../components/ThemeToggle';

/* ─────────────────────────────────────────
   Piston API — free, no-key, supports 30+ languages
───────────────────────────────────────── */
const LANG_CONFIG = {
  Python: { language: 'python', version: '3.10.0', ext: 'py' },
  JavaScript: { language: 'javascript', version: '18.15.0', ext: 'js' },
  TypeScript: { language: 'typescript', version: '5.0.3', ext: 'ts' },
  Java: { language: 'java', version: '15.0.2', ext: 'java' },
  'C++': { language: 'c++', version: '10.2.0', ext: 'cpp' },
  C: { language: 'c', version: '10.2.0', ext: 'c' },
  Go: { language: 'go', version: '1.16.2', ext: 'go' },
  Ruby: { language: 'ruby', version: '3.0.1', ext: 'rb' },
  Rust: { language: 'rust', version: '1.50.0', ext: 'rs' },
  Kotlin: { language: 'kotlin', version: '1.8.20', ext: 'kt' },
};

/* ─────────────────────────────────────────
   Per-Language Starter Code Templates
───────────────────────────────────────── */
const STARTER_TEMPLATES = {
  Python: (fnName = 'solution') =>
    `def ${fnName}(data):
    # Write your Python solution here
    pass

# Example usage:
# result = ${fnName}(your_input)
# print(result)
`,

  JavaScript: (fnName = 'solution') =>
    `function ${fnName}(data) {
    // Write your JavaScript solution here
}

// Example usage:
// console.log(${fnName}(yourInput));
`,

  TypeScript: (fnName = 'solution') =>
    `function ${fnName}(data: any): any {
    // Write your TypeScript solution here
}

// Example usage:
// console.log(${fnName}(yourInput));
`,

  Java: () =>
    `import java.util.*;

public class Main {

    public static Object solution(Object data) {
        // Write your Java solution here
        return null;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Read input from STDIN if needed
        // String input = sc.nextLine();

        Object result = solution(null); // pass your input
        System.out.println(result);
    }
}
`,

  'C++': () =>
    `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

// Write your C++ solution here
int solution(int n) {
    return n;
}

int main() {
    // Read input
    // int n; cin >> n;
    
    cout << solution(0) << endl;
    return 0;
}
`,

  C: () =>
    `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Write your C solution here */
int solution(int n) {
    return n;
}

int main() {
    /* Read input */
    /* int n; scanf("%d", &n); */
    
    printf("%d\\n", solution(0));
    return 0;
}
`,

  Go: () =>
    `package main

import "fmt"

// Write your Go solution here
func solution(data interface{}) interface{} {
    return data
}

func main() {
    // Read input if needed
    result := solution(nil)
    fmt.Println(result)
}
`,

  Ruby: (fnName = 'solution') =>
    `def ${fnName}(data)
  # Write your Ruby solution here
end

# Example usage:
# puts ${fnName}(your_input)
`,

  Rust: () =>
    `use std::io::{self, BufRead};

fn solution(data: &str) -> String {
    // Write your Rust solution here
    data.to_string()
}

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    let input = lines.next().unwrap_or(Ok(String::new())).unwrap_or_default();
    
    println!("{}", solution(&input));
}
`,

  Kotlin: () =>
    `fun solution(data: Any?): Any? {
    // Write your Kotlin solution here
    return data
}

fun main() {
    // Read input if needed
    // val input = readLine() ?: ""
    
    println(solution(null))
}
`,
};

function getStarterCode(language, aiStarterCode) {
  if (aiStarterCode && aiStarterCode.trim()) {
    return aiStarterCode;
  }
  const tmpl = STARTER_TEMPLATES[language];
  return tmpl ? tmpl() : `// Write your ${language} solution here\n`;
}

function prepareCode(code, language, stdin) {
  const c = (code || '').trim();
  if (!c) return '';

  if (language === 'Python' && !c.includes('print(') && !c.includes('if __name__')) {
    return `${c}

# ── Auto-Evaluator ──
import sys as _sys, ast as _ast, inspect as _inspect

def _auto_eval():
    _raw = _sys.stdin.read().strip()
    _arg = _raw
    if _raw:
        try: _arg = _ast.literal_eval(_raw)
        except: pass
    _fns = [v for k, v in list(globals().items())
            if _inspect.isfunction(v) and not k.startswith('_')]
    if not _fns: return
    _fn = _fns[-1]
    try:
        _p = len(_inspect.signature(_fn).parameters)
        if _p > 1 and isinstance(_arg, (list, tuple)) and len(_arg) == _p:
            print(_fn(*_arg))
        else:
            print(_fn(_arg))
    except Exception as _e:
        print(f"RuntimeError in {_fn.__name__}(): {type(_e).__name__}: {_e}", file=_sys.stderr)
        _sys.exit(1)

if __name__ == '__main__':
    _auto_eval()
`;
  }

  if ((language === 'JavaScript' || language === 'TypeScript') && !c.includes('console.log(')) {
    return `${c}

// ── Auto-Evaluator ──
try {
  const _fs = require('fs');
  const _raw = _fs.readFileSync(0, 'utf-8').trim();
  if (_raw) {
    let _arg = _raw;
    try { _arg = JSON.parse(_raw); } catch(e) {}
    const _fn = Object.values(global).find(v => typeof v === 'function' && !v.name.startsWith('_'));
    if (_fn) console.log(_fn(_arg));
  }
} catch(e) {}
`;
  }

  return c;
}

async function executeCodeClient(sourceCode, language, stdin = '') {
  if (!sourceCode?.trim()) {
    return { output: '', error: '⚠️ Editor is empty. Write your code then click Run.', status: 'Error' };
  }

  const cfg = LANG_CONFIG[language] || LANG_CONFIG.Python;
  const code = prepareCode(sourceCode, language, stdin);
  const fileName = cfg.language === 'java' ? 'Main.java' : `main.${cfg.ext}`;

  for (const pistonUrl of [
    'https://emkc.org/api/v2/piston/execute',
    'https://piston.kirillzhosul.ru/api/v2/piston/execute',
  ]) {
    try {
      const res = await fetch(pistonUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: cfg.language,
          version: cfg.version,
          files: [{ name: fileName, content: code }],
          stdin,
          run_timeout: 8000,
        }),
      });

      if (!res.ok) continue;

      const data = await res.json();
      const run = data.run || {};
      const compile = data.compile || {};

      const exitCode = run.code ?? compile.code ?? 0;
      const stderr = (run.stderr || compile.stderr || compile.output || '').trim();
      const stdout = (run.stdout || '').trim();

      if (exitCode !== 0 || (stderr && !stdout)) {
        return { output: stdout, error: stderr || 'Execution error (non-zero exit).', status: 'Error' };
      }
      if (stderr) {
        return { output: stdout, error: stderr, status: 'Warning' };
      }
      if (!stdout && exitCode === 0) {
        return {
          output: '(No output)\n💡 Tip: Use print() / System.out.println() / console.log() to display results.',
          error: '', status: 'No Output'
        };
      }
      return { output: stdout, error: '', status: 'Success' };
    } catch (err) {
      continue;
    }
  }

  return {
    output: '',
    error: 'Could not connect to the code execution server.\nPlease check your internet connection and try again.',
    status: 'Error'
  };
}

/* ─────────────────────────────────────────
   Code Editor Component
───────────────────────────────────────── */
function CodeEditor({ q, i }) {
  const initialLang = q.language || 'Python';
  const [code, setCode] = useState(getStarterCode(initialLang, q.starter_code));
  const [lang, setLang] = useState(initialLang);
  const [stdin, setStdin] = useState(q.sample_input || '');
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const textareaRef = useRef(null);

  const handleLangChange = (newLang) => {
    const tmpl = STARTER_TEMPLATES[newLang];
    const defaultCode = tmpl ? tmpl() : `// Write your ${newLang} solution here\n`;
    setLang(newLang);
    setCode(defaultCode);
    setOutput(null);
  };

  const handleReset = () => {
    const tmpl = STARTER_TEMPLATES[lang];
    setCode(tmpl ? tmpl() : `// Write your ${lang} solution here\n`);
    setOutput(null);
  };

  const handleTabKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const executableCode = prepareCode(code, lang, stdin);
      let result;
      try {
        result = await apiExecuteCode({ code: executableCode, language: lang, stdin });
      } catch (backendErr) {
        console.warn('Backend execution failed, using fallback Piston client runner:', backendErr);
        result = await executeCodeClient(code, lang, stdin);
      }
      setOutput(result);
    } catch (e) {
      setOutput({ output: '', error: e.message, status: 'Error' });
    } finally {
      setRunning(false);
    }
  };

  const badgeBase = {
    height: 28,
    padding: '0 14px',
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.4px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    flexShrink: 0,
    lineHeight: 1,
    color: '#ffffff',
  };

  const diffStyle = {
    Easy: { background: '#10b981', border: '1px solid #059669' },
    Medium: { background: '#f59e0b', border: '1px solid #d97706' },
    Hard: { background: '#ef4444', border: '1px solid #dc2626' },
  };

  return (
    <div className="bento-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', background: 'var(--surface-color)' }}>
        <span style={{ ...badgeBase, background: '#4f46e5', border: '1px solid #4338ca', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}>
          TASK {i + 1}
        </span>
        {q.difficulty && (
          <span style={{ ...badgeBase, ...(diffStyle[q.difficulty] || { background: '#64748b', border: '1px solid #475569' }) }}>
            {q.difficulty}
          </span>
        )}
        {q.time_limit && (
          <span style={{ ...badgeBase, background: 'var(--surface-muted)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            ⏱ {q.time_limit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Problem Statement */}
        <div style={{ padding: '1.5rem', background: 'var(--surface-color)' }}>
          <p style={{ margin: '0 0 1.25rem', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', lineHeight: 1.7, fontFamily: 'Outfit, sans-serif' }}>{q.question}</p>

          {q.sample_input && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, minWidth: 200, padding: '1rem 1.2rem', background: '#12121f', borderRadius: 14, border: '1px solid #2a2a40', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#38e54d' }}></span>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#a0a6b8', letterSpacing: '1px' }}>SAMPLE INPUT</p>
                </div>
                <pre style={{ margin: 0, color: '#ffffff', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '14px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.sample_input}</pre>
              </div>
              <div style={{ flex: 1, minWidth: 200, padding: '1rem 1.2rem', background: '#12121f', borderRadius: 14, border: '1px solid #2a2a40', boxShadow: '0 4px 14px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ffb86c' }}></span>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#a0a6b8', letterSpacing: '1px' }}>EXPECTED OUTPUT</p>
                </div>
                <pre style={{ margin: 0, color: '#ffbe6b', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '14px', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.sample_output}</pre>
              </div>
            </div>
          )}

          {q.hints && (
            <div>
              <button onClick={() => setShowHints(v => !v)} className="hover-pill"
                style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'var(--surface-muted)', color: 'var(--text-primary)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>
                {showHints ? '🙈 Hide Hints' : '💡 Show Hints'}
              </button>
              {showHints && (
                <div style={{ marginTop: '0.85rem', padding: '1rem 1.25rem', background: 'rgba(20,184,166,0.08)', borderRadius: 12, borderLeft: '4px solid var(--accent-teal)' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{q.hints}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
          {/* Editor Toolbar */}
          <div style={{ padding: '0.75rem 1.25rem', background: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#a0a6b8', fontWeight: 700 }}>Language:</span>
            <select value={lang} onChange={e => handleLangChange(e.target.value)}
              style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #3b3b5c', background: '#252540', color: '#ffffff', fontSize: 13, cursor: 'pointer', fontWeight: 700, outline: 'none' }}>
              {Object.keys(LANG_CONFIG).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem' }}>
              <button onClick={handleReset}
                style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #444466', background: 'transparent', color: '#cccccc', cursor: 'pointer', fontSize: 13, fontWeight: 700, transition: 'all 0.2s' }}>
                Reset
              </button>
              <button onClick={handleRun} disabled={running}
                style={{ padding: '6px 20px', borderRadius: 8, border: 'none', background: running ? '#444' : '#10b981', color: '#ffffff', cursor: running ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 800, transition: 'all 0.2s', boxShadow: running ? 'none' : '0 2px 10px rgba(16,185,129,0.3)' }}>
                {running ? '⏳ Running...' : '▶ Run Code'}
              </button>
            </div>
          </div>

          {/* Textarea Code Editor */}
          <div style={{ position: 'relative', background: '#0d0d1a' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleTabKey}
              spellCheck={false}
              style={{
                width: '100%', minHeight: 260, padding: '1rem 1rem 1rem 3.5rem',
                background: 'transparent', color: '#e8e8f0', fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                fontSize: 14, lineHeight: 1.7, border: 'none', outline: 'none', resize: 'vertical',
                boxSizing: 'border-box', caretColor: '#38e54d', letterSpacing: '0.3px',
              }}
            />
            {/* Line numbers */}
            <div style={{
              position: 'absolute', top: 0, left: 0, padding: '1rem 0.5rem',
              color: '#444', fontFamily: 'monospace', fontSize: 14, lineHeight: 1.7,
              userSelect: 'none', pointerEvents: 'none', textAlign: 'right', width: '2.5rem',
            }}>
              {code.split('\n').map((_, n) => <div key={n}>{n + 1}</div>)}
            </div>
          </div>

          {/* Stdin */}
          <div style={{ padding: '0.85rem 1.25rem', background: '#12121f', borderTop: '1px solid #222' }}>
            <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 800, color: '#777', letterSpacing: 1 }}>STDIN (OPTIONAL INPUT)</p>
            <textarea value={stdin} onChange={e => setStdin(e.target.value)}
              placeholder="Custom input to pass to your program..."
              rows={2}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', background: '#0d0d1a', border: '1px solid #2a2a40', borderRadius: 8, color: '#dddddd', fontFamily: 'monospace', fontSize: 13, resize: 'vertical', outline: 'none' }} />
          </div>

          {/* Output */}
          {output && (
            <div style={{ padding: '1.25rem 1.5rem', background: '#0a0a18', borderTop: '1px solid #2a2a40' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                {output.status === 'Error' ? (
                  <>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#ff5050' }}></span>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#ff5050' }}>❌ RUNTIME ERROR / EXCEPTION</p>
                  </>
                ) : output.status === 'No Output' ? (
                  <>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }}></span>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#f59e0b' }}>ℹ️ EXECUTION COMPLETED (NO OUTPUT)</p>
                  </>
                ) : (
                  <>
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: '#38e54d' }}></span>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 800, letterSpacing: 1, color: '#38e54d' }}>✅ EXECUTION RESULT</p>
                  </>
                )}
              </div>

              {output.output && (
                <pre style={{ margin: 0, fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '13.5px', lineHeight: 1.6, color: output.status === 'No Output' ? '#ffbe6b' : '#c8f7c5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>
                  {output.output}
                </pre>
              )}
              {output.error && (
                <pre style={{ margin: output.output ? '0.75rem 0 0' : 0, padding: output.output ? '0.75rem 1rem' : 0, background: output.output ? 'rgba(255,80,80,0.08)' : 'transparent', borderRadius: 8, fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '13.5px', lineHeight: 1.6, color: '#ff8080', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: 500 }}>
                  {output.error}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MCQ Card
───────────────────────────────────────── */
function MCQCard({ q, i }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="bento-card hover-lift" style={{ padding: '1.75rem' }}>
      <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>
        <span style={{ color: 'var(--accent-pink)', marginRight: 10, fontWeight: 800 }}>Q{i + 1}.</span>{q.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {q.options.map((opt, j) => {
          let bg = 'var(--bg-color)', border = '1px solid var(--border-color)', color = 'var(--text-primary)';
          if (revealed) {
            if (j === q.correct_answer_index) { bg = 'rgba(56,229,77,0.14)'; border = '2px solid #38e54d'; }
            else if (j === selected) { bg = 'rgba(255,80,80,0.14)'; border = '2px solid #ff5050'; }
          } else if (j === selected) { border = '2px solid var(--accent-pink)'; bg = 'rgba(235,99,131,0.08)'; }
          return (
            <div key={j} onClick={() => !revealed && setSelected(j)} className="hover-pill"
              style={{ padding: '14px 18px', background: bg, borderRadius: 14, border, cursor: revealed ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 14, color, fontWeight: 600, transition: 'all 0.2s ease' }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface-color)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {String.fromCharCode(65 + j)}
              </span>
              <span style={{ lineHeight: 1.5, flex: 1 }}>{opt}</span>
              {revealed && j === q.correct_answer_index && <span style={{ fontSize: 18 }}>✅</span>}
              {revealed && j === selected && j !== q.correct_answer_index && <span style={{ fontSize: 18 }}>❌</span>}
            </div>
          );
        })}
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)} className="btn-primary"
          style={{ marginTop: '1.25rem', padding: '10px 24px', fontSize: 13 }}>
          Show Answer
        </button>
      ) : (
        <div style={{ marginTop: '1.25rem', padding: '1.25rem', background: 'rgba(235, 99, 131, 0.08)', borderRadius: 16, borderLeft: '4px solid var(--accent-pink)' }}>
          <strong style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontFamily: 'Outfit, sans-serif' }}>✅ Correct Answer: {q.options[q.correct_answer_index]}</strong>
          {q.explanation && <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{q.explanation}</p>}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Tab Button
───────────────────────────────────────── */
function TabBtn({ label, active, onClick, count }) {
  return (
    <button onClick={onClick} className="hover-pill" style={{
      padding: '10px 22px', borderRadius: 100, border: '1px solid var(--border-color)', cursor: 'pointer',
      fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', whiteSpace: 'nowrap',
      background: active ? 'var(--text-primary)' : 'var(--surface-color)',
      color: active ? 'var(--bg-color)' : 'var(--text-secondary)',
      boxShadow: active ? '0 4px 14px rgba(0,0,0,0.12)' : 'none',
    }}>
      {label} {count !== undefined && <span style={{ opacity: 0.75, marginLeft: 4 }}>({count})</span>}
    </button>
  );
}

/* ─────────────────────────────────────────
   Test Modes Config
───────────────────────────────────────── */
const TEST_MODES = [
  { id: 'full', label: '🎯 Full Mock Interview', desc: 'MCQs + Analytical + Coding + Rapid Fire + Soft Skills', badgeColor: 'var(--accent-pink)' },
  { id: 'mcq_only', label: '📝 MCQ Only', desc: 'Multiple choice questions to test core domain knowledge', badgeColor: 'var(--accent-teal)' },
  { id: 'analytical', label: '🧠 Analytical', desc: 'Logical reasoning and analytical thinking problems', badgeColor: 'var(--accent-orange)' },
  { id: 'coding', label: '💻 Coding Round', desc: 'Technical coding & problem solving with live code editor', badgeColor: '#38bdf8' },
  { id: 'rapid', label: '⚡ Rapid Fire', desc: 'Quick 30-second rapid answer questions', badgeColor: '#eab308' },
  { id: 'soft_skills', label: '🤝 Soft Skills', desc: 'Behavioral and interpersonal scenario questions', badgeColor: '#a855f7' },
];

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function InterviewPrep() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState('');
  const [skills, setSkills] = useState('');
  const [jd, setJd] = useState('');
  const [testMode, setTestMode] = useState('full');
  const [questionCount, setQuestionCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [error, setError] = useState('');
  const [testData, setTestData] = useState(null);
  const [activeTab, setActiveTab] = useState('mcqs');

  // Dynamic loading text effect
  useEffect(() => {
    let interval;
    if (loading) {
      const messages = [
        `⏳ Preparing ${questionCount} Questions...`,
        "🧠 Analyzing your skills...",
        "📝 Designing custom scenarios...",
        "💻 Generating coding challenges...",
        "⚡ Crafting rapid-fire questions...",
        "🤝 Adding soft skills tests...",
        "✨ Almost there, putting it all together..."
      ];
      let msgIndex = 0;
      setLoadingText(messages[0]);
      interval = setInterval(() => {
        msgIndex = (msgIndex + 1) % messages.length;
        setLoadingText(messages[msgIndex]);
      }, 3500); // Change every 3.5s
    }
    return () => clearInterval(interval);
  }, [loading, questionCount]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await generateMockInterview({
        job_role: jobRole,
        skills,
        job_description: jd,
        test_type: testMode,
        question_count: questionCount,
      });
      const questions = res.data.questions;
      setTestData({ ...questions, job_role: res.data.job_role || jobRole, test_type: testMode });

      const modeTabMap = { mcq_only: 'mcqs', coding: 'coding', rapid: 'rapid_fire', soft_skills: 'soft_skills', analytical: 'analytical', full: 'mcqs' };
      setActiveTab(modeTabMap[testMode] || 'mcqs');
    } catch (err) {
      console.error('Interview error:', err);
      setError('Failed: ' + (err.response?.data?.error || err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /* ── Results View ── */
  if (testData) {
    const tabs = [
      { id: 'mcqs', label: '📝 MCQs', data: testData.mcqs },
      { id: 'analytical', label: '🧠 Analytical', data: testData.analytical },
      { id: 'coding', label: '💻 Coding', data: testData.coding },
      { id: 'rapid_fire', label: '⚡ Rapid Fire', data: testData.rapid_fire },
      { id: 'soft_skills', label: '🤝 Soft Skills', data: testData.soft_skills },
    ].filter(t => t.data && t.data.length > 0);

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <style>{`
          @keyframes smoothRiseUp {
            0% { opacity: 0; transform: translateY(60px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .rise-item-1 { animation: smoothRiseUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
          .rise-item-2 { animation: smoothRiseUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
          .hover-lift { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; }
          .hover-lift:hover { transform: translateY(-6px) scale(1.01) !important; box-shadow: 0 18px 38px rgba(0,0,0,0.14) !important; }
        `}</style>
        <AnimatedBackground />

        {/* Top Navbar Header */}
        <nav style={{ padding: '2rem 3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
            <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 15px rgba(226, 85, 131, 0.25)' }}>
                📖
              </div>
              <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LearnPath</span>
            </div>

            <div style={{ display: 'flex', gap: 36, fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onClick={() => navigate('/dashboard')}>Home</span>
              <span style={{ color: 'var(--accent-pink)', cursor: 'pointer' }}>Interview Preparation</span>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onClick={() => navigate('/cv-analyzer')}>CV Analyzer</span>
              <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onClick={() => navigate('/profile')}>Profile</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <ThemeToggle />
            <button title="Logout" onClick={logout} style={{ background: 'transparent', border: '2px solid var(--border-color)', color: 'var(--text-primary)', width: 46, height: 46, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transition: 'all 0.2s ease' }}>
              🚪
            </button>
          </div>
        </nav>

        <div style={{ position: 'relative', zIndex: 1, padding: '1rem 2rem 4rem', maxWidth: 1040, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div className="rise-item-1" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setTestData(null)} className="hover-pill" style={{ padding: '10px 22px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'Outfit, sans-serif' }}>
              ← New Test
            </button>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.75rem,3.5vw,2.4rem)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
                Mock Interview — <span style={{ color: 'var(--accent-teal)' }}>{testData.job_role}</span>
              </h1>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500 }}>
                {TEST_MODES.find(m => m.id === testData.test_type)?.label || 'Full Mock Interview'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          {tabs.length > 1 && (
            <div className="rise-item-2" style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {tabs.map(t => <TabBtn key={t.id} label={t.label} count={t.data?.length} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
            </div>
          )}

          {/* MCQs */}
          {activeTab === 'mcqs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(testData.mcqs || []).map((q, i) => <MCQCard key={i} q={q} i={i} />)}
            </div>
          )}

          {/* Analytical */}
          {activeTab === 'analytical' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(testData.analytical || []).map((q, i) => (
                <div key={i} className="bento-card hover-lift" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-orange)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>{q.question}</p>
                  </div>
                  <div style={{ padding: '1.1rem 1.35rem', background: 'rgba(244, 162, 89, 0.08)', borderRadius: 14, borderLeft: '4px solid var(--accent-orange)' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>💡 What interviewers look for:</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.tips_to_answer}</p>
                    {q.ideal_answer && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>✅ Ideal Answer Strategy:</p>
                        <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.ideal_answer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coding — Live Editor */}
          {activeTab === 'coding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              <div style={{ padding: '1rem 1.25rem', background: 'rgba(56,229,77,0.08)', borderRadius: 16, border: '1px solid rgba(56,229,77,0.25)', fontSize: 14, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>💡</span>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>Live Code Editor</strong> — Write your code solution and click <strong>▶ Run Code</strong> to evaluate output. Tab key inserts 4 spaces.
                </div>
              </div>
              {(testData.coding || []).map((q, i) => <CodeEditor key={i} q={q} i={i} />)}
            </div>
          )}

          {/* Rapid Fire */}
          {activeTab === 'rapid_fire' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
              {(testData.rapid_fire || []).map((q, i) => (
                <div key={i} className="bento-card hover-lift" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
                    <span style={{ padding: '5px 14px', background: '#f59e0b', border: '1px solid #d97706', borderRadius: 100, fontSize: 12, fontWeight: 800, color: '#ffffff', flexShrink: 0, boxShadow: '0 2px 6px rgba(245,158,11,0.25)' }}>⚡ {i + 1}</span>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5, fontFamily: 'Outfit, sans-serif' }}>{q.question}</p>
                  </div>
                  <details style={{ cursor: 'pointer' }}>
                    <summary style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 700, userSelect: 'none' }}>Reveal Ideal Answer</summary>
                    <p style={{ margin: '0.85rem 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, paddingLeft: '0.75rem', borderLeft: '3px solid #f59e0b' }}>{q.ideal_answer}</p>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Soft Skills */}
          {activeTab === 'soft_skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {(testData.soft_skills || []).map((q, i) => (
                <div key={i} className="bento-card hover-lift" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>🤝</div>
                    <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.6, fontFamily: 'Outfit, sans-serif' }}>{q.question}</p>
                  </div>
                  <div style={{ padding: '1.1rem 1.35rem', background: 'rgba(42, 118, 106, 0.08)', borderRadius: 14, borderLeft: '4px solid var(--accent-teal)' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem', fontFamily: 'Outfit, sans-serif' }}>🎯 What to demonstrate:</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.what_to_demonstrate}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Setup Form ── */
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes smoothRiseUp {
          0% { opacity: 0; transform: translateY(60px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .rise-item-1 { animation: smoothRiseUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        .rise-item-2 { animation: smoothRiseUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both; }
        .rise-item-3 { animation: smoothRiseUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.55s both; }
        .hover-lift { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .hover-lift:hover { transform: translateY(-6px) scale(1.01) !important; box-shadow: 0 18px 38px rgba(0,0,0,0.14) !important; }
        .hover-pill { transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .hover-pill:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1) !important; }
        
        @keyframes buttonFillBar {
          0% { width: 0%; opacity: 1; }
          90% { width: 95%; opacity: 1; }
          100% { width: 100%; opacity: 0; }
        }
        .btn-loading-fill {
          position: relative;
          overflow: hidden;
        }
        .btn-loading-fill::after {
          content: '';
          position: absolute;
          top: 0; left: 0; bottom: 0;
          background: rgba(214, 51, 90, 0.85);
          animation: buttonFillBar 4.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          z-index: 1;
        }
        .btn-loading-text {
          position: relative;
          z-index: 2;
        }
      `}</style>
      <AnimatedBackground />

      {/* Top Navbar Header */}
      <nav style={{ padding: '2rem 3.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 4px 15px rgba(226, 85, 131, 0.25)' }}>
              📖
            </div>
            <span style={{ fontSize: 32, fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>LearnPath</span>
          </div>

          <div style={{ display: 'flex', gap: 36, fontSize: 19, fontWeight: 700, color: 'var(--text-primary)' }}>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onClick={() => navigate('/dashboard')}>Home</span>
            <span style={{ color: 'var(--accent-pink)', cursor: 'pointer' }}>Interview Preparation</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onClick={() => navigate('/cv-analyzer')}>CV Analyzer</span>
            <span style={{ cursor: 'pointer', transition: 'opacity 0.2s', opacity: 0.85 }} onClick={() => navigate('/profile')}>Profile</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <ThemeToggle />
          <button title="Logout" onClick={logout} style={{ background: 'transparent', border: '2px solid var(--border-color)', color: 'var(--text-primary)', width: 46, height: 46, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, transition: 'all 0.2s ease' }}>
            🚪
          </button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, padding: '1rem 2rem 4rem', maxWidth: 880, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {/* Title Header */}
        <div className="rise-item-1" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>

          <h1 style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', fontWeight: 900, margin: '0 0 0.75rem', color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif', letterSpacing: '-1px' }}>
            Interview Preparation
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: 640, margin: '0 auto', fontWeight: 500 }}>
            Generate realistic mock interview questions with interactive MCQs, live code evaluation, rapid fire rounds, and behavioral soft skills feedback.
          </p>
        </div>

        {/* Test Mode Selector — Orange Theme */}
        <div className="rise-item-2" style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif' }}>Select Test Mode</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {TEST_MODES.map(mode => {
              const isSelected = testMode === mode.id;
              return (
                <div key={mode.id} onClick={() => setTestMode(mode.id)} className="hover-lift"
                  style={{
                    padding: '1.35rem 1.25rem', borderRadius: 22,
                    border: '2px solid var(--accent-orange)',
                    background: isSelected ? 'rgba(244, 162, 89, 0.12)' : 'var(--accent-orange)',
                    boxShadow: 'none',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    gap: '0.75rem', transition: 'all 0.25s ease', position: 'relative'
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontWeight: 900, color: isSelected ? 'var(--accent-orange)' : '#ffffff', fontSize: '1.05rem', fontFamily: 'Outfit, sans-serif' }}>{mode.label}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: isSelected ? 'var(--text-primary)' : 'rgba(255,255,255,0.92)', lineHeight: 1.5, fontWeight: 500 }}>{mode.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container — Exact Dashboard Curriculum Card Color Pattern */}
        <form onSubmit={handleGenerate} className="bento-card card-teal rise-item-3 hover-lift"
          style={{
            padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem',
            position: 'relative', overflow: 'hidden', borderRadius: 28, background: 'var(--accent-teal)', color: '#ffffff',
            boxShadow: '0 18px 45px rgba(42, 118, 106, 0.25)', border: 'none'
          }}>
          <div style={{ position: 'absolute', right: -20, top: -20, fontSize: 150, opacity: 0.1, pointerEvents: 'none' }}>🎯</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 800, color: '#ffffff', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>Target Job Role *</label>
            <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px 24px', borderRadius: 100, border: 'none', fontSize: 15, fontFamily: 'Inter', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }} />
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 800, color: '#ffffff', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>Your Skills <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>(comma separated)</span></label>
            <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Python, SQL, Machine Learning"
              style={{ width: '100%', boxSizing: 'border-box', padding: '16px 24px', borderRadius: 100, border: 'none', fontSize: 15, fontFamily: 'Inter', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }} />
          </div>

          {/* Question Count Picker — Translucent Segment Control like Dashboard Level Switcher */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 800, color: '#ffffff', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
              Number of Questions
              <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>(total questions — max 5 for coding)</span>
            </label>
            <div style={{ display: 'flex', gap: 8, background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 100, alignItems: 'center' }}>
              {[20, 30, 40, 50].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setQuestionCount(n)}
                  style={{
                    flex: 1, padding: '12px 0', borderRadius: 100, border: 'none',
                    background: questionCount === n ? 'var(--surface-color)' : 'transparent',
                    color: questionCount === n ? 'var(--accent-teal)' : '#ffffff',
                    fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.25s',
                    boxShadow: questionCount === n ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                >
                  {n}
                </button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 10, paddingLeft: 6 }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700 }}>Custom:</span>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={questionCount}
                  onChange={e => setQuestionCount(Math.max(10, Math.min(50, Number(e.target.value))))}
                  style={{ width: 56, padding: '6px 8px', borderRadius: 100, border: 'none', background: 'var(--surface-color)', color: 'var(--accent-teal)', fontSize: 13, fontWeight: 800, outline: 'none', textAlign: 'center' }}
                />
              </div>
            </div>
            {/* Slider */}
            <input type="range" min={10} max={50} value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              style={{ width: '100%', marginTop: '1rem', accentColor: '#ffffff', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: 600 }}>
              <span>10 (Quick)</span>
              <span style={{ fontWeight: 800, color: '#ffffff' }}>{questionCount} Questions Selected</span>
              <span>50 (Comprehensive)</span>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <label style={{ display: 'block', marginBottom: '0.6rem', fontWeight: 800, color: '#ffffff', fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>Job Description <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>(optional — improves relevance)</span></label>
            <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..."
              style={{ width: '100%', boxSizing: 'border-box', minHeight: 110, padding: '16px 24px', borderRadius: 20, border: 'none', fontSize: 14, fontFamily: 'Inter', outline: 'none', background: 'var(--surface-color)', color: 'var(--text-primary)', resize: 'vertical', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }} />
          </div>

          {error && (
            <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(255,80,80,0.2)', borderRadius: 14, color: '#ffffff', fontSize: 14, border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          <button type="submit" disabled={loading || !jobRole.trim()} className={`btn-primary hover-pill ${loading ? 'btn-loading-fill' : ''}`}
            style={{
              padding: '16px 28px', borderRadius: 100, border: 'none',
              background: loading ? 'var(--surface-color)' : 'var(--text-primary)',
              color: loading ? 'var(--text-primary)' : 'var(--bg-color)', 
              fontSize: '1.1rem', fontWeight: 900,
              cursor: loading || !jobRole.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', marginTop: '0.5rem',
              boxShadow: 'none'
            }}>
            <span className="btn-loading-text">{loading ? loadingText : `Preparing ${questionCount} Questions`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

