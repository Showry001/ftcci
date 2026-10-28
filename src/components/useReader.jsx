import { lazy, Suspense, useState } from "react";

// The reader bundles pdf.js, so it is only downloaded the first time someone opens an issue.
const FlipbookReader = lazy(() => import("./FlipbookReader.jsx"));

// Returns the reader element to render (null while closed) and a function that opens a PDF in it.
export default function useReader() {
  const [doc, setDoc] = useState(null);
  const reader = doc && (
    <Suspense fallback={null}>
      <FlipbookReader src={doc.src} title={doc.title} onClose={() => setDoc(null)} />
    </Suspense>
  );
  return [reader, setDoc];
}
