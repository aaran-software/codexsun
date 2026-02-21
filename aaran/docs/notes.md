The `tooltip` component has been added. Remember to wrap your app with the `TooltipProvider` component.

```tsx title="app/layout.tsx"                                                                                                                                                                                                       
import { TooltipProvider } from "@/components/ui/tooltip"                                                                                                                                                                           
                                                                                                                                                                                                                                    
export default function RootLayout({ children }: { children: React.ReactNode }) {                                                                                                                                                   
  return (                                                                                                                                                                                                                          
    <html lang="en">                                                                                                                                                                                                                
      <body>                                                                                                                                                                                                                        
        <TooltipProvider>{children}</TooltipProvider>                                                                                                                                                                               
      </body>                                                                                                                                                                                                                       
    </html>                                                                                                                                                                                                                         
  )                                                                                                                                                                                                                                 
}                                                                                                                                                                                                                                   
```   



https://github.com/ansonbenny/Social-Media

ssh -p 65002 u831445660@147.93.23.68

Tech@1947#

chmod -x iphp.sh
