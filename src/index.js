
var decompress = require('decompress');
var path = require('path');
var plist = require('simple-plist');

var tempDir = "tmp";

function analyzeFiles(files) {

    console.log('done! files.length = ' + files.length);
    var infoPlists = files.filter(function(file){
        return path.basename(file.path) === 'Info.plist';
    });

    var plistData = plist.readFileSync(path.join(tempDir,infoPlists[0].path));

    console.log("DisplayName : " + plistData.CFBundleDisplayName);
    console.log("BundleIdentifier : " + plistData.CFBundleIdentifier);

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

    var results = [];
    var totalCount = fileQueue.length;

    var onResult = function(res) {
        results.push(res);
        doNext();
    };

    var doNext = function() {
        if(fileQueue.length > 0) {
            dropZone.innerText = "Processing apps ...\n" + ( results.length + 1) + " of " + totalCount;
            processApp(fileQueue.shift().path,onResult);
        }
        else {
            outputResults(results);
        }
    };
    doNext();
}

document.addEventListener("DOMContentLoaded",function(){

    dropZone.addEventListener("drop", doDrop);
    dropZone.addEventListener("dragover", doDragOver);

});
