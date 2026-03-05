"use client"
import React, { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://app.workwiseai.org/reset-password',
    })
    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#1a1a1a', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#2a2a2a', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <h1 style={{ color: 'white', fontSize: '24px', fontWeight: '600', marginBottom: '8px', textAlign: 'center' }}>
          Forgot Password
        </h1>
        {submitted ? (
          <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', marginTop: '16px' }}>
            Check your email for a password reset link.
          </p>
        ) : (
          <>
            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>
              Enter your email and we'll send you a reset link
            </p>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#aaa', fontSize: '14px', marginBottom: '8px' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%', padding: '12px 16px', backgroundColor: '#1a1a1a',
                    border: '1px solid #444', borderRadius: '8px', color: 'white',
                    fontSize: '16px', outline: 'none', boxSizing: 'border-box'
                  }}
                  placeholder="you@example.com"
                />
              </div>
              {error && (
                <div style={{
                  backgroundColor: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)',
                  borderRadius: '8px', padding: '12px', marginBottom: '20px', color: '#ff6464', fontSize: '14px'
                }}>{error}</div>
              )}
              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '14px', backgroundColor: loading ? '#444' : '#3b9eff',
                color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px',
                fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer'
              }}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
