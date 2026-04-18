import './ProjectInput.css'

function ProjectInput({ path, setPath, onAnalyze, loading }) {
  return (
    <div className="project-input-section">
      <h2>Enter Project Path</h2>
      <input
        type="text"
        className="path-input"
        value={path}
        onChange={(e) => setPath(e.target.value)}
        placeholder="/path/to/your/project"
      />
      <button
        className="analyze-btn"
        onClick={onAnalyze}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : '🔍 Analyze & Fix Project'}
      </button>
    </div>
  )
}

export default ProjectInput
