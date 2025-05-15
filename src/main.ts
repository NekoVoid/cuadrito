import { millisToMinutes } from "./utils";
import { Player } from "./shared";
import { createGame, drawBoard, drawEdge, drawGame, hoverEdgeIndex } from "./game";
import { Vec2 } from "./Linear";

interface PlayerBoard{
    nameSpan: HTMLSpanElement;
    scoreSpan: HTMLSpanElement;
    timeSpan: HTMLSpanElement;
}

const players: Player[] = [
    {
        color: "#FF0000",
        name: "Player 1",
        bot: false,
        time: 0,
        score: 0
    },
    {
        color: "#0000FF",
        name: "Player 2",
        bot: false,
        time: 0,
        score: 0
    },
]
const playerBoards: PlayerBoard[] = []

function createAddPlayerBoard(player: Player, board: HTMLDivElement): PlayerBoard{
    /*
    <span>| <span style="color: red;">player 1</span>      |</span>
    <span>| score: 12     |</span>
    <span>| time: 1:25.25 |</span>
    */
   
   const playerTab = document.createElement("span");
   const playerName = document.createElement("span");
   
   playerTab.appendChild(document.createTextNode("| "));
   playerTab.appendChild(playerName);
   playerTab.appendChild(document.createTextNode(" |"));
   playerName.style.color = player.color;
   
   playerName.textContent = player.name;
   
   const playerScore = document.createElement("span");
   playerScore.textContent = `| score: ${player.score} |`;
   const playerTime = document.createElement("span");
   playerTime.textContent = `| time: ${millisToMinutes(player.time, {millisDigits: 2, minuteDigits: 2})} |`;
   
   board.appendChild(playerTab);
   board.appendChild(playerScore);
   board.appendChild(playerTime);
   
   return {
       nameSpan:playerName,
       scoreSpan:playerScore,
       timeSpan:playerTime
    };
}
function updatePlayerBoard(player: Player, board: PlayerBoard){
    board.nameSpan.textContent = player.name;
    board.scoreSpan.textContent = `| score: ${player.score} |`;
    board.timeSpan.textContent = `| time: ${millisToMinutes(player.time, {millisDigits: 2,  minuteDigits: 2})} |`;
}
function updatePlayerTime(playerIndex: number, time: number){
    players[playerIndex].time = time;
    playerBoards[playerIndex].timeSpan.textContent = `| time: ${millisToMinutes(players[playerIndex].time, {millisDigits: 2, minuteDigits: 2})} |`;
}
function updatePlayerScore(playerIndex: number, score: number){
    players[playerIndex].score = score;
    playerBoards[playerIndex].scoreSpan.textContent = `| score: ${players[playerIndex].score} |`;
}

const intro = document.querySelector<HTMLDivElement>("#intro")!;
const gameScreen = document.querySelector<HTMLDivElement>("#game_screen")!;
const form = document.querySelector<HTMLFormElement>("#start_form")!;

const boardsDiv = document.querySelectorAll<HTMLDivElement>(".p_board");

const canvas = document.querySelector<HTMLCanvasElement>("#game_canvas")!;

canvas.width = canvas.clientWidth;
canvas.height = canvas.clientWidth;

const ctx = canvas.getContext("2d");
if(!ctx){
    alert("Canvas context not found");
    throw new Error("Canvas context not found")
};

let gameSize = 5;
let winRect = {
        width: canvas.width,
        height: canvas.height
    };
let game = createGame(gameSize, winRect);
gameSize = game.board.length;

let drawData = {
    players: players,
    size: gameSize,
    ctx: ctx,
    winRect: winRect,
    prevHover: -1
};

game.edges[0].owner = -1;
game.board[0][0] = 0;

function DrawLoop(time: DOMHighResTimeStamp){
    if(drawData.ctx){
        drawGame(game, drawData);
    }

    // requestAnimationFrame(DrawLoop);
}

form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const formData = new FormData(ev.currentTarget as (HTMLFormElement | undefined) );
    
    players[0].name = (formData.get("p1_name") as string) ?? players[0].name;
    players[0].color = (formData.get("p1_color") as string) ?? players[0].color;
    players[0].bot = (Boolean(formData.get("p1_bot"))) ?? players[0].bot;
    
    players[1].name = (formData.get("p2_name") as string) ?? players[1].name;
    players[1].color = (formData.get("p2_color") as string) ?? players[1].color;
    players[1].bot = (Boolean(formData.get("p2_bot"))) ?? players[1].bot;
    
    playerBoards.push(createAddPlayerBoard(players[0], boardsDiv[0]));
    playerBoards.push(createAddPlayerBoard(players[1], boardsDiv[1]));

    
    intro.style.display = "none";
    gameScreen.style.display = "";
    
})

canvas.addEventListener("mousemove", (ev) => {
    const mousePos: Vec2 = [ev.offsetX, ev.offsetY];
    //TODO: MAKE UPDATING NOT NEED DRAWGAME TO PAINT CORRECTLY, OR NOT
    //drawGame(game, drawData);

    ctx.fillStyle = "red";
    ctx.fillRect(mousePos[0]-3, mousePos[1]-3, 6, 6);

    const edgeHover = hoverEdgeIndex(game.edgesClickBoxes, mousePos);
    if(edgeHover >= 0){
        if(edgeHover != drawData.prevHover){
            if(drawData.prevHover >= 0)drawEdge(game.edges[drawData.prevHover], drawData);
            drawEdge(game.edges[edgeHover], drawData, {type:"hover", player:0});
        }
    }else if(drawData.prevHover >= 0){
        drawEdge(game.edges[drawData.prevHover], drawData);
    }
    
    drawData.prevHover = edgeHover;
});

drawData.winRect.width = canvas.width;
drawData.winRect.height = canvas.height;

if(drawData.ctx)
    drawGame(game, drawData);

