import { useLayoutEffect } from 'react';
import { gsap, OCEAN, ScrollTrigger, SplitText, SUNSET } from '../lib/gsap';

/**
 * Site-wide scroll choreography. Elements opt in with data attributes:
 *  data-parallax     image drifts and settles inside its frame
 *  data-split        heading letters rise in random order with a sunset/ocean colour split that snaps shut
 *  data-count="28"   number counts up when it scrolls in (optional data-suffix="+")
 *  data-draw         SVG strokes draw themselves in
 *  data-scrub-text   paragraph words light up as you scroll through it
 *  data-clip         frame opens from a rounded inset
 *  data-curtain      a sunset-orange curtain sweeps across, then pulls away to show the photo
 *  data-float        card swings up and straightens, floats at its own pace; its children stagger in
 *  data-drift="1|-1" giant background word slides sideways
 *  data-marquee      endless ticker
 *  data-pop          children pop in with a stagger once
 *  data-wave         wave divider rises like a tide as it comes into view
 *  data-spin         sun rays turn with the scroll while the sun drifts
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
          // Words keep letters together so a word never breaks across lines mid-animation
          const split = SplitText.create(el, { type: 'words,chars' });
          gsap.from(split.chars, {
            yPercent: 115,
            opacity: 0,
            textShadow: `-0.12em 0 0 ${SUNSET}, 0.12em 0 0 ${OCEAN}`,
            duration: 1.1,
            ease: 'tide',
            stagger: { each: 0.024, from: 'random' },
            clearProps: 'textShadow',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const to = Number(el.dataset.count);
          const suffix = el.dataset.suffix ?? '';
          const n = { v: 0 };
          el.textContent = `0${suffix}`;
          gsap.to(n, {
            v: to,
            duration: 2.2,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%' },
            onUpdate: () => {
              el.textContent = `${Math.round(n.v)}${suffix}`;
            },
          });
        });

        gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
          gsap.from(el.querySelectorAll('path, line, circle'), {
            drawSVG: 0,
            duration: 2,
            stagger: 0.1,
            ease: 'power2.inOut',
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

        gsap.utils.toArray<HTMLElement>('[data-curtain]').forEach((el) => {
          const curtain = el.querySelector<HTMLElement>('.feature-curtain');
          const pic = el.querySelector('picture');
          if (!curtain || !pic) return;
          // The curtain comes in from the image's outer edge
          const fromLeft = !!el.closest('.feature--img-left');
          gsap.set(pic, { autoAlpha: 0 });
          gsap
            .timeline({ scrollTrigger: { trigger: el, start: 'top 80%' } })
            .fromTo(curtain, { scaleX: 0, transformOrigin: fromLeft ? 'left' : 'right' }, { scaleX: 1, duration: 0.6, ease: 'expo.in' })
            .set(pic, { autoAlpha: 1 })
            .set(curtain, { transformOrigin: fromLeft ? 'right' : 'left' })
            .to(curtain, { scaleX: 0, duration: 0.9, ease: 'expo.out' })
            .from(pic, { scale: 1.3, duration: 1.4, ease: 'expo.out' }, '<');
        });

        gsap.utils.toArray<HTMLElement>('[data-float]').forEach((el) => {
          const left = !!el.closest('.feature--img-right');
          gsap.fromTo(
            el,
            { y: 110 },
            { y: -50, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.2 } },
          );
          // The card swings in from its side and settles straight
          gsap.from(el, {
            rotate: left ? -5 : 5,
            xPercent: left ? -12 : 12,
            autoAlpha: 0,
            duration: 1.3,
            ease: 'back.out(1.4)',
            scrollTrigger: { trigger: el, start: 'top 90%' },
          });
          gsap.from(el.children, {
            y: 40,
            autoAlpha: 0,
            duration: 1,
            ease: 'power3.out',
            stagger: 0.09,
            delay: 0.25,
            scrollTrigger: { trigger: el, start: 'top 85%' },
          });
          const ticks = el.querySelectorAll('.ticks li');
          if (ticks.length) {
            gsap.from(ticks, {
              x: -24,
              autoAlpha: 0,
              duration: 0.7,
              ease: 'back.out(2)',
              stagger: 0.07,
              scrollTrigger: { trigger: ticks[0], start: 'top 90%' },
            });
          }
        });

        gsap.utils.toArray<HTMLElement>('[data-wave]').forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0.25 },
            { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom 55%', scrub: 0.8 } },
          );
        });

        gsap.utils.toArray<HTMLElement>('[data-spin]').forEach((el) => {
          const trigger = el.parentElement;
          gsap.from(el, { scale: 0, rotate: -120, duration: 1.6, ease: 'elastic.out(1, 0.5)', scrollTrigger: { trigger, start: 'top 70%' } });
          gsap.to(el.querySelector('.sun-rays'), {
            rotate: 360,
            svgOrigin: '100 100',
            ease: 'none',
            scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          });
          gsap.fromTo(el.querySelector('svg'), { y: 80 }, { y: -120, ease: 'none', scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1 } });
        });

        // Accommodation cards flip up in waves the first time they come into view
        const units = gsap.utils.toArray<HTMLElement>('.unit');
        if (units.length) {
          gsap.set(units, { autoAlpha: 0, y: 70, rotateX: -55, transformPerspective: 900, transformOrigin: '50% 0%' });
          ScrollTrigger.batch(units, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, rotateX: 0, duration: 1, ease: 'back.out(1.6)', stagger: 0.08, clearProps: 'transform,transformPerspective' }),
          });
        }

        // Contact icons pop like bubbles
        const icons = gsap.utils.toArray<HTMLElement>('.info-icon');
        if (icons.length) {
          gsap.from(icons, {
            scale: 0,
            rotate: -90,
            duration: 0.9,
            ease: 'back.out(2.6)',
            stagger: 0.12,
            scrollTrigger: { trigger: icons[0].closest('.contact-wrap') ?? icons[0], start: 'top 80%' },
          });
        }

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
          const rise = (batch: Element[]) => gsap.to(batch, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08 });
          // onLeave too, so photos jumped straight past (anchor links, fast flicks) still show
          ScrollTrigger.batch(photos, { start: 'top 95%', once: true, onEnter: rise, onLeave: rise });
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
