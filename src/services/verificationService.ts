import { CheckInResult } from '../types/checkIn';
import { GoalCategory } from '../types/goal';

export type VerificationResult = {
  aiConfidence: number;
  aiResult: CheckInResult;
  aiFeedback: string;
};

type OpenAIVerificationPayload = {
  confidence: number;
  feedback: string;
};

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_VISION_MODEL =
  process.env.EXPO_PUBLIC_OPENAI_VISION_MODEL || 'gpt-5.5';

const categoryEvidence: Record<GoalCategory, string> = {
  Exercise:
    'gym equipment, treadmill, weights, workout environment, sports gear, or visible exercise activity',
  Study:
    'books, notes, laptop, flashcards, worksheets, learning materials, or a study desk',
  Reading: 'a physical book, open book, e-reader, reading notes, or reading setup',
  Diet: 'a healthy meal, food preparation, groceries, meal prep containers, or nutrition-focused food',
  Meditation:
    'a calm meditation setup, mat, cushion, quiet space, timer, breathing practice, or mindfulness setting',
  Spiritual:
    'scripture, prayer journal, devotional notes, church-related study materials, or spiritual practice setup',
  Hobby:
    'materials, tools, instruments, supplies, or an environment clearly related to the hobby goal',
  Work: 'a desk, computer, notebook, documents, work tools, or focused work environment',
  Other:
    'clear visual evidence that reasonably matches the selected goal title',
};

function getResultFromConfidence(confidence: number): CheckInResult {
  if (confidence >= 70) {
    return 'approved';
  }

  if (confidence >= 40) {
    return 'warning';
  }

  return 'rejected';
}

function getOutputText(response: unknown) {
  if (
    response &&
    typeof response === 'object' &&
    'output_text' in response &&
    typeof response.output_text === 'string'
  ) {
    return response.output_text;
  }

  const output = (response as { output?: unknown[] })?.output;
  const textParts = output
    ?.flatMap((item) => (item as { content?: unknown[] }).content ?? [])
    .map((content) => (content as { text?: unknown }).text)
    .filter((text): text is string => typeof text === 'string');

  return textParts?.join('\n') ?? '';
}

function parseVerificationResponse(response: unknown): VerificationResult {
  const outputText = getOutputText(response);

  if (!outputText) {
    throw new Error('OpenAI did not return a verification result.');
  }

  const parsed = JSON.parse(outputText) as OpenAIVerificationPayload;
  const aiConfidence = Math.max(
    0,
    Math.min(100, Math.round(Number(parsed.confidence)))
  );

  if (!Number.isFinite(aiConfidence)) {
    throw new Error('OpenAI returned an invalid confidence score.');
  }

  return {
    aiConfidence,
    aiResult: getResultFromConfidence(aiConfidence),
    aiFeedback:
      parsed.feedback ||
      'The photo was reviewed, but no detailed feedback was provided.',
  };
}

function getPrompt(goalCategory: GoalCategory, goalTitle: string) {
  return [
    'You verify DailyProof check-in photos.',
    'Judge whether the image provides visual evidence that the user worked on the selected goal.',
    'Be fair but not overly strict. Do not approve unrelated selfies, blank images, unrelated rooms, or generic photos without evidence.',
    '',
    `Goal category: ${goalCategory}`,
    `Goal title: ${goalTitle}`,
    `Expected evidence for this category: ${categoryEvidence[goalCategory]}`,
    '',
    'Return a confidence number from 0 to 100.',
    '70 or higher means the image clearly supports the goal.',
    '40 to 69 means the image is somewhat related but ambiguous.',
    '39 or lower means the image does not support the goal.',
    'Keep feedback short and user-facing.',
  ].join('\n');
}

export async function verifyCheckInPhoto(
  photoUrl: string,
  goalCategory: GoalCategory,
  goalTitle: string
): Promise<VerificationResult> {
  if (!photoUrl) {
    throw new Error('The proof photo is missing. Please retake the photo.');
  }

  if (!OPENAI_API_KEY) {
    throw new Error(
      'OpenAI verification is not configured. Add EXPO_PUBLIC_OPENAI_API_KEY to your environment.'
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_VISION_MODEL,
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: getPrompt(goalCategory, goalTitle),
              },
              {
                type: 'input_image',
                image_url: photoUrl,
              },
            ],
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'dailyproof_check_in_verification',
            strict: true,
            schema: {
              type: 'object',
              additionalProperties: false,
              properties: {
                confidence: {
                  type: 'number',
                  minimum: 0,
                  maximum: 100,
                },
                feedback: {
                  type: 'string',
                },
              },
              required: ['confidence', 'feedback'],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `OpenAI request failed: ${response.status}`);
    }

    return parseVerificationResponse(await response.json());
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message.includes('OpenAI verification is not configured') ||
        error.message.includes('OpenAI did not return') ||
        error.message.includes('invalid confidence')
      ) {
        throw error;
      }

      if (
        error.message.includes('401') ||
        error.message.includes('invalid_api_key')
      ) {
        throw new Error('OpenAI verification failed. Check your API key.');
      }

      if (
        error.message.includes('model') ||
        error.message.includes('not found')
      ) {
        throw new Error(
          'OpenAI verification failed. Check the configured vision model.'
        );
      }
    }

    console.error('[verificationService] OpenAI verification failed.', error);
    throw new Error(
      'OpenAI verification could not be completed. Please retry or retake the photo.'
    );
  }
}
