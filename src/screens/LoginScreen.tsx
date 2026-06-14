import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import { getReadableAuthError } from '../services/authService';
import { colors, radii } from '../theme';
import { AuthStackParamList } from '../types/navigation';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await login(email, password);
    } catch (loginError) {
      setError(getReadableAuthError(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.mark}>
            <Ionicons color={colors.ink} name="checkmark" size={32} />
          </View>
          <Text style={styles.eyebrow}>DAILYPROOF</Text>
          <Text style={styles.title}>Welcome back.</Text>
          <Text style={styles.subtitle}>
            Sign in and keep the promises you made visible.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              editable={!isSubmitting}
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#9A9D95"
              style={styles.input}
              value={email}
            />

            <Text style={[styles.label, styles.secondLabel]}>PASSWORD</Text>
            <View style={styles.passwordField}>
              <TextInput
                autoCapitalize="none"
                autoComplete="password"
                editable={!isSubmitting}
                onChangeText={setPassword}
                placeholder="Your password"
                placeholderTextColor="#9A9D95"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={password}
              />
              <Pressable
                accessibilityLabel={
                  showPassword ? 'Hide password' : 'Show password'
                }
                onPress={() => setShowPassword((current) => !current)}
              >
                <Ionicons
                  color={colors.muted}
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={21}
                />
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={handleLogin}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !isSubmitting && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Log In</Text>
                  <Ionicons
                    color={colors.ink}
                    name="arrow-forward"
                    size={19}
                  />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New to DailyProof?</Text>
            <Pressable
              disabled={isSubmitting}
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.footerLink}>Create an account</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  mark: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  eyebrow: {
    color: colors.accentDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
    marginTop: 24,
  },
  title: {
    color: colors.ink,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.4,
    marginTop: 8,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  form: {
    marginTop: 34,
  },
  label: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginLeft: 3,
  },
  secondLabel: {
    marginTop: 18,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 15,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  passwordField: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  passwordInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
    minHeight: 54,
  },
  error: {
    color: '#A23A32',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 56,
  },
  primaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'center',
    marginTop: 26,
  },
  footerText: {
    color: colors.muted,
    fontSize: 13,
  },
  footerLink: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '900',
  },
});
