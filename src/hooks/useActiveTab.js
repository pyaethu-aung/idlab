import { useState } from "react";

function useActiveTab() {
  const [activeTab, setActiveTab] = useState("generator");
  return { activeTab, setActiveTab };
}

export default useActiveTab;
