import { View, Text, ScrollView } from 'react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader } from '@/components/ui/Card'
import { Check, X } from 'lucide-react-native'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

const PLAN_FEATURES: Record<string, { label: string; free: boolean; pro: boolean; enterprise: boolean }[]> = {
  features: [
    { label: 'Unlimited commands', free: false, pro: true, enterprise: true },
    { label: 'Custom bot name', free: false, pro: true, enterprise: true },
    { label: 'Channel point rewards', free: true, pro: true, enterprise: true },
    { label: 'Timers & scheduled messages', free: true, pro: true, enterprise: true },
    { label: 'Chat moderation tools', free: true, pro: true, enterprise: true },
    { label: 'Pipeline automations', free: false, pro: true, enterprise: true },
    { label: 'Spotify integration', free: false, pro: true, enterprise: true },
    { label: 'Multi-channel management', free: false, pro: false, enterprise: true },
    { label: 'Priority support', free: false, pro: false, enterprise: true },
    { label: 'Custom integrations', free: false, pro: false, enterprise: true },
  ],
}

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <View className="flex-row items-center gap-3 py-2 border-b border-border last:border-b-0">
      {included
        ? <Check size={14} color="rgb(74,222,128)" />
        : <X size={14} color="rgb(107,114,128)" />
      }
      <Text className={included ? 'text-sm text-gray-200' : 'text-sm text-gray-500'}>
        {label}
      </Text>
    </View>
  )
}

export function BillingScreen() {
  const featureList = PLAN_FEATURES.features

  return (
    <ErrorBoundary>
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="pb-8">
      <PageHeader title="Billing" subtitle="Manage your subscription" />
      <View className="px-4 pt-4 gap-4">
        {/* Coming soon banner */}
        <Card className="border border-accent-800 bg-accent-950">
          <View className="px-4 py-4 gap-2">
            <Text className="text-base font-semibold text-accent-200">Billing Coming Soon</Text>
            <Text className="text-sm text-accent-400">
              Subscription management and plan upgrades are under development.
            </Text>
          </View>
        </Card>

        {/* Features overview */}
        <Card>
          <CardHeader title="Available Features" />
          <View className="px-4 py-2">
            {featureList.map((feature) => (
              <FeatureRow key={feature.label} label={feature.label} included={feature.pro} />
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
    </ErrorBoundary>
  )
}
