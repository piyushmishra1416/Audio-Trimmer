import React, { useMemo, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { useWavesurfer } from '@wavesurfer/react'
import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js'


interface AudioPlayerProps {
  audioSrc: string;
}

const formatTime = (seconds: number) => [seconds / 60, seconds % 60].map((v) => `0${Math.floor(v)}`.slice(-2)).join(':')
const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { wavesurfer, isReady, isPlaying, currentTime } = useWavesurfer({
    container: containerRef,
    url: audioSrc,
    waveColor: 'purple',
    height: 100,
    plugins: useMemo(() => [Timeline.create()], []),
  })

  const onPlayPause = () => {
    wavesurfer && wavesurfer.playPause()
  }
  return (
    <div className=' mt-10 ' >
      <div ref={containerRef} />

<button onClick={onPlayPause}>
  {isPlaying ? 'Pause' : 'Play'}
</button>
    </div>
  );
};

export default AudioPlayer;
