import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Site-wide scroll choreography. Elements opt in with data attributes:
 *  data-parallax     image drifts and settles inside its frame
 *  data-split        heading words rise out of a mask
 *  data-scrub-text   paragraph words light up as you scroll through it
 *  data-clip         frame opens from a rounded inset
 *  data-float        card floats at a different speed to the page; its children stagger in
 *  data-drift="1|-1" giant background word slides sideways
 *  data-marquee      endless ticker
 *  data-pop          children pop in with a stagger once
 * plus: eyebrow lines draw in, gallery photos rise in batches and lean with scroll speed,
 * and a scroll progress bar. (The booking widget loads later and runs its own entrance.)
 */
export function useGsapEffects() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: -10, scale: 1.18 },
            {
              yPercent: 10,
              scale: 1.02,
              ease: 'none',
              scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
          const split = SplitText.create(el, { type: 'words', mask: 'words' });
          gsap.from(split.words, {
            yPercent: 115,
            rotate: 6,
            duration: 1.1,
            ease: 'expo.out',
            stagger: 0.06,
            scrollTrigger: { trigger: el, start: 'top 88%' },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-scrub-text]').forEach((el) => {
          const split = SplitText.create(el, { type: 'words' });
          gsap.fromTo(
            split.words,
            { opacity: 0.14 },
            {
              opacity: 1,
              ease: 'none',
              stagger: 0.05,
              scrollTrigger: { trigger: el, start: 'top 82%', end: 'bottom 45%', scrub: 0.6 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-clip]').forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: 'inset(14% 10% 14% 10% round 40px)' },
            {
              clipPath: 'inset(0% 0% 0% 0% round 28px)',
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 35%', scrub: 1 },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 110 },
            { y: -50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } },
          );
          gsap.from(el.children, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 85%' },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-drift]').forEach((el) => {
          const dir = Number(el.dataset.drift || 1);
          gsap.fromTo(
            el,
            { xPercent: dir > 0 ? 8 : -38 },
            { xPercent: dir > 0 ? -38 : 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-marquee]').forEach((el) => {
          const loop = gsap.to(el, { xPercent: -50, ease: 'none', duration: 45, repeat: -1 });
          // Scrolling speeds the ticker up, then it eases back to its own pace
          ScrollTrigger.create({
            onUpdate: (self) => {
              const v = Math.min(5, Math.abs(self.getVelocity()) / 300);
              gsap.to(loop, { timeScale: 1 + v, duration: 0.3, overwrite: true });
              gsap.to(loop, { timeScale: 1, duration: 1.2, delay: 0.3, ease: 'power2.out' });
            },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-pop]').forEach((el) => {
          gsap.from(el.children, {
            y: 50,
            autoAlpha: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 85%' },
          });
        });

        // Eyebrow labels: their line draws in, then the text slides after it. Only the ones on the page now
        // get the effect (ones that appear later, e.g. after a booking step, just show).
        const eyebrows = gsap.utils.toArray<HTMLElement>('.eyebrow');
        eyebrows.forEach((e) => e.classList.add('eyebrow-anim'));
        ScrollTrigger.batch(eyebrows, {
          start: 'top 92%',
          once: true,
          onEnter: (els) => els.forEach((e, i) => window.setTimeout(() => e.classList.add('is-in'), i * 120)),
        });
        const cleanEyebrows = () => eyebrows.forEach((e) => e.classList.remove('eyebrow-anim', 'is-in'));

        // Gallery: photos rise in waves, then lean with the speed of the scroll
        const photos = gsap.utils.toArray<HTMLElement>('.gallery-item');
        if (photos.length) {
          gsap.set(photos, { autoAlpha: 0, y: 90, rotate: () => gsap.utils.random(-3, 3) });
          ScrollTrigger.batch(photos, {
            start: 'top 95%',
            once: true,
            onEnter: (batch) => gsap.to(batch, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 }),
          });
          const skew = gsap.quickTo('.gallery-grid', 'skewY', { duration: 0.5, ease: 'power3.out' });
          ScrollTrigger.create({
            trigger: '.gallery-grid',
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => skew(gsap.utils.clamp(-4, 4, self.getVelocity() / -350)),
            onLeave: () => skew(0),
            onLeaveBack: () => skew(0),
          });
        }

        return cleanEyebrows;
      });

      gsap.to('.progress-bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      });
    });

    // Re-measure when images load or the page height changes (booking steps, accommodation filters…)
    let last = document.body.scrollHeight;
    let timer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const h = document.body.scrollHeight;
        if (Math.abs(h - last) > 2) {
          last = h;
          ScrollTrigger.refresh();
        }
      }, 200);
    });
    ro.observe(document.body);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', onLoad);

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      window.removeEventListener('load', onLoad);
      ctx.revert();
    };
  }, []);
}
