"use client";

import React from "react";

interface VividFireIconProps {
  size?: "xs" | "sm" | "md" | "lg" | number;
  className?: string;
  showSparks?: boolean;
}

export default function VividFireIcon({
  size = "md",
  className = "",
  showSparks = true,
}: VividFireIconProps) {
  // Determine pixel dimension
  let dim = 20;
  if (typeof size === "number") {
    dim = size;
  } else {
    switch (size) {
      case "xs":
        dim = 15;
        break;
      case "sm":
        dim = 18;
        break;
      case "lg":
        dim = 26;
        break;
      case "md":
      default:
        dim = 21;
        break;
    }
  }

  // Generate unique IDs for gradients so multiple instances don't collide
  const idPrefix = React.useId().replace(/:/g, "_");

  return (
    <span
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{
        width: dim,
        height: dim,
        overflow: "visible",
      }}
    >
      {/* Rising Embers / Sparks (Tàn lửa bốc lên trên) */}
      {showSparks && (
        <>
          {/* Spark 1 - drifting left */}
          <span
            className="absolute pointer-events-none rounded-full animate-ember-1"
            style={{
              width: 3,
              height: 3,
              bottom: "55%",
              left: "25%",
              background: "radial-gradient(circle, #fff 10%, #fbbf24 60%, #ea580c 100%)",
              boxShadow: "0 0 5px #f97316, 0 0 8px #f59e0b",
              zIndex: 3,
            }}
          />
          {/* Spark 2 - shooting high in center */}
          <span
            className="absolute pointer-events-none rounded-full animate-ember-2"
            style={{
              width: 3.5,
              height: 3.5,
              bottom: "60%",
              left: "48%",
              background: "radial-gradient(circle, #ffffff 20%, #fde047 60%, #ea580c 100%)",
              boxShadow: "0 0 6px #fbbf24, 0 0 10px #f97316",
              zIndex: 3,
            }}
          />
          {/* Spark 3 - drifting right */}
          <span
            className="absolute pointer-events-none rounded-full animate-ember-3"
            style={{
              width: 2.8,
              height: 2.8,
              bottom: "50%",
              right: "22%",
              background: "radial-gradient(circle, #ffffff 10%, #fb923c 60%, #e11d48 100%)",
              boxShadow: "0 0 4px #fb923c, 0 0 7px #ea580c",
              zIndex: 3,
            }}
          />
          {/* Spark 4 - fast rising ember */}
          <span
            className="absolute pointer-events-none rounded-full animate-ember-4"
            style={{
              width: 2.2,
              height: 2.2,
              bottom: "65%",
              left: "35%",
              background: "radial-gradient(circle, #ffffff 20%, #fef08a 70%, #f97316 100%)",
              boxShadow: "0 0 4px #fef08a",
              zIndex: 3,
            }}
          />
        </>
      )}

      {/* Flame Tongue rising up (Lưỡi lửa bốc lên trên) */}
      <svg
        viewBox="0 0 24 24"
        className="absolute pointer-events-none animate-flame-tongue"
        style={{
          width: dim * 0.75,
          height: dim * 0.75,
          bottom: "35%",
          left: "12%",
          zIndex: 1,
        }}
        fill="none"
      >
        <path
          d="M12 2C10.5 5 9 7.5 9.5 10c.5 2.5 2.5 3.5 2.5 6 0 1-.5 2-1 2.5 2-.5 4-2.5 4-5.5 0-3.5-2.5-6-3-11z"
          fill={`url(#${idPrefix}-tongue)`}
        />
        <defs>
          <linearGradient id={`${idPrefix}-tongue`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#fde047" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main Dancing Flame (Thân ngọn lửa nhảy múa sinh động) */}
      <svg
        viewBox="64 64 896 896"
        className="animate-flame-dance"
        style={{
          width: dim,
          height: dim,
          zIndex: 2,
        }}
        fill="none"
      >
        <defs>
          {/* Outer Flame Gradient */}
          <linearGradient id={`${idPrefix}-outer`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#be123c" />
            <stop offset="30%" stopColor="#e11d48" />
            <stop offset="65%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>

          {/* Inner Flame Gradient */}
          <linearGradient id={`${idPrefix}-inner`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="45%" stopColor="#fbbf24" />
            <stop offset="85%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Flame Shape */}
        <path
          d="M834.1 469.2A347.49 347.49 0 00751.2 354l-29.1-26.7a8.09 8.09 0 00-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 01-47.5 46.1 352.6 352.6 0 00-100.3 121.5A347.75 347.75 0 00160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0075.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 00760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0027.7-136c0-48.8-10-96.2-29.9-140.9z"
          fill={`url(#${idPrefix}-outer)`}
        />

        {/* Inner Heart of the Flame (Lõi lửa rực sáng bên trong) */}
        <path
          className="animate-inner-flame"
          d="M737 438.6c-9.6 15.5-21.1 30.7-34.4 45.6a73.1 73.1 0 01-51 24.4 73.36 73.36 0 01-53.4-18.8 74.01 74.01 0 01-24.4-59.8c3-47.4-12.4-103.1-45.8-165.7-16.9-31.4-37.1-58.2-61.2-80.4a240 240 0 01-12.1 46.5 354.26 354.26 0 01-58.2 101 349.6 349.6 0 01-58.6 56.8c-34 26.1-62 60-80.8 97.9a275.96 275.96 0 00-29.1 124c0 74.9 29.5 145.3 83 198.4 53.7 53.2 125 82.4 201 82.4s147.3-29.2 201-82.4c53.5-53 83-123.5 83-198.4 0-39.2-8.1-77.3-24-113.1-9.3-21-21-40.5-35-58.4z"
          fill={`url(#${idPrefix}-inner)`}
        />
      </svg>
    </span>
  );
}

