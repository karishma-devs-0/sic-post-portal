import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, Clipboard } from 'lucide-react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'
import AnimatedLetter from './AnimatedLetter'
import PostButtons from './PostButtons'

/**
 * SUBMIT_ENDPOINT: Google Apps Script Web App URL that accepts POST { roll, week, postUrl, ts }.
 * See README for Apps Script template. Because Apps Script CORS is finicky, we submit with
 * `mode: 'no-cors'` and use optimistic success — the response body is opaque.
 *
 * FALLBACK: prefilled Google Form URL pattern:
 *   https://docs.google.com/forms/d/e/<FORM_ID>/formResponse?entry.<rollId>=ROLL&entry.<urlId>=POSTURL&entry.<weekId>=WEEK
 */
const SUBMIT_ENDPOINT = 'https://script.google.com/macros/s/REPLACE_WITH_YOUR_DEPLOYMENT_ID/exec'

// First day of the campaign — used to compute the current week number.
const CAMPAIGN_START = new Date('2026-01-06T00:00:00Z')

// Course → Samsung-blue pill label
const COURSE_LABEL: Record<string, string> = {
  AI: 'AI',
  'Coding & Programming': 'Coding & Programming',
  IoT: 'IoT',
  'Big Data': 'Big Data',
}

type Student = { course: string; university: string }
type WeekTask = { title: string; prompt: string; caption: string; templateUrl: string }
type TasksJson = { week: number; tasks: Record<string, WeekTask> }

type Phase = 'idle' | 'not-found' | 'found' | 'submitted'

function computeWeek(): number {
  const now = new Date()
  const diffMs = now.getTime() - CAMPAIGN_START.getTime()
  return Math.max(1, Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000)) + 1)
}

