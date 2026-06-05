import { ImageResponse } from 'next/og';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

// Apple icon generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '40px',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
            fill="white"
          />
          <path
            d="M9 11C9.55228 11 10 10.5523 10 10C10 9.44772 9.55228 9 9 9C8.44772 9 8 9.44772 8 10C8 10.5523 8.44772 11 9 11Z"
            fill="white"
          />
          <path
            d="M15 11C15.5523 11 16 10.5523 16 10C16 9.44772 15.5523 9 15 9C14.4477 9 14 9.44772 14 10C14 10.5523 14.4477 11 15 11Z"
            fill="white"
          />
          <path
            d="M12 18C14.21 18 16.1 16.67 17 14.75C16.32 15.55 15.22 16.05 14 16.05H10C8.78 16.05 7.68 15.55 7 14.75C7.9 16.67 9.79 18 12 18Z"
            fill="white"
          />
          <path
            d="M8 8C8 7.45 8.45 7 9 7H11V5H9C7.34 5 6 6.34 6 8V9H8V8Z"
            fill="white"
          />
          <path
            d="M16 8C16 7.45 15.55 7 15 7H13V5H15C16.66 5 18 6.34 18 8V9H16V8Z"
            fill="white"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
