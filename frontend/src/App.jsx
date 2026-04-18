import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import ModeToggle from './components/ModeToggle'
import CodeInput from './components/CodeInput'
import ProjectInput from './components/ProjectInput'
import Results from './components/Results'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const [mode, setMode] = useState('code')
  const [code, setCode] = useState('')
  const [projectPath, setProjectPath] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:8000/analyze_code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      const data = await response.json()
      if (data.success) {
        setResults({ type: 'code', data: data.data, originalCode: code })
      } else {
        setError('Analysis failed')
      }
    } catch (err) {
      setError(`Failed to connect to backend: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const analyzeProject = async () => {
    if (!projectPath.trim()) {
      setError('Please enter a project path')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:8000/analyze_project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: projectPath }),
      })

      const data = await response.json()
      setResults({ type: 'project', data })
    } catch (err) {
      setError(`Failed to connect to backend: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app">
      <Header />
      <ModeToggle mode={mode} setMode={setMode} />
      
      {mode === 'code' ? (
        <CodeInput 
          code={code} 
          setCode={setCode} 
          onAnalyze={analyzeCode}
          loading={loading}
        />
      ) : (
        <ProjectInput 
          path={projectPath} 
          setPath={setProjectPath} 
          onAnalyze={analyzeProject}
          loading={loading}
        />
      )}

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      {loading && <LoadingSpinner />}
      {results && !loading && <Results results={results} />}
    </div>
  )
}

export default App
