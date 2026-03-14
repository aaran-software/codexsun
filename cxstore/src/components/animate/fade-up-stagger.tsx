import { Children, cloneElement, isValidElement, type ReactNode } from 'react'
import FadeUp from './FadeUp'

type FadeUpStaggerProps = {
  children: ReactNode
  staggerChildren?: number
  delay?: number
  className?: string
  once?: boolean
  distance?: number
  durationMs?: number
}

type FadeUpItemProps = {
  children: ReactNode
  className?: string
}

export default function FadeUpStagger({
  children,
  staggerChildren = 0.08,
  delay = 0.04,
  className,
  once = true,
  distance = 20,
  durationMs = 820,
}: FadeUpStaggerProps) {
  const items = Children.toArray(children)

  return (
    <div className={className}>
      {items.map((child, index) => {
        const itemDelay = delay + index * staggerChildren
        return (
          <FadeUp key={index} delay={itemDelay} once={once} distance={distance} durationMs={durationMs}>
            {child}
          </FadeUp>
        )
      })}
    </div>
  )
}

export function FadeUpItem({ children, className }: FadeUpItemProps) {
  if (isValidElement(children) && className) {
    return cloneElement(children, {
      className: [className, (children.props as { className?: string }).className].filter(Boolean).join(' '),
    } as { className: string })
  }

  if (className) {
    return <div className={className}>{children}</div>
  }

  return <>{children}</>
}

