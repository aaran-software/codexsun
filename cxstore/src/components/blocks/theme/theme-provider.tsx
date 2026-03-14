import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type Theme = "dark" | "light" | "system"
type ThemeColor = "neutral" | "blue" | "orange"

type ThemeProviderProps = {
  children: ReactNode
  defaultTheme?: Theme
  defaultColorTheme?: ThemeColor
  themeStorageKey?: string
  colorStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  colorTheme: ThemeColor
  setTheme: (theme: Theme) => void
  setColorTheme: (colorTheme: ThemeColor) => void
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorTheme = "neutral",
  themeStorageKey = "vite-ui-theme",
  colorStorageKey = "vite-ui-color-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(themeStorageKey)
    return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : defaultTheme
  })
  const [colorTheme, setColorTheme] = useState<ThemeColor>(() => {
    const storedColorTheme = localStorage.getItem(colorStorageKey)
    return storedColorTheme === "neutral" || storedColorTheme === "blue" || storedColorTheme === "orange"
      ? storedColorTheme
      : defaultColorTheme
  })

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark")

      if (currentTheme === "system") {
        root.classList.add(mediaQuery.matches ? "dark" : "light")
        return
      }

      root.classList.add(currentTheme)
    }

    applyTheme(theme)

    if (theme !== "system") {
      return
    }

    const handleChange = () => applyTheme("system")
    mediaQuery.addEventListener("change", handleChange)

    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [theme])

  useEffect(() => {
    window.document.documentElement.dataset.theme = colorTheme
  }, [colorTheme])

  const value = useMemo(
    () => ({
      theme,
      colorTheme,
      setTheme: (nextTheme: Theme) => {
        localStorage.setItem(themeStorageKey, nextTheme)
        setTheme(nextTheme)
      },
      setColorTheme: (nextColorTheme: ThemeColor) => {
        localStorage.setItem(colorStorageKey, nextColorTheme)
        setColorTheme(nextColorTheme)
      },
    }),
    [colorStorageKey, colorTheme, theme, themeStorageKey],
  )

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeProviderContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
