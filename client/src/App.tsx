import { Toaster } from "sonner";
import { LoginForm } from "./pages/Login";
import { ThemeProvider } from "./components/common/theme-provider";
const App = () => {
  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster richColors position="top-right" />
        <LoginForm />
      </ThemeProvider>
    </>
  );
};

export default App;
