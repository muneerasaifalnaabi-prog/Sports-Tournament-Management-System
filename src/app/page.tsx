import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  CalendarClock,
  ListOrdered,
  Target,
  Flag,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroAnimation } from "@/components/marketing/HeroAnimation";
import { StatCounter } from "@/components/marketing/StatCounter";
import { RevealOnScroll } from "@/components/marketing/RevealOnScroll";
import { Button } from "@/components/ui/Button";
import heroImage from "../../images/hero.jpg";
import sectionImage from "../../images/section.jpg";
import section2Image from "../../images/section2.jpg";
import ctaImage from "../../images/cta.jpg";

const features = [
  {
    icon: CalendarClock,
    title: "Automatic fixtures",
    description:
      "Generate a balanced round-robin schedule or a seeded knockout bracket in one click — byes handled for you.",
  },
  {
    icon: ListOrdered,
    title: "Live standings",
    description:
      "Points, goal difference, and rankings recalculate the moment a result is recorded — no spreadsheets.",
  },
  {
    icon: Trophy,
    title: "Knockout brackets",
    description: "A real bracket view that advances the winner automatically after every match.",
  },
  {
    icon: Target,
    title: "Top scorer race",
    description: "Track every goal, own goals included, and see the golden boot race update live.",
  },
  {
    icon: Flag,
    title: "Referee assignment",
    description: "Assign referees to matches and give them a focused view to submit results.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    description: "Admins, organizers, referees, and team managers each get exactly what they need.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <section className="relative isolate min-h-[34rem] overflow-hidden sm:min-h-[40rem] lg:min-h-[46rem]">
        <div className="hero-photo">
          <Image
            src={heroImage}
            alt="Floodlit stadium with a live tournament bracket and match statistics overlay"
            fill
            priority
            sizes="100vw"
            placeholder="blur"
          />
        </div>
        <div className="hero-photo-overlay" />
        <div className="hero-ray pointer-events-none absolute inset-0 z-[2]" />

        <div className="relative z-10 mx-auto flex min-h-[34rem] max-w-6xl items-center px-4 py-16 sm:min-h-[40rem] sm:px-6 sm:py-24 lg:min-h-[46rem] lg:py-28">
          <div className="max-w-xl text-white">
            <span className="badge badge-live mb-4 bg-white/10 text-white">
              <span className="live-dot" />
              Built for real tournaments
            </span>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Run your league or cup like a pro sports platform.
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/75 sm:text-lg">
              STMS handles fixtures, live standings, knockout brackets, top scorers, and referee
              assignment — so every tournament you run looks and feels like broadcast-grade sport.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button href="/register" className="px-5 py-2.5 text-base">
                Start a tournament
                <ArrowRight size={16} />
              </Button>
              <Button
                href="/tournaments"
                variant="secondary"
                className="bg-white/10 px-5 py-2.5 text-base text-white border-white/20 hover:bg-white/20"
              >
                Browse tournaments
              </Button>
            </div>

            <div className="mt-10">
              <HeroAnimation />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-surface py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:px-6">
          {[
            { value: 12, suffix: "", label: "Active tournaments" },
            { value: 48, suffix: "", label: "Teams competing" },
            { value: 620, suffix: "+", label: "Players tracked" },
            { value: 310, suffix: "+", label: "Goals recorded" },
          ].map((s, i) => (
            <RevealOnScroll
              key={s.label}
              delayMs={i * 80}
              className="rounded-xl p-2 transition-transform duration-300 hover:-translate-y-1"
            >
              <StatCounter value={s.value} suffix={s.suffix} label={s.label} />
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            Everything a tournament organizer needs
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            One dashboard for tournaments, teams, matches, and results — built for admins,
            organizers, referees, and team managers alike.
          </p>
        </RevealOnScroll>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <RevealOnScroll
              key={f.title}
              delayMs={(i % 3) * 90}
              className="card card-interactive group p-5"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light text-brand transition-transform duration-300 group-hover:scale-110">
                <f.icon size={19} />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.description}</p>
            </RevealOnScroll>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <span className="eyebrow justify-center">Inside STMS</span>
          <h2 className="mt-3 text-2xl font-semibold text-foreground sm:text-3xl">
            A command center for every tournament
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            The same broadcast-grade view your organizers, referees, and fans see — live, on any
            screen.
          </p>
        </RevealOnScroll>

        <div className="mt-12 space-y-16 sm:space-y-20">
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <RevealOnScroll>
              <span className="eyebrow">Live control room</span>
              <h3 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
                Watch every match, bracket, and top scorer update in real time
              </h3>
              <p className="mt-3 text-sm text-muted sm:text-base">
                Referees submit results from the pitch and standings, brackets, and the golden
                boot race recalculate instantly — no manual spreadsheets, no refresh.
              </p>
            </RevealOnScroll>
            <RevealOnScroll className="showcase-media" slideUp={false}>
              <Image
                src={sectionImage}
                alt="Broadcast control room with tournament dashboards, live score, and standings overlaying a packed stadium"
                className="h-auto w-full"
                sizes="(min-width: 1024px) 42rem, 100vw"
                placeholder="blur"
              />
            </RevealOnScroll>
          </div>

          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <RevealOnScroll className="showcase-media lg:order-1" slideUp={false}>
              <Image
                src={section2Image}
                alt="Tournament bracket, live match score, standings, and player statistics displayed on one screen"
                className="h-auto w-full"
                sizes="(min-width: 1024px) 42rem, 100vw"
                placeholder="blur"
              />
            </RevealOnScroll>
            <RevealOnScroll className="lg:order-2">
              <span className="eyebrow">One screen, every stat</span>
              <h3 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">
                Standings, brackets, and player stats side by side
              </h3>
              <p className="mt-3 text-sm text-muted sm:text-base">
                No tab-switching between spreadsheets. Tournament progress, venue allocation, and
                team performance sit in one view, whatever the sport.
              </p>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <div className="hero-photo">
          <Image
            src={ctaImage}
            alt="Champions lifting the trophy on the pitch as confetti falls and the crowd celebrates"
            fill
            sizes="100vw"
            placeholder="blur"
          />
        </div>
        <div className="cta-photo-overlay" />

        <RevealOnScroll className="relative z-10 mx-auto max-w-3xl px-4 py-16 text-center text-white sm:px-6 sm:py-20">
          <Trophy size={32} className="mx-auto mb-4 text-amber-300" />
          <h2 className="text-2xl font-bold sm:text-3xl">Ready to kick off?</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/70">
            Create your first tournament in minutes — register teams, generate fixtures, and go
            live.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Button href="/register" className="px-5 py-2.5 text-base">
              Create your account
              <ArrowRight size={16} />
            </Button>
            <Button
              href="/login"
              variant="secondary"
              className="border-white/20 bg-white/10 px-5 py-2.5 text-base text-white hover:bg-white/20"
            >
              Log in
            </Button>
          </div>
        </RevealOnScroll>
      </section>

      <footer className="border-t border-border bg-surface py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted sm:flex-row sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
            <Trophy size={16} className="text-brand" />
            <span className="font-brand text-base">STMS</span>
          </Link>
          <p>&copy; {new Date().getFullYear()} Sports Tournament Management System</p>
        </div>
      </footer>
    </div>
  );
}
