import React from 'react';

const HangmanNotificationIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width="36"
    height="36"
    {...props} 
  >
    {/* Arka Plan */}
    <rect width="64" height="64" rx="12" fill="#E3F2FD" /> {/* Daha yumuşak, modern bir arka plan */}

    {/* Darağacı */}
    <line
      x1="12"
      y1="54"
      x2="12"
      y2="10"
      stroke="#1565C0" // Koyu mavi tonu
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <line
      x1="10"
      y1="10"
      x2="32"
      y2="10"
      stroke="#1565C0"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    <line
      x1="12"
      y1="18" 
      x2="20"
      y2="10"
      stroke="#1565C0"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="10"
      x2="30"
      y2="18"
      stroke="#42A5F5" 
      strokeWidth="3"
      strokeLinecap="round"
    />

    {/* Adam (Soyut) */}
    <circle cx="30" cy="23" r="5" fill="none" stroke="#FF7043" strokeWidth="2.5" /> {/* Turuncu kafa - dikkat çekici */}
    <line
      x1="30"
      y1="28"
      x2="30"
      y2="38"
      stroke="#FF7043"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Kollar ve bacaklar daha basit */}
    <line
      x1="30"
      y1="32"
      x2="25"
      y2="36"
      stroke="#FF7043"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="32"
      x2="35"
      y2="36"
      stroke="#FF7043"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="38"
      x2="26"
      y2="45"
      stroke="#FF7043"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="30"
      y1="38"
      x2="34"
      y2="45"
      stroke="#FF7043"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Kelime Alanı / Bildirim İması */}
    <rect x="40" y="48" width="7" height="7" rx="2" fill="#BBDEFB" />
    <rect x="49" y="48" width="7" height="7" rx="2" fill="#FFAB91" /> {/* Vurgulanan kutu - "sıra sende" iması */}
    <rect x="58" y="48" width="7" height="7" rx="2" fill="#BBDEFB" />

    {/*Küçük bir ünlem veya konuşma balonu */}
     <path
      d="M52 30 Q 52 26, 55 26 Q 58 26, 58 30 Q 58 34, 55 34 Q 52 34, 52 30 M 55 35 L 55 38" // Ünlem balonu
      fill="#1E88E5"
      stroke="#FFF"
      strokeWidth="0.5"
    />
    <circle cx="55" cy="28" r="1" fill="#FFF" />
    <line x1="55" y1="30" x2="55" y2="32" stroke="#FFF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default HangmanNotificationIcon;