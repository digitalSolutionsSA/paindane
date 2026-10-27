// One place where GSAP plugins are registered and the house ease is defined. Import gsap from here.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);

// "Tide": a quick swell, then a long, soft settle – the house ease for reveals
CustomEase.create('tide', 'M0,0 C0.12,0.72 0.18,0.96 0.36,1 0.6,1.03 0.8,1 1,1');

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Brand colours used in motion (the sunset/ocean split on headings) */
export const SUNSET = '#ff8a1f';
export const OCEAN = '#19a8e0';

export { gsap, ScrollTrigger, SplitText };
