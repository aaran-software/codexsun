import { BrowserRouter } from 'react-router-dom'
import { ShellRoutes } from '@cxsun/app/shell/shell-routes'

function App() {
  return (
    <BrowserRouter>
      <ShellRoutes />
    </BrowserRouter>
  )
}

export default App
