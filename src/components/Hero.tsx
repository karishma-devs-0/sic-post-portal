import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import WordsPullUp from './WordsPullUp'

const NAV = [
  { label: 'My task', href: '#portal' },
  { label: 'How it works', href: '#how' },
  { label: 'Leaderboard', href: '#recognition' },
  { label: 'Templates', href: '#portal' },
  { label: 'Help', href: '#how' },
]

export default function Hero() {
  return (
    <section className="h-screen p-4 md:p-6">
      <div className="relative h-full rounded-2xl md:rounded-[2rem] overflow-hidden">
        {/*
          Cinematic backdrop. Self-contained CSS animation.
          When an official SIC event reel becomes available, drop it in as a <video> here:
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src="/media/sic-reel.mp4" type="video/mp4" />
          </video>
        */}
        <div className="absolute inset-0 hero-backdrop" />

        {/* Noise + gradient overlays */}
        <div className="absolute inset-0 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

        {/* Top navbar — black pill hanging from top edge */}
        <nav className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8 z-10">
          <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14 text-[10px] sm:text-xs md:text-sm">
            {NAV.map((n) => (
              <li key={n.label}>
                <a
                  href={n.href}
                  className="transition-colors"
                  style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                  onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = '#E1E0CC')}
                  onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = 'rgba(225, 224, 204, 0.8)')}
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom-aligned hero content */}
        <div className="absolute bottom-0 left-0 right-0 grid grid-cols-12 gap-4 md:gap-6 px-6 md:px-10 lg:px-14 pb-8 md:pb-12">
          {/* Left: giant tag */}
          <h1 className="col-span-12 md:col-span-8 font-medium leading-[0.85] tracking-[-0.05em] text-[13vw] sm:text-[12vw] md:text-[11vw] lg:text-[10vw]"
              style={{ color: '#E1E0CC' }}>
            <WordsPullUp text="#MySICStory" showAsterisk />
          </h1>

          {/* Right: description + CTA */}
          <div className="col-span-12 md:col-span-4 flex flex-col justify-end gap-4 md:gap-6 md:pb-[0.6em]">
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-primary/70 text-xs sm:text-sm md:text-base"
              style={{ lineHeight: 1.2 }}
            >
              One scan. One roll number. One post a week. The official portal for Samsung Innovation Campus students in TSSC universities — find your task, grab your template, post your story.
            </motion.p>

            <motion.a
              href="#portal"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="group inline-flex items-center gap-2 hover:gap-3 bg-primary rounded-full pl-5 pr-1 py-1 text-black font-medium text-sm sm:text-base w-fit transition-all"
            >
              Find my task
              <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#E1E0CC' }} />
              </span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
