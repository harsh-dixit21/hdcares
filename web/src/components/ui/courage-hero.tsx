import { Heart } from 'lucide-react';
import TigerTearReveal from '@/components/ui/tiger-tear-reveal';

export default function CourageHero() {
  return <TigerTearReveal
    id="courage"
    className="courage-hero"
    word="COURAGE"
    tagline="ON YOUR OWN TERMS"
    ink="#c3d3a5"
    paper="#171c16"
    taglineColor="#b8c3ad"
    eyeColor="#c9d892"
    furColor="#b9874e"
    height="100dvh"
    scrollDistance="220svh"
    hint={false}
  >
    <h2 className="sr-only">Courage, on your own terms.</h2>
    <div className="tear-topline" aria-hidden="true">
      <span>03 / A WAY FORWARD</span>
      <span><Heart size={13} /> AT YOUR PACE</span>
    </div>
    <div className="tear-footer">
      <p>You don’t have to face this alone.<br /><span>Support, on your own terms.</span></p>
    </div>
  </TigerTearReveal>;
}
