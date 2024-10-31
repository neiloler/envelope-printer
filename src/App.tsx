import { useState, ChangeEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import './App.css';
import Envelope from './Envelope';

interface Address {
  name: string;
  street: string;
  cityStateZip: string;
}

// Setting worker path to public path
pdfjsLib.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf/pdf.worker.mjs`;

function App() {
  const [address, setAddress] = useState<Address | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const pdfBytes = await file.arrayBuffer();
      
      // Load PDF with pdfjs-dist to extract text
      const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const firstPage = await pdf.getPage(1);
      const textContent = await firstPage.getTextContent();
      
      const text = textContent.items.map((item: any) => item.str).join(' ');

      console.log(text);

      // Extract address based on known pattern
      const addressRegex = /([A-Za-z\s]+)\s(\d+\s[\w\s]+),?\s([A-Za-z\s]+),?\s([A-Z]{2})\s(\d{5}(-\d{4})?)/;
      const match = text.match(addressRegex);

      if (match) {
        setAddress({
          name: match[1].trim(),
          street: match[2].trim(),
          cityStateZip: match[3].trim(),
        });
        setPdfFile(file);
      } else {
        alert("Address not found in PDF.");
      }
    }
  };

  const handlePrintPdf = () => {
    if (pdfFile) {
      const pdfWindow = window.open(URL.createObjectURL(pdfFile));
      pdfWindow?.print();
    }
  };

  return (
    <div className="App">
      <h1>Envelope Printer</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={handlePrintPdf} disabled={!pdfFile}>Print Original PDF</button>
      {address && (
        <>
          <Envelope address={address} />
          <button onClick={() => window.print()}>Click to Print Envelope</button>
        </>
      )}
    </div>
  );
}

export default App;
