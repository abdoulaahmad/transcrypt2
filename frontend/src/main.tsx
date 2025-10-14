import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { WagmiProviderWrapper } from "./providers/WagmiProvider";
import "./styles.css";

const root = createRoot(document.getElementById("root")!);
const queryClient = new QueryClient();

root.render(
  <StrictMode>
    <WagmiProviderWrapper>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProviderWrapper>
  </StrictMode>
);
