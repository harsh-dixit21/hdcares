import TigerTearReveal from '@/components/ui/tiger-tear-reveal';

export default function CourageHero() {
  return <TigerTearReveal
    id="courage"
    className="courage-hero"
    word="COURAGE"
    tagline=""
    ink="#c3d3a5"
    paper="#171c16"
    taglineColor="#b8c3ad"
    eyeColor="#c9d892"
    furColor="#b9874e"
    height="100dvh"
    scrollDistance="220svh"
    hint={false}
  >
    <h2 className="sr-only">Courage</h2>
  </TigerTearReveal>;
}
