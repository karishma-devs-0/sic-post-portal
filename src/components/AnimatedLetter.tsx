import { useRef } from 'react'
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'

interface AnimatedLetterProps {
  text: string
  className?: string
}

/**
 * Per-character scroll-linked opacity animation.
 * Each character fades from 0.2 → 1 over a small slice of the container's scroll range.
 */
export default function AnimatedLetter({ text, className = '' }: AnimatedLetterProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = text.split('')
  return (
    <p ref={ref} className={className}>
      {chars.map((ch, i) => (
        <Char key={`${ch}-${i}`} char={ch} progress={scrollYProgress} index={i} total={chars.length} />
      ))}
    </p>
  )
}

function Char({
  char,
  progress,
  index,
  total,
}: {
  char: string
  progress: MotionValue<number>
  index: number
  total: number
}) {
  const charProgress = index / total
  const opacity = useTransform(progress, [charProgress - 0.1, charProgress + 0.05], [0.2, 1])
  if (char === ' ') return <span>&nbsp;</span>
  return <motion.span style={{ opacity, display: 'inline-block' }}>{char}</motion.span>
}
