// src/lib/sound-service.ts

class SoundService {
  private audioContext: AudioContext | null = null
  private isEnabled = true

  constructor() {
    // Check if sound is enabled from localStorage
    const savedSettings = localStorage.getItem('notification-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      this.isEnabled = settings.sound !== false
    }
  }

  private async getAudioContext(): Promise<AudioContext | null> {
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      } catch (error) {
        console.warn('AudioContext not supported:', error)
        return null
      }
    }
    return this.audioContext
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.isEnabled) return

    this.getAudioContext().then(audioContext => {
      if (!audioContext) return

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = type

      // Envelope for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    })
  }

  playMessageSent(): void {
    // High-pitched, short sound for sent messages
    this.createTone(800, 0.1, 'sine')
  }

  playMessageReceived(): void {
    // Lower-pitched, slightly longer sound for received messages
    this.createTone(600, 0.15, 'sine')
  }

  playNotification(): void {
    // Two-tone notification sound
    this.createTone(500, 0.1, 'sine')
    setTimeout(() => {
      this.createTone(700, 0.1, 'sine')
    }, 100)
  }

  playError(): void {
    // Low, harsh sound for errors
    this.createTone(300, 0.3, 'sawtooth')
  }

  playSuccess(): void {
    // Pleasant ascending tone for success
    this.createTone(400, 0.1, 'sine')
    setTimeout(() => {
      this.createTone(600, 0.1, 'sine')
    }, 50)
    setTimeout(() => {
      this.createTone(800, 0.1, 'sine')
    }, 100)
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  isSoundEnabled(): boolean {
    return this.isEnabled
  }
}

// Export singleton instance
export const soundService = new SoundService()
export default soundService
