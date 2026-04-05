import { Component, type ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'
import { AlertTriangle } from 'lucide-react-native'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'An unexpected error occurred.',
    }
  }

  reset = () => {
    this.setState({ hasError: false, message: '' })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <View className="flex-1 items-center justify-center bg-gray-950 px-8 gap-4">
          <View className="h-14 w-14 rounded-2xl bg-red-900/30 items-center justify-center">
            <AlertTriangle size={28} color="#ef4444" />
          </View>
          <Text className="text-lg font-bold text-gray-100">Something went wrong</Text>
          <Text className="text-sm text-gray-500 text-center leading-5">{this.state.message}</Text>
          <Pressable
            onPress={this.reset}
            className="mt-2 rounded-xl bg-accent-600 px-6 py-3 active:bg-accent-700"
          >
            <Text className="text-white font-semibold">Try again</Text>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}
