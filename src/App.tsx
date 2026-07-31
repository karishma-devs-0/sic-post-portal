import Hero from './components/Hero'
import Portal from './components/Portal'
import HowItWorks from './components/HowItWorks'
import Recognition from './components/Recognition'

export default function App() {
  return (
    <main className="bg-black text-primary">
      <Hero />
      <Portal />
      <HowItWorks />
      <Recognition />
    </main>
  )
}
