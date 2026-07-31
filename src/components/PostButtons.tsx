import { useEffect, useState } from 'react'
import { Check, Linkedin, Twitter, Share2, MessageCircle } from 'lucide-react'

interface Props {
  caption: string
}

/**
 * One-tap posting row. Each button:
 *   1. Copies the caption to clipboard (inside the click handler — required for iOS Safari).
 *   2. Opens the platform's composer URL in a new tab.
 *
 * The LinkedIn and (on iOS) Threads apps intercept their web URLs via universal links and
 * strip the `text=` query param — so the pre-copy step guarantees a one-paste fallback.
 * Smart Share appears only when the browser supports Web Share API with files (phones).
 */
export default function PostButtons({ caption }: Props) {
  const [copiedTag, setCopiedTag] = useState<string | null>(null)
  const [canShareFiles, setCanShareFiles] = useState(false)

  useEffect(() => {
    // Feature-detect Web Share with files (Android Chrome / iOS Safari on HTTPS)
    try {
      const dummy = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'x.png', {
        type: 'image/png',
      })
      setCanShareFiles(!!(navigator.canShare && navigator.canShare({ files: [dummy] })))
    } catch {
      setCanShareFiles(false)
    }
  }, [])

  async function copyThenOpen(tag: string, url: string) {
    try {
      await navigator.clipboard.writeText(caption)
    } catch {
      /* older browsers — user will just have to type */
    }
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag((t) => (t === tag ? null : t)), 1600)
    // Small delay so the "copied" pulse is visible before the tab flip.
    setTimeout(() => window.open(url, '_blank', 'noopener,noreferrer'), 120)
  }

  const e = encodeURIComponent

  const options: {
    tag: string
    label: string
    Icon: typeof Linkedin
    url: string
    hint?: string
  }[] = [
    {
      tag: 'linkedin',
      label: 'LinkedIn',
      Icon: Linkedin,
      url: `https://www.linkedin.com/feed/?shareActive=true&text=${e(caption)}`,
      hint: 'app may not pre-fill — paste (caption copied)',
    },
    {
      tag: 'x',
      label: 'X',
      Icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${e(caption)}`,
    },
    {
      tag: 'threads',
      label: 'Threads',
      Icon: MessageCircle,
      url: `https://www.threads.net/intent/post?text=${e(caption)}`,
    },
    {
      tag: 'whatsapp',
      label: 'WhatsApp',
      Icon: MessageCircle,
      url: `https://wa.me/?text=${e(caption)}`,
    },
  ]

  async function smartShare() {
    try {
      await navigator.clipboard.writeText(caption)
    } catch { /* ignore */ }
    // Minimal PNG so navigator.share has a file — real card generation lives in the lab.
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1080; canvas.height = 1080
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#0B1F5C'; ctx.fillRect(0, 0, 1080, 1080)
      ctx.fillStyle = '#00A9E0'
      ctx.textAlign = 'center'
      ctx.font = '600 40px -apple-system, "Helvetica Neue", Arial, sans-serif'
      ctx.fillText('SAMSUNG INNOVATION CAMPUS', 540, 200)
      ctx.fillStyle = '#DEDBC8'
      ctx.font = '700 80px -apple-system, "Helvetica Neue", Arial, sans-serif'
      ctx.fillText('#MySICStory', 540, 560)
      ctx.font = '400 40px -apple-system, "Helvetica Neue", Arial, sans-serif'
      ctx.fillStyle = 'rgba(222,219,200,0.7)'
      ctx.fillText('implemented by TSSC', 540, 640)
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob((b) => (b ? res(b) : rej(new Error('toBlob null'))), 'image/png'),
      )
      const file = new File([blob], 'mysicstory.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: caption })
        setCopiedTag('smart')
        setTimeout(() => setCopiedTag((t) => (t === 'smart' ? null : t)), 1600)
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        // Silent — clipboard fallback already happened.
      }
    }
  }

  return (
    <div className="mt-6">
      <div className="text-[11px] uppercase tracking-widest text-gray-500 mb-2">
        Post it — one tap
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {options.map((opt) => {
          const active = copiedTag === opt.tag
          return (
            <button
              key={opt.tag}
              type="button"
              onClick={() => copyThenOpen(opt.tag, opt.url)}
              className="flex items-center justify-center gap-2 bg-[#141414] hover:bg-[#1a1a1a] border border-white/10 rounded-lg py-2.5 text-sm text-primary transition-colors"
            >
              {active ? (
                <Check className="w-4 h-4 text-siccyan" />
              ) : (
                <opt.Icon className="w-4 h-4" />
              )}
              <span>{active ? 'Copied · opening' : opt.label}</span>
            </button>
          )
        })}
      </div>

      {canShareFiles && (
        <button
          type="button"
          onClick={smartShare}
          className="mt-2 w-full flex items-center justify-center gap-2 bg-sic hover:bg-[#1832c7] text-white rounded-lg py-2.5 text-sm transition-colors"
        >
          {copiedTag === 'smart' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          <span>{copiedTag === 'smart' ? 'Shared' : 'Smart Share (image + caption)'}</span>
        </button>
      )}

      <p className="mt-2 text-[11px] text-gray-500 leading-snug">
        Every button copies the caption first — if the app doesn't pre-fill, just long-press → Paste.
        Or use the{' '}
        <a
          href={`${import.meta.env.BASE_URL}lab.html`}
          className="text-primary hover:text-white underline underline-offset-2"
        >
          testing lab
        </a>{' '}
        to try all mechanisms.
      </p>
    </div>
  )
}
