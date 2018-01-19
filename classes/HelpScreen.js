function HelpScreen() {
    window.addEventListener("keydown", function (e) {
        var code = e.which;
        if (code == 72) {
            $("#help").css("display", "block");
        }
    })
    window.addEventListener("keyup", function (e) {
        var code = e.which;
        if (code == 72) {
            $("#help").css("display", "none");
        }
    })
}