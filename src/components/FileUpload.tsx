// src/components/FileUpload.tsx

import React, { useState, useRef } from 'react';
import type { CSSProperties } from 'react'; // <-- Use 'import type' for types

// Define the component's props interface
interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
}

// The SVG icon component
const UploadIcon = () => (
  <svg
    width="50"
    height="50"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginBottom: '16px', color: '#909090' }}
  >
    <path
      d="M7 10L12 5L17 10M12 5V19"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 15C4 16.0573 4 16.586 4.21799 17.013C4.40973 17.3854 4.71458 17.6903 5.08701 17.882C5.51396 18.1 6.04269 18.1 7.1 18.1H16.9C17.9573 18.1 18.486 18.1 18.913 17.882C19.2854 17.6903 19.5903 17.3854 19.782 17.013C20 16.586 20 16.0573 20 15"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);


export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Necessary to allow drop
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleContainerClick = () => {
    fileInputRef.current?.click();
  };

  // Base styles for the container
  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    border: '2px dashed #4A5568', // Dashed border
    borderRadius: '8px',
    backgroundColor: '#2D3748', // Dark background
    color: '#A0AEC0', // Light text
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'border-color 0.3s ease, background-color 0.3s ease',
  };
  
  // Styles when a file is being dragged over
  const draggingStyle: CSSProperties = {
    borderColor: '#4299E1', // Highlight color
    backgroundColor: '#374151',
  };

  return (
    <div
      style={isDragging ? { ...containerStyle, ...draggingStyle } : containerStyle}
      onClick={handleContainerClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept={accept}
      />

      {/* Visible content */}
      <UploadIcon />
      <p style={{ margin: 0, fontWeight: 'bold' }}>
        Click to upload or drag and drop
      </p>
      <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>
        PDF File (MAX. 10MB)
      </p>
    </div>
  );
};