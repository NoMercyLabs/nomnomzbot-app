import { Pressable, Text, ActivityIndicator } from 'react-native'
import { useTwitchOAuth } from '../hooks/useTwitchOAuth'

export function TwitchLoginButton() {
  const { login, isLoading } = useTwitchOAuth()

  return (
    <Pressable
      onPress={login}
      disabled={isLoading}
      className="flex-row items-center justify-center gap-3 rounded-xl bg-[#9147ff] py-4 px-6 active:opacity-80 disabled:opacity-50"
    >
      {isLoading && <ActivityIndicator size="small" color="white" />}
      <Text className="text-white font-semibold text-base">
        {isLoading ? 'Connecting...' : 'Login with Twitch'}
      </Text>
    </Pressable>
  )
}
