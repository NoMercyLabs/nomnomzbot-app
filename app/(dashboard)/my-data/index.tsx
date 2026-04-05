import { useState } from 'react'
import { View, Text, ScrollView, Alert } from 'react-native'
import { useMutation } from '@tanstack/react-query'
import { Download, Trash2, Eye, Lock, FileText } from 'lucide-react-native'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/useAuthStore'
import { useToast } from '@/hooks/useToast'
import { apiClient } from '@/lib/api/client'

export default function MyDataScreen() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const toast = useToast()
  const [exportRequested, setExportRequested] = useState(false)

  const exportMutation = useMutation({
    mutationFn: () =>
      apiClient.post('/api/me/data/export').then((r) => r.data),
    onSuccess: () => {
      setExportRequested(true)
      toast.success('Export requested — you will receive an email when ready.')
    },
    onError: () => toast.error('Failed to request data export'),
  })

  const deleteMutation = useMutation({
    mutationFn: () =>
      apiClient.delete('/api/me').then((r) => r.data),
    onSuccess: () => {
      toast.success('Account deletion scheduled.')
      logout()
    },
    onError: () => toast.error('Failed to request account deletion'),
  })

  function confirmDelete() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all associated data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete My Account',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(),
        },
      ],
    )
  }

  return (
    <ScrollView className="flex-1 bg-gray-950" contentContainerClassName="p-4 gap-4">
      <PageHeader title="My Data" />

      {/* What we store */}
      <Card className="gap-4">
        <View className="flex-row items-center gap-2">
          <Eye size={18} color="#3b82f6" />
          <Text className="text-sm font-semibold text-gray-200">What We Store</Text>
        </View>
        {[
          'Your Twitch account information (username, profile image)',
          'Chat messages and moderation history for your channel',
          'Bot configuration (commands, timers, pipelines, widgets)',
          'Viewer data (watchtime, points, trust levels)',
          'Stream statistics and event history',
        ].map((item, i) => (
          <View key={i} className="flex-row items-start gap-2">
            <Text className="text-gray-500 text-xs mt-0.5">•</Text>
            <Text className="flex-1 text-xs text-gray-400 leading-5">{item}</Text>
          </View>
        ))}
      </Card>

      {/* Account info */}
      {user && (
        <Card className="gap-3">
          <View className="flex-row items-center gap-2">
            <Lock size={18} color="#a855f7" />
            <Text className="text-sm font-semibold text-gray-200">Your Account</Text>
          </View>
          <View className="gap-1">
            <Text className="text-xs text-gray-500">Display Name</Text>
            <Text className="text-sm text-gray-200">{user.displayName}</Text>
          </View>
          <View className="gap-1">
            <Text className="text-xs text-gray-500">Email</Text>
            <Text className="text-sm text-gray-200">{user.email || '—'}</Text>
          </View>
          <View className="gap-1">
            <Text className="text-xs text-gray-500">Member Since</Text>
            <Text className="text-sm text-gray-200">
              {new Date(user.createdAt).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
        </Card>
      )}

      {/* Export */}
      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Download size={18} color="#10b981" />
          <Text className="text-sm font-semibold text-gray-200">Export Your Data</Text>
        </View>
        <Text className="text-xs text-gray-500 leading-5">
          Request a copy of all your data. We'll email you a download link within 24 hours.
        </Text>
        {exportRequested ? (
          <View className="rounded-xl bg-green-900/20 border border-green-700 px-4 py-3">
            <Text className="text-sm text-green-400">Export requested. Check your email within 24 hours.</Text>
          </View>
        ) : (
          <Button
            variant="secondary"
            onPress={() => exportMutation.mutate()}
            loading={exportMutation.isPending}
            leftIcon={<Download size={14} color="#8889a0" />}
            label="Request Data Export"
          />
        )}
      </Card>

      {/* Delete */}
      <Card className="gap-3">
        <View className="flex-row items-center gap-2">
          <Trash2 size={18} color="#ef4444" />
          <Text className="text-sm font-semibold text-red-400">Delete Account</Text>
        </View>
        <Text className="text-xs text-gray-500 leading-5">
          Permanently delete your account and all data. Your bot will be removed from your channel.
          This cannot be undone.
        </Text>
        <Button
          variant="danger"
          onPress={confirmDelete}
          loading={deleteMutation.isPending}
          leftIcon={<Trash2 size={14} color="white" />}
          label="Delete My Account"
        />
      </Card>
    </ScrollView>
  )
}
