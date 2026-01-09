import { Audio } from 'expo-av'

let currentSound: Audio.Sound | null = null

export async function playAlarm() {
  try {
    // Stop any existing sound
    if (currentSound) {
      await currentSound.stopAsync()
      await currentSound.unloadAsync()
      currentSound = null
    }

    // Safe audio mode (works across expo-av versions)
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    })

    const { sound } = await Audio.Sound.createAsync(
      require('../../assets/sounds/alarm.mp3'),
      { shouldPlay: true }
    )

    currentSound = sound

    sound.setOnPlaybackStatusUpdate(status => {
      if (
        status.isLoaded &&
        status.didJustFinish
      ) {
        sound.unloadAsync()
        if (currentSound === sound) {
          currentSound = null
        }
      }
    })
  } catch (e) {
    console.warn('Alarm playback failed', e)
  }
}
