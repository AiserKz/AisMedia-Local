// frontend/src/Components/avatar.tsx

import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  className: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
    />
  );
};

export default Avatar;