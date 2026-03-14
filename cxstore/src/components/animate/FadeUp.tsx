import { useEffect, useRef, useState, type ReactNode } from 'react'

type FadeUpProps = {
  children: ReactNode
  delay?: number
  distance?: number
  durationMs?: number
  once?: boolean
  className?: string
}

export default function FadeUp({
  children,
  delay = 0,
  distance = 20,
  durationMs = 820,
  once = true,
  className,
}: FadeUpProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting) {
          setVisible(true)
          if (once) {
            observer.unobserve(element)
          }
          return
        }

        if (!once) {
          setVisible(false)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [once])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0, 0, 0)' : `translate3d(0, ${distance}px, 0)`,
        transitionProperty: 'opacity, transform',
        transitionDuration: `${durationMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}s`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  )
}
