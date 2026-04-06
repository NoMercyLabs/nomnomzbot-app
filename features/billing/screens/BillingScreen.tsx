import { View, Text, ScrollView, Pressable } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Check, CreditCard } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import { useLoadingTimeout } from '@/hooks/useLoadingTimeout'

interface BillingInfo {
  currentPlan: string
  paymentMethod?: { brand: string; last4: string; expMonth: number; expYear: number }
  billingHistory: { date: string; description: string; amount: string; status: string }[]
}


const PLAN_DEFS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'month',
    description: 'Get started with the basics',
    features: ['Up to 10 commands', 'Channel point rewards', 'Basic timers', 'Chat moderation', 'Community management'],
    accentColor: '#5a5280',
  },
  {
    id: 'plus',
    name: 'Plus',
    price: 4,
    period: 'month',
    description: 'For growing streamers',
    features: ['Up to 50 commands', 'Custom bot responses', 'Advanced timers', 'Spotify integration', 'Widget overlays', 'Priority queue'],
    accentColor: '#7C3AED',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 12,
    period: 'month',
    description: 'Everything you need to grow',
    features: ['Unlimited commands', 'Pipeline automations', 'Custom bot name', 'Advanced integrations', 'Analytics dashboard', 'Priority support'],
    isPopular: true,
    accentColor: '#8b5cf6',
  },
  {
    id: 'team',
    name: 'Team',
    price: 25,
    period: 'month',
    description: 'For teams and agencies',
    features: ['Everything in Pro', 'Multi-channel management', 'Team member access', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
    accentColor: '#a78bfa',
  },
]

