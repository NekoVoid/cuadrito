const intro = document.querySelector<HTMLDivElement>("#intro")!;
const gameScreen = document.querySelector<HTMLDivElement>("#game_screen")!;
const form = document.querySelector<HTMLFormElement>("#start_form")!;

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
    const formData = new FormData(ev.currentTarget as (HTMLFormElement | undefined) );

    players[0].name = (formData.get("p1_name") as string) ?? players[0].name;

    alert(players[0].name)

    intro.style.display = "none";
    gameScreen.style.display = "";
})
