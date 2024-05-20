import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';

interface AudioTrimmerProps {
  audioFile: File;
}

const AudioTrimmer: React.FC<AudioTrimmerProps> = ({ audioFile }) => {
  const [audioContext] = useState(new AudioContext());
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);

  useEffect(() => {
    const loadAudioFile = async () => {
      const arrayBuffer = await audioFile.arrayBuffer();
      const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
      setAudioBuffer(decodedAudio);
      setEndTime(decodedAudio.duration);
    };

    loadAudioFile();
  }, [audioFile, audioContext]);

  const handleTrim = async () => {
    if (!audioBuffer) return;

    const sampleRate = audioBuffer.sampleRate;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const trimmedLength = endSample - startSample;

    const trimmedBuffer = audioContext.createBuffer(
      audioBuffer.numberOfChannels,
      trimmedLength,
      sampleRate
    );

    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      const trimmedChannelData = trimmedBuffer.getChannelData(channel);
      for (let i = 0; i < trimmedLength; i++) {
        trimmedChannelData[i] = channelData[startSample + i];
      }
    }

    const wavBlob = createWavBlob(trimmedBuffer);
    saveAs(wavBlob, `trimmed-${audioFile.name}.wav`);
  };

  const createWavBlob = (buffer: AudioBuffer) => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2 + 44;
    const bufferArray = new ArrayBuffer(length);
    const view = new DataView(bufferArray);

    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    const interleave = (buffer: AudioBuffer) => {
      const channels = [];
      for (let i = 0; i < buffer.numberOfChannels; i++) {
        channels.push(buffer.getChannelData(i));
      }

      const length = buffer.length * buffer.numberOfChannels;
      const result = new Float32Array(length);

      for (let i = 0; i < buffer.length; i++) {
        for (let j = 0; j < buffer.numberOfChannels; j++) {
          result[i * buffer.numberOfChannels + j] = channels[j][i];
        }
      }
      return result;
    };

    const samples = interleave(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* file length */
    view.setUint32(4, 32 + buffer.length * numOfChan * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, numOfChan, true);
    /* sample rate */
    view.setUint32(24, buffer.sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, buffer.sampleRate * numOfChan * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numOfChan * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  return (
    <div className='mx-auto'>
      <div className=' text-xl font-semibold mb-4'>
        <label>Start Time (seconds): </label>
        <input
          type="number"
          className='text-black'
          value={startTime}
          min="0"
          step="0.01"
          onChange={(e) => setStartTime(Number(e.target.value))}
        />
      </div>
      <div className=' text-xl font-semibold'>
        <label>End Time (seconds): </label>
        <input
          type="number"
          className=' text-black'
          value={endTime}
          max={audioBuffer?.duration || 0}
          step="0.01"
          onChange={(e) => setEndTime(Number(e.target.value))}
        />
      </div>
      <button
  onClick={handleTrim}
  disabled={!audioBuffer}
  className={`bg-gradient-to-r from-gray-800 to-gray-900 mt-4 text-white px-4 py-2 rounded-md ${audioBuffer ? 'hover:from-gray-900 hover:to-black' : 'opacity-50 cursor-not-allowed'}`}
>
  Trim Audio
</button>




    </div>
  );
};

export default AudioTrimmer;
