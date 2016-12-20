
const ipc = require('electron').ipcRenderer;

ipc.on('display-results', function (event, results) {
    //document.body.innerText = results.length;
    var errorCount = 0;
    var uList = document.createElement("ul");

    results.forEach(function(result) {
        if(result.code != null) {
            console.log("ERROR : " + JSON.stringify(result));

            // use errno?
            errorCount++;
            var li = document.createElement("li");
            var h3 = document.createElement("h3");
                h3.innerText = "Error";

            li.appendChild(h3);

            var div = document.createElement("div");
                div.innerText = JSON.stringify(result,0,"\t");
            li.appendChild(div);

            uList.appendChild(li);

        }
        else {
            console.log("result = " + JSON.stringify(result));
            var li = document.createElement("li");
            var h3 = document.createElement("h3");
                h3.innerText = result.displayName;

            li.appendChild(h3);

            var div = document.createElement("div");
                div.innerText = "bundleId: " + result.bundleId;
            li.appendChild(div);

            div = document.createElement("div");
            div.innerText = "cordovaJSCount: " + result.cordovaJSCount;
            li.appendChild(div);

            div = document.createElement("div");
            div.innerText = "jsFileCount: " + result.jsFileCount;
            li.appendChild(div);

            div = document.createElement("div");
            div.innerText = "icon: " + result.icon;
            li.appendChild(div);


            uList.appendChild(li);
        }
    });

    document.body.appendChild(uList);

});



