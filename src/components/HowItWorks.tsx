import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, Check, QrCode, Hash, Share2, Trophy } from 'lucide-react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'

type CardData = {
  num: string
  title: string
  Icon: typeof QrCode
  checks: string[]
}

const CARDS: CardData[] = [
  {
    num: '01',
    title: 'Scan & land.',
    Icon: QrCode,
    checks: [
      'QR on classroom posters & event standees',
      'Pinned in your class WhatsApp group',
      'One link, works on any phone',
    ],
  },
  {
    num: '02',
    title: 'Find your task.',
    Icon: Hash,
    checks: [
      'Roll number → your course, instantly',
      'A fresh prompt every week',
      'Template + caption included',
    ],
  },
  {
    num: '03',
    title: 'Post your story.',
    Icon: Share2,
    checks: [
      'LinkedIn for milestones',
      'Instagram for reels & campus energy',
      'Always tag #MySICStory',
    ],
  },
  {
    num: '04',
    title: 'Get counted.',
    Icon: Trophy,
    checks: [
      'Submit your post link',
      'Earn Storyteller → Voice of SIC badges',
      'Push your university up the leaderboard',
    ],
  },
]

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="how" className="relative min-h-screen bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-noise opacity-[0.15] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'From QR scan to posted in four steps.', className: 'text-primary' },
            ]}
          />
          <div className="mt-2">
            <WordsPullUpMultiStyle
              segments={[
                { text: 'Built for 4,000 students. Powered by you.', className: 'text-gray-500' },
              ]}
            />
          </div>
        </div>

        {/* Card grid */}
        <div
          ref={ref}
          className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1 lg:h-[480px]"
        >
          {CARDS.map((c, i) => (
            <motion.div
              key={c.num}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={inView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#212121] rounded-2xl p-6 sm:p-7 lg:h-full flex flex-col"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center mb-5 ${
                  i === 1 ? 'bg-sic' : 'bg-primary'
                }`}
              >
                <c.Icon className={`w-5 h-5 ${i === 1 ? 'text-primary' : 'text-black'}`} />
              </div>

              <p className="text-gray-500 text-xs tracking-widest">{c.num}</p>
              <h3 className="text-primary text-xl sm:text-2xl font-medium mt-1">{c.title}</h3>

              <ul className="mt-5 space-y-2.5 flex-1">
                {c.checks.map((chk) => (
                  <li key={chk} className="flex items-start gap-2 text-sm text-gray-400 leading-snug">
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    <span>{chk}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#portal"
                className="mt-6 inline-flex items-center gap-1.5 text-primary hover:text-white text-sm transition-colors"
              >
                Learn more
                <ArrowRight className="w-4 h-4" style={{ transform: 'rotate(-45deg)' }} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
