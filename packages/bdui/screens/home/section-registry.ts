import * as React from 'react';
import type { SectionRegistry } from '../../utils/section-registry';
import { defineSection } from '../../utils/section-registry';

import { announcementBarPropsSchema } from '@/packages/sections/announcement-bar/schema';
import { bottomBarPropsSchema } from '@/packages/sections/bottom-bar/schema';
import { couponCardPropsSchema } from '@/packages/sections/coupon-card/schema';
import { daypartMenuPropsSchema } from '@/packages/sections/daypart-menu/schema';
import { featuredProductsPropsSchema } from '@/packages/sections/featured-products/schema';
import { headerDefaultPropsSchema } from '@/packages/sections/header-default/schema';
import { headerGreetingPropsSchema } from '@/packages/sections/header-greeting/schema';
import { heroBannerPropsSchema } from '@/packages/sections/hero-banner/schema';
import { loyaltyCardPropsSchema } from '@/packages/sections/loyalty-card/schema';
import { promoBannerPropsSchema } from '@/packages/sections/promo-banner/schema';

/**
 * Home screen section registry.
 *
 * Each entry binds a `section.type` string from the BFF to:
 *   - `component`: a lazily-loaded client component
 *   - `schema`   : the Zod schema that validates its props
 *   - `version`  : the contract version this client understands
 *
 * Keeping the schema next to the component (in `packages/sections/*`) lets
 * each team ship breaking changes by bumping `version` here and shipping a
 * new schema/component pair — the renderer picks the right fallback while
 * older clients are still in the wild.
 *
 * `satisfies SectionRegistry` preserves the literal keys for the TypeScript
 * tooling while still conforming to the renderer's required shape.
 */
export const sectionRegistry = {
  // Header slot (Screen v1.1). Same registry as the body.
  header_default: defineSection({
    schema: headerDefaultPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/header-default').then(m => ({ default: m.HeaderDefault }))),
  }),
  header_greeting: defineSection({
    schema: headerGreetingPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/header-greeting').then(m => ({ default: m.HeaderGreeting }))),
  }),

  // Bottom bar slot (Screen v1.2). Same registry as the body.
  bottom_bar: defineSection({
    schema: bottomBarPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/bottom-bar').then(m => ({ default: m.BottomBar }))),
  }),

  // Body
  announcement_bar: defineSection({
    schema: announcementBarPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/announcement-bar').then(m => ({ default: m.AnnouncementBar }))),
  }),
  coupon_card: defineSection({
    schema: couponCardPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/coupon-card').then(m => ({ default: m.CouponCard }))),
  }),
  daypart_menu: defineSection({
    schema: daypartMenuPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/daypart-menu').then(m => ({ default: m.DaypartMenu }))),
  }),
  hero_banner: defineSection({
    schema: heroBannerPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/hero-banner').then(m => ({ default: m.HeroBanner }))),
  }),
  loyalty_card: defineSection({
    schema: loyaltyCardPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/loyalty-card').then(m => ({ default: m.LoyaltyCard }))),
  }),
  featured_products: defineSection({
    schema: featuredProductsPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/featured-products').then(m => ({ default: m.FeaturedProducts }))),
  }),
  promo_banner: defineSection({
    schema: promoBannerPropsSchema,
    version: 1,
    component: React.lazy(() => import('@/packages/sections/promo-banner').then(m => ({ default: m.PromoBanner }))),
  }),
} as const satisfies SectionRegistry;

export type HomeSectionRegistry = typeof sectionRegistry;
