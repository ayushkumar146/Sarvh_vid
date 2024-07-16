import React, { useState } from 'react';
import './App.css';

function App() {
  const [videoUrl, setVideoUrl] = useState(null);
  const numCores = navigator.hardwareConcurrency || 2; // Use 2 cores if navigator.hardwareConcurrency is not available

  function fn(e) {
    const file = e.target.files[0];
    if (!file) return;

    const chunkSize = Math.ceil(file.size / numCores);
    const workers = [];
    const results = [];
    let completedChunks = 0;

    for (let i = 0; i < numCores; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const worker = new Worker(new URL('./worker.js', import.meta.url));

      worker.postMessage({ file, start, end });

      worker.onmessage = (event) => {
        results[event.data.start / chunkSize] = event.data.result;
        completedChunks++;
        if (completedChunks === numCores) {
          const combinedResults = new Blob(results, { type: file.type });
          const url = URL.createObjectURL(combinedResults);
          setVideoUrl(url);
          workers.forEach(w => w.terminate()); // Terminate all workers
        }
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      workers.push(worker);
    }
  }

  return (
    <div className="mainbody">
      <div className="btn">
        <input type="file" onChange={fn} />
        {videoUrl ? (
          <video src={videoUrl} controls>
            Your browser does not support the video tag.
          </video>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default App;