function PlanCard({ plan, isCurrent, onSelect }: { plan: typeof PLAN_DEFS[number]; isCurrent: boolean; onSelect: () => void }) {
  return (
    <View
      className="flex-1 rounded-xl p-4 gap-4"
      style={{
        backgroundColor: isCurrent ? 'rgba(124,58,237,0.12)' : '#1A1530',
        borderWidth: isCurrent ? 2 : 1,
        borderColor: isCurrent ? '#7C3AED' : '#1e1a35',
        minWidth: 180,
      }}
    >
      {/* Header */}
      <View className="gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-sm font-bold text-white">{plan.name}</Text>
          {plan.isPopular && !isCurrent && (
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(124,58,237,0.3)' }}>
              <Text className="text-xs font-semibold" style={{ color: '#a78bfa' }}>Popular</Text>
            </View>
          )}
          {isCurrent && (
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: '#7C3AED' }}>
              <Text className="text-xs font-semibold text-white">Current</Text>
            </View>
          )}
        </View>
        <View className="flex-row items-baseline gap-1">
          <Text className="text-2xl font-bold text-white">${plan.price}</Text>
          <Text className="text-xs" style={{ color: '#5a5280' }}>/ {plan.period}</Text>
        </View>
        <Text className="text-xs" style={{ color: '#5a5280' }}>{plan.description}</Text>
      </View>

      {/* Features */}
      <View className="gap-2 flex-1">
        {plan.features.map((feature) => (
          <View key={feature} className="flex-row items-center gap-2">
            <Check size={13} color="#22c55e" />
            <Text className="text-xs flex-1" style={{ color: '#cdcede' }}>{feature}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <Pressable
        onPress={onSelect}
        disabled={isCurrent}
        className="rounded-lg py-2.5 items-center"
        style={{ backgroundColor: isCurrent ? 'rgba(124,58,237,0.2)' : '#7C3AED' }}
      >
        <Text className="text-sm font-semibold" style={{ color: isCurrent ? '#a78bfa' : '#fff' }}>
          {isCurrent ? 'Current Plan' : `Upgrade to ${plan.name}`}
        </Text>
      </Pressable>
    </View>
  )
}

export function BillingScreen() {
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const { data: billing, isLoading, isError, refetch } = useQuery<BillingInfo>({
    queryKey: ['billing'],
    enabled: !!user?.id,
    queryFn: async () => {
      const res = await apiClient.get<{ data: BillingInfo }>(`/v1/users/${user!.id}/billing`)
      return res.data.data
    },
  })

  const timedOut = useLoadingTimeout(isLoading)
  const showSkeleton = isLoading && !isError && !timedOut
  const currentPlanId = billing?.currentPlan ?? null

  return (
    <ErrorBoundary>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#141125' }}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <PageHeader title="Billing" subtitle="Manage your subscription" />

        <View className="px-5 pt-4 gap-6">
          {/* Plan cards */}
          <View className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5280' }}>
              Plans
            </Text>
            {isError || timedOut ? (
              <ErrorState title="Unable to load billing info" onRetry={refetch} />
            ) : showSkeleton ? (
              <View className="flex-row flex-wrap gap-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-64 flex-1 rounded-xl min-w-[180px]" />)}
              </View>
            ) : (
              <View className="flex-row flex-wrap gap-3">
                {PLAN_DEFS.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    isCurrent={currentPlanId === plan.id}
                    onSelect={() => setSelectedPlan(plan.id)}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Payment method — always shown */}
          <View className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5280' }}>
              Payment Method
            </Text>
            <View
              className="rounded-xl p-4 flex-row items-center gap-4"
              style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
            >
              <View
                className="h-10 w-10 rounded-lg items-center justify-center"
                style={{ backgroundColor: '#231D42' }}
              >
                <CreditCard size={20} color={billing?.paymentMethod ? '#a78bfa' : '#3d3566'} />
              </View>
              {billing?.paymentMethod ? (
                <>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm font-medium text-white">
                      {billing.paymentMethod.brand} ending in {billing.paymentMethod.last4}
                    </Text>
                    <Text className="text-xs" style={{ color: '#5a5280' }}>
                      Expires {billing.paymentMethod.expMonth}/{billing.paymentMethod.expYear}
                    </Text>
                  </View>
                  <Pressable
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#231D42', borderWidth: 1, borderColor: '#1e1a35' }}
                  >
                    <Text className="text-xs font-medium" style={{ color: '#8889a0' }}>Update</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View className="flex-1 gap-0.5">
                    <Text className="text-sm" style={{ color: '#5a5280' }}>No payment method on file</Text>
                    <Text className="text-xs" style={{ color: '#3d3566' }}>Required for paid plans</Text>
                  </View>
                  <Pressable
                    className="px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: '#7C3AED', borderWidth: 1, borderColor: '#7C3AED' }}
                  >
                    <Text className="text-xs font-medium text-white">Add Card</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* Billing history — always shown */}
          <View className="gap-3">
            <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#5a5280' }}>
              Billing History
            </Text>
            <View
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: '#1A1530', borderWidth: 1, borderColor: '#1e1a35' }}
            >
              <View
                className="flex-row items-center px-4 py-2.5"
                style={{ backgroundColor: '#231D42' }}
              >
                {[
                  { label: 'DATE', flex: 1 },
                  { label: 'DESCRIPTION', flex: 3 },
                  { label: 'AMOUNT', flex: 1 },
                  { label: 'STATUS', flex: 1 },
                  { label: 'INVOICE', flex: 1 },
                ].map(({ label, flex }) => (
                  <View key={label} style={{ flex }}>
                    <Text className="text-xs font-semibold tracking-wider" style={{ color: '#3d3566' }}>{label}</Text>
                  </View>
                ))}
              </View>
              {(billing?.billingHistory?.length ?? 0) === 0 ? (
                <View className="items-center py-8 gap-1">
                  <Text className="text-sm" style={{ color: '#3d3566' }}>No billing history</Text>
                  <Text className="text-xs" style={{ color: '#2e2757' }}>Invoices will appear here after your first payment</Text>
                </View>
              ) : (
                billing!.billingHistory.map((row, i) => (
                  <View
                    key={i}
                    className="flex-row items-center px-4 py-3"
                    style={i > 0 ? { borderTopWidth: 1, borderTopColor: '#1e1a35' } : undefined}
                  >
                    <View style={{ flex: 1 }}>
                      <Text className="text-xs" style={{ color: '#8889a0' }}>{row.date}</Text>
                    </View>
                    <View style={{ flex: 3 }}>
                      <Text className="text-sm" style={{ color: '#cdcede' }}>{row.description}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text className="text-sm font-medium text-white">{row.amount}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View className="flex-row items-center gap-1.5">
                        <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                        <Text className="text-xs" style={{ color: '#22c55e' }}>{row.status}</Text>
                      </View>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Pressable>
                        <Text className="text-xs font-medium" style={{ color: '#a78bfa' }}>
                          {(row as any).invoiceUrl ? 'Download' : '—'}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </ErrorBoundary>
  )
}
