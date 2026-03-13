import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setMessage("You are back online");
      setShow(true);
      setTimeout(() => setShow(false), 3000);
    };
    const handleOffline = () => {
      setOnline(false);
      setMessage("You are currently offline");
      setShow(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg animate-slide-in text-sm font-medium ${online ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"}`}>
      {online ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      {message}
    </div>
  );
}
