import { View, Text, ScrollView, Pressable } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { CreditCard, Check, Zap, Star, Crown, ExternalLink } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useChannelStore } from '@/stores/useChannelStore'
import { apiClient } from '@/lib/api/client'

interface BillingInfo {
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'past_due' | 'canceled' | 'trialing'
  currentPeriodEnd?: string
  cancelAtPeriodEnd: boolean
  portalUrl?: string
}

const PLAN_FEATURES: Record<string, { label: string; free: boolean; pro: boolean; enterprise: boolean }[]> = {
  Bot: [
    { label: 'Custom commands', free: true, pro: true, enterprise: true },
    { label: 'Timed messages', free: true, pro: true, enterprise: true },
    { label: 'Automation pipelines', free: false, pro: true, enterprise: true },
    { label: 'Unlimited commands', free: false, pro: true, enterprise: true },
  ],
  Overlays: [
    { label: 'Basic widgets', free: true, pro: true, enterprise: true },
    { label: 'Custom HTML widgets', free: false, pro: true, enterprise: true },
    { label: 'Unlimited widgets', free: false, pro: false, enterprise: true },
  ],
  Music: [
    { label: 'Now playing widget', free: true, pro: true, enterprise: true },
    { label: 'Song requests', free: false, pro: true, enterprise: true },
    { label: 'Spotify integration', free: false, pro: true, enterprise: true },
  ],
  Support: [
    { label: 'Community support', free: true, pro: true, enterprise: true },
    { label: 'Priority support', free: false, pro: true, enterprise: true },
    { label: 'Dedicated account manager', free: false, pro: false, enterprise: true },
  ],
}

const PLAN_CONFIG = {
  free: { label: 'Free', color: '#9ca3af', icon: Zap, price: '$0/mo' },
  pro: { label: 'Pro', color: '#9146FF', icon: Star, price: '$9/mo' },
  enterprise: { label: 'Enterprise', color: '#f59e0b', icon: Crown, price: 'Custom' },
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <View className="flex-row items-center gap-2 py-1">
      <View
        className={`h-4 w-4 rounded-full items-center justify-center ${
          included ? 'bg-green-500/20' : 'bg-gray-700/40'
        }`}
      >
        {included && <Check size={10} color="#10b981" />}
      </View>
      <Text className={`text-xs ${included ? 'text-gray-300' : 'text-gray-600'}`}>{label}</Text>
    </View>
  )
}

export default function BillingScreen() {
  const broadcasterId = useChannelStore((s) => s.currentChannel?.broadcasterId)

  const { data: billing, isLoading } = useQuery<BillingInfo>({
    queryKey: ['billing', broadcasterId],
    queryFn: () =>
      apiClient.get(`/api/${broadcasterId}/billing`).then((r) => r.data),
    enabled: !!broadcasterId,
  })

  const plan = billing?.plan ?? 'free'
  const cfg = PLAN_CONFIG[plan]
  const PlanIcon = cfg.icon

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="Billing" />

      {isLoading ? (
        <View className="gap-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </View>
      ) : (
        <>
          {/* Current plan */}
          <Card className="gap-4">
            <View className="flex-row items-center gap-3">
              <View
                className="h-12 w-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${cfg.color}20` }}
              >
                <PlanIcon size={22} color={cfg.color} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-base font-bold text-gray-100">{cfg.label} Plan</Text>
                <Text className="text-sm text-gray-500">{cfg.price}</Text>
              </View>
              <Badge
                variant={
                  billing?.status === 'active' || billing?.status === 'trialing' ? 'success' :
                  billing?.status === 'past_due' ? 'warning' : 'muted'
                }
                label={
                  billing?.status === 'trialing' ? 'Trial' :
                  billing?.status === 'past_due' ? 'Past Due' :
                  billing?.status === 'canceled' ? 'Canceled' : 'Active'
                }
              />
            </View>

            {billing?.currentPeriodEnd && (
              <Text className="text-xs text-gray-500">
                {billing.cancelAtPeriodEnd ? 'Cancels on' : 'Renews on'}{' '}
                {new Date(billing.currentPeriodEnd).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </Text>
            )}

            {billing?.portalUrl && (
              <Button
                variant="secondary"
                onPress={() => {}}
                leftIcon={<ExternalLink size={14} color="#8889a0" />}
                label="Manage Subscription"
              />
            )}
          </Card>

          {/* Features */}
          <Card className="gap-4">
            <Text className="text-sm font-semibold text-gray-300">Plan Features</Text>
            {Object.entries(PLAN_FEATURES).map(([group, features]) => (
              <View key={group} className="gap-1">
                <Text className="text-xs font-semibold text-gray-500 uppercase mt-1">{group}</Text>
                {features.map((f) => (
                  <FeatureRow key={f.label} label={f.label} included={f[plan as keyof typeof f] as boolean} />
                ))}
              </View>
            ))}
          </Card>

          {/* Upgrade CTA */}
          {plan === 'free' && (
            <Card className="items-center gap-3 py-6">
              <Star size={28} color="#9146FF" />
              <Text className="text-base font-bold text-gray-100">Upgrade to Pro</Text>
              <Text className="text-sm text-gray-500 text-center px-4">
                Unlock pipelines, unlimited commands, song requests, and more.
              </Text>
              <Button label="Upgrade — $9/mo" className="w-full mt-1" />
            </Card>
          )}
        </>
      )}
    </ScrollView>
  )
}
