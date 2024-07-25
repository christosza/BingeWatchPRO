// no debug outputs
//console.log = () => {};

var settings = {};
var currentVideo = null;

chrome.storage.sync.get(null, function (items) {
    for (var item in items) {
        settings[item] = items[item];
    }
});

chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (var key in changes) {
        settings[key] = changes[key].newValue;
        console.log(settings);
        if (key == "settings-time") {
            toggleTimeBox(changes[key].newValue);
        }
    }
});

// https://stackoverflow.com/a/13368349
function formatTime(s) {
    seconds = Math.floor(s),
    hours = Math.floor(seconds / 3600);
    seconds -= hours * 3600;
    minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    return hours + ':' + minutes + ':' + seconds;
}

function toggleTimeBox(display) {
    var timeBox = document.getElementById("timeDisplayContainer");
    if (display == "true") {
        timeBox.style.display = "block";
    } else {
        timeBox.style.display = "none";
    }
}

function createWorkingArea(timerSelector) {
    var parent = document.evaluate(timerSelector, document).iterateNext();
    //remove previous display if exist
    var child = document.getElementById('timeDisplayContainer');
    if (child != undefined) {
       parent.removeChild(child); 
    }

    var containerDiv = document.createElement('div');
    containerDiv.setAttribute('id', 'timeDisplayContainer');
    var timeBarContainer = document.createElement('div');
    timeBarContainer.setAttribute('id', 'timeBarContainer');
    var timeBar = document.createElement('div');
    timeBar.setAttribute('id', 'timeBar');
    var timeDisplay = document.createElement('div');
    timeDisplay.setAttribute('id', 'timeDisplay');
    timeDisplay.textContent = "00:00:00 / 00:00:00";
    timeBarContainer.appendChild(timeBar);
    containerDiv.appendChild(timeBarContainer);
    containerDiv.appendChild(timeDisplay);

    parent.appendChild(containerDiv);

    toggleTimeBox(settings['settings-time']);
}

function displayTime(currentTime, videoLength) {
    var width = Math.floor(currentTime / videoLength * 100);
    var timebar = document.getElementById("timeBar");
    var timeDisplay = document.getElementById("timeDisplay");
    if (timebar) document.getElementById("timeBar").style.width = width + "%";
    if (timeDisplay) document.getElementById("timeDisplay").innerHTML = formatTime(currentTime) + ' / ' + formatTime(videoLength);
}

var selectors = {
                    'netflix': {
                        'video'   : '//*/video',
                        'intro'   : '[data-uia="player-skip-intro"]',
                        'next'    : '[data-uia="next-episode-seamless-button-draining"]',
                        'preplay' : '[data-uia="player-skip-preplay"]',
                        'recap'   : '[data-uia="player-skip-recap"]',
                        'timer'   : '//*[@class="watch-video"]',
                        'promo'   : '',
                    },
                    'hbomax' : {
                        'video'   : '//*/video',
                        'intro'   : '[data-testid="SkipButton"]',
                        'next'    : '[data-testid="UpNextButton"]',
                        'preplay' : '',
                        'recap'   : '',
                        'timer'   : '//*[@id="layer-root-player-screen"]/div/div',
                        'promo'   : '',
                    },
                    'primevideo' : {
                        'video'   : '//*/video',
                        'intro'   : '.atvwebplayersdk-skipelement-button',
                        'next'    : '.atvwebplayersdk-nextupcard-button',
                        'preplay' : '',
                        'recap'   : '',
                        'timer'   : '//*[@id="dv-web-player"]/div/div[1]/div/div/div[2]/div/div/div/div',
                        'promo'   : '.fu4rd6c.f1cw2swo',
                    }
                };

var services = {'watch': selectors['netflix'], 'video': selectors['hbomax'], 'detail': selectors['primevideo']};

// https://stackoverflow.com/questions/41985502/how-to-interact-with-netflix-cadmium-video-player-on-the-client
function launchBingeWatchPRO(url) {
    console.log('launchBingeWatchPRO called');
    var url = url.split("/");
    var service = url[1];
    if (service in services) {
        var checkExist = setInterval(function () {
            if (document.evaluate(services[service]['video'], document).iterateNext() !== null) {
                clearInterval(checkExist);
                createWorkingArea(services[service]['timer']);
                var video = document.evaluate(services[service]['video'], document).iterateNext();
                video.setAttribute("timeupdate", true);
                video.addEventListener("timeupdate",
                    function (e) {
                        displayTime(video.currentTime, video.duration);
                        console.log('tick');
                        // skip intro
                        if ('' !=  services[service]['intro']){
                            if (document.querySelectorAll(services[service]['intro']).length && settings['settings-skip'] == 'true') {
                                document.querySelectorAll(services[service]['intro'])[0].click();
                                console.log('click skip-intro');
                            } 
                        }

                        // go to next episode without waiting
                        if ('' !=  services[service]['next']){
                            if (document.querySelectorAll(services[service]['next']).length && settings['settings-next'] == 'true') {
                                document.querySelectorAll(services[service]['next'])[0].click();
                                console.log('click next-episode');
                            }
                        }
                        // skip preplay
                        if ('' !=  services[service]['preplay']){
                            if (document.querySelectorAll(services[service]['preplay']).length && settings['settings-preplay'] == 'true') {
                                document.querySelectorAll(services[service]['preplay'])[0].click();
                                console.log('click skip-preplay');
                            }
                        }

                        // skip recap
                        if ('' !=  services[service]['recap']){
                            if (document.querySelectorAll(services[service]['recap']).length && settings['settings-recap'] == 'true') {
                                document.querySelectorAll(services[service]['recap'])[0].click();
                                console.log('click skip-recap');
                            }
                        }
                        // skip promo
                        if ('' !=  services[service]['promo']){
                            if (document.querySelectorAll(services[service]['promo']).length && settings['settings-promo'] == 'true') {
                                document.querySelectorAll(services[service]['promo'])[0].click();
                                console.log('click skip-promo');
                            }
                        }
                    }
                );
            }
        }, 100);
    }
}


var healthCheck = setInterval(function () {
    var reinit = 0;
    var tempUrl = window.location.pathname;    
    var video = document.querySelector('video');
    if (video == null) {
        return;
    } else {
        if (video.hasAttribute("timeupdate") == false) {
            reinit = 1;
        } else {
            reinit = 0;
        }
    }

    if (currentVideo != tempUrl || reinit == 1) {
        currentVideo = tempUrl;
        launchBingeWatchPRO(currentVideo);
    }
}, 1000);