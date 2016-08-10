

const path = require('path');
const BrowserWindow = require('electron').remote.BrowserWindow;
const ipcRenderer = require('electron').ipcRenderer;
let myWindowId;

function outputResults(res) {
    window.alert("res" + res.length);
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
        const workerPath = 'file://' + path.join(__dirname, '/worker.html');

        let win = new BrowserWindow({ width: 400, height: 400, show: false });
        win.loadURL(workerPath);

        win.webContents.on('did-finish-load', function () {
            win.webContents.send('process-files', fileQueue, myWindowId);
        });
    }
    else {
        window.alert("oops, none of the files were .ipa files.")
    }
}

ipcRenderer.on('file-menu',function(event,files){
    window.alert("got files");
    processFiles(files);
})

ipcRenderer.on('window-id',function(event,id){
    myWindowId = id;
})

ipcRenderer.on('process-files-result', function (event, result) {
    outputResults(result);
})

document.addEventListener("DOMContentLoaded",function(){
    dropZone.addEventListener("drop", doDrop);
    dropZone.addEventListener("dragover", doDragOver);
});
