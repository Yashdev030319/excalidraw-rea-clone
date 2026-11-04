import './globals.css';

export const metadata = {
  title: 'Whiteboard Lab - Excalidraw Reconstruction',
  description: 'A responsive whiteboard application inspired by Excalidraw, built with Next.js App Router and Node.js Express.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

