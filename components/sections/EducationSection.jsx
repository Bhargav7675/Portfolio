'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/EducationSection.module.css'

const EDUCATION = profile.education ?? []

export default function EducationSection() {
  const sectionRef = useRef(null)
  const visualRef = useRef(null)
  const contentRef = useRef(null)

  useEffect(() => {
    const section = sectionRef.current
    const scroller = document.querySelector('main')
    if (!section || !scroller) return

    const targets = [visualRef.current, contentRef.current].filter(Boolean)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(targets, { opacity: 1, x: 0, y: 0 })
      return
    }

    gsap.set(visualRef.current, { opacity: 0, x: -48 })
    gsap.set(contentRef.current, { opacity: 0, y: 36 })

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      gsap.timeline()
        .to(visualRef.current, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' })
        .to(contentRef.current, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.5')
      observer.disconnect()
    }, { root: scroller, threshold: 0.3 })

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  if (!EDUCATION.length) return null
  const education = EDUCATION[0]

  return (
    <section id="education" ref={sectionRef} className={styles.section} data-native-scroll="true">
      <div ref={visualRef} className={styles.visual}>
        <Image
          src={education.image}
          alt={`${education.school} campus`}
          fill
          quality={90}
          sizes="(min-width: 768px) 42vw, 100vw"
          className={styles.image}
        />
        <div className={styles.imageOverlay} />
        <div className={styles.visualCopy}>
          <span className={styles.schoolShort}>{education.schoolShort}</span>
          <span className={styles.location}>{education.location}</span>
        </div>
      </div>

      <div ref={contentRef} className={styles.content}>
        <div className={styles.eyebrowRow}>
          <span className={styles.eyebrow}>Education</span>
          <span className={styles.status}>{education.status}</span>
        </div>

        <h2 className={styles.degree}>{education.degree}</h2>
        <p className={styles.school}>{education.school}</p>
        <p className={styles.period}>{education.period} — {education.periodEnd}</p>
        <p className={styles.description}>{education.desc}</p>

        <ul className={styles.highlights}>
          {education.highlights.slice(0, 3).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>

        <div className={styles.coursework}>
          <span className={styles.courseworkLabel}>Selected coursework</span>
          <div className={styles.tags}>
            {education.coursework.slice(0, 6).map((course) => (
              <span key={course} className={styles.tag}>{course}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
