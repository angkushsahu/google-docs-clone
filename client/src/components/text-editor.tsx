import "quill/dist/quill.snow.css";

import { useCallback, useEffect, useState } from "react";
import type { Delta, EmitterSource } from "quill/core";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Quill from "quill";

import { TOOLBAR_OPTIONS } from "../lib";

export function TextEditor() {
   const params = useParams();
   const documentId = params.id;

   const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
   const [quill, setQuill] = useState<Quill | null>(null);

   // secures connection with web-socket
   useEffect(() => {
      const newSocket = io(import.meta.env.VITE_APP_SERVER_URL);
      setSocket(newSocket);

      return () => {
         newSocket.disconnect();
      };
   }, []);

   // send changes made by the user to the server
   useEffect(() => {
      if (!quill || !socket) return;

      const changeHandler = (delta: Delta, _: Delta, source: EmitterSource) => {
         if (source !== "user") return;
         socket.emit("send-changes", delta);
      };

      quill.on("text-change", changeHandler);

      return () => {
         quill.off("text-change", changeHandler);
      };
   }, [socket, quill]);

   // loading the document for the current URL
   useEffect(() => {
      if (!documentId || !socket || !quill) return;

      socket.once("load-document", (document) => {
         quill.setContents(document);
         quill.enable();
      });

      socket.emit("get-document", documentId);
   }, [documentId, socket, quill]);

   // receives changes made by the user
   useEffect(() => {
      if (!quill || !socket) return;

      const changeHandler = (delta: Delta) => {
         quill.updateContents(delta);
      };

      socket.on("receive-changes", changeHandler);

      return () => {
         socket.off("receive-changes", changeHandler);
      };
   }, [socket, quill]);

   // initiating Quill text-editor instance
   const wrapperRef = useCallback((wrapper: HTMLDivElement) => {
      if (!wrapper) return;

      wrapper.innerHTML = "";

      const editor = document.createElement("div");
      wrapper.append(editor);

      const quillInstance = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS } });
      quillInstance.disable();
      quillInstance.setText("Loading ....");
      setQuill(quillInstance);
   }, []);

   return <section className="editor" ref={wrapperRef}></section>;
}