export default function Portal() {
  const [students, setStudents] = useState<Record<string, Student> | null>(null)
  const [tasks, setTasks] = useState<TasksJson | null>(null)

  const [roll, setRoll] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [student, setStudent] = useState<(Student & { roll: string }) | null>(null)
  const [postUrl, setPostUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)

  // Load static data once
  useEffect(() => {
    const base = import.meta.env.BASE_URL ?? './'
    fetch(`${base}data/students.json`).then((r) => r.json()).then(setStudents).catch(() => setStudents({}))
    fetch(`${base}data/tasks.json`).then((r) => r.json()).then(setTasks).catch(() => setTasks(null))
  }, [])

  const week = tasks?.week ?? computeWeek()
  const task: WeekTask | null =
    student && tasks?.tasks ? (tasks.tasks[student.course] ?? tasks.tasks['AI'] ?? null) : null

  function submitRoll(e: React.FormEvent) {
    e.preventDefault()
    if (!students) return
    const key = roll.trim().toUpperCase()
    const match = students[key]
    if (!match) {
      setPhase('not-found')
      setShakeKey((k) => k + 1)
      return
    }
    setStudent({ ...match, roll: key })
    setPhase('found')
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault()
    if (!student) return
    const payload = { roll: student.roll, week, postUrl: postUrl.trim(), ts: new Date().toISOString() }
    try {
      await fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
    } catch {
      /* swallow — optimistic success */
    }
    setPhase('submitted')
  }

  async function copyCaption() {
    if (!task) return
    try {
      await navigator.clipboard.writeText(task.caption)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* older browsers */
    }
  }

  return (
    <section id="portal" className="bg-black py-16 sm:py-24 md:py-32 px-4 sm:px-6">
      <div className="bg-[#101010] max-w-6xl mx-auto rounded-2xl md:rounded-3xl p-6 sm:p-10 md:p-14 text-center">
        <p className="text-primary text-[10px] sm:text-xs tracking-[0.15em] uppercase">
          SIC 2026 · TSSC × Samsung
        </p>

        <div className="mt-4 sm:mt-6">
          <WordsPullUpMultiStyle
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-[0.95] sm:leading-[0.9]"
            segments={[
              { text: 'Enter your roll number,', className: 'font-normal' },
              { text: "get this week's post.", className: 'italic font-serif' },
              { text: 'Takes less than 60 seconds.', className: 'font-normal' },
            ]}
          />
        </div>

        {/* ---- Roll number input ---- */}
        <form onSubmit={submitRoll} className="mt-8 sm:mt-12 max-w-xl mx-auto">
          <label htmlFor="roll" className="sr-only">
            Roll number
          </label>
          <input
            key={shakeKey}
            id="roll"
            value={roll}
            onChange={(e) => {
              setRoll(e.target.value)
              if (phase === 'not-found') setPhase('idle')
            }}
            placeholder="e.g. SIC26-TSSC-0421"
            className={`w-full bg-black border border-white/10 rounded-xl px-5 py-4 text-center text-lg sm:text-xl text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-sic transition ${phase === 'not-found' ? 'shake border-red-500/50' : ''}`}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="characters"
          />
          {phase === 'idle' && (
            <button
              type="submit"
              className="mt-3 inline-flex items-center gap-2 hover:gap-3 bg-primary rounded-full pl-5 pr-1 py-1 text-black font-medium text-sm sm:text-base transition-all group"
            >
              Find my task
              <span className="bg-black rounded-full w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-110">
                <ArrowRight className="w-4 h-4" style={{ color: '#E1E0CC' }} />
              </span>
            </button>
          )}
          {phase === 'not-found' && (
            <p className="mt-3 text-red-400 text-sm">
              Roll number not found — check with your faculty coordinator.
            </p>
          )}
        </form>

        {/* ---- Task card (on match) ---- */}
        <AnimatePresence>
          {phase !== 'idle' && phase !== 'not-found' && student && task && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 sm:mt-14 max-w-2xl mx-auto text-left bg-black rounded-2xl p-6 sm:p-8 border border-white/5"
            >
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[11px] sm:text-xs uppercase tracking-wider bg-sic text-white px-3 py-1 rounded-full">
                  {COURSE_LABEL[student.course] ?? student.course}
                </span>
                <span className="text-gray-400 text-xs sm:text-sm">{student.university}</span>
                <span className="ml-auto text-[10px] uppercase tracking-widest text-gray-500">Week {week}</span>
              </div>

              <h3 className="text-primary text-xl sm:text-2xl font-medium">{task.title}</h3>
              <p className="mt-2 text-gray-400 text-sm sm:text-base leading-relaxed">{task.prompt}</p>

              {/* Caption block */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] uppercase tracking-widest text-gray-500">Ready-made caption</span>
                  <button
                    onClick={copyCaption}
                    className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-white transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-siccyan" /> <span className="text-siccyan">Copied</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="w-4 h-4" /> Copy caption
                      </>
                    )}
                  </button>
                </div>
                <pre className="bg-[#0a0a0a] border border-white/5 rounded-lg p-4 text-xs sm:text-sm text-primary/90 whitespace-pre-wrap font-mono">
{task.caption}
                </pre>
              </div>

              {/* One-tap posting buttons — copies caption first, then opens composer */}
              <PostButtons caption={task.caption} />

              {/* Get template link */}
              <div className="mt-6">
                <a
                  href={task.templateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-white text-sm transition-colors"
                >
                  Get template
                  <ArrowRight className="w-4 h-4" style={{ transform: 'rotate(-45deg)' }} />
                </a>
              </div>

              {/* Submit post URL */}
              <form onSubmit={submitPost} className="mt-8 border-t border-white/5 pt-6">
                <label htmlFor="posturl" className="text-[11px] uppercase tracking-widest text-gray-500 block mb-2">
                  Your post URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="posturl"
                    type="url"
                    required
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/posts/..."
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-primary placeholder:text-primary/40 outline-none focus:ring-2 focus:ring-sic text-sm"
                  />
                  <button
                    type="submit"
                    disabled={phase === 'submitted'}
                    className="group inline-flex items-center justify-center gap-2 hover:gap-3 bg-primary rounded-full pl-5 pr-1 py-1 text-black font-medium text-sm transition-all disabled:opacity-70"
                  >
                    {phase === 'submitted' ? (
                      <>
                        <Check className="w-5 h-5 text-siccyan" />
                        <span className="pr-4">Done!</span>
                      </>
                    ) : (
                      <>
                        Mark my post done
                        <span className="bg-black rounded-full w-9 h-9 flex items-center justify-center transition-transform group-hover:scale-110">
                          <ArrowRight className="w-4 h-4" style={{ color: '#E1E0CC' }} />
                        </span>
                      </>
                    )}
                  </button>
                </div>
                {phase === 'submitted' && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-siccyan text-sm"
                  >
                    Done! Your roll number is marked for week {week}.
                  </motion.p>
                )}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Scroll-linked character opacity paragraph ---- */}
        <div className="mt-16 sm:mt-24 max-w-3xl mx-auto">
          <AnimatedLetter
            text="Every week, every SIC student posts one story — a project, a win, a moment from the lab. Four thousand students, four thousand voices, one hashtag. Your post takes a minute; your story lasts."
            className="text-primary text-lg sm:text-xl md:text-2xl leading-relaxed"
          />
        </div>

        {/* ---- One-Tap Posting Lab (diagnostic / demo) ---- */}
        <div className="mt-10 text-center">
          <a
            href={`${import.meta.env.BASE_URL}lab.html`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <span>Testing lab</span>
            <span className="opacity-60">·</span>
            <span>One-tap posting mechanism demo</span>
            <ArrowRight className="w-3.5 h-3.5" style={{ transform: 'rotate(-45deg)' }} />
          </a>
        </div>
      </div>
    </section>
  )
}
