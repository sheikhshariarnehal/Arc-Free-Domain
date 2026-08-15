import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function VercelIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 1L24 22H0L12 1Z" />
    </svg>
  );
}

export function GitHubIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export function DockerIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185zm0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.186.185.186zm-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm-2.954 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.145a.185.185 0 00-.185.185v1.887c0 .102.083.186.185.186zm5.884 2.714h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.186v1.887c0 .102.082.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.954 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.185-.186H5.145a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zm-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.185.186v1.887c0 .102.083.185.185.185zM23.79 12.3c-.45-.487-1.39-.638-2.29-.44-.24-1.348-1.2-2.38-2.43-2.52-.08-.01-.16-.01-.24 0-.15-.75-.68-1.35-1.42-1.61-.13-.05-.27-.07-.41-.07-.37 0-.72.15-.99.41-.03-.02-.06-.04-.09-.06-.6-.35-1.35-.38-2.02-.1-.08-.6-.4-1.12-.9-1.43-.51-.31-1.14-.38-1.74-.2-.14-.07-.29-.12-.45-.16a2.9 2.9 0 00-.63-.07c-.98 0-1.87.5-2.37 1.31-.08.13-.15.27-.21.41-.33.02-.65.12-.94.28-.44.24-.78.62-.97 1.08-.03.07-.06.14-.08.21-.36.08-.69.25-.96.5-.47.43-.72 1.05-.68 1.68v.17c-1.37.11-2.52.88-3.08 2.06-.5 1.06-.41 2.31.24 3.29 1.57 2.37 4.19 3.73 7.02 3.73 4.41 0 8.35-3.32 9.25-7.79.85-.02 1.65-.4 2.22-1.02.66-.72.76-1.72.29-2.64z" />
    </svg>
  );
}

export function RailwayIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M1.5 8.25C1.5 5.62665 3.62665 3.5 6.25 3.5H17.75C20.3734 3.5 22.5 5.62665 22.5 8.25V15.75C22.5 18.3734 20.3734 20.5 17.75 20.5H6.25C3.62665 20.5 1.5 18.3734 1.5 15.75V8.25ZM6.25 5C4.45507 5 3 6.45507 3 8.25V12H21V8.25C21 6.45507 19.5449 5 17.75 5H6.25ZM21 13.5H3V15.75C3 17.5449 4.45507 19 6.25 19H17.75C19.5449 19 21 17.5449 21 15.75V13.5ZM6.75 15C6.33579 15 6 15.3358 6 15.75C6 16.1642 6.33579 16.5 6.75 16.5H8.25C8.66421 16.5 9 16.1642 9 15.75C9 15.3358 8.66421 15 8.25 15H6.75ZM15.75 15C15.3358 15 15 15.3358 15 15.75C15 16.1642 15.3358 16.5 15.75 16.5H17.25C17.6642 16.5 18 16.1642 18 15.75C18 15.3358 17.6642 15 17.25 15H15.75Z" />
    </svg>
  );
}

export function CloudflareIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M16.5 7.5c-.24 0-.47.02-.7.06A6.5 6.5 0 003.5 13.5c0 .35.03.7.08 1.04A4.5 4.5 0 007.5 19h9a5 5 0 005-5c0-2.76-2.24-5-5-5-.34 0-.67.04-1 .1A4.5 4.5 0 0016.5 7.5z" />
    </svg>
  );
}

export function NextjsIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.6 13.8L9.2 7.6h1.6l5.2 6.8v1.4h-0.4zm-4.8 0H9.2V7.6h1.6v8.2z" />
    </svg>
  );
}

export function AstroIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function RemixIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M4 4h7a4 4 0 0 1 4 4v0a4 4 0 0 1-4 4H4z" />
      <path d="M4 12h8l4 8" />
      <path d="M4 4v16" />
    </svg>
  );
}

export function ViteIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M21.5 3.5L12.5 22.5L2.5 3.5h7l2.5 6 2.5-6h7z" />
    </svg>
  );
}

export function NodejsIcon({ size = 14, className = "", ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2l9 5.2v10.4L12 23l-9-5.4V7.2L12 2z" />
      <path d="M12 12v11" />
      <path d="M12 12L3 7.2" />
      <path d="M12 12l9-4.8" />
    </svg>
  );
}
