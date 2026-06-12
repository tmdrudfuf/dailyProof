import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
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

import { useGoals } from '../context/GoalContext';
import { colors, radii } from '../theme';
import {
  GoalCategory,
  GoalVisibility,
  NewGoal,
} from '../types/goal';
import { ProfileStackParamList } from '../types/navigation';

type CreateGoalScreenProps = NativeStackScreenProps<
  ProfileStackParamList,
  'CreateGoal'
>;

type CategoryOption = {
  category: GoalCategory;
  emoji: string;
};

const categories: CategoryOption[] = [
  { category: 'Exercise', emoji: '💪' },
  { category: 'Study', emoji: '📚' },
  { category: 'Reading', emoji: '📖' },
  { category: 'Diet', emoji: '🥗' },
  { category: 'Meditation', emoji: '🧘' },
  { category: 'Spiritual', emoji: '🙏' },
  { category: 'Hobby', emoji: '🎨' },
  { category: 'Work', emoji: '💼' },
  { category: 'Other', emoji: '✨' },
];

const visibilityOptions: {
  label: GoalVisibility;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    label: 'Friends',
    description: 'Only people you are friends with',
    icon: 'people-outline',
  },
  {
    label: 'Private',
    description: 'Only you can see this goal',
    icon: 'lock-closed-outline',
  },
  {
    label: 'Public',
    description: 'Anyone can see your progress',
    icon: 'globe-outline',
  },
];

const steps = [
  { eyebrow: 'STEP 1', title: 'Choose a category', subtitle: 'What kind of promise are you making?' },
  { eyebrow: 'STEP 2', title: 'Name your goal', subtitle: 'Make it clear, specific, and easy to remember.' },
  { eyebrow: 'STEP 3', title: 'Set the duration', subtitle: 'Choose when this commitment starts and ends.' },
  { eyebrow: 'STEP 4', title: 'Define success', subtitle: 'How many completed days will count as success?' },
  { eyebrow: 'STEP 5', title: 'Pick a reminder', subtitle: 'Choose a daily time that supports your routine.' },
  { eyebrow: 'STEP 6', title: 'Who can see it?', subtitle: 'Friends is selected by default.' },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getInitialDates() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 29);
  return { startDate: formatDate(start), endDate: formatDate(end) };
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(new Date(`${value}T00:00:00`).getTime());
}

export function CreateGoalScreen({ navigation }: CreateGoalScreenProps) {
  const { addGoal, canAddGoal } = useGoals();
  const initialDates = getInitialDates();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CategoryOption | null>(null);
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(initialDates.startDate);
  const [endDate, setEndDate] = useState(initialDates.endDate);
  const [successTarget, setSuccessTarget] = useState('');
  const [reminderTime, setReminderTime] = useState('9:00 AM');
  const [visibility, setVisibility] = useState<GoalVisibility>('Friends');
  const [error, setError] = useState('');

  const currentStep = steps[step];

  function validateCurrentStep() {
    if (step === 0 && !category) {
      return 'Choose a category to continue.';
    }

    if (step === 1 && !title.trim()) {
      return 'Enter a title for your goal.';
    }

    if (step === 2) {
      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        return 'Use the YYYY-MM-DD format for both dates.';
      }
      if (new Date(`${endDate}T00:00:00`) < new Date(`${startDate}T00:00:00`)) {
        return 'End date must be on or after the start date.';
      }
    }

    if (
      step === 3 &&
      (!Number.isInteger(Number(successTarget)) || Number(successTarget) < 1)
    ) {
      return 'Enter a target of at least 1 completed day.';
    }

    if (step === 4 && !reminderTime.trim()) {
      return 'Enter a reminder time.';
    }

    return '';
  }

  function handleBack() {
    setError('');
    if (step === 0) {
      navigation.goBack();
      return;
    }
    setStep((currentStepIndex) => currentStepIndex - 1);
  }

  function handleContinue() {
    const validationError = validateCurrentStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    if (step < steps.length - 1) {
      setStep((currentStepIndex) => currentStepIndex + 1);
      return;
    }

    if (!category) {
      return;
    }

    const goal: NewGoal = {
      category: category.category,
      categoryEmoji: category.emoji,
      title: title.trim(),
      startDate,
      endDate,
      successTarget: Number(successTarget),
      reminderTime: reminderTime.trim(),
      visibility,
    };

    if (addGoal(goal)) {
      navigation.goBack();
    } else {
      setError('You can have up to 3 active goals.');
    }
  }

  function renderStep() {
    if (step === 0) {
      return (
        <View style={styles.categoryGrid}>
          {categories.map((option) => {
            const selected = category?.category === option.category;
            return (
              <Pressable
                accessibilityRole="button"
                key={option.category}
                onPress={() => {
                  setCategory(option);
                  setError('');
                }}
                style={({ pressed }) => [
                  styles.categoryOption,
                  selected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <Text style={styles.categoryEmoji}>{option.emoji}</Text>
                <Text style={styles.categoryLabel}>{option.category}</Text>
                {selected ? (
                  <View style={styles.selectedCheck}>
                    <Ionicons color={colors.ink} name="checkmark" size={13} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      );
    }

    if (step === 1) {
      return (
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>GOAL TITLE</Text>
          <TextInput
            autoFocus
            maxLength={80}
            onChangeText={(value) => {
              setTitle(value);
              setError('');
            }}
            placeholder="e.g. Read for 20 minutes"
            placeholderTextColor="#9A9D95"
            returnKeyType="done"
            style={styles.input}
            value={title}
          />
          <Text style={styles.characterCount}>{title.length}/80</Text>
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>START DATE</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons color={colors.muted} name="calendar-outline" size={20} />
            <TextInput
              autoCapitalize="none"
              onChangeText={(value) => {
                setStartDate(value);
                setError('');
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9A9D95"
              style={styles.iconInput}
              value={startDate}
            />
          </View>
          <Text style={[styles.inputLabel, styles.secondLabel]}>END DATE</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons color={colors.muted} name="calendar-outline" size={20} />
            <TextInput
              autoCapitalize="none"
              onChangeText={(value) => {
                setEndDate(value);
                setError('');
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9A9D95"
              style={styles.iconInput}
              value={endDate}
            />
          </View>
          <View style={styles.tip}>
            <Ionicons color={colors.ink} name="information-circle-outline" size={18} />
            <Text style={styles.tipText}>
              Simple date fields for now. Use the YYYY-MM-DD format.
            </Text>
          </View>
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>TARGET COMPLETED DAYS</Text>
          <TextInput
            autoFocus
            keyboardType="number-pad"
            onChangeText={(value) => {
              setSuccessTarget(value.replace(/[^0-9]/g, ''));
              setError('');
            }}
            placeholder="e.g. 24"
            placeholderTextColor="#9A9D95"
            style={[styles.input, styles.numberInput]}
            value={successTarget}
          />
          <Text style={styles.fieldHelp}>
            You do not need a perfect streak. Set the number of days that makes
            this goal meaningful.
          </Text>
        </View>
      );
    }

    if (step === 4) {
      return (
        <View style={styles.formGroup}>
          <Text style={styles.inputLabel}>DAILY REMINDER</Text>
          <View style={styles.inputWithIcon}>
            <Ionicons color={colors.muted} name="alarm-outline" size={20} />
            <TextInput
              autoFocus
              onChangeText={(value) => {
                setReminderTime(value);
                setError('');
              }}
              placeholder="9:00 AM"
              placeholderTextColor="#9A9D95"
              style={styles.iconInput}
              value={reminderTime}
            />
          </View>
          <Text style={styles.fieldHelp}>
            This is saved with your goal. Notifications are not enabled yet.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.visibilityList}>
        {visibilityOptions.map((option) => {
          const selected = visibility === option.label;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              key={option.label}
              onPress={() => {
                setVisibility(option.label);
                setError('');
              }}
              style={({ pressed }) => [
                styles.visibilityOption,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}
            >
              <View style={styles.visibilityIcon}>
                <Ionicons color={colors.ink} name={option.icon} size={21} />
              </View>
              <View style={styles.visibilityCopy}>
                <Text style={styles.visibilityTitle}>{option.label}</Text>
                <Text style={styles.visibilityDescription}>
                  {option.description}
                </Text>
              </View>
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioDot} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.topBar}>
          <Pressable
            accessibilityLabel={step === 0 ? 'Close goal creation' : 'Previous step'}
            hitSlop={10}
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons
              color={colors.ink}
              name={step === 0 ? 'close' : 'arrow-back'}
              size={22}
            />
          </Pressable>
          <Text style={styles.headerTitle}>Create Goal</Text>
          <Text style={styles.stepCount}>{step + 1}/6</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${((step + 1) / steps.length) * 100}%` },
            ]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.eyebrow}>{currentStep.eyebrow}</Text>
          <Text style={styles.title}>{currentStep.title}</Text>
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
          <View style={styles.stepContent}>{renderStep()}</View>
        </ScrollView>

        <View style={styles.footer}>
          {!canAddGoal ? (
            <Text style={styles.limitText}>
              You can have up to 3 active goals.
            </Text>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={!canAddGoal}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              !canAddGoal && styles.continueButtonDisabled,
              pressed && canAddGoal && styles.continueButtonPressed,
            ]}
          >
            <Text
              style={[
                styles.continueText,
                !canAddGoal && styles.continueTextDisabled,
              ]}
            >
              {step === steps.length - 1 ? 'Create Goal' : 'Continue'}
            </Text>
            <Ionicons
              color={canAddGoal ? colors.ink : colors.muted}
              name={step === steps.length - 1 ? 'checkmark' : 'arrow-forward'}
              size={20}
            />
          </Pressable>
        </View>
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
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 8,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: 21,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  stepCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    width: 42,
  },
  progressTrack: {
    backgroundColor: colors.line,
    height: 3,
    marginHorizontal: 18,
    marginTop: 17,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: colors.ink,
    height: '100%',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 32,
  },
  eyebrow: {
    color: colors.accentDark,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -1.2,
    marginTop: 9,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 320,
  },
  stepContent: {
    marginTop: 28,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryOption: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    minHeight: 100,
    justifyContent: 'center',
    position: 'relative',
    width: '31.3%',
  },
  optionSelected: {
    backgroundColor: colors.softGreen,
    borderColor: colors.ink,
    borderWidth: 1.5,
  },
  optionPressed: {
    opacity: 0.65,
  },
  categoryEmoji: {
    fontSize: 26,
  },
  categoryLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  selectedCheck: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 7,
    top: 7,
    width: 20,
  },
  formGroup: {
    width: '100%',
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginLeft: 3,
  },
  secondLabel: {
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 58,
    paddingHorizontal: 16,
  },
  numberInput: {
    fontSize: 24,
    fontWeight: '800',
  },
  characterCount: {
    color: colors.muted,
    fontSize: 11,
    marginRight: 4,
    marginTop: 8,
    textAlign: 'right',
  },
  inputWithIcon: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 58,
    paddingHorizontal: 15,
  },
  iconInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 12,
  },
  tip: {
    alignItems: 'center',
    backgroundColor: colors.softGreen,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 9,
    marginTop: 18,
    padding: 13,
  },
  tipText: {
    color: colors.ink,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldHelp: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    paddingHorizontal: 3,
  },
  visibilityList: {
    gap: 10,
  },
  visibilityOption: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.line,
    borderRadius: radii.medium,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 76,
    padding: 12,
  },
  visibilityIcon: {
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 14,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  visibilityCopy: {
    flex: 1,
    marginLeft: 12,
  },
  visibilityTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
  },
  visibilityDescription: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 4,
  },
  radio: {
    alignItems: 'center',
    borderColor: colors.line,
    borderRadius: 10,
    borderWidth: 1.5,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioSelected: {
    borderColor: colors.ink,
  },
  radioDot: {
    backgroundColor: colors.ink,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  footer: {
    backgroundColor: colors.background,
    borderTopColor: colors.line,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: radii.medium,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
  },
  continueButtonDisabled: {
    backgroundColor: colors.line,
  },
  continueButtonPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.99 }],
  },
  continueText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  continueTextDisabled: {
    color: colors.muted,
  },
  errorText: {
    color: '#A23A32',
    fontSize: 12,
    marginBottom: 9,
    textAlign: 'center',
  },
  limitText: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 9,
    textAlign: 'center',
  },
});
