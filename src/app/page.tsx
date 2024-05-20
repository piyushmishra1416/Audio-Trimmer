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
    <div className='flex flex-col h-screen bg-black text-white  justify-center px-6 '>
      <h1 className=' font-bold text-5xl md:text-6xl mx-auto  mb-4 '>Audio Trimmer</h1>
      <FileUpload onFileSelect={handleFileSelect} />
      {audioSrc && <AudioPlayer audioSrc={audioSrc}   />}
      {selectedFile && <AudioTrimmer audioFile={selectedFile} />}
    </div>
  );
};

export default HomePage;
