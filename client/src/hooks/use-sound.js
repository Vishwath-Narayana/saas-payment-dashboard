import { useCallback } from 'react';
import { playSound } from '@/lib/sound-engine';

/**
 * Hook to play sounds using the sound engine
 * @param {Object} sound - The sound object containing dataUri
 * @param {Object} options - Playback options (volume, playbackRate)
 * @returns [playFunction]
 */
export function useSound(sound, options = {}) {
  const play = useCallback(() => {
    if (!sound?.dataUri) return;
    playSound(sound.dataUri, options);
  }, [sound, options]);

  return [play];
}
