import TableTopChainCatalog from "@/components/tableTopChain/TableTopChainCatalog";
import { useNavigate } from "react-router-dom";

export default function TableTopChains() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <TableTopChainCatalog onBack={() => navigate("/Home")} />
    </div>
  );
}