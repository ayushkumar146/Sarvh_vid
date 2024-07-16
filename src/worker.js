self.onmessage = (e) => {
    const { file, start, end } = e.data;
    const reader = new FileReader();
    const blob = file.slice(start, end);
  
    reader.onload = (event) => {
      self.postMessage({ result: event.target.result, start });
    };
  
    reader.readAsArrayBuffer(blob);
  };
  