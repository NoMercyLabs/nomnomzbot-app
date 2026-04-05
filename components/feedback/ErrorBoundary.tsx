import { Component, type ReactNode } from 'react'
import { View, Text, Pressable } from 'react-native'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <View className="flex-1 items-center justify-center p-8 bg-surface gap-4">
          <Text className="text-xl font-bold text-gray-100">Something went wrong</Text>
          <Text className="text-gray-400 text-center text-sm">
            {this.state.error?.message ?? 'An unexpected error occurred'}
          </Text>
          <Pressable
            onPress={() => this.setState({ hasError: false })}
            className="rounded-lg bg-accent-600 px-6 py-3"
          >
            <Text className="text-white font-medium">Try Again</Text>
          </Pressable>
        </View>
      )
    }
    return this.props.children
  }
}
