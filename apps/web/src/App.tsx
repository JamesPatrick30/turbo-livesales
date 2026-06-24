import AppRoutes from "./routes";
import { toast, ToastContainer } from "react-toastify";
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
        toast.error("Backend is not ready. Please try again later.");
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