import './CodeInput.css'

function CodeInput({ code, setCode, onAnalyze, loading }) {
  return (
    <div className="code-input-section">
      <h2>Enter Code to Analyze</h2>
      <textarea
        className="code-textarea"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Paste your code here..."
        spellCheck={false}
      />
      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : '🔍 Analyze & Fix Code'}
      </button>
    </div>
  )
}

export default CodeInput
