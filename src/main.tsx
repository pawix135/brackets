import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { RouterProvider, createHashRouter } from "react-router-dom";
import KodPage from "./pages/kod/index.tsx";
import TurnejPage from "./pages/turniej/index.tsx";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/turniej",
    element: <TurnejPage />,
  },
  {
    path: "/kod",
    element: <KodPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
