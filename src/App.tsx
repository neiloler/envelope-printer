import React, { useState, ChangeEvent } from 'react';
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

      // Extract address based on known pattern
      const addressRegex = /([A-Za-z\s]+)\s(\d+\s[\w\s]+),?\s([A-Za-z\s]+),?\s([A-Z]{2})\s(\d{5}(-\d{4})?)/;
      const match = text.match(addressRegex);

      if (match) {
        setAddress({
          name: match[1].trim(),
          street: match[2].trim(),
          cityStateZip: `${match[3].trim()}, ${match[4]} ${match[5]}`
        });
        setPdfFile(file);
      } else {
        alert("Address not found in PDF.");
      }
    }
  };

  const handlePrintEnvelope = () => {
    if (address) {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      iframe.style.position = 'absolute';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
  
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <style>
                /* Load Berlin Sans FB font from the public folder */
                @font-face {
                  font-family: 'Berlin Sans FB';
                  src: url('${window.location.origin}/brlnsr.ttf') format('truetype');
                  font-weight: normal;
                  font-style: normal;
                }
  
                @page { size: 9.5in 4.125in; margin: 0; }
                body { margin: 0; font-family: 'Berlin Sans FB', Arial, sans-serif; }
  
                .envelope {
                  width: 9.5in;
                  height: 4.125in;
                  padding: 0.5in;
                  position: relative;
                  box-sizing: border-box;
                  color: black;
                  background-color: white;
                }
  
                .return-address {
                  position: absolute;
                  top: 0.5in;
                  left: 0.5in;
                  width: 2in; /* Adjust width as needed */
                }
  
                .recipient-address {
                  position: absolute;
                  top: 1.5in;
                  left: 3in;
                  width: 4in;
                  text-align: left;
                  font-size: 26px;
                  line-height: 1.4;
                  color: black;
                }
              </style>
            </head>
            <body>
              <div class="envelope">
                <img src="${window.location.origin}/return-address.webp" alt="Return Address" class="return-address" />
                <div class="recipient-address">
                  ${address.name}<br />
                  ${address.street}<br />
                  ${address.cityStateZip}
                </div>
              </div>
            </body>
          </html>
        `);
        doc.close();
        
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }
      
      // Clean up iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };  

  return (
    <div className="App">
      <h1>Envelope Printer</h1>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
      <button onClick={() => pdfFile && window.open(URL.createObjectURL(pdfFile))?.print()} disabled={!pdfFile}>
        Print Original PDF
      </button>
      {address && (
        <>
          <Envelope address={address} />
          <button onClick={handlePrintEnvelope}>Click to Print Envelope</button>
        </>
      )}
    </div>
  );
}

export default App;
