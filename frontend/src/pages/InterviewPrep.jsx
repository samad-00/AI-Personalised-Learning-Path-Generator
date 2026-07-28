import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMockInterview, executeCode as apiExecuteCode } from '../services/api';
import AnimatedBackground from '../components/AnimatedBackground';

/* ─────────────────────────────────────────
   Piston API — free, no-key, supports 30+ languages
   https://github.com/engineer-man/piston
───────────────────────────────────────── */

// Map display language → Piston API lang/version + file extension
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

/* ─────────────────────────────────────────
   Get starter code for a language, using the
   AI-provided starter_code as a base if available
───────────────────────────────────────── */
function getStarterCode(language, aiStarterCode) {
  // If AI provided starter code for this language, use it
  if (aiStarterCode && aiStarterCode.trim()) {
    return aiStarterCode;
  }
  // Otherwise use our default template
  const tmpl = STARTER_TEMPLATES[language];
  return tmpl ? tmpl() : `// Write your ${language} solution here\n`;
}

/* ─────────────────────────────────────────
   Auto-evaluator: wraps a bare function with
   code that calls it with STDIN input and prints the result
   (Only for Python and JS without explicit print/console.log)
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Code Execution via Piston API
───────────────────────────────────────── */
async function executeCode(sourceCode, language, stdin = '') {
  if (!sourceCode?.trim()) {
    return { output: '', error: '⚠️ Editor is empty. Write your code then click Run.', status: 'Error' };
  }

  const cfg = LANG_CONFIG[language] || LANG_CONFIG.Python;
  const code = prepareCode(sourceCode, language, stdin);
  const fileName = cfg.language === 'java' ? 'Main.java' : `main.${cfg.ext}`;

  // Try primary Piston instance
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

      if (!res.ok) continue; // try next

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
      continue; // try next Piston instance
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

  // Switch language → load that language's template
  const handleLangChange = (newLang) => {
    const tmpl = STARTER_TEMPLATES[newLang];
    const defaultCode = tmpl ? tmpl() : `// Write your ${newLang} solution here\n`;
    setLang(newLang);
    setCode(defaultCode);
    setOutput(null);
  };

  // Reset to the current language's default template
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
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
      }, 0);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      // prepareCode wraps bare Python/JS functions with an auto-evaluator
      const executableCode = prepareCode(code, lang, stdin);
      const result = await apiExecuteCode({ code: executableCode, language: lang, stdin });
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
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ ...badgeBase, background: '#4f46e5', border: '1px solid #4338ca', boxShadow: '0 2px 6px rgba(79,70,229,0.25)' }}>
          TASK {i + 1}
        </span>
        {q.difficulty && (
          <span style={{ ...badgeBase, ...(diffStyle[q.difficulty] || { background: '#64748b', border: '1px solid #475569' }) }}>
            {q.difficulty}
          </span>
        )}
        {q.time_limit && (
          <span style={{ ...badgeBase, background: '#64748b', border: '1px solid #475569' }}>
            ⏱ {q.time_limit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {/* Problem Statement */}
        <div style={{ padding: '1.5rem' }}>
          <p style={{ margin: '0 0 1rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.7 }}>{q.question}</p>

          {q.sample_input && (
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, minWidth: 160, padding: '0.85rem 1.1rem', background: '#12121f', borderRadius: 10, border: '1px solid #2a2a40', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#38e54d' }}></span>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#a0a6b8', letterSpacing: '1px' }}>SAMPLE INPUT</p>
                </div>
                <pre style={{ margin: 0, color: '#ffffff', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '14px', fontWeight: 600, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.sample_input}</pre>
              </div>
              <div style={{ flex: 1, minWidth: 160, padding: '0.85rem 1.1rem', background: '#12121f', borderRadius: 10, border: '1px solid #2a2a40', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#ffb86c' }}></span>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#a0a6b8', letterSpacing: '1px' }}>EXPECTED OUTPUT</p>
                </div>
                <pre style={{ margin: 0, color: '#ffbe6b', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '14px', fontWeight: 700, lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{q.sample_output}</pre>
              </div>
            </div>
          )}

          {q.hints && (
            <div>
              <button onClick={() => setShowHints(v => !v)}
                style={{ padding: '6px 14px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {showHints ? '🙈 Hide Hints' : '💡 Show Hints'}
              </button>
              {showHints && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(20,184,166,0.08)', borderRadius: 8, borderLeft: '3px solid var(--accent-mint)' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{q.hints}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Code Editor */}
        <div style={{ borderTop: '1px solid var(--border-color)' }}>
          {/* Editor Toolbar */}
          <div style={{ padding: '0.6rem 1rem', background: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>Language:</span>
            <select value={lang} onChange={e => handleLangChange(e.target.value)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #333', background: '#252540', color: '#e0e0e0', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
              {Object.keys(LANG_CONFIG).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleReset}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #444', background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                Reset
              </button>
              <button onClick={handleRun} disabled={running}
                style={{ padding: '5px 18px', borderRadius: 6, border: 'none', background: running ? '#444' : '#38e54d', color: '#0a0a1a', cursor: running ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 800 }}>
                {running ? '⏳ Running...' : '▶ Run'}
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
                width: '100%', minHeight: 240, padding: '1rem 1rem 1rem 3.5rem',
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
          <div style={{ padding: '0.6rem 1rem', background: '#12121f', borderTop: '1px solid #222' }}>
            <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#666', letterSpacing: 1 }}>STDIN (optional input)</p>
            <textarea value={stdin} onChange={e => setStdin(e.target.value)}
              placeholder="Custom input to pass to your program..."
              rows={2}
              style={{ width: '100%', boxSizing: 'border-box', padding: '6px 10px', background: '#0d0d1a', border: '1px solid #2a2a40', borderRadius: 6, color: '#aaa', fontFamily: 'monospace', fontSize: 13, resize: 'vertical', outline: 'none' }} />
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
    <div style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.75rem', border: '1px solid var(--border-color)' }}>
      <p style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        <span style={{ color: 'var(--accent-pink)', marginRight: 8 }}>Q{i + 1}.</span>{q.question}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {q.options.map((opt, j) => {
          let bg = 'var(--bg-color)', border = '1px solid var(--border-color)', color = 'var(--text-primary)';
          if (revealed) {
            if (j === q.correct_answer_index) { bg = 'rgba(56,229,77,0.12)'; border = '2px solid #38e54d'; }
            else if (j === selected) { bg = 'rgba(255,80,80,0.12)'; border = '2px solid #ff5050'; }
          } else if (j === selected) { border = '2px solid var(--accent-pink)'; }
          return (
            <div key={j} onClick={() => !revealed && setSelected(j)}
              style={{ padding: '12px 16px', background: bg, borderRadius: 10, border, cursor: revealed ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, color, transition: 'all 0.15s' }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--surface-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {String.fromCharCode(65 + j)}
              </span>
              <span style={{ lineHeight: 1.5 }}>{opt}</span>
              {revealed && j === q.correct_answer_index && <span style={{ marginLeft: 'auto' }}>✅</span>}
              {revealed && j === selected && j !== q.correct_answer_index && <span style={{ marginLeft: 'auto' }}>❌</span>}
            </div>
          );
        })}
      </div>
      {!revealed ? (
        <button onClick={() => setRevealed(true)}
          style={{ marginTop: '1rem', padding: '8px 18px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
          Show Answer
        </button>
      ) : (
        <div style={{ marginTop: '1rem', padding: '1rem 1.25rem', background: 'rgba(168,85,247,0.08)', borderRadius: 10, borderLeft: '4px solid var(--accent-pink)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>✅ {q.options[q.correct_answer_index]}</strong>
          {q.explanation && <p style={{ margin: '0.4rem 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.5 }}>{q.explanation}</p>}
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
    <button onClick={onClick} style={{
      padding: '10px 18px', borderRadius: 100, border: '1px solid var(--border-color)', cursor: 'pointer',
      fontWeight: 700, fontSize: 13, transition: 'all 0.2s', whiteSpace: 'nowrap',
      background: active ? 'var(--text-primary)' : 'var(--surface-color)',
      color: active ? 'var(--bg-color)' : 'var(--text-secondary)',
    }}>
      {label} {count !== undefined && <span style={{ opacity: 0.7 }}>({count})</span>}
    </button>
  );
}

/* ─────────────────────────────────────────
   Test Modes Config
───────────────────────────────────────── */
const TEST_MODES = [
  { id: 'full', label: '🎯 Full Mock Interview', desc: 'MCQs + Analytical + Coding + Rapid Fire + Soft Skills' },
  { id: 'mcq_only', label: '📝 MCQ Only', desc: 'Multiple choice questions to test knowledge' },
  { id: 'coding', label: '💻 Coding Round', desc: 'Technical coding & problem solving with live code editor' },
  { id: 'rapid', label: '⚡ Rapid Fire', desc: 'Quick 30-second answer questions' },
  { id: 'soft_skills', label: '🤝 Soft Skills', desc: 'Behavioral and interpersonal questions' },
];

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function InterviewPrep() {
  const navigate = useNavigate();
  const [jobRole, setJobRole] = useState('');
  const [skills, setSkills] = useState('');
  const [jd, setJd] = useState('');
  const [testMode, setTestMode] = useState('full');
  const [questionCount, setQuestionCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testData, setTestData] = useState(null);
  const [activeTab, setActiveTab] = useState('mcqs');

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

      // Set the default active tab based on mode
      const modeTabMap = { mcq_only: 'mcqs', coding: 'coding', rapid: 'rapid_fire', soft_skills: 'soft_skills', full: 'mcqs' };
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
      <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <AnimatedBackground />
        <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', maxWidth: 960, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button onClick={() => setTestData(null)} style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>← New Test</button>
            <div>
              <h1 style={{ margin: 0, fontSize: 'clamp(1.5rem,3vw,2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
                Mock Interview — <span style={{ color: '#10b981' }}>{testData.job_role}</span>
              </h1>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>
                {TEST_MODES.find(m => m.id === testData.test_type)?.label || 'Full Mock Interview'}
              </p>
            </div>
          </div>

          {/* Tabs */}
          {tabs.length > 1 && (
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {tabs.map(t => <TabBtn key={t.id} label={t.label} count={t.data?.length} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />)}
            </div>
          )}

          {/* MCQs */}
          {activeTab === 'mcqs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(testData.mcqs || []).map((q, i) => <MCQCard key={i} q={q} i={i} />)}
            </div>
          )}

          {/* Analytical */}
          {activeTab === 'analytical' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(testData.analytical || []).map((q, i) => (
                <div key={i} style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-pink)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.question}</p>
                  </div>
                  <div style={{ padding: '1rem 1.25rem', background: 'rgba(168,85,247,0.07)', borderRadius: 10, borderLeft: '4px solid var(--accent-pink)' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>💡 What interviewers look for:</p>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{q.tips_to_answer}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coding — Live Editor */}
          {activeTab === 'coding' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(56,229,77,0.08)', borderRadius: 10, border: '1px solid rgba(56,229,77,0.2)', fontSize: 13, color: 'var(--text-secondary)' }}>
                💡 <strong style={{ color: 'var(--text-primary)' }}>Live Code Editor</strong> — Write your solution and click <strong>▶ Run</strong> to execute it. Tab key inserts 4 spaces.
              </div>
              {(testData.coding || []).map((q, i) => <CodeEditor key={i} q={q} i={i} />)}
            </div>
          )}

          {/* Rapid Fire */}
          {activeTab === 'rapid_fire' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {(testData.rapid_fire || []).map((q, i) => (
                <div key={i} style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.5rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <span style={{ padding: '4px 14px', background: '#f59e0b', border: '1px solid #d97706', borderRadius: 100, fontSize: 12, fontWeight: 800, color: '#ffffff', flexShrink: 0, alignSelf: 'flex-start', marginTop: 2, boxShadow: '0 2px 6px rgba(245,158,11,0.25)' }}>⚡ {i + 1}</span>
                    <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.5 }}>{q.question}</p>
                  </div>
                  <details>
                    <summary style={{ cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Reveal Answer</summary>
                    <p style={{ margin: '0.75rem 0 0', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, paddingLeft: '0.5rem', borderLeft: '3px solid var(--accent-yellow)' }}>{q.ideal_answer}</p>
                  </details>
                </div>
              ))}
            </div>
          )}

          {/* Soft Skills */}
          {activeTab === 'soft_skills' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(testData.soft_skills || []).map((q, i) => (
                <div key={i} style={{ background: 'var(--surface-color)', borderRadius: 16, padding: '1.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-teal)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>🤝</div>
                    <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.6 }}>{q.question}</p>
                  </div>
                  <div style={{ padding: '1rem 1.25rem', background: 'rgba(20,184,166,0.07)', borderRadius: 10, borderLeft: '4px solid var(--accent-teal)' }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>🎯 What to demonstrate:</p>
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
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AnimatedBackground />
      <div style={{ position: 'relative', zIndex: 1, padding: '3rem 2rem', maxWidth: 780, margin: '0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 18px', borderRadius: 100, border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, marginBottom: '2rem', fontSize: 14 }}>
          ← Dashboard
        </button>

        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 800, margin: '0 0 0.4rem', color: 'var(--text-primary)' }}>🎯 AI Interview Prep</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Personalized mock interviews with MCQs, live coding challenges, rapid fire rounds, and soft skills tests.
        </p>

        {/* Test Mode Selector */}
        <div style={{ marginBottom: '2rem' }}>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '0.95rem' }}>Select Test Mode</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {TEST_MODES.map(mode => (
              <div key={mode.id} onClick={() => setTestMode(mode.id)}
                style={{ padding: '1rem 1.25rem', borderRadius: 12, border: `2px solid ${testMode === mode.id ? 'var(--accent-pink)' : 'var(--border-color)'}`, background: testMode === mode.id ? 'rgba(235, 99, 131, 0.08)' : 'var(--surface-color)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{mode.label}</p>
                  <p style={{ margin: '0.2rem 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{mode.desc}</p>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${testMode === mode.id ? 'var(--accent-pink)' : 'var(--border-color)'}`, background: testMode === mode.id ? 'var(--accent-pink)' : 'transparent', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--surface-color)', borderRadius: 16, padding: '2rem', border: '1px solid var(--border-color)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Target Job Role *</label>
            <input type="text" value={jobRole} onChange={e => setJobRole(e.target.value)} required placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Your Skills <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(comma separated)</span></label>
            <input type="text" value={skills} onChange={e => setSkills(e.target.value)} placeholder="e.g. React, Python, SQL, Machine Learning"
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1rem', outline: 'none' }} />
          </div>

          {/* ── Question Count Picker ── */}
          <div>
            <label style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              Number of Questions
              <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 400, color: 'var(--text-secondary)' }}>(applies per section for focused modes)</span>
            </label>
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {[20, 30, 40, 50].map(n => (
                <button key={n} type="button" onClick={() => setQuestionCount(n)}
                  style={{
                    padding: '9px 20px', borderRadius: 100, border: `2px solid ${questionCount === n ? 'var(--accent-pink)' : 'var(--border-color)'}`,
                    background: questionCount === n ? 'var(--accent-pink)' : 'transparent',
                    color: questionCount === n ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.18s',
                    boxShadow: questionCount === n ? '0 2px 8px rgba(235, 99, 131, 0.3)' : 'none',
                  }}>
                  {n}
                </button>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Custom:</span>
                <input type="number" min={10} max={50} value={questionCount}
                  onChange={e => setQuestionCount(Math.max(10, Math.min(50, Number(e.target.value))))}
                  style={{ width: 68, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: 14, fontWeight: 700, outline: 'none', textAlign: 'center' }} />
              </div>
            </div>
            {/* Slider */}
            <input type="range" min={10} max={50} value={questionCount}
              onChange={e => setQuestionCount(Number(e.target.value))}
              style={{ width: '100%', marginTop: '0.85rem', accentColor: '#eb6383', cursor: 'pointer' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              <span>10 (Quick)</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-pink)' }}>{questionCount} selected</span>
              <span>50 (Comprehensive)</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>Job Description <span style={{ fontWeight: 400, color: 'var(--text-secondary)' }}>(optional — improves question relevance)</span></label>
            <textarea value={jd} onChange={e => setJd(e.target.value)} placeholder="Paste the job description here..."
              style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontSize: '1rem', minHeight: 100, outline: 'none', resize: 'vertical' }} />
          </div>

          {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,80,80,0.1)', borderRadius: 8, color: '#ff5050', fontSize: 14, border: '1px solid rgba(255,80,80,0.3)' }}>⚠️ {error}</div>}

          <button type="submit" disabled={loading || !jobRole.trim()}
            style={{ padding: '15px', borderRadius: 12, border: 'none', background: loading ? 'var(--border-color)' : 'var(--text-primary)', color: 'var(--bg-color)', fontSize: '1.05rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {loading ? `⏳ Generating ${questionCount} questions...` : `🚀 Generate ${questionCount} Questions`}
          </button>
        </form>
      </div>
    </div>
  );
}
