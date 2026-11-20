
"use client";

import React, { useState, useEffect, useRef } from "react";

export function formatMoney(val: number): {
  numStr: string;
  unit: string;
  fullStr: string;
} {
  const abs = Math.abs(val);
  const divisor = abs >= 1_000_000 ? 1_000_000 : abs >= 1_000 ? 1_000 : 1;
  const unit = abs >= 1_000_000 ? "Tỉ" : abs >= 1_000 ? "Tr" : "K";

  const num = Math.round((abs / divisor) * 100) / 100;
  const numStr = num.toLocaleString(undefined, {
    minimumFractionDigits: num % 1 !== 0 ? 1 : 0,
    maximumFractionDigits: 2,
  });

  return {
    numStr,
    unit,
    fullStr: `${numStr} ${unit}`,
  };
}

export interface AnimatedProfitCellProps {
  value: number;
  suffix?: string;
  prefix?: string;
  showPlus?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  theme?: "profit" | "gold" | "blue" | "amber" | "volcano";
  className?: string;
  isNegativeMetric?: boolean;
}

function RollingDigit({
  digit,
  animate,
}: {
  digit: string;
  animate: boolean;
}) {
  const num = parseInt(digit, 10);

  if (isNaN(num)) {
    return <span className="inline-block align-middle">{digit}</span>;
  }

  return (
    <span className="inline-block overflow-hidden h-[1.25em] leading-[1.25em] align-middle text-center">
      <span
        className="inline-flex flex-col w-full"
        style={{
          transform: `translateY(-${num * 10}%)`,
          transition: animate
            ? "transform 1.3s cubic-bezier(0.2, 0.9, 0.3, 1)"
            : "none",
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span
            key={n}
            className="h-[1.25em] leading-[1.25em] block text-center"
          >
            {n}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function AnimatedProfitCell({
  value,
  suffix,
  prefix = "",
  showPlus = false,
  size = "sm",
  theme = "profit",
  className = "",
  isNegativeMetric = false,
}: AnimatedProfitCellProps) {
  const [changeInfo, setChangeInfo] = useState<{ delta: number } | null>(null);
  const [isReady, setIsReady] = useState(false);

  const prevValueRef = useRef<number>(value);
  const isInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true;
      prevValueRef.current = value;

      const t = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(t);
    }

    if (prevValueRef.current !== value) {
      const delta =
        Math.round((value - prevValueRef.current) * 100) / 100;

      prevValueRef.current = value;

      if (delta !== 0) {
        setChangeInfo({ delta });

        const timer = setTimeout(() => {
          setChangeInfo(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [value, isNegativeMetric]);

  const moneyInfo = formatMoney(value);
  const isPos = value >= 0;
  const numFormatted = moneyInfo.numStr;
  const displaySuffix = suffix !== undefined ? suffix : moneyInfo.unit;

  let sign = "";
  if (value < 0) {
    sign = "-";
  } else if (showPlus && value > 0) {
    sign = "+";
  }

  const sizeStyles = {
    xs: "text-xs",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  }[size];

  let themeColor = "";

  if (theme === "profit") {
    themeColor = isPos ? "text-emerald-700" : "text-rose-700";
  } else if (theme === "gold") {
    themeColor = "text-amber-700";
  } else if (theme === "blue") {
    themeColor = "text-blue-700";
  } else if (theme === "amber") {
    themeColor = "text-amber-700";
  } else if (theme === "volcano") {
    themeColor = isPos ? "text-orange-700" : "text-gray-600";
  }

  const renderRollingNumbers = (numStr: string) => {
    const digitsCount = (numStr.match(/\d/g) || []).length;
    let currentDigitRevIndex = digitsCount - 1;

    return Array.from(numStr).map((char, idx) => {
      const isDigit = /\d/.test(char);

      if (isDigit) {
        const key = `rev-d-${currentDigitRevIndex}`;
        currentDigitRevIndex--;

        return (
          <RollingDigit
            key={key}
            digit={char}
            animate={isReady}
          />
        );
      }

      return <span key={`char-${idx}`}>{char}</span>;
    });
  };

  const deltaMoney = changeInfo ? formatMoney(changeInfo.delta) : null;

  return (
    <div className="relative inline-flex items-center">
      <span
        className={`font-black font-mono tracking-tight transition-transform duration-300 inline-flex items-center ${sizeStyles} ${themeColor} ${changeInfo ? "scale-[1.04]" : "scale-100"
          } ${className}`}
      >
        {prefix}
        {sign}

        {renderRollingNumbers(numFormatted)}

        <span className="ml-1 inline-flex items-center self-center leading-none align-middle">
          {displaySuffix.trim()}
        </span>
      </span>

      {changeInfo && deltaMoney && (
        <span
          className={`absolute left-full top-1/2 -translate-y-1/2 ml-1.5 z-30 pointer-events-none whitespace-nowrap px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight leading-none shadow-sm animate-tag-badge ${changeInfo.delta > 0
              ? "bg-emerald-600 text-white"
              : "bg-rose-600 text-white"
            }`}
        >
          {changeInfo.delta > 0
            ? `+${deltaMoney.fullStr}`
            : `-${deltaMoney.fullStr}`}
        </span>
      )}
    </div>
  );
}
