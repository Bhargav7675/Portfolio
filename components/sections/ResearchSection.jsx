'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { gsap } from '@/lib/gsap'
import profile from '@/data/profile.json'
import styles from '@/styles/sections/ResearchSection.module.css'

const RESEARCH = profile.research

export default function ResearchSection() {
  const sectionRef = useRef(null)
  const contentRefs = useRef([])
  const bgRefs = useRef([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const scroller = document.querySelector('main')
    if (!scroller) return

    const n = RESEARCH.length
    contentRefs.current = contentRefs.current.slice(0, n)
    bgRefs.current = bgRefs.current.slice(0, n)
    const contentElements = contentRefs.current.filter(Boolean)
    const backgroundElements = bgRefs.current.filter(Boolean)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(contentElements, { opacity: 1, y: 0 })
      gsap.set(backgroundElements, { opacity: 1 })
      return
    }

    gsap.set(contentElements, { opacity: 0, y: 30 })
    gsap.set(backgroundElements, { opacity: 0 })

    function playAnim() {
      const tl = gsap.timeline()

      RESEARCH.forEach((_, i) => {
        const delay = i * 0.3

        if (bgRefs.current[i]) {
          tl.to(bgRefs.current[i], { opacity: 1, duration: 0.6, ease: 'power2.out' }, delay)
        }

        if (contentRefs.current[i]) {
          tl.to(contentRefs.current[i], { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, delay + 0.1)
        }
      })
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      playAnim()
      observer.disconnect()
    }, { root: scroller, threshold: 0.2 })

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <section id="research" ref={sectionRef} className={styles.section} data-native-scroll="true">
      <div className={styles.header}>
        <h2 className={styles.title}>Research Systems</h2>
      </div>

      <div className={styles.container}>
        {RESEARCH.map((item, i) => (
          <div key={item.id} className={styles.card}>
            {/* Background Image */}
            {item.image && (
              <div
                ref={(el) => { bgRefs.current[i] = el }}
                className={styles.cardBg}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  quality={90}
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className={styles.bgImg}
                />
                <div className={styles.overlay} />
              </div>
            )}

            {/* Content */}
            <div
              ref={(el) => { contentRefs.current[i] = el }}
              className={styles.content}
            >
              <div className={styles.meta}>
                <span className={styles.type}>{item.type}</span>
                <span className={styles.period}>
                  {item.period} {item.periodEnd && `— ${item.periodEnd}`}
                </span>
              </div>

              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.organization}>{item.organization}</p>
              <p className={styles.desc}>{item.desc}</p>

              {item.highlights && (
                <ul className={styles.highlights}>
                  {item.highlights.slice(0, 3).map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              )}

              {item.tech && (
                <div className={styles.tech}>
                  {item.tech.slice(0, 5).map((t) => (
                    <span key={t} className={styles.techTag}>
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {item.reference && (
                <div className={styles.reference}>
                  <p className={styles.refTitle}>{item.reference.title}</p>
                  <p className={styles.refAuthors}>{item.reference.authors}</p>
                  <p className={styles.refVenue}>
                    {item.reference.venue} • {item.reference.year}
                  </p>
                  {item.reference.link && (
                    <a
                      href={item.reference.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.refLink}
                    >
                      View Paper →
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
