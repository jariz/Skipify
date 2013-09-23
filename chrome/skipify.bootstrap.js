//Skipify bootstrap injects skipify resources into the spotify DOM.
//Skipify bootstrap version: CHROME VERSION

var SkipifyBootstrap = {
    "injectFile" : function(res) {
        var scr = document.createElement("script"); scr.type="text/javascript"; scr.src=chrome.extension.getURL(res); document.head.appendChild(scr);
    },
    "injectCode" : function(code) {
        var scr = document.createElement("script"); scr.type="text/javascript"; scr.text = code; document.head.appendChild(scr);
    },
    "init" : function() {
        SkipifyBootstrap.injectCode("var SkipifyIcon = '"+chrome.extension.getURL("skipify48.png")+"'; var SkipifyIcon_enabled = '"+chrome.extension.getURL("skipify_enabled.png")+"'; var SkipifyIcon_disabled = '"+chrome.extension.getURL("skipify_disabled.png")+"';")
        SkipifyBootstrap.injectFile("skipify.web.js");
    }
}


//and away we go
SkipifyBootstrap.init();