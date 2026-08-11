import React from "react";
import { type CatSkinId, getSkin } from "../Cat/catSkins";
import { useStore } from "@/lib/store";

interface CatPawProps extends React.SVGProps<SVGSVGElement> {
  skinId?: CatSkinId;
}

export default function CatPaw({ skinId, className = "", ...props }: CatPawProps) {
  const storeSkinId = useStore((s) => s.catSkin);
  const actualSkinId = skinId ?? (storeSkinId as CatSkinId);
  
  let fill = "#B2ACA3"; // tabby default
  let stroke = "#524A47";

  if (actualSkinId === "hitam") fill = "#595751";
  else if (actualSkinId === "oren") fill = "#EABC7A";
  else if (actualSkinId === "putih") fill = "#E3DDCF";

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 5000"
      className={className}
      {...props}
    >
      <g>
        <path
          fill={fill}
          stroke={stroke}
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          d="M423.2,5000 L423.2,2084.1
            c0,0-5.8-1569.5-23.3-1631.7c-17.4-62.2-44.8-204,59.7-231.3c0,0,39.8-74.6,119.4-37.3
            c0,0,109.4-9.9,102,84.6c0,0,62.2,29.8,22.4,129.3c0,0-36.4,1544.7,13.3,1686.4
            L716.7,5000"
        />
        <line
          fill="none"
          stroke={stroke}
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          x1="459.7" y1="221" x2="475" y2="268.3"
        />
        <line
          fill="none"
          stroke={stroke}
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          x1="579.1" y1="183.7" x2="568" y2="240.1"
        />
        <line
          fill="none"
          stroke={stroke}
          strokeWidth="40"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit="10"
          x1="681" y1="268.3" x2="652.7" y2="302.1"
        />
      </g>
    </svg>
  );
}
