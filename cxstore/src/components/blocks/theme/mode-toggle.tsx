import { Check, Moon, Palette, Sun } from "lucide-react"

import { useTheme } from "./theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { colorTheme, setColorTheme, setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="icon" aria-label="Toggle theme" />}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setTheme("light")}>
            <span className="flex-1">Light</span>
            {theme === "light" ? <Check /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            <span className="flex-1">Dark</span>
            {theme === "dark" ? <Check /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            <span className="flex-1">System</span>
            {theme === "system" ? <Check /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Palette</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setColorTheme("neutral")}>
            <Palette />
            <span className="flex-1">Neutral</span>
            {colorTheme === "neutral" ? <Check /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColorTheme("blue")}>
            <Palette />
            <span className="flex-1">Blue</span>
            {colorTheme === "blue" ? <Check /> : null}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setColorTheme("orange")}>
            <Palette />
            <span className="flex-1">Orange</span>
            {colorTheme === "orange" ? <Check /> : null}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
