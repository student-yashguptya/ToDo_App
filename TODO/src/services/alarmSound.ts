import { Audio } from 'expo-av'

export async function playAlarm() {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/sounds/alarm.mp3')
  )
  await sound.playAsync()
}
