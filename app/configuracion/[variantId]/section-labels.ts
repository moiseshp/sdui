import type { Section } from '@/packages/bdui/schema/section';

/**
 * [DEMO] Friendly names for the section order editor. Presenter-facing only:
 * it is NOT part of the contract (another platform could label sections its
 * own way). The editor never shows JSON.
 */
export interface SectionCard {
  id: string;
  typeLabel: string;
  summary: string;
  thumbnail: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  hero_banner: 'Banner principal',
  featured_products: 'Carrusel de productos',
  promo_banner: 'Banner promocional',
  announcement_bar: 'Barra de anuncio',
  coupon_card: 'Cupón',
  loyalty_card: 'Tarjeta de puntos',
  daypart_menu: 'Menú por franja horaria',
  header_default: 'Header',
  header_greeting: 'Header con saludo',
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

/** Tokens like {{firstName}} are resolved by the backend per person; here they read as a generic name. */
function withoutTokens(text: string): string {
  return text.replace(/\{\{\s*\w+\s*\}\}/g, 'tu nombre');
}

export function describeSection(section: Section): SectionCard {
  const props = asRecord(section.props);
  const firstItem = Array.isArray(props.items) ? asRecord(props.items[0]) : {};

  const typeLabel =
    section.type === 'featured_products' && props.layout === 'grid'
      ? 'Grilla de productos'
      : (TYPE_LABELS[section.type] ?? section.type);
  const summary = asText(props.title) ?? asText(props.message) ?? asText(firstItem.name) ?? asText(firstItem.alt) ?? '';
  const thumbnail = asText(props.imageUrl) ?? asText(firstItem.imageUrl);

  return { id: section.id, typeLabel, summary: withoutTokens(summary), thumbnail };
}

export function describeHeader(header: Section): string {
  return TYPE_LABELS[header.type] ?? header.type;
}
