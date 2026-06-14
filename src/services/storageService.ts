import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';

import { storage } from './firebase';

function getCheckInPhotoPath(userId: string, checkInId: string) {
  return `checkIns/${userId}/${checkInId}.jpg`;
}

export async function uploadCheckInPhoto(
  userId: string,
  checkInId: string,
  localUri: string
): Promise<string> {
  try {
    const response = await fetch(localUri);

    if (!response.ok) {
      throw new Error('The captured photo could not be read.');
    }

    const photoBlob = await response.blob();
    const photoReference = ref(
      storage,
      getCheckInPhotoPath(userId, checkInId)
    );

    await uploadBytes(photoReference, photoBlob, {
      contentType: 'image/jpeg',
    });

    return getDownloadURL(photoReference);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('storage/unauthorized')) {
        throw new Error(
          'Photo upload was denied. Check your Firebase Storage rules.'
        );
      }

      if (
        error.message.includes('storage/retry-limit-exceeded') ||
        error.message.includes('Network request failed')
      ) {
        throw new Error(
          'Photo upload failed because of a network problem. Please try again.'
        );
      }

      if (error.message.includes('captured photo could not be read')) {
        throw error;
      }
    }

    throw new Error('Photo upload failed. Please try again.');
  }
}

export async function deleteCheckInPhoto(
  userId: string,
  checkInId: string
): Promise<void> {
  try {
    await deleteObject(
      ref(storage, getCheckInPhotoPath(userId, checkInId))
    );
  } catch {
    // A failed cleanup must not hide the original check-in error.
  }
}
