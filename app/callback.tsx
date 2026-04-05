/**
 * Shallow redirect to handle flat deep-link URLs.
 *
 * When Twitch (or the backend) redirects to `nomercybot://callback?token=XXX`,
 * expo-router resolves this file. We forward all query params to the actual
 * auth callback screen that lives in the `(auth)` route group.
 */
import { Redirect, useLocalSearchParams } from 'expo-router'

export default function CallbackRedirect() {
  const params = useLocalSearchParams<Record<string, string>>()
  const query = new URLSearchParams(params as Record<string, string>).toString()
  const href = query ? (`/(auth)/callback?${query}` as const) : ('/(auth)/callback' as const)
  return <Redirect href={href as any} />
}
