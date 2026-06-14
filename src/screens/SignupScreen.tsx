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

type SignupScreenProps = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: SignupScreenProps) {
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignup() {
    if (!displayName.trim() || !email.trim() || !password) {
      setError('Complete all fields to create your account.');
      return;
    }

    if (password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await signup(displayName, email, password);
    } catch (signupError) {
      setError(getReadableAuthError(signupError));
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
          <Pressable
            accessibilityLabel="Back to login"
            disabled={isSubmitting}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons color={colors.ink} name="arrow-back" size={22} />
          </Pressable>

          <Text style={styles.eyebrow}>START YOUR PROOF</Text>
          <Text style={styles.title}>Create account.</Text>
          <Text style={styles.subtitle}>
            Your username will be generated automatically.
          </Text>

          <View style={styles.form}>
            <Text style={styles.label}>DISPLAY NAME</Text>
            <TextInput
              autoCapitalize="words"
              autoComplete="name"
              editable={!isSubmitting}
              maxLength={40}
              onChangeText={setDisplayName}
              placeholder="Ky"
              placeholderTextColor="#9A9D95"
              style={styles.input}
              value={displayName}
            />

            <Text style={[styles.label, styles.secondLabel]}>EMAIL</Text>
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
                autoComplete="new-password"
                editable={!isSubmitting}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
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
              onPress={handleSignup}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && !isSubmitting && styles.buttonPressed,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.ink} />
              ) : (
                <>
                  <Text style={styles.primaryButtonText}>Create Account</Text>
                  <Ionicons
                    color={colors.ink}
                    name="checkmark"
                    size={20}
                  />
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Pressable
              disabled={isSubmitting}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.footerLink}>Log in</Text>
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
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    marginBottom: 24,
    width: 42,
  },
  eyebrow: {
    color: colors.accentDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.4,
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
    marginTop: 30,
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
    marginTop: 24,
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
