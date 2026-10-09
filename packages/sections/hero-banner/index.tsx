'use client';

import * as React from 'react';

import { useActionHandler } from '@/packages/bdui/hooks/use-action-handler';
import {
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  Carousel as EmblaCarousel,
} from '@/packages/ui/carousel';
import { cn } from '@/packages/utils/cn';
import Autoplay from 'embla-carousel-autoplay';
import type { HeroBannerItem, HeroBannerProps } from './schema';

export function HeroBanner({ items, viewportMode = 'full', showDots = false, autoplay = false, autoplayInterval = 5000 }: HeroBannerProps) {
  const { handleActions } = useActionHandler();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const isViewportFull = viewportMode === 'full';
  const isViewportPeek = viewportMode === 'peek';

  const autoplayPlugin = React.useMemo(() => Autoplay({ delay: autoplayInterval, stopOnInteraction: false }), [autoplayInterval]);

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => setCurrent(api.selectedScrollSnap()));
  }, [api]);

  const handlePress = (item: HeroBannerItem) => {
    const onPress = item.actions?.onPress;
    if (onPress?.length) void handleActions(onPress);
  };

  return (
    <section role="region" aria-roledescription="hero-banner" data-slot="hero-banner">
      <EmblaCarousel setApi={setApi} plugins={autoplay ? [autoplayPlugin] : []} opts={{ loop: true }} className="w-full">
        <CarouselContent className={cn(isViewportPeek && '-ml-4')}>
          {items.map((item, index) => {
            const isClickable = !!item.actions?.onPress?.length;
            return (
              <CarouselItem key={`${item.imageUrl}-${index}`} className={cn(isViewportPeek && 'basis-4/5 pl-4')}>
                <div
                  onClick={() => isClickable && handlePress(item)}
                  onKeyDown={event => {
                    if (!isClickable) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handlePress(item);
                    }
                  }}
                  role={isClickable ? 'button' : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  aria-label={item.alt}
                  className={cn('relative block w-full overflow-hidden', isClickable && 'cursor-pointer')}
                >
                  <img src={item.imageUrl} alt={item.alt} className="w-full h-auto" />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {isViewportFull && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
      </EmblaCarousel>
      {showDots && (
        <div className="py-4 flex gap-2 justify-center">
          {items.map((_, index) => (
            <span key={index} className={cn('block w-2 h-2 bg-gray-300 rounded-full', current === index && 'bg-primary')} />
          ))}
        </div>
      )}
    </section>
  );
}
