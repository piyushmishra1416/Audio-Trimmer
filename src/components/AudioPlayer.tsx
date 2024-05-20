import React from 'react';
import ReactAudioPlayer from 'react-audio-player';

interface AudioPlayerProps {
  audioSrc: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioSrc }) => {
  return (
    <div>
      <ReactAudioPlayer src={audioSrc} controls />
    </div>
  );
};

export default AudioPlayer;
