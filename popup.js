'use strict';

window.addEventListener('change', function(e) {
    var type = e.target.type;

    if (type == 'checkbox') {
        var name = e.target.id;

        if (name.includes("settings")) {
            var state = e.target.checked.toString();
            localStorage.setItem(name, state);
        }
    }
});

window.addEventListener("load", function() {
    for (var a in localStorage) {
        if (a.includes("settings")) {
            var state = (localStorage[a] == "true") ? true : false;
            document.getElementById(a).checked = state;
        }
    }
});