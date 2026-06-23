'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import Navbar                from '@/components/ui/Navbar'
import VideoIntro            from '@/components/sections/VideoIntro'
import HeroSection           from '@/components/sections/HeroSection'
import AboutSection          from '@/components/sections/AboutSection'
import ProjectsSection       from '@/components/sections/ProjectsSection'
import WorkExperienceSection from '@/components/sections/WorkExperienceSection'
import EducationSection      from '@/components/sections/EducationSection'
import ResearchSection       from '@/components/sections/ResearchSection'
import PublicationsFooterSection from '@/components/sections/PublicationsFooterSection'
import ScreenLoader from '@/components/sections/ScreenLoader'
import { TOTAL_SCROLL_STEPS } from '@/lib/scrollConfig'
import styles from '@/styles/Page.module.css'

export default function Home() {
  const mainRef        = useRef(null)
  const idxRef         = useRef(0)
  const busyRef        = useRef(false)
  const tweenRef       = useRef(null)
  const loopOverlayRef = useRef(null)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    const viewportHeight = () => el.clientHeight || window.innerHeight

    // Fade to black → instant scrollTop jump → fade in
    // Used whenever we loop footer → first section
    function fadeLoop(targetScrollTop, targetIdx) {
      busyRef.current = true
      tweenRef.current?.kill()
      gsap.to(loopOverlayRef.current, {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.in',
        onComplete: () => {
          el.scrollTop    = targetScrollTop
          idxRef.current  = targetIdx
          gsap.to(loopOverlayRef.current, {
            opacity: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05,
            onComplete: () => {
              setTimeout(() => { busyRef.current = false }, 300)
            },
          })
        },
      })
    }

    function goTo(idx, exactScrollTop, force = false) {
      // Wrap-around
      if (idx >= TOTAL_SCROLL_STEPS) idx = 0
      if (idx < 0) idx = TOTAL_SCROLL_STEPS - 1

      if ((idx === idxRef.current && exactScrollTop == null) || (busyRef.current && !force)) return

      // Footer → top: fade-cut instead of scrolling back through all sections
      if (idxRef.current === TOTAL_SCROLL_STEPS - 1 && idx === 0) {
        fadeLoop(0, 0)
        return
      }

      // Top → footer: fade-cut instead of scrolling forward through all sections
      if (idxRef.current === 0 && idx === TOTAL_SCROLL_STEPS - 1) {
        fadeLoop((TOTAL_SCROLL_STEPS - 1) * viewportHeight(), TOTAL_SCROLL_STEPS - 1)
        return
      }

      idxRef.current = idx
      busyRef.current = true
      tweenRef.current?.kill()
      tweenRef.current = gsap.to(el, {
        scrollTop: exactScrollTop ?? idx * viewportHeight(),
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1,
        ease: 'power3.inOut',
        onComplete: () => { setTimeout(() => { busyRef.current = false }, 600) },
      })
    }

    function onWheel(e) {
      const nestedScroller = e.target instanceof Element
        ? e.target.closest('[data-native-scroll="true"]')
        : null
      if (nestedScroller) {
        const canScrollDown = e.deltaY > 0 && nestedScroller.scrollTop + nestedScroller.clientHeight < nestedScroller.scrollHeight - 1
        const canScrollUp = e.deltaY < 0 && nestedScroller.scrollTop > 1
        if (canScrollDown || canScrollUp) return
      }
      e.preventDefault()
      if (busyRef.current) return
      goTo(idxRef.current + (e.deltaY > 0 ? 1 : -1))
    }

    let touchY = 0
    function onTouchStart(e) { touchY = e.touches[0].clientY }
    function onTouchEnd(e) {
      const dy = touchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40 || busyRef.current) return
      goTo(idxRef.current + (dy > 0 ? 1 : -1))
    }

    function onScroll() {
      idxRef.current = Math.round(el.scrollTop / viewportHeight())
    }

    // Footer video ends → same fade-cut loop back to top
    function onFooterLoop() {
      if (busyRef.current) return
      fadeLoop(0, 0)
    }

    function onNavigate(e) {
      const target = e.detail?.target
      if (Number.isInteger(target)) {
        goTo(target, undefined, true)
        return
      }
      if (typeof target !== 'string') return

      const targetElement = document.getElementById(target)
      if (!targetElement) return

      const stepOffset = Number(e.detail?.stepOffset) || 0
      const targetTop = el.scrollTop
        + targetElement.getBoundingClientRect().top
        - el.getBoundingClientRect().top
        + stepOffset * viewportHeight()

      // Menu navigation must be deterministic. A GSAP scrollTop tween can be
      // interrupted by ScrollTrigger refreshes from the horizontal projects
      // section, leaving the viewport one scene early.
      tweenRef.current?.kill()
      busyRef.current = false
      idxRef.current = Math.round(targetTop / viewportHeight())
      el.scrollTop = targetTop
    }

    function onKeyDown(e) {
      const target = e.target
      if (target instanceof HTMLElement && target.closest('a, button, input, textarea, select, [role="button"], [contenteditable="true"]')) return

      const nextKeys = ['ArrowDown', 'PageDown']
      const prevKeys = ['ArrowUp', 'PageUp']
      if (nextKeys.includes(e.key) || (e.key === ' ' && !e.shiftKey)) {
        e.preventDefault()
        goTo(idxRef.current + 1)
      } else if (prevKeys.includes(e.key) || (e.key === ' ' && e.shiftKey)) {
        e.preventDefault()
        goTo(idxRef.current - 1)
      } else if (e.key === 'Home') {
        e.preventDefault()
        goTo(0)
      } else if (e.key === 'End') {
        e.preventDefault()
        goTo(TOTAL_SCROLL_STEPS - 1)
      }
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches

    el.addEventListener('wheel',  onWheel,  { passive: false })
    el.addEventListener('scroll', onScroll, { passive: true  })

    let mTouchY = 0
    function onMobileTouchStart(e) { mTouchY = e.touches[0].clientY }
    function onMobileTouchEnd(e) {
      const dy = mTouchY - e.changedTouches[0].clientY
      if (Math.abs(dy) < 40) return
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 8
      const atTop    = el.scrollTop < 8
      if (dy > 0 && atBottom) fadeLoop(0, 0)
      if (dy < 0 && atTop) fadeLoop(el.scrollHeight - el.clientHeight, TOTAL_SCROLL_STEPS - 1)
    }

    if (!isMobile) {
      el.addEventListener('touchstart', onTouchStart, { passive: true })
      el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    } else {
      el.addEventListener('touchstart', onMobileTouchStart, { passive: true })
      el.addEventListener('touchend',   onMobileTouchEnd,   { passive: true })
    }
    window.addEventListener('footer-loop-back', onFooterLoop)
    window.addEventListener('portfolio:navigate', onNavigate)
    window.addEventListener('keydown', onKeyDown)

    return () => {
      el.removeEventListener('wheel',  onWheel)
      el.removeEventListener('scroll', onScroll)
      if (!isMobile) {
        el.removeEventListener('touchstart', onTouchStart)
        el.removeEventListener('touchend',   onTouchEnd)
      } else {
        el.removeEventListener('touchstart', onMobileTouchStart)
        el.removeEventListener('touchend',   onMobileTouchEnd)
      }
      window.removeEventListener('footer-loop-back', onFooterLoop)
      window.removeEventListener('portfolio:navigate', onNavigate)
      window.removeEventListener('keydown', onKeyDown)
      tweenRef.current?.kill()
    }
  }, [])

  return (
    <>
      {showLoader && (
        <ScreenLoader onDismiss={() => setShowLoader(false)} />
      )}

      <div inert={showLoader} aria-hidden={showLoader || undefined}>
        <a className={styles.skipLink} href="#portfolio-content">Skip to portfolio</a>

        {/* Full-screen fade overlay for seamless footer → top loop */}
        <div ref={loopOverlayRef} className={styles.loopOverlay} aria-hidden="true" />

        <Navbar />
        <main id="portfolio-content" ref={mainRef} className={styles.main} aria-label="Portfolio sections">
          <div>
            <VideoIntro />
            <HeroSection />
            <AboutSection />
            <ProjectsSection />
            <WorkExperienceSection />
            <EducationSection />
            <ResearchSection />
            <PublicationsFooterSection />
          </div>
        </main>
      </div>
    </>
  )
}
