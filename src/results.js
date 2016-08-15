
const ipc = require('electron').ipcRenderer;

ipc.on('display-results', function (event, results) {
    document.body.innerText = results.length;
}

/*
    console.log("res = " + JSON.stringify(res[0]));
    var errorCount = 0;
    res.forEach(function(result) {
        if(result.code != null) {
            console.log("ERROR : " + JSON.stringify(result));

            // use errno?
            errorCount++;
        }
        else {
            console.log("result = " + JSON.stringify(result));
        }
    });
*/

