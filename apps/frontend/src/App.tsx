import {ThemeProvider} from "@/components/theme/theme-provider.tsx";
import {ModeToggle} from "@/components/theme/mode-toggle.tsx";
import AppLayout from "@/components/layouts/app-layout.tsx";

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppLayout>
                <ModeToggle/>
                <p className="text-3xl font-bold underline bg-amber-300 p-4">
                    Click on the Vite and React logos to learn more
                </p>
            </AppLayout>
        </ThemeProvider>
    )
}

export default App
