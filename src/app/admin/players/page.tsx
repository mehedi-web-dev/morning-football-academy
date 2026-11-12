import PlayersClient from "./PlayersClient";

// The players console renders behind AdminGuard, which withholds its children
// until the admin session resolves. During instant-navigation validation there
// is no session, so the client page never renders and Next.js reports it as a
// "dropped segment". Opt this authenticated route out of that validation.
export const instant = false;

/**
 * Admin Players Management Page (CRUD)
 * Server Component wrapper; the interactive console lives in PlayersClient.
 */
export default function AdminPlayersPage() {
  return <PlayersClient />;
}
