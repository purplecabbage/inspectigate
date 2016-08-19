

const path = require('path');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;
let myWindowId;
let workerWindow;

function outputResults(res) {

    var errorCount = 0;
    res.forEach(function(result) {
        if(result.code != null) {
            console.log("ERROR : " + JSON.stringify(result));
            // use errno?
            errorCount++;
        }
        else {
            //console.log("result = " + JSON.stringify(result));
        }
    });

    const modalPath = path.join('file://', __dirname, 'results.html')
    let win = new BrowserWindow({ frame:true })
    win.on('close', function () {
        win = null;
    });
    win.loadURL(modalPath);

    win.webContents.on('did-finish-load', function () {
        win.webContents.send('display-results', res);
    });
    win.show();
    dropZone.innerText = "Drop an ipa file here to inspect it.";
}

function doDragOver(evt) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move'; // Explicitly show this is a copy.
}

function doDrop(evt) {
    evt.preventDefault();
    var files = evt.dataTransfer.files;
    processFiles(files);
}

function processFiles(files) {

    var isIPA = function(file) {
        return path.extname(file.path ? file.path : file) === ".ipa";
    };
    var fileQueue;
    if(files.filter) {
        fileQueue = files.filter(isIPA);
    }
    else {
       fileQueue = Array.prototype.filter.call(files,isIPA);
    }


    if(fileQueue.length > 0) {
        dropZone.innerText = "Processing " + fileQueue.length + " files ...";
        let workerPath = 'file://' + path.join(__dirname, '/worker.html');
        workerWindow = new BrowserWindow({ width: 400, height: 400, show: false });
        workerWindow.loadURL(workerPath);
        workerWindow.openDevTools();

        workerWindow.webContents.once('did-finish-load', function () {
            workerWindow.webContents.send('process-files', fileQueue, myWindowId);
        });
    }
    else {
        window.alert("oops, none of the files were .ipa files.")
    }
}

ipcRenderer.on('file-menu',function(event,files){
    processFiles(files);
})

ipcRenderer.on('window-id',function(event,id){
    myWindowId = id;
})

ipcRenderer.on('process-files-progress', function (event, index,total) {
    dropZone.innerText = "Processing " + index + " of " + total  + " files.";
})

ipcRenderer.on('process-files-result', function (event, result) {
    outputResults(result);
    workerWindow.close();
})

document.addEventListener("DOMContentLoaded",function(){
    dropZone.addEventListener("drop", doDrop);
    dropZone.addEventListener("dragover", doDragOver);
});
