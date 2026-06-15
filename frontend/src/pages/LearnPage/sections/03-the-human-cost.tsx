/**
 * @fileoverview Learn section 03 — The Human Cost: The Harms.
 * Copy: ../plan/03-the-human-cost.md (Synthesis 03).
 * Honest-epistemics nuance is load-bearing here — keep it intact.
 */
import { ICONS } from '../../../components/LordIcon/LordIcon';
import type { LearnSection } from '../types';

export const theHumanCost: LearnSection = {
  id: 'the-human-cost',
  number: '03',
  title: 'The Human Cost',
  subtitle: 'The documented, clinical harms — harm by harm.',
  slides: [
    {
      icon: ICONS.learn03Medicine,
      title: 'This is medicine, not mood',
      body: `Start with the register. The clinicians studying this describe "clinical-level depression that requires treatment" and "self harm that lands people in the ER" — not vague unhappiness. A UK coroner formally ruled that algorithmic content "contributed … in a more than minimal way" to 14-year-old Molly Russell's death. The stakes here are diagnosable conditions and, in the tail, lives.`,
    },
    {
      icon: ICONS.learn03Meter,
      title: 'Body image and body dysmorphia',
      body: `Meta's own internal research concluded: "We make body image issues worse for one in three teen girls," with 32% of teen girls feeling worse about their bodies after Instagram. Clinically, "Snapchat dysmorphia" ties filtered-selfie culture to body dysmorphic disorder — a real DSM-5 condition — with surgeons reporting patients who want to look like their filtered selves. The image feed is, for some, an engine of appearance distress.`,
    },
    {
      icon: ICONS.learn03Brain,
      title: 'Depression and anxiety',
      body: `Internal Meta slides record that "teens blame Instagram for increases in the rate of anxiety and depression." This isn't only correlation: when Facebook rolled out across U.S. colleges, it causally worsened students' mental health, an effect attributed to "fostering unfavorable social comparisons." And moment-to-moment studies find that the more people used Facebook, the more their affect and life satisfaction declined over the following hours.`,
    },
    {
      icon: ICONS.learn03Fastfood,
      title: 'Disordered eating',
      body: `Clinicians estimate social media plays a role in roughly half of their eating-disorder patients. An audit found a major feed pushing pro-eating-disorder content to fresh teen accounts within minutes, and both the APA and Surgeon General name disordered-eating risk explicitly. The harm is not hypothetical — it is in treatment rooms.`,
    },
    {
      icon: ICONS.learn03Phone,
      title: 'Compulsive, "addictive" use',
      body: `Teens told Meta, in its own research, that they feel "addicted" and "unable to stop themselves." This isn't a character flaw — it's the designed output of variable reinforcement tuned per user (the mechanism the next section unpacks). When people in a controlled study deactivated Facebook, they afterward used it less and valued it less: usage had exceeded what users themselves endorsed.`,
    },
    {
      icon: ICONS.learn03Ribbon,
      title: 'Self-harm and suicide',
      body: `This is the severe tail, and it is documented. Among teens reporting suicidal thoughts, 13% in the UK and 6% in the US traced those thoughts to Instagram, per Meta's internal research. Molly Russell, 14, received emails titled "10 depression pins you might like" before her death, which a coroner tied in part to algorithmic content. Rare, but real — and the reason precaution is the right default.`,
    },
    {
      icon: ICONS.learn03Sleep,
      title: 'Sleep, eroded at the margin',
      body: `A quieter, near-universal harm: bedtime "doomscrolling" displaces sleep. In a medical-society survey, 38% of adults — and 46% of those aged 18–24 — said it worsens their sleep, and the aggravator was emotionally charged content, not just blue light. The engagement objective, which selects for exactly that kind of content, keeps you awake by design.`,
    },
    {
      icon: ICONS.learn03Coffee,
      title: 'Beyond the feed: dating apps',
      body: `Recommendation harm extends past the image feed to any appearance-ranked interface. On dating apps, where the swipe is the feedback signal, use is associated with self-objectification, body shame, and lower self-worth — in both men and women. The same comparison machinery, applied to an explicitly appearance-graded surface.`,
    },
    {
      icon: ICONS.learn03Temperature,
      title: 'A corrosive climate — and an honest caveat',
      body: `Because the engagement objective rewards what spreads, it selects for hostility: across 2.7 million posts, each out-group term raised the odds of sharing by about 67%, making animosity the single strongest predictor of spread. The feed's emotional weather is shaped by arithmetic, not intent. But hold the line honestly — across 355,358 teens, generic "screen time" explains at most 0.4% of well-being, so the harm is concentrated in the vulnerable tail, not uniform; ask whose harm, which feature, what mechanism.`,
    },
  ],
};
