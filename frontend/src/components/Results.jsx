import './Results.css'

function Results({ results }) {
  if (results.type === 'code') {
    return <CodeResults data={results.data} originalCode={results.originalCode} />
  }
  return <ProjectResults data={results.data} />
}

function CodeResults({ data, originalCode }) {
  return (
    <div className="results-section">
      <h2>Results</h2>
      
      <div className="quality-score">
        <div className="score-circle">
          <span className="score-number">{data.quality_score}</span>
          <span className="score-label">/100</span>
        </div>
        <p>Code Quality Score</p>
      </div>

      <div className="bugs-section">
        <h3>🐛 Bugs Detected</h3>
        <ul className="bugs-list">
          {data.bugs.map((bug, index) => (
            <li key={index}>{bug}</li>
          ))}
        </ul>
      </div>

      <div className="code-comparison">
        <div className="code-panel">
          <h4>Before</h4>
          <pre className="code-display">
            <code>{originalCode}</code>
          </pre>
        </div>
        <div className="code-panel">
          <h4>After</h4>
          <pre className="code-display">
            <code>{data.fixed_code}</code>
          </pre>
        </div>
      </div>

      <div className="explanation-section">
        <h3>📝 Explanation</h3>
        <p>{data.explanation}</p>
      </div>
    </div>
  )
}

function ProjectResults({ data }) {
  return (
    <div className="results-section">
      <h2>Project Analysis Results</h2>
      
      {data.success ? (
        <>
          <div className="summary-section">
            <h3>✅ Summary</h3>
            <p>{data.summary}</p>
          </div>

          <div className="steps-section">
            <h3>📋 Execution Steps</h3>
            <ol className="steps-list">
              {data.steps.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>

          {data.modified_files.length > 0 && (
            <div className="modified-section">
              <h3>✏️ Modified Files</h3>
              <ul className="modified-list">
                {data.modified_files.map((file, index) => (
                  <li key={index}>
                    <strong>{file.file}</strong>
                    <span className="file-score">Score: {file.quality_score}/100</span>
                    <ul className="file-bugs">
                      {file.bugs_fixed.map((bug, i) => (
                        <li key={i}>{bug}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      ) : (
        <div className="error-section">
          <h3>❌ Error</h3>
          <p>{data.error}</p>
        </div>
      )}
    </div>
  )
}

export default Results
