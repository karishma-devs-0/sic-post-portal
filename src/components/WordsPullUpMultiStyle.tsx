import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

export interface StyledSegment {
  text: string
  className?: string
}

interface Props {
  segments: StyledSegment[]
  className?: string
  wordStagger?: number
}

/**
 * Multi-style pull-up heading. Each segment is a chunk of text with its own className
 * (e.g. one italic, one regular). Segments are split into words; every word pulls up
 * from y:20 → 0 with a staggered delay across the entire concatenated word list.
 */
export default function WordsPullUpMultiStyle({
  segments,
  className = '',
  wordStagger = 0.08,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })

  // Flatten: assemble [{word, className}] preserving per-segment className.
  const words: { word: string; cls?: string }[] = []
  segments.forEach((seg, si) => {
    seg.text.split(' ').forEach((w) => words.push({ word: w, cls: seg.className }))
    // Add a trailing spacer between segments (not after the last).
    if (si < segments.length - 1) {
      // No-op: word spacing handled by the mr-[0.25em] on each word.
    }
  })

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {words.map(({ word, cls }, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{
            duration: 0.6,
            delay: i * wordStagger,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`inline-block mr-[0.25em] ${cls ?? ''}`}
          style={{ willChange: 'transform, opacity' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}
