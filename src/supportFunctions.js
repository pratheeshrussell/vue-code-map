function getHTML(mermaidCode){
    return `
        <html>
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.css">
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
            <style>
                body {
                    background: #fff;
                }
            </style>
        </head>
        <body>
            <div class="mermaid">
            ${mermaidCode}
            </div>
        </body>
        <script>
            // Initialize and render the Mermaid.js chart
            mermaid.initialize();
            mermaid.init(undefined, document.getElementsByClassName('mermaid'));
        </script>
        </html>
  `;
}

function generateMermaidCode(){
    // Your JavaScript code that generates the Mermaid.js code
    // Replace this with your actual script
    const mermaidCode = `
    graph LR;
        A-->B;
        B-->C;
        C-->D;
    `;
    return mermaidCode;
}

function getFileExtension(uri) {
    // Get the file extension from the URI
    const fileName = uri.fsPath;
    const fileExtension = fileName.split('.').pop();
    return fileExtension;
  }

module.exports = {
	getHTML,
	generateMermaidCode,
    getFileExtension
}