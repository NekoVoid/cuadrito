import config from "./config.json"
const { colors } = config;

import { addVec2 } from "./Linear";
import { Player } from "./shared";

interface Edge{
  cells: number[][];
  owner: number;
}

interface Game{
  board: number[][];
  edges: Edge[];
}

interface DrawData{
  players: Player[];
  size: number;
  ctx: CanvasRenderingContext2D;
  winRect: {width: number, height: number};
}

interface DrawEvent{
  type: string;
  player: number;
}

function createGame(size:number): Game{
  size = Math.max(3, size);
  //creates size x size board filled with 0
  const board: number[][] = Array.from({length: size}, () => Array.from({length: size}, () => 0));
  const edges: Edge[] = [];

  for(let i = 0; i < size; i++){
    board[i][0] += 1;
    board[i][size-1] += 1;
    board[0][i] += 1;
    board[size-1][i] += 1;
  }

  for(let i = 0; i < size; i++){
    for(let j = 0; j < size-1; j++){
      edges.push({
        cells: [[i,j],[i,j+1]],
        owner: -1
      });
      edges.push({
        cells: [[j,i],[j+1,i]],
        owner: -1
      });
    }
  }

  return { board, edges };
}

function getCellPosition(cellIndex: number[], cellSize: number){
  const y = cellIndex[0] * cellSize;
  const x = cellIndex[1] * cellSize;
  return [x, y];
}

function drawEdge(edge: Edge, drawData: DrawData, hover?: DrawEvent){
  const hovered = (hover && hover.type === "hover");
  const { players, size, ctx, winRect } = drawData;
  const cellSize = winRect.width / size;

  const lineSlim = winRect.width / 150;
  const lineThick = winRect.width / 110;

  if(edge.owner === -1){
    ctx.strokeStyle = (hovered)? (players[hover.player].color + colors.game.edgeMask): colors.game.edge;
    ctx.lineWidth = (hovered)? lineThick : lineSlim;
  }else{
    ctx.strokeStyle = players[edge.owner].color;
    ctx.lineWidth = lineThick;
  }

  if(edge.cells[0][0] === edge.cells[1][0]){
    //vertical edge
    const A = getCellPosition(edge.cells[1], cellSize);
    const B = addVec2(A, [0, cellSize - winRect.width/120]);
    
    ctx.beginPath();
    ctx.moveTo(A[0], A[1] + winRect.width/120);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.closePath();
  }else{
    //horizontal edge
    const A = getCellPosition(edge.cells[1], cellSize);
    const B = addVec2(A, [cellSize - winRect.width/120, 0]);

    ctx.beginPath();
    ctx.moveTo(A[0] + winRect.width/120, A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.closePath();
  }

}

function drawBoard(board: number[][], drawData: DrawData){
  const { players, size, ctx, winRect } = drawData;
  const cellSize = winRect.width / size;

  const offset = winRect.width / 100;

  for(let i = 0; i < size; i++){
    for(let j = 0; j < size; j++){
      const cellPos = addVec2(getCellPosition([i,j], cellSize), [offset, offset]);
      if(board[i][j] >= 4)
        ctx.fillStyle = players[board[i][j] - 4].color;
      else
        ctx.fillStyle = colors.game.cell;
      ctx.beginPath();
      ctx.roundRect(cellPos[0], cellPos[1], cellSize - offset*2, cellSize - offset*2, winRect.width/120);
      ctx.fill();
    }
  }
}

function drawGame(game: Game, drawData: DrawData){
  drawData.ctx.fillStyle = colors.game.background;
  drawData.ctx.fillRect(0, 0, drawData.winRect.width, drawData.winRect.height);
  drawData.ctx.lineCap = "round";

  for(const edge of game.edges){
    drawEdge(edge, drawData);
  }
  drawBoard(game.board, drawData);
}

// function hover

export {
  createGame,
  drawEdge,
  drawBoard,
  drawGame,
  getCellPosition
}