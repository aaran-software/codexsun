import type { HTMLAttributes } from "react"
import { motion } from "framer-motion"

import { useCompanyConfig } from "@/config/company"
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
  const { company } = useCompanyConfig()

  return (
    <div className={cn("flex min-h-screen items-center justify-center p-8", className)} {...props}>
      <motion.div
        className={cn("relative", sizeConfig[size])}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(0, 0, 0) 120deg, rgba(0, 0, 0, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 180deg, transparent 0deg, rgba(0, 0, 0, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
        />

        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 270deg, transparent 0deg, rgba(0, 0, 0, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 90deg, transparent 180deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 35%, black 37%, black 39%, transparent 41%)",
            opacity: 0.8,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <motion.div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0deg, rgb(255, 255, 255) 120deg, rgba(255, 255, 255, 0.5) 240deg, transparent 360deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 42%, black 44%, black 48%, transparent 50%)",
            opacity: 0.9,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
        />

        <motion.div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 180deg, transparent 0deg, rgba(255, 255, 255, 0.6) 45deg, transparent 90deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 52%, black 54%, black 56%, transparent 58%)",
            opacity: 0.35,
          }}
          animate={{ rotate: [0, -360] }}
          transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: [0.4, 0, 0.6, 1] }}
        />

        <motion.div
          className="absolute inset-0 hidden rounded-full dark:block"
          style={{
            background:
              "conic-gradient(from 270deg, transparent 0deg, rgba(255, 255, 255, 0.4) 20deg, transparent 40deg)",
            mask: "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 61%, black 62%, black 63%, transparent 64%)",
            opacity: 0.5,
          }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={company.logoUrl}
            alt={company.displayName}
            className="h-10 w-auto rounded-md object-contain shadow-sm sm:h-12 dark:hidden"
          />
          <img
            src={company.logoUrl}
            alt={company.displayName}
            className="hidden h-10 w-auto rounded-md object-contain shadow-sm sm:h-12 dark:block"
          />
        </div>
      </motion.div>
    </div>
  )
}
