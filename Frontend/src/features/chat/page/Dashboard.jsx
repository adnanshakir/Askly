import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useChat } from "./hooks/useChat";

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  console.log(user);
  
  const chat = useChat();

  useEffect(() => {
    if (user) {
      chat.initializeSocketConnection();
    }
  }, []);

  return <div>Dashboard</div>;
};

export default Dashboard;
