import { Toaster } from "sonner";
import { ThemeProvider } from "./components/common/theme-provider";
import AddTrade from "./pages/AddTrade";
import Dashboard from "./pages/Dashboard";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import TradingPreferencesPage from "./pages/TradingPreferences";
import Sidebar from "./layouts/Sidebar";
import OpenPositionsPage from "./pages/OpenPositionsPage";
import NewTradePage from "./pages/NewTradePage";
import Header from "./layouts/Header";
import MyProfilePage from "./pages/MyProfilePage";
import MutualFundPage from "./pages/MutualFundPage";
import Scanner from "./pages/Scanner";
import ClosedTradesPage from "./pages/ClosedTradesPage";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster richColors position="top-right" />

      <BrowserRouter>
        <div className="flex min-h-screen bg-background text-foreground">
          {/* 1. Sidebar: Fixed width (e.g., w-64) */}
          <Sidebar />

          {/* 2. Content Wrapper: Flex-column to stack Header, Main, and Footer */}
          <div className="flex flex-col flex-1">
            <Header />

            <main className="flex-1 p-6">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/add-trade" element={<AddTrade />} />
                <Route
                  path="/preferences"
                  element={<TradingPreferencesPage />}
                />
                <Route path="/open-positions" element={<OpenPositionsPage />} />
                <Route path="/new-trade" element={<NewTradePage />} />
                <Route path="/my-profile" element={<MyProfilePage />} />
                <Route path="/mutual-funds" element={<MutualFundPage />} />
                <Route path="/signals" element={<Scanner />} />
                <Route path="/history" element={<ClosedTradesPage />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
