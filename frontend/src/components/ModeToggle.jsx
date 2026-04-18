import './ModeToggle.css'

function ModeToggle({ mode, setMode }) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-btn ${mode === 'code' ? 'active' : ''}`}
        onClick={() => setMode('code')}
      >
        💻 Code Mode
      </button>
      <button
        className={`mode-btn ${mode === 'project' ? 'active' : ''}`}
        onClick={() => setMode('project')}
      >
        📁 Project Mode
      </button>
    </div>
  )
}

export default ModeToggle
