import WordsPullUp from './WordsPullUp'

export default function Recognition() {
  return (
    <section id="recognition" className="bg-black py-16 sm:py-20 md:py-24 px-4 sm:px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-primary text-lg sm:text-xl md:text-2xl leading-tight">
          <WordsPullUp text="Weekly features. University leaderboard. Certificates on stage." />
        </h2>

        <p className="mt-8 text-gray-500 text-xs">
          Samsung Innovation Campus · implemented by TSSC · #MySICStory
        </p>

        {/*
          Future links — leaderboard page + past winners:
          <a href="/leaderboard" className="text-primary/70 hover:text-primary text-xs">Leaderboard →</a>
          <a href="/winners"     className="text-primary/70 hover:text-primary text-xs">Past winners →</a>
        */}
      </div>
    </section>
  )
}
