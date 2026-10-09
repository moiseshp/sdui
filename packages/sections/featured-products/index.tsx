'use client';

import { useActionHandler } from '@/packages/bdui/hooks/use-action-handler';
import type { TriggerMap } from '@/packages/bdui/schema/action';
import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { ArrowRightIcon, PlusIcon } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import type { FeaturedProductsProps } from './schema';

const featuredProductsVariants = cva('w-full px-4', {
  variants: {
    layout: {
      carousel:
        'flex gap-4 overflow-x-auto snap-x snap-mandatory flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
      grid: 'grid grid-cols-2 gap-4',
    },
  },
  defaultVariants: {
    layout: 'carousel',
  },
});

function FeaturedProducts({ title, layout = 'carousel', variant = 'default', cta, items }: FeaturedProductsProps) {
  const { handleActions } = useActionHandler();

  const handlePress = (actions?: TriggerMap) => {
    void handleActions(actions?.onPress);
  };

  return (
    <section data-slot="featured-products" className="py-3">
      <div className="flex justify-between items-center px-4 mb-2">
        <h2 className="text-lg font-semibold">{title}</h2>
        {cta && (
          <nav>
            <Button variant="link" className="px-0" onClick={() => handlePress(cta.actions)}>
              {cta.label} <ArrowRightIcon />
            </Button>
          </nav>
        )}
      </div>
      <div className={cn(featuredProductsVariants({ layout }))} data-slot="featured-products-list">
        {items.map(product => {
          const isClickable = !!product.actions?.onPress?.length;
          return (
            <button
              key={product.id}
              data-slot="featured-products-card"
              type="button"
              onClick={() => isClickable && handlePress(product.actions)}
              disabled={!isClickable}
              className={cn(
                'w-52 shrink-0 rounded-md overflow-hidden border border-secondary text-left',
                layout === 'grid' ? 'w-full' : 'w-52',
              )}
            >
              {product.imageUrl && <img src={product.imageUrl} alt={product.name} className="w-ful object-cover" />}
              <div className="p-2">
                <h3
                  className={cn(
                    'font-semibold line-clamp-1',
                    variant === 'compact' ? 'text-center pb-2' : 'mb-1 text-sm',
                  )}
                >
                  {product.name}
                </h3>
                {variant === 'default' && (
                  <>
                    <p className="text-muted-foreground text-xs line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center mt-3">
                      <div>
                        <p className="flex items-center gap-2 text-sm mb-1">
                          <span className="text-primary">{product.badge}</span>
                          <span className="text-muted-foreground line-through">{product.originalPrice}</span>
                        </p>
                        <p className="font-bold">{product.price}</p>
                      </div>
                      <span className="p-2 border border-secondary rounded-sm">
                        <PlusIcon />
                      </span>
                    </div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export { FeaturedProducts, featuredProductsVariants };
