import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import api from "./shared/lib/axios";
import { useEffect, useState } from "react";
import WakingUpScreen from "./shared/components/Wakingupscreen";
function App() {
  const [backendReady, setBackendReady] = useState(false);
  useEffect(() => {
    const wakeupServer = async () => {
      try {
        await api.get("/health");
        setBackendReady(true);
      } catch (error) {
        console.error("Error waking up the server:", error);
      }
    };
    wakeupServer();
  }, []);
  if (!backendReady) {
    return <WakingUpScreen/>;
  }
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;