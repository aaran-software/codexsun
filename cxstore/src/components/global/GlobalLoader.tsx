import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

type LoaderSize = "sm" | "md" | "lg"

interface GlobalLoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoaderSize
}

const sizeConfig: Record<LoaderSize, string> = {
  sm: "size-20",
  md: "size-32",
  lg: "size-40",
}

export default function GlobalLoader({ size = "md", className, ...props }: GlobalLoaderProps) {
  return (
    <div className={cn("flex min-h-screen items-center justify-center p-8", className)} {...props}>
      <div className={cn("relative animate-pulse", sizeConfig[size])}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 120deg, rgba(0, 0, 0, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 180deg, transparent 0deg, rgba(0, 0, 0, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 270deg, transparent 0deg, rgba(0, 0, 0, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 120deg, rgba(255, 255, 255, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(255, 255, 255, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(255, 255, 255, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          aria-hidden="true"
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/Aspire.png"
            alt="Aspire"
            className="h-10 w-auto rounded-md object-contain shadow-sm sm:h-12"
          />
        </div>
      </div>
    </div>
  )
}
