var Skipify = {

    "skipping" : true,

    "start" : function() {
        if(!window._core) { setTimeout(Skipify.start, 100); return; }

        DebuggerJS.log("Skipify.start", ["Skipify is waiting for Spotify's advertisement service...."], "skipifyjs");
        window._core.audioManager.onReady(Skipify.initialize);
    },

    "initialize" : function() {
        //have we successfully replaced spotify adchooser with skipify adchooser?
        if(typeof(window._core.adChooser.fake) == "undefined") {
            Skipify.notification("<strong>Skipify failed to initialize</strong>: Ads will now appear :(<br>Reason: SkipifyAdChooser not found.", "SKIPIFY_FAILED");
            return;
        } else Skipify.notification("<img src='"+SkipifyIcon+"' style='float:left; margin-right:10px;'>Skipify is enabled!, <strong>You will hear no more commercials from now on :)</strong><br>Use at your own risk</strong>", "SKIPIFY_ENABLED");

        //hook the hook
        var mh = new SkipifyHook(_core.audioManager.getPlayerById("Player0"));
        mh._init();

        //initialize skipify user interface
        Skipify.gui();
    },

    "toggle" : function() {
        Skipify.skipping = !Skipify.skipping;

        if(Skipify.skipping) {
            var gui = document.getElementById("skipify-toggler");
            gui.setAttribute("style", "background-position: center 10px;background-image:url('"+SkipifyIcon_enabled+"')");
            gui.setAttribute("class", "current");

            Skipify.notification("<img src='"+SkipifyIcon+"' style='float:left; margin-right:10px;'>Skipify is enabled!.<br><strong>You will hear no more commercials from now on :)</strong>", "SKIPIFY_TOGGLE")

            //hack spotify back to normal playback
            if(_core.audioManager.getActivePlayer().isAd) _core.contextPlayer._playIntercepted();

        }
        else {
            var gui = document.getElementById("skipify-toggler");
            gui.setAttribute("style", "background-position: center 10px;background-image:url('"+SkipifyIcon_disabled+"')");
            gui.removeAttribute("class");
            Skipify.notification("<img src='"+SkipifyIcon+"' style='float:left; margin-right:10px;'>Skipify is <strong>disabled</strong>.<br>Commercials will now be played again.", "SKIPIFY_TOGGLE");

            //start commercial if there was one
            if(typeof(_core.contextPlayer._interceptions) !== 'null') { //is there a ad in the queue?
                //force adchooser to inject ad
                _core.adChooser.getNextAd();
                //go to next track
                _core.contextPlayer.next();
                //play commercial
                _core.contextPlayer._attemptPlay();
            }
        }

    },

    "gui" : function() {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.setAttribute("style", "background-position: center 10px;background-image:url('"+SkipifyIcon_enabled+"')");
        a.setAttribute("id", "skipify-toggler");
        a.setAttribute("class", "");
        a.innerHTML = "Skipify";
        a.addEventListener("click", function() {
            Skipify.toggle();
        });
        li.appendChild(a);
        document.getElementById("nav-items").appendChild(li);
    },

    "notification": function(a,b) {
        var notification = new Spotify.Web.NotificationArea({
            element: document.getElementById("notification-area")
        });
        notification.initialize();
        notification.show({
            message: _(a),
            id: b,
            timeout:10000
        })
    }
};

//skipifyhook binds events to the active player and if a ad falls trough the cracks, bypasses the ad
var SkipifyHook = function(player) {
    var events = new Spotify.Events,
        onPlay = function() {
            DebuggerJS.log("SkipifyHook.onPlay", ["SkipifyHook tracking play event for "+player.id], "skipifyjs");

            if(Skipify.skipping && player.isAd) {
                DebuggerJS.warn("SkipifyHook.onPlay", ["WTF??? A ad still managed to play while muting, BYPASS!"], "skipifyjs");
                _core.contextPlayer._playIntercepted();
            }
        };

    this._init = function() {
        player.bind(events.PLAYING, onPlay, events);

        DebuggerJS.log("SkipifyHook", ["SkipifyHook initialized on  "+player.id], "skipifyjs");
    };
};

var SkipifyConsole = function () {
    this.log = function () {
        console.log(arguments[0] + ": " + arguments[1] + " ["+arguments[2]+"]");
        return !0
    };
    this.error = function () {
        console.error(arguments[0] + ": " + arguments[1] + " ["+arguments[2]+"]");
        return !0
    };
    this.warn = function () {
        console.warn(arguments[0] + ": " + arguments[1] + " ["+arguments[2]+"]");
        return !0
    }
};

//Replace spotify's console with ours
Spotify.DebuggerJS = DebuggerJS = new SkipifyConsole();

DebuggerJS.log(atob("ICBfX19fXyBfICAgIF8gICAgICAgXyAgX18gICAgICAgDQogLyBfX19ffCB8ICAoXykgICAgIChfKS8gX3wgICAgICANCnwgKF9fXyB8IHwgX19fIF8gX18gIF98IHxfIF8gICBfIA0KIFxfX18gXHwgfC8gLyB8ICdfIFx8IHwgIF98IHwgfCB8DQogX19fXykgfCAgIDx8IHwgfF8pIHwgfCB8IHwgfF98IHwNCnxfX19fXy98X3xcX1xffCAuX18vfF98X3wgIFxfXywgfA0KICAgICAgICAgICAgICB8IHwgICAgICAgICAgIF9fLyB8DQogICAgICAgICAgICAgIHxffCAgICAgICAgICB8X19fLyANCg==")+"\r\n", ["you","got","pwned","by"], "skipify");
DebuggerJS.log("skipify.web.js", ["Skipify is waiting for Spotify to initialize...."], "skipifyjs");
Skipify.start();

var parent = new Spotify.Services.AdChooser;

//Our 'fake' adchooser that forwards everything towards it's parent except when muting / adding events
SkipifyAdChooser = Spotify.Services.AdChooser = function () {
    Spotify.EventTarget.call(this);

    this.fake = true;

    this.onReady = function (a, b) {
        DebuggerJS.log("SkipifyAdChooser", ["calling parent onReady() callback",a,b], "skipifyjs");
        parent.onReady(a,b);
    };
    this.recordAdEvent = function (a, b) {
        DebuggerJS.log("SkipifyAdChooser", ["calling parent recordAdEvent() callback",a,b], "skipifyjs");
        parent.recordAdEvent(a,b);
    };
    this.getNextAd = function () {
        DebuggerJS.log("SkipifyAdChooser", ["calling parent getNextAd() callback (if not muting)"], "skipifyjs");
        if(!Skipify.skipping) //only thing that we don't directly forward to parent
            parent.getNextAd();
    };
    this.lookup = function (a, b) {
        DebuggerJS.log("SkipifyAdChooser", ["calling parent lookup() callback",a,b], "skipifyjs");
        parent.lookup(a,b);
    };
    this.maybeRetrieveAds = function () {
        DebuggerJS.log("SkipifyAdChooser", ["calling parent maybeRetrieveAds() callback"], "skipifyjs");
        parent.maybeRetrieveAds();
    };
    this.init = function (a, c, m) {
        DebuggerJS.log("SkipifyAdChooser.init", ["calling parent init() callback",a,c,m], "skipifyjs");
        parent.init(a,c,m);
    };
    this.initializeContext = function (a, b) {
        DebuggerJS.log("SkipifyAdChooser", ["Adding our own events @ initializeContext",a,b], "skipifyjs");
        //parent.initializeContext(a,b);
        b.addEvents({
            beforeContextChange: this.getNextAd,
            beforeNext: this.getNextAd,
            beforePrevious: this.getNextAd,
            ended: function () {}
        })
        parent.initializeContext(a,b);
        //no no no, events no here
        //I'LL HANDLE THOSE EVENTS MYSELF THANK YOU PLEASE
        b.removeEvent("beforeContextChange", parent.getNextAd);
        b.removeEvent("beforeNext", parent.getNextAd);
        b.removeEvent("beforePrevious", parent.getNextAd);

    }
};