'use client';

import { cn } from '@/packages/utils/cn';
import { useActionHandler } from '@/packages/bdui/hooks/use-action-handler';
import type { PromoBannerProps } from './schema';

export function PromoBanner({ title, description, imageUrl, badge, actions, backgroundColor, textColor }: PromoBannerProps) {
  const { handleActions } = useActionHandler();

  const onPress = actions?.onPress;
  const isClickable = !!onPress?.length;

  return (
    <section className="p-4">
      <div
        onClick={() => isClickable && void handleActions(onPress)}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={event => {
          if (!isClickable) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void handleActions(onPress);
          }
        }}
        // Without raw colors (D-61 debt) the banner follows the screen theme (D-63).
        style={{
          backgroundColor: backgroundColor ?? 'var(--primary)',
          color: textColor ?? 'var(--primary-foreground)',
        }}
        className={cn(
          'relative overflow-hidden rounded-xl group transition-transform duration-300 shadow-lg flex items-center justify-between p-6',
          isClickable && 'cursor-pointer',
        )}
      >
        <div className="z-10 flex flex-col items-start gap-2 max-w-[60%]">
          {badge && (
            <span className="px-3 py-1 text-xs font-bold tracking-wider uppercase bg-white/20 rounded-full backdrop-blur-sm">{badge}</span>
          )}
          <h2 className="text-2xl font-black md:text-3xl tracking-tight">{title}</h2>
          {description && <p className="text-sm opacity-90 md:text-base font-medium">{description}</p>}
        </div>

        <div className="absolute right-[-10%] top-0 h-full w-1/2 group-hover:opacity-100 transition-opacity pointer-events-none">
          {imageUrl ? (
            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
          ) : (
            <div className="w-full h-full bg-black/10 rounded-full mix-blend-overlay blur-2xl transform scale-150 translate-x-1/4" />
          )}
        </div>

        <div className="absolute inset-0 bg-linear-to-r from-black/20 to-transparent pointer-events-none" />
      </div>
    </section>
  );
}
