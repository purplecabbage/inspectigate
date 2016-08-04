
var decompress = require('decompress');
var path = require('path');
var plist = require('simple-plist');


var testFiles = ['PhoneGap 1.7.0.ipa',
                 'Adobe Ideas 2.9.2.ipa'];

var tempDir = "tmp";

function analyzeFiles(files) {

    console.log('done! files.length = ' + files.length);

    dropZone.innerText = "Analysing ...";

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
        cordovaJSCount:cordovaJsFiles.length
    };


}

function doDragOver(evt) {
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'move'; // Explicitly show this is a copy.
}

function doDrop(evt) {

    evt.preventDefault();
    var files = evt.dataTransfer.files;

    dropZone.innerText = "Processing " + files.length + " files ..."

    var fileQueue = [];
    var resultQueue = [];
    for (var i = 0, f; f = files[i]; i++) {
        // Read the File objects in this FileList.
        if(path.extname(files[i].path) === ".ipa") {
            fileQueue.push(files[i].path);
        }
    }
    if(fileQueue.length > 0) {
        dropZone.innerText = "Decompressing...";
        decompress(fileQueue[0],tempDir).then(analyzeFiles,function(err){
            window.alert("err : " + err);
        })
        .then(function (res) {
            window.alert("*.js: " + res.jsFileCount + "\n" +
                         "cordova.js: " + res.cordovaJSCount);
        })
        .then(function(){
            dropZone.innerText = "Drop an ipa file here to inspect it.";
        });;
    }
    else {
        console.log("No ipa files found");
    }
}

document.addEventListener("DOMContentLoaded",function(){

    dropZone.addEventListener("drop", doDrop);
    dropZone.addEventListener("dragover", doDragOver);

});
