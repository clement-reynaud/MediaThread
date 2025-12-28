import "./config/env";
import server from "./app";

const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
