"use client"
import { useState } from "react"
import { login } from "../../actions/auth"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await login(password)
    if (res.success) {
      window.location.href = "/admin"
    } else {
      setError(res.error || "Chyba")
    }
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f7f7f7' }}>
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '350px' }}>
        <h2 style={{marginTop: 0, color: '#1A171B'}}>Login do Administrace</h2>
        <input 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Zadejte heslo..."
          style={{ padding: '0.75rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '1rem', display: 'block', boxSizing: 'border-box' }}
        />
        {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: '0.75rem 1.5rem', background: '#1A171B', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Vstoupit</button>
      </form>
    </div>
  )
}
