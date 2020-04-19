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
}

function displayTime(currentTime, videoLength) {
    var width = Math.floor(currentTime / videoLength * 100);
    document.getElementById("timeBar").style.width = width + "%";
    document.getElementById("timeDisplay").innerHTML = formatTime(currentTime) + ' / ' + formatTime(videoLength);
}

var settings = {};
chrome.storage.sync.get(null, function(items) {
    for (var item in items) {
        settings[item] = items[item];
    }
});
console.log(settings);

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        settings[key] = changes[key].newValue;
        console.log(settings);
    }
});

// https://stackoverflow.com/questions/41985502/how-to-interact-with-netflix-cadmium-video-player-on-the-client
var url = window.location.pathname.split("/");

if (url[1] == "watch") {
    var videoId = url[2];
    var checkExist = setInterval(function() {
        if (document.evaluate('//*[@id="' + videoId + '"]/video', document).iterateNext() !== null) {
            clearInterval(checkExist);
            createWorkingArea();
            var video = document.evaluate('//*[@id="' + videoId + '"]/video', document).iterateNext();

            video.addEventListener("timeupdate",
                function(e) {
                    displayTime(video.currentTime, video.duration);
                    if (document.getElementsByClassName("skip-credits").length && settings['settings-skip'] == 'true') {
                        document.getElementsByClassName("nf-icon-button nf-flat-button nf-flat-button-uppercase no-icon")[0].click();
                    }
                    if (document.getElementsByClassName("main-hitzone-element-container").length && settings['settings-next'] == 'true') {
                        document.getElementsByClassName("button-nfplayerNextEpisode")[0].click();
                    }
                }
            );
        }
    }, 100); // check every 100ms
}