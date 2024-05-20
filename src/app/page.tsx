'use client';

import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import AudioPlayer from '@/components/AudioPlayer';
import AudioTrimmer from '@/components/AudioTrimmer';

const HomePage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAudioSrc(URL.createObjectURL(file));
  };

  return (
    <div>
      <h1>Audio Trimmer</h1>
      <FileUpload onFileSelect={handleFileSelect} />
      {audioSrc && <AudioPlayer audioSrc={audioSrc} />}
      {selectedFile && <AudioTrimmer audioFile={selectedFile} />}
    </div>
  );
};

export default HomePage;
