
 const ipc = require('electron').ipcRenderer;
const BrowserWindow = require('electron').remote.BrowserWindow;
var decompress = require('decompress');
var path = require('path');
var plist = require('simple-plist');
var callerWindow;

var tempDir = "tmp";

ipc.on('process-files', function (event, fileQueue, fromWindowId) {

    const fromWindow = BrowserWindow.fromId(fromWindowId);
    var results = [];
    var totalCount = fileQueue.length;
    var index = 0;

    var onResult = function(res) {
        results.push(res);
        doNext();
    };

    var doNext = function() {
        if(fileQueue.length > 0) {
            fromWindow.webContents.send('process-files-progress', ++index,totalCount);
            processApp(fileQueue.shift().path,onResult);
        }
        else {
            fromWindow.webContents.send('process-files-result', results);
            window.close();
        }
    };
    doNext();
});

function analyzeFiles(files) {

    // console.log('done! files.length = ' + files.length);
    var infoPlists = files.filter(function(file){
        return path.basename(file.path) === 'Info.plist';
    });

    var plistData = plist.readFileSync(path.join(tempDir,infoPlists[0].path));

    // console.log("DisplayName : " + plistData.CFBundleDisplayName);
    // console.log("BundleIdentifier : " + plistData.CFBundleIdentifier);

    var jsFiles = files.filter(function(file){
        return path.extname(file.path) === ".js";
    });

    var cordovaJsFiles = jsFiles.filter(function(file) {
        return path.basename(file.path) === 'cordova.js';
    });

    return {
        jsFileCount:jsFiles.length,
        cordovaJSCount:cordovaJsFiles.length,
        displayName:plistData.CFBundleDisplayName,
        bundleId:plistData.CFBundleIdentifier
    };
}

function processApp(path,cb) {

    decompress(path,tempDir)
    .then(function(res) {
        return analyzeFiles(res);
    })
    .then(function(res) {
        setTimeout(function(){ // delay so the UI can update
            cb(res);
        },0);
    },function onError(err) {
        setTimeout(function(){ // delay so the UI can update
            cb(err);
        },0);
    });
}