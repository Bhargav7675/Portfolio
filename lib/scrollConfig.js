import profile from '@/data/profile.json'

const projectCount = profile.projects.length

export const SCROLL_INDEX = Object.freeze({
  intro: 0,
  hero: 1,
  about: 2,
  education: 3,
  projects: 4,
  experience: 4 + projectCount,
  research: 5 + projectCount,
  publications: 6 + projectCount,
  contact: 8 + projectCount,
})

// PublicationsFooterSection occupies three viewport steps: publications,
// interstitial, and contact/footer.
export const TOTAL_SCROLL_STEPS = 9 + projectCount

export function navigateTo(target, stepOffset = 0) {
  window.dispatchEvent(new CustomEvent('portfolio:navigate', {
    detail: { target, stepOffset },
  }))
}
