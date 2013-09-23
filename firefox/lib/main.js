var pageMod = require("sdk/page-mod");
var data = require("sdk/self").data;

pageMod.PageMod({
    include: ["*.spotify.com"],
    contentScript: "var vars = document.createElement('script'); vars.innerHTML = \"var SkipifyIcon = '"+data.url("skipify48.png")+"'; var SkipifyIcon_enabled = '"+data.url("skipify_enabled.png")+"'; var SkipifyIcon_disabled = '"+data.url("skipify_disabled.png")+"';\"; document.head.appendChild(vars);"+
    "var scr = document.createElement('script'); scr.type='text/javascript'; scr.src='"+data.url("skipify.web.js")+"'; document.head.appendChild(scr);"
});
