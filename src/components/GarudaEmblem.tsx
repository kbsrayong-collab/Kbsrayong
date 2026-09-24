import React from 'react';

interface GarudaEmblemProps {
  className?: string;
  size?: number;
}

/**
 * Official Royal Thai Government Garuda Emblem (ตราครุฑราชการไทย)
 * Used on official government memorandum ("บันทึกข้อความ")
 */
export const GarudaEmblem: React.FC<GarudaEmblemProps> = ({ className = '', size = 64 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ตราครุฑราชการไทย"
    >
      {/* Authentic Stylized Thai Government Garuda Silhouette */}
      <g fillRule="evenodd" clipRule="evenodd">
        {/* Crown / Chada */}
        <path d="M50 3 L52 14 L56 18 L50 20 L44 18 L48 14 Z" />
        <path d="M50 1 L51 8 L49 8 Z" />
        
        {/* Head and Beak */}
        <circle cx="50" cy="22" r="4.5" />
        <path d="M50 24 L52 27 L48 27 Z" />
        <path d="M47 21 C45 20 44 23 46 25 Z" />
        <path d="M53 21 C55 20 56 23 54 25 Z" />

        {/* Torso & Chest Armor */}
        <path d="M45 26 C45 26 42 32 44 38 C46 44 50 48 50 48 C50 48 54 44 56 38 C58 32 55 26 55 26 Z" />
        <path d="M47 30 L53 30 L50 36 Z" />
        
        {/* Powerful Wings - Left */}
        <path d="M44 28 C36 24 24 22 12 28 C8 30 6 34 8 36 C13 36 21 34 26 36 C18 39 10 43 9 48 C14 47 22 44 27 47 C20 51 13 58 14 63 C18 61 24 56 30 57 C24 63 19 71 23 75 C27 72 32 65 37 64 C33 71 31 78 36 80 C39 77 41 70 44 65 C44 57 43 45 44 38 Z" />

        {/* Powerful Wings - Right */}
        <path d="M56 28 C64 24 76 22 88 28 C92 30 94 34 92 36 C87 36 79 34 74 36 C82 39 90 43 91 48 C86 47 78 44 73 47 C80 51 87 58 86 63 C82 61 76 56 70 57 C76 63 81 71 77 75 C73 72 68 65 63 64 C67 71 69 78 64 80 C61 77 59 70 56 65 C56 57 57 45 56 38 Z" />

        {/* Lower Body & Tail (Hang Nok) */}
        <path d="M45 47 L50 60 L55 47 Z" />
        <path d="M48 60 L50 78 L52 60 Z" />
        <path d="M46 62 L42 75 L47 70 Z" />
        <path d="M54 62 L58 75 L53 70 Z" />

        {/* Powerful Legs and Talons */}
        <path d="M43 48 C41 54 38 60 34 66 C32 70 30 76 34 78 C37 77 40 71 42 66 L44 55 Z" />
        <path d="M57 48 C59 54 62 60 66 66 C68 70 70 76 66 78 C63 77 60 71 58 66 L56 55 Z" />
        
        {/* Base / Tail Fluff */}
        <path d="M50 78 L47 90 L50 93 L53 90 Z" />
        <path d="M47 85 L42 94 L46 91 Z" />
        <path d="M53 85 L58 94 L54 91 Z" />
      </g>
    </svg>
  );
};
