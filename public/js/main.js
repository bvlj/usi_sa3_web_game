
const play_button = document.querySelector("div[id=menu_enter] button");

// popup
const info = document.getElementById("menu_info");
const rules = document.getElementById("menu_rules");
const menu_enter = document.getElementById("menu_enter");
let playback = false;

//buttons
const btn_info = document.getElementById("info");
const btn_rules = document.getElementById("rules");
const btn_back = document.querySelectorAll(".back");
const input_name = document.getElementById("username");

var start_audio = function(e) {
    if (!playback) {
        menu_enter.querySelector("div audio").play();
        playback = true;
    }
}

btn_back.forEach((el) => {
    el.addEventListener('click', () => {
        document.querySelectorAll(".menu_enter").forEach((el) => {
            if (el.id != "menu_enter" ) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    });
});

let socket = undefined;

let angle = 0;
let inGame = false;

window.onload = () => {
    //main page
    this.addEventListener("mousemove", start_audio);
    moveCursorToEnd(input_name);
    menu_enter.querySelector("div input").onkeyup = () => {
        angle += 45;
        document.getElementById("logo_input").style.transform = "rotate("+angle+"deg)";
    };

    btn_info.onclick = () => {
        document.querySelectorAll(".menu_enter").forEach((el) => {
            if (el.id != "menu_info" ) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    };

    btn_rules.onclick = () => {
        document.querySelectorAll(".menu_enter").forEach((el) => {
            if (el.id != "menu_rules" ) {
                el.classList.add("hidden");
            } else {
                el.classList.remove("hidden");
            }
        });
    };


    //init game
    play_button.addEventListener('click', startGame);
    input_name.addEventListener('keypress', startGame);
}

//pos starting cursor
function moveCursorToEnd(el) {
    if (localStorage.getItem('user_name') != undefined) {
        input_name.value = localStorage.getItem('user_name');
    } else {
        input_name.value = "Ajax";
    }

    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function startGame(e) {
    if (e.code == "Enter" || e.code ==  undefined) {
        let name = input_name.value;
        let bg = document.querySelector(".hero");
        let user_name = "Ajax";

        if (name != "" && /\S/.test(name)) {
            user_name = name;
        }

        document.getElementById("usname").innerHTML = "@" + user_name;
        menu_enter.parentNode.removeChild(menu_enter);
        document.getElementById("stats").classList.toggle("hidden");
        document.getElementById("more").addEventListener('click', () => {
            document.getElementById("more").classList.toggle("hidden");
            document.getElementById("less").classList.toggle("hidden");
        });

        document.getElementById("less").addEventListener('click', () => {
            document.getElementById("less").classList.toggle("hidden");
            document.getElementById("more").classList.toggle("hidden");
        });

        bg.parentNode.removeChild(bg);

        // document.getElementById("audiogame").innerHTML = "<source src='media/audio_game.mp3' type='audio/mpeg'>";
        // console.log(document.getElementById("audiogame").innerHTML);
        document.getElementById("audio_game").play();

        init(user_name);
    }
}

function init(name) {
    // Create canvas app
    const app = new App({ canvas: 'canvas', 
                          inputs: { cell: 'cell', spike: 'spike', shield: 'shield', bounce: 'bounce' },
                          info: {cell: 'info_cells', spike: 'info_spikes', shield: 'info_shields', time: 'info_time' },
                          time: new Date() });

    //initialize socket
    socket = io();

    if (!inGame) {
        app.enableInput();
        inGame = true;
    } else {
        app.disableInput();
        inGame = false;
    }

    // set name
    app.setName(name);

    socket.on('playerColors', function (msg) {
        app.playerColors = msg;
    });

    socket.on('message', function(msg){
        //console.log(msg);
    });

    socket.on('drawWorld', function(data) {
        //console.log(data);
        app.drawMap(data);
    });
}
