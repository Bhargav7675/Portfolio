'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/ui/Navbar.module.css'
import { FaBars, FaTimes } from 'react-icons/fa'
import { navigateTo } from '@/lib/scrollConfig'

const NAV_ITEMS = [
  { label: 'Home',        target: 'intro' },
  { label: 'About',       target: 'about' },
  { label: 'Projects',    target: 'projects' },
  { label: 'Experience',  target: 'experience' },
  { label: 'Education',   target: 'education' },
  { label: 'Research',    target: 'research' },
  { label: 'Credentials', target: 'credentials' },
  { label: 'Contact',     target: 'credentials', stepOffset: 2 },
]

function getCT() {
  return new Date().toLocaleTimeString('en-US', {
    timeZone: profile.location.timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).toUpperCase()
}

export default function Navbar() {
  const [time,    setTime]    = useState('')   // '' on SSR - avoids hydration mismatch
  const [onIntro, setOnIntro] = useState(true)
  const [onDark,  setOnDark]  = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef   = useRef(null)
  const lastY       = useRef(0)
  const hidden      = useRef(false)
  const stopTimer   = useRef(null)

  // Live clock - set immediately on mount, then every second
  useEffect(() => {
    const initial = setTimeout(() => setTime(getCT()), 0)
    const id = setInterval(() => setTime(getCT()), 1000)
    return () => {
      clearTimeout(initial)
      clearInterval(id)
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // Auto-hide on scroll-down, reveal on scroll-up or scroll-stop
  useEffect(() => {
    const scroller = document.querySelector('main') ?? window

    function showNavbar() {
      if (!hidden.current) return
      gsap.to(headerRef.current, { y: '0%', duration: 0.35, ease: 'power2.out' })
      hidden.current = false
    }

    const onScroll = () => {
      const currentY = scroller.scrollTop ?? window.scrollY
      const delta    = currentY - lastY.current
      const vh = scroller.clientHeight || window.innerHeight

      const sectionIdx = Math.round(currentY / vh)
      setOnIntro(currentY < vh * 0.8)
      setOnDark(sectionIdx >= 3)

      if (delta > 8 && !hidden.current) {
        gsap.to(headerRef.current, { y: '-100%', duration: 0.35, ease: 'power2.inOut' })
        hidden.current = true
      } else if (delta < -6) {
        showNavbar()
      }

      lastY.current = currentY

      // Show navbar 400 ms after scrolling stops
      clearTimeout(stopTimer.current)
      stopTimer.current = setTimeout(showNavbar, 400)
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      clearTimeout(stopTimer.current)
    }
  }, [])

  return (
    <>
      <header ref={headerRef} className={`${styles.header} ${onIntro ? styles.introMode : ''} ${onDark ? styles.darkMode : ''}`}>
        <span className={styles.time}>{profile.location.timeLabel} — {time}</span>

        <nav className={styles.navMenu} aria-label="Primary navigation">
          <ul className={styles.navList}>
            {NAV_ITEMS.map(({ label, target, stepOffset }) => (
              <li key={label}>
                <a
                  href={`#${target}`}
                  className={styles.navLink}
                  onClick={(event) => {
                    event.preventDefault()
                    navigateTo(target, stepOffset)
                  }}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={`mailto:${profile.email}`}
          className={`${styles.emailBtn} rounded-full text-xs font-semibold px-5 h-8`}
        >
          Email me
        </a>

        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </button>
      </header>

      {menuOpen && (
        <div id="mobile-navigation" className={styles.mobileMenu} role="dialog" aria-label="Site navigation">
          {NAV_ITEMS.map(({ label, target, stepOffset }) => (
            <a
              key={label}
              href={`#${target}`}
              className={styles.mobileNavLink}
              onClick={(event) => {
                event.preventDefault()
                navigateTo(target, stepOffset)
                setMenuOpen(false)
              }}
            >
              {label}
            </a>
          ))}
          <a
            href={`mailto:${profile.email}`}
            className={styles.mobileMailLink}
            onClick={() => setMenuOpen(false)}
          >
            {profile.email}
          </a>
        </div>
      )}
    </>
  )
}
