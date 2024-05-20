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

    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      trimmedLength,
      sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;

    source.connect(offlineContext.destination);
    source.start(0, startTime, endTime - startTime);

    const renderedBuffer = await offlineContext.startRendering();

    const wavBlob = createWavBlob(renderedBuffer);
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
    view.setUint32(28, buffer.sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, numOfChan * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, buffer.length * numOfChan * 2, true);

    const offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const chanData = buffer.getChannelData(i);
      for (let j = 0; j < chanData.length; j++) {
        const sample = Math.max(-1, Math.min(1, chanData[j]));
        view.setInt16(offset + (j * 2), sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  return (
    <div>
      <div>
        <label>Start Time (seconds): </label>
        <input type="number" value={startTime} min="0" step="0.01" onChange={(e) => setStartTime(Number(e.target.value))} />
      </div>
      <div>
        <label>End Time (seconds): </label>
        <input type="number" value={endTime} max={audioBuffer?.duration || 0} step="0.01" onChange={(e) => setEndTime(Number(e.target.value))} />
      </div>
      <button onClick={handleTrim} disabled={!audioBuffer}>Trim Audio</button>
    </div>
  );
};

export default AudioTrimmer;
