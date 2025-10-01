import {ThemeProvider} from "@/components/theme/theme-provider.tsx";
import {ModeToggle} from "@/components/theme/mode-toggle.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <ModeToggle/>
            <p className="text-3xl font-bold underline bg-amber-300 p-4">
                Click on the Vite and React logos to learn more
            </p>
        </ThemeProvider>
    )
}
export default App
