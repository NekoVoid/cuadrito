const intro = document.getElementById("intro");
const gameScreen = document.getElementById("game_screen");
const form = document.getElementById("start_form");

const players = [
    {
        color: "#FF0000",
        name: "Player 1",
        bot: false
    },
    {
        color: "#0000FF",
        name: "Player 2",
        bot: false
    },
]

form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget);

    players[0] = formData.get("p1_name") ?? players[0].name;

    intro.style.display = "none";
    gameScreen.style.display = "";
})
