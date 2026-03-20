import { useState, useRef, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../api/auth'
import { extractAuthError } from '../api/errorUtils'
import toast from 'react-hot-toast'
import logoWhite from '../assets/logo-white-CvEM_RYU.png'

interface LoginForm {
  username: string
  password: string
}

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -5
    const rotateY = ((x - centerX) / centerX) * 5
    cardRef.current.style.transform =
      `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return
    cardRef.current.style.transform =
      'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  }, [])

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await authAPI.login(data.username.trim(), data.password)
      setAuth(res.user, res.access, res.refresh)
      toast.success('Login successful')
      setExiting(true)
      setTimeout(() => navigate('/super-admin'), 900)
    } catch (err: unknown) {
      toast.error(extractAuthError(err, 'Login failed'))
      setLoading(false)
    }
  }

  return (
    <div className="lp">
      <div className="lp-bg" />

      {/* Lens flare light spots */}
      <div className="lp-flare lp-flare--1" />
      <div className="lp-flare lp-flare--2" />
      <div className="lp-flare lp-flare--3" />

      {/* Floating particles */}
      <div className="lp-particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="lp-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              opacity: 0.3 + Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* 3D floating shapes */}
      <div className="lp-shapes">
        <div className="lp-s lp-s--sphere1" />
        <div className="lp-s lp-s--sphere2" />
        <div className="lp-s lp-s--cube1" />
        <div className="lp-s lp-s--cube2" />
        <div className="lp-s lp-s--torus1" />
        <div className="lp-s lp-s--torus2" />
        <div className="lp-s lp-s--cylinder1" />
        <div className="lp-s lp-s--pill1" />
        <div className="lp-s lp-s--pill2" />
        <div className="lp-s lp-s--ring1" />
      </div>

      {/* Animated gradient border wrapper */}
      <div className={`lp-card-border ${mounted ? 'lp-card-border--in' : ''} ${exiting ? 'lp-card--exit' : ''}`}>
        <div
          ref={cardRef}
          className="lp-card"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* LEFT PANEL */}
          <div className="lp-left">
            <div className="lp-left__mesh" />
            <div className="lp-left__glow" />

            {/* Dot grid pattern */}
            <div className="lp-dots">
              {Array.from({ length: 49 }).map((_, i) => (
                <span key={i} className="lp-dot" />
              ))}
            </div>

            <div className="lp-dots lp-dots--bl">
              {Array.from({ length: 25 }).map((_, i) => (
                <span key={i} className="lp-dot" />
              ))}
            </div>

            {/* Sparkles */}
            <svg className="lp-sparkle lp-sparkle--1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
            </svg>
            <svg className="lp-sparkle lp-sparkle--2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
            </svg>
            <svg className="lp-sparkle lp-sparkle--3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
            </svg>
            <svg className="lp-sparkle lp-sparkle--4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0l2.5 9.5L24 12l-9.5 2.5L12 24l-2.5-9.5L0 12l9.5-2.5z" />
            </svg>

            {/* Company Logo */}
            <div className="lp-avatar">
              <div className="lp-avatar__ring" />
              <div className="lp-avatar__inner">
                <img src={logoWhite} alt="VED Logo" className="lp-avatar__img" />
              </div>
            </div>

            <h2 className="lp-left__title">Welcome Back</h2>
            <p className="lp-left__sub">Sign in to access your admin dashboard and manage the system.</p>

            <div className="lp-left__status">
              {/* <span className="lp-left__status-dot" /> */}
              {/* System Operational */}
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="lp-right">
            <h1 className="lp-right__title">Sign In</h1>
            {/* <p className="lp-right__sub">Enter your credentials to continue</p> */}

            <form onSubmit={handleSubmit(onSubmit)} className="lp-form">
              <div className="lp-field">
                <div className="lp-field__wrap">
                  <input
                    {...register('username', { required: 'Username is required' })}
                    type="text"
                    autoComplete="username"
                    placeholder="Username / Email"
                    className="lp-field__input"
                  />
                  <svg className="lp-field__icon" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                {errors.username && <span className="lp-field__err">{errors.username.message}</span>}
              </div>

              <div className="lp-field">
                <div className="lp-field__wrap">
                  <input
                    {...register('password', { required: 'Password is required' })}
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password"
                    className="lp-field__input"
                  />
                  <svg className="lp-field__icon" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                {errors.password && <span className="lp-field__err">{errors.password.message}</span>}
              </div>

              <div className="lp-meta">
                {/* <div className="lp-status-sm">
                  <span className="lp-status-sm__dot" />
                  Server Connected
                </div> */}
              </div>

              <button type="submit" disabled={loading || exiting} className="lp-btn">
                <span className="lp-btn__shimmer" />
                {loading ? (
                  <span className="lp-btn__loading">
                    <svg className="lp-spinner" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" strokeWidth="2.5" />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <>
                    Sign In
                    <span className="lp-btn__arrow">&rarr;</span>
                  </>
                )}
              </button>
            </form>

            {/* <p className="lp-right__footer">
              Authorized personnel only &middot; All access is monitored
            </p> */}
          </div>
        </div>
      </div>
    </div>
  )
}
