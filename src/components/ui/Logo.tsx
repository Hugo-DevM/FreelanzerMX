"use client";

import React from "react";
import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({
  className = "",
  width = 120,
  height = 40,
}) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Image
        src="/images/1.svg"
        alt="Freelanzer Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );
};

export default Logo;
