var settings = {};
var url = null;
var semaphore = 0;

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

function createWorkingArea() {
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

    document.getElementsByClassName('AkiraPlayer')[0].appendChild(containerDiv);

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
    url = url.split("/");

    if (url[1] == "watch") {
        var videoId = url[2];
        var checkExist = setInterval(function () {
            if (document.evaluate('//*[@id="' + videoId + '"]/video', document).iterateNext() !== null) {
                clearInterval(checkExist);
                createWorkingArea();
                var video = document.evaluate('//*[@id="' + videoId + '"]/video', document).iterateNext();

                video.addEventListener("timeupdate",
                    function (e) {
                        displayTime(video.currentTime, video.duration);
                        if (document.getElementsByClassName("skip-credits").length && settings['settings-skip'] == 'true' && !semaphore) {
                            document.getElementsByClassName("nf-icon-button nf-flat-button nf-flat-button-uppercase no-icon")[0].click();
                            var semaphore = 1;
                        } else if (document.getElementsByClassName("main-hitzone-element-container").length && settings['settings-next'] == 'true' && !semaphore) {
                            document.getElementsByClassName("button-nfplayerNextEpisode")[0].click();
                            var semaphore = 1;
                        } else if (document.getElementsByClassName("recap-lower").length && settings['settings-recap'] == 'true' && !semaphore) {
                            document.getElementsByClassName("nf-icon-button nf-flat-button nf-flat-button-uppercase no-icon")[0].click();
                            var semaphore = 1;
                        } else {
                            var semaphore = 0;
                        }
                    }
                );
            }
        }, 100);
    }
}


// TODO: .VideoContainer div video - sprawdzanie czy istnieje? nf-big-play-pause nf-big-play-pause-secondary play button click
var checkExist = setInterval(function () {
    var tempUrl = window.location.pathname;
    if (url != tempUrl) {
        url = tempUrl;
        launchBingeWatchPRO(url);
    }

}, 1000);