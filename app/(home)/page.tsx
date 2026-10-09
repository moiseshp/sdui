import { getSessionUserId } from '@/lib/session';
import { getHomeScreen } from '@/lib/data';
import { Home } from '@/packages/bdui/screens/home';
import { parseScreen } from '@/packages/bdui/schema/screen';
import { HomeScreenProvider } from './home-bdui-provider';

/**
 * Demo Home (root `/`). See docs/variantes-y-vistas.md → `/`.
 *
 * Public (D-69): there is no session guard. Without a session the backend
 * answers with the anonymous view; once the person signs in, it answers with
 * the view assigned to them.
 *
 * [ARQ] The client decides nothing: it asks the backend for the already
 * resolved screen, validates it and renders it. Every load requests the screen
 * again, so reloading shows changes.
 */
export default async function HomePage() {
  // Reading the cookie makes the page dynamic: no cache (D-19).
  const userId = await getSessionUserId();

  const screen = parseScreen(await getHomeScreen(userId));

  return (
    <HomeScreenProvider>
      <Home screen={screen} />
    </HomeScreenProvider>
  );
}
