import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

import { TextEditor } from "./components";

export function App() {
   const randomUrl = uuidV4();

   return (
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<Navigate to={`/document/${randomUrl}`} replace />} />
            <Route path="/document/:id" element={<TextEditor />} />
         </Routes>
      </BrowserRouter>
   );
}
