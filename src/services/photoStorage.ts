import * as FileSystem from 'expo-file-system/legacy';

export async function persistCheckInPhoto(photoUri: string) {
  if (!FileSystem.documentDirectory) {
    return photoUri;
  }

  const extensionMatch = photoUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const extension = extensionMatch?.[1] ?? 'jpg';
  const storedUri =
    `${FileSystem.documentDirectory}check-in-${Date.now()}.` + extension;

  try {
    await FileSystem.copyAsync({
      from: photoUri,
      to: storedUri,
    });
    return storedUri;
  } catch {
    return photoUri;
  }
}
