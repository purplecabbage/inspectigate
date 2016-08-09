

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

    dropZone.innerText = "Processing " + files.length + " files ..."

    var fileQueue = Array.prototype.filter.call(files,function(file) {
        return path.extname(file.path) === ".ipa";
    });

    const workerPath = 'file://' + path.join(__dirname, '/worker.html');

    let win = new BrowserWindow({ width: 400, height: 400, show: true });
    win.loadURL(workerPath);

    //win.webContents.openDevTools();

    win.webContents.on('did-finish-load', function () {
        win.webContents.send('process-files', fileQueue, myWindowId);
    });
}

ipcRenderer.on('window-id',function(event,id){
    myWindowId = id;
})

ipcRenderer.on('process-files-result', function (event, result) {
    //window.alert("got a result " + JSON.stringify(result));
    outputResults(result);
})

document.addEventListener("DOMContentLoaded",function(){
    dropZone.addEventListener("drop", doDrop);
    dropZone.addEventListener("dragover", doDragOver);
});
