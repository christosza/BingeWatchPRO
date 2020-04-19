'use strict';

window.addEventListener('change', function(e) {
    var type = e.target.type;

    if (type == 'checkbox') {
        var name = e.target.id;

        if (name.includes("settings")) {
            var state = e.target.checked.toString();
            var setting = {};
            setting[name] = state;
            chrome.storage.sync.set(setting);
        }
    }
});

window.addEventListener("load", function() {
    chrome.storage.sync.get(null, function(items) {
        for (var item in items) {
            if (item.includes("settings")) {
                var state = (items[item] == "true") ? true : false;
                document.getElementById(item).checked = state;
            }
        }
    });
});