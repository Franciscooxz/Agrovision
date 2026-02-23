'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LeafIcon, EyeIcon, EyeOffIcon, CheckIcon } from '@/components/icons';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al registrarse');

      // Show success state, then redirect to login with registered flag
      setSuccess(true);
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 1800);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '380px', animation: 'fadeIn 0.4s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: success
              ? 'linear-gradient(135deg, #22c55e, #15803d)'
              : 'linear-gradient(135deg, #22c55e, #15803d)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: success
              ? '0 8px 32px rgba(34,197,94,0.5)'
              : '0 8px 32px rgba(34,197,94,0.25)',
            transition: 'box-shadow 0.4s ease',
          }}>
            {success ? <CheckIcon size={30} color="white" /> : <LeafIcon size={30} color="white" />}
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#f1f5f9' }}>
            AgroVision
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#64748b' }}>
            Únete y empieza a monitorear
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: '#111111',
          border: success ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.07)',
          borderRadius: '20px',
          padding: '32px',
          transition: 'border-color 0.4s ease',
        }}>
          {success ? (
            /* Success state */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '56px',
                height: '56px',
                background: 'rgba(34,197,94,0.15)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckIcon size={28} color="#22c55e" />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 700, color: '#22c55e' }}>
                ¡Cuenta creada!
              </h2>
              <p style={{ margin: '0 0 4px', fontSize: '14px', color: '#94a3b8' }}>
                Tu cuenta fue registrada exitosamente.
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Redirigiendo al inicio de sesión...
              </p>
              {/* Progress bar */}
              <div style={{
                marginTop: '20px',
                height: '3px',
                background: '#1a1a1a',
                borderRadius: '2px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #15803d)',
                  borderRadius: '2px',
                  animation: 'progressBar 1.8s linear forwards',
                }} />
              </div>
            </div>
          ) : (
            /* Form state */
            <>
              <h2 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: 700, color: '#f1f5f9' }}>
                Crear cuenta
              </h2>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#f87171',
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Nombre completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="input-dark"
                />

                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="input-dark"
                />

                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    className="input-dark"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ marginTop: '8px' }}
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                </button>
              </form>
            </>
          )}
        </div>

        {!success && (
          <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
              Iniciar sesión
            </Link>
          </p>
        )}
      </div>

      {/* Progress bar animation */}
      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
