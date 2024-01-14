import { useState, useRef } from 'react';
import preprocessImage from './preprocess';
import Tesseract from 'tesseract.js';
import './App.css';

function App() {
  const [image, setImage] = useState("");
  const [lines, setLines] = useState([]);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setImage(URL.createObjectURL(event.target.files[0]));
  };

  const handleClick = () => {
    setLoading(true);
    setError("");
  
    const canvas = canvasRef.current;
    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    const ctx = canvas.getContext('2d');
  
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.putImageData(preprocessImage(canvas), 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
  
    Tesseract.recognize(dataUrl, 'eng', {
      logger: (m) => console.log(m),
    })
      .catch((err) => {
        console.error(err);
        setError("An error occurred during OCR processing.");
      })
      .then((result) => {
        let text = result.text;

        // Extract all question numbers
        let extractedData = [];
        let regex = /(\d+)\./g;
        let match;
        while ((match = regex.exec(text)) !== null) {
          extractedData.push(match[0] + "->");
        }
  
        setLines(extractedData);
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="App">
      <main className="App-main">
        <h3>Actual image uploaded</h3>
        <img src={image} className="App-logo" alt="logo" ref={imageRef} />
        <h3>Canvas</h3>
        <canvas ref={canvasRef} width={700} height={300}></canvas>
        <h3>Extracted text</h3>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && !error && (
          <div className="pin-box">
            {lines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
        <input type="file" onChange={handleChange} />
        <button onClick={handleClick} style={{ height: 50 }}>
          Convert to text
        </button>
      </main>
    </div>
  );
}

export default App;

