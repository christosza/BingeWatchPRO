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

function createWorkingArea(app) {
    if (app == 'watch') {
        var parent = document.getElementsByClassName('watch-video')[0];
    } else {
        var parent = document.evaluate('//*[@id="Viewport"]/div[2]/div[2]/div/div[1]/div[3]', document).iterateNext();
    }
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


// https://stackoverflow.com/questions/41985502/how-to-interact-with-netflix-cadmium-video-player-on-the-client
function launchBingeWatchPRO(url) {
    console.log('launchBingeWatchPRO called');
    var url = url.split("/");

    if (url[1] == "watch" || url[1] == "episode") {
        var checkExist = setInterval(function () {
            if (document.evaluate('//*/video', document).iterateNext() !== null) {
                clearInterval(checkExist);
                createWorkingArea(url[1]);
                var video = document.evaluate('//*/video', document).iterateNext();
                video.setAttribute("timeupdate", true);
                video.addEventListener("timeupdate",
                    function (e) {
                        displayTime(video.currentTime, video.duration);
                        console.log('tick');
                        // skip intro
                        if (document.querySelectorAll('[data-uia="player-skip-intro"]').length && settings['settings-skip'] == 'true') {
                            document.querySelectorAll('[data-uia="player-skip-intro"]')[0].click();
                            console.log('click player-skip-intro');
                        } 

                        // go to next episode without waiting
                        if (document.querySelectorAll('[data-uia="next-episode-seamless-button-draining"]').length && settings['settings-next'] == 'true') {
                            document.querySelectorAll('[data-uia="next-episode-seamless-button-draining"]')[0].click();
                            console.log('click next-episode-seamless-button');
                        }

                        // skip recap
                        if (document.querySelectorAll('[data-uia="player-skip-preplay"]').length && settings['settings-recap'] == 'true') {
                            document.querySelectorAll('[data-uia="player-skip-preplay"]')[0].click();
                            console.log('click player-skip-preplay');
                        }
                    }
                );
            }
        }, 100);
    }
}


var checkExist = setInterval(function () {
    var tempUrl = window.location.pathname;
    
    if (!document.querySelector('video')) {
        return;
    }

    if (currentVideo != tempUrl || !document.querySelector('video').hasAttribute('timeupdate')) {
        currentVideo = tempUrl;
        launchBingeWatchPRO(currentVideo);
        return;
    }
}, 1000);