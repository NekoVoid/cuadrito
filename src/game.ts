import config from "./config.json"
const { colors } = config;

import { addVec2, Vec2 } from "./Linear";
import { Player } from "./shared";

interface EdgesClickBox{
  topL: Vec2;
  botR: Vec2;
}

interface Game{
  board: number[][];
  edges: number[];
  edgesClickBoxes: EdgesClickBox[];
  relations: GameRelations;
}

interface GameRelations{
  cells: number[][][];
  edges : ([Vec2, Vec2])[]
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

/*
* Game utilities
*/

function getCellPosition(cellIndex: Vec2, cellSize: number): Vec2 {
  const y = cellIndex[0] * cellSize;
  const x = cellIndex[1] * cellSize;
  return [x, y];
}

function toClickBoxSpace(a: Vec2): Vec2{
  return [a[0]+a[1], a[1]-a[0]];
}
function fromClickBoxSpace(a: Vec2): Vec2{
  return  [(a[0]-a[1])/2, (a[0]+a[1])/2];
}

function getTransformedClickBox(cellPos: Vec2, cellSize: number, vertical: boolean): EdgesClickBox{
  const half = cellSize/2;
  
  if(vertical){
    const cellSpan = addVec2(cellPos, vertical? [0, cellSize]:[cellSize, 0]);
    
    return {topL: toClickBoxSpace(cellPos),  botR: toClickBoxSpace(cellSpan)};
  }else{
    let top : Vec2 = [cellPos[0] + half, cellPos[1] - half];
    let bot: Vec2 = [cellPos[0] + half, cellPos[1] + half];
    
    return {topL: toClickBoxSpace(top),  botR: toClickBoxSpace(bot)};
  }
}

function verticalEdge(cell: Vec2, n: number){
  return 2*(cell[1] + cell[0]*(n-1));
}
function horizontalEdge(cell: Vec2, n: number){
  return 2*(cell[0] + cell[1]*(n - 1)) + 1;
}




/*
* Game Setup
*/

function createGame(size:number, winRect: {width:number, height:number}): Game{
  size = Math.max(3, size);
  //creates size x size board filled with 0
  const board: number[][] = Array.from({length: size}, () => Array.from({length: size}, () => 0));
  const edges: number[] = Array.from({length: (2*size*(size - 1))}, () => -1);;
  const relations: GameRelations = {
    cells: Array.from({length: size}, () => Array.from({length: size}, () => [])),
    edges: []
  }
  const edgesClickBoxes: EdgesClickBox[] = [];

  for(let i = 0; i < size; i++){
    board[i][0] += 1;
    board[i][size-1] += 1;
    board[0][i] += 1;
    board[size-1][i] += 1;
  }

  const cellSize = winRect.width / size;
  for(let i = 0; i < size; i++){
    for(let j = 0; j < size-1; j++){
      // Vertical Edges
      {
        const cells: [Vec2, Vec2] = [[i,j],[i,j+1]];
        relations.edges.push(cells);
        relations.cells[cells[0][0]][cells[0][1]].push(relations.edges.length - 1);
        relations.cells[cells[1][0]][cells[1][1]].push(relations.edges.length - 1);

        edgesClickBoxes.push(
          getTransformedClickBox(
            getCellPosition(cells[1], cellSize),
            cellSize, true
          )
        );
      }

      // Horizontal Edges
      {
        const cells: [Vec2, Vec2] = [[j,i],[j+1,i]];
        relations.edges.push(cells);
        relations.cells[cells[0][0]][cells[0][1]].push(relations.edges.length - 1);
        relations.cells[cells[1][0]][cells[1][1]].push(relations.edges.length - 1);

        edgesClickBoxes.push(
          getTransformedClickBox(
            getCellPosition(cells[1], cellSize),
            cellSize, false
          )
        );
      }
    }
  }

  return { board, edges, edgesClickBoxes, relations };
}




/*
* Game Drawing
*/

function drawEdgeLine(A: Vec2, B: Vec2, lStyle: string, lWidth: number, ctx: CanvasRenderingContext2D){
  ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.closePath();

    ctx.strokeStyle = lStyle;
    ctx.lineWidth = lWidth;
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.stroke();
    ctx.closePath();
}

function drawEdge(game: Game, edgeId: number, drawData: DrawData, hover?: DrawEvent){
  const hovered = (hover && hover.type === "hover");
  const { players, size, ctx, winRect } = drawData;
  const cellSize = winRect.width / size;

  const lineSlim = winRect.width / 150;
  const lineThick = winRect.width / 90;
  const lineMid = winRect.width / 110;

  let lineStyle = colors.game.edge;
  let lineWidth = lineThick;
  ctx.strokeStyle = colors.game.background;
  ctx.lineWidth = lineThick;

  if(game.edges[edgeId] === -1){
    lineStyle = (hovered)? (players[hover.player].color + colors.game.edgeMask): colors.game.edge;
    lineWidth = (hovered)? lineThick : lineSlim;
    ctx.strokeStyle = hovered? colors.game.edge: colors.game.background;
    ctx.lineWidth = lineThick + (hovered? 0: 2); 
  }else{
    lineStyle = players[game.edges[edgeId]].color;
    lineWidth = lineMid;
  }

  if(game.relations.edges[edgeId][0][0] === game.relations.edges[edgeId][1][0]){
    //vertical edge
    const A = getCellPosition(game.relations.edges[edgeId][1], cellSize);
    const B = addVec2(A, [0, cellSize - winRect.width/120]);

    drawEdgeLine([A[0], A[1] + winRect.width/120], B, lineStyle, lineWidth, ctx);
  }else{
    //horizontal edge
    const A = getCellPosition(game.relations.edges[edgeId][1], cellSize);
    const B = addVec2(A, [cellSize - winRect.width/120, 0]);

    drawEdgeLine([A[0] + winRect.width/120, A[1]], B, lineStyle, lineWidth, ctx);
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

  drawBoard(game.board, drawData);

  
  for(let i = 0; i < game.edges.length; i++){
    drawEdge(game, i, drawData);

    // const sizeclickBox = game.edgesClickBoxes[i].botR[0] - game.edgesClickBoxes[i].topL[0];

    // const edgePoint = fromClickBoxSpace(addVec2(game.edgesClickBoxes[i].topL, [sizeclickBox/2, sizeclickBox/2]));
    // drawData.ctx.fillStyle = "black";
    // drawData.ctx.font = `bold ${drawData.winRect.width/35}px serif`;
    // drawData.ctx.fillText(i.toString(), edgePoint[0], edgePoint[1]);
  }
}

function hoverEdgeIndex(clickBoxes: EdgesClickBox[], mousePos: Vec2){
  const mouseClickBox = toClickBoxSpace(mousePos);
  for(let i = 0; i < clickBoxes.length; i++){
    const clickBox = clickBoxes[i];
    if(
      mouseClickBox[0] > clickBox.topL[0] && mouseClickBox[1] > clickBox.topL[1] &&
      mouseClickBox[0] < clickBox.botR[0] && mouseClickBox[1] < clickBox.botR[1]
    )
      return i;
  }
  return -1;
}

/*
* Game Logic
*/

function updateEdges(game: Game, cell: Vec2, player: number){
  for(let edgeId of game.relations.cells[cell[0]][cell[1]]){
    if(game.edges[edgeId] == -1){
      game.edges[edgeId] = player;

      for(let cell of game.relations.edges[edgeId]){

        if(game.board[cell[0]][cell[1]] < 4){
          ++game.board[cell[0]][cell[1]];

          if(game.board[cell[0]][cell[1]] == 4)
            game.board[cell[0]][cell[1]] += player;

        }

      }

      break;
    }
  }
}

function fillBoardstarter(game: Game, cell: Vec2, player: number){
  const cells: Vec2[] = [
    [cell[0] + 1, cell[1]],
    [cell[0] - 1, cell[1]],
    [cell[0], cell[1] + 1],
    [cell[0], cell[1] - 1]
  ];

  for(let floodCell of cells){
    if(
      floodCell[0] >= 0 && floodCell[0] < game.board.length &&
      floodCell[1] >= 0 && floodCell[1] < game.board.length
    ){
      fillBoardCell(game, floodCell, player);
    }
  }
}

function fillBoardCell(game: Game, cell: Vec2, player: number) {
  const edges = game.board[cell[0]][cell[1]];
  if(edges >= 4) return;

  if(edges < 4 && edges > 2){
    game.board[cell[0]][cell[1]] += player + 1;
    updateEdges(game, cell, player);
    
    fillBoardstarter(game, cell, player);
  }
}

function EdgePlayed(EdgeIndex: number, game: Game, player: number){
  if(game.edges[EdgeIndex] !== -1) return; 

  game.edges[EdgeIndex] = player;

  const cells = game.relations.edges[EdgeIndex];
  let starter: Vec2 | null = null;
  for(let cell of cells){
    game.board[cell[0]][cell[1]]++;
    if(game.board[cell[0]][cell[1]] == 4){
      game.board[cell[0]][cell[1]] += player;
      starter = cell;
    }
  }

  if(starter){
    fillBoardstarter(game, starter, player);
  }
}

export {
  createGame,
  drawEdge,
  drawBoard,
  drawGame,
  getCellPosition,
  hoverEdgeIndex,
  EdgePlayed
}




