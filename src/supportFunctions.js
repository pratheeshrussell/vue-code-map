function getHTML(mermaidCode,title){
    return `
        <html>
        <head>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.css">
            <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
            <script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>
            <style>
                body {
                    background: #fff;
                    height: 95vh;
                    width: 95vw;
                }
                .container{
                    height:100%;
                    width: 100%;
                }
                .mermaid-title{
                    display:flex;
                    align-items:center;
                    justify-content:center;
                }
                .mermaid-holder{
                    height:80%;
                    width:100%;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                }
                .mermaid{
                    height:100%;
                    width:100%;
                    border: 1px solid black;
                }

            </style>
        </head>
        <body>
        <div class="container"> 
            <div class="mermaid-title"> 
                <h1>${title}</h1>
            </div>
            <div class="mermaid-holder">
                <div class="mermaid">
                ${mermaidCode}
                </div>
            </div>
        </div>
        </body>
        <script>
            
            // Initialize and render the Mermaid.js chart
            mermaid.initialize();
            mermaid.init(undefined, document.getElementsByClassName('mermaid'));
            // add zoom script
            var panZoom;
            function modelZoom() {
                if (typeof panZoom !== "undefined") {
                  panZoom.destroy();
                  panZoom = undefined;
                  window.removeEventListener('resize', modelResize); 
                } else {
                  const svgElement = document.querySelector("svg");
                  if (svgElement) {
                    // Retrieve the ID of the first SVG element
                    const svgId = svgElement.id;
                    svgElement.style.height = '100%';
                    svgElement.style.width = '100%';
                    panZoom = svgPanZoom("#" + svgId, {
                      zoomEnabled: true,
                      minZoom: 0.1,
                      maxZoom: 75,
                      controlIconsEnabled: true,
                      fit: true,
                      center: true,
                    });
                    window.addEventListener('resize', modelResize);    
                  }
                }
              }
              function modelResize (){
                    panZoom.resize();
                    panZoom.fit();
                    panZoom.center();  
                }
            setTimeout(()=>{modelZoom();},500)
            
        </script>
        </html>
  `;
}


function getFileExtension(uri) {
    // Get the file extension from the URI
    const fileName = uri.fsPath;
    const fileExtension = fileName.split('.').pop();
    return fileExtension;
  }
function getFileName(uri) {
    // Get the file extension from the URI
    const filePath = uri.fsPath;
    const fileName = filePath.split('/').pop();
    return fileName;
}

module.exports = {
	getHTML,
	getFileName,
    getFileExtension
}