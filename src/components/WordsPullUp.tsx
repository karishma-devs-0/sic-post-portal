import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface WordsPullUpProps {
  text: string
  className?: string
  showAsterisk?: boolean
  wordStagger?: number
  delayBase?: number
}

/**
 * Splits `text` on spaces; each word is a motion.span that slides up (y:20 → 0)
 * with a staggered delay, triggered once when the container enters view.
 * When `showAsterisk` is true, a superscript "*" is appended after the LAST character
 * of the final word.
 */
export default function WordsPullUp({
  text,
  className = '',
  showAsterisk = false,
  wordStagger = 0.08,
  delayBase = 0,
}: WordsPullUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const words = text.split(' ')

  return (
    <span ref={ref} className={className}>
      {words.map((word, i) => {
        const isLast = i === words.length - 1
        return (
          <motion.span
            key={`${word}-${i}`}
            initial={{ y: 20, opacity: 0 }}
            animate={inView ? { y: 0, opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: delayBase + i * wordStagger,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="inline-block mr-[0.25em] relative"
            style={{ willChange: 'transform, opacity' }}
          >
            {word}
            {showAsterisk && isLast && (
              <span
                className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]"
                aria-hidden
              >
                *
              </span>
            )}
          </motion.span>
        )
      })}
    </span>
  )
}
