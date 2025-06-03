import config from "./config.json"
const { colors } = config;

import { addVec2, Vec2 } from "./Linear";
import { Player } from "./shared";

interface Edge{
  cells: number[][];
  owner: number;
}

interface EdgesClickBox{
  topL: Vec2;
  botR: Vec2;
}

interface Game{
  board: number[][];
  edges: Edge[];
  edgesClickBoxes: EdgesClickBox[];
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

function getCellPosition(cellIndex: number[], cellSize: number): Vec2 {
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

    //alert("vertical:\n" + 
    //  "[" + cellPos + "]"  + "[" + toClickBoxSpace(cellPos) + "]"  + "[" + fromClickBoxSpace(toClickBoxSpace(cellPos)) + "]\n"+
    //  "[" + cellSpan + "]" + "[" + toClickBoxSpace(cellSpan) + "]" + "[" + fromClickBoxSpace(toClickBoxSpace(cellSpan)) + "]\n"+
    //  "[" + left + "]"     + "[" + toClickBoxSpace(left) + "]"     + "[" + fromClickBoxSpace(toClickBoxSpace(left)) + "]\n"+
    //  "[" + right + "]"    + "[" + toClickBoxSpace(right) + "]"    + "[" + fromClickBoxSpace(toClickBoxSpace(right)) + "]\n"
    //);
  }else{
    let top : Vec2 = [cellPos[0] + half, cellPos[1] - half];
    let bot: Vec2 = [cellPos[0] + half, cellPos[1] + half];

    return {topL: toClickBoxSpace(top),  botR: toClickBoxSpace(bot)};

    //alert("horizontal:\n" + 
    //  "[" + cellPos + "]"  + "[" + toClickBoxSpace(cellPos) + "]"  + "[" + fromClickBoxSpace(toClickBoxSpace(cellPos)) + "]\n"+
    //  "[" + cellSpan + "]" + "[" + toClickBoxSpace(cellSpan) + "]" + "[" + fromClickBoxSpace(toClickBoxSpace(cellSpan)) + "]\n"+
    //  "[" + top + "]"     + "[" + toClickBoxSpace(top) + "]"     + "[" + fromClickBoxSpace(toClickBoxSpace(top)) + "]\n"+
    //  "[" + bot + "]"    + "[" + toClickBoxSpace(bot) + "]"    + "[" + fromClickBoxSpace(toClickBoxSpace(bot)) + "]\n"
    //);
  }
  return {botR:[0,0], topL:[0,0]};
}

function createGame(size:number, winRect: {width:number, height:number}): Game{
  size = Math.max(3, size);
  //creates size x size board filled with 0
  const board: number[][] = Array.from({length: size}, () => Array.from({length: size}, () => 0));
  const edges: Edge[] = [];
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
      edges.push({
        cells: [[i,j],[i,j+1]],
        owner: -1
      });
      edgesClickBoxes.push(
        getTransformedClickBox(
          getCellPosition(edges[edges.length -1].cells[1], cellSize),
          cellSize, true
        )
      );
      // Horizontal Edges
      edges.push({
        cells: [[j,i],[j+1,i]],
        owner: -1
      });
      edgesClickBoxes.push(
        getTransformedClickBox(
          getCellPosition(edges[edges.length -1].cells[1], cellSize),
          cellSize, false
        )
      );
    }
  }

  return { board, edges, edgesClickBoxes };
}

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

function drawEdge(edge: Edge, drawData: DrawData, hover?: DrawEvent){
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

  if(edge.owner === -1){
    lineStyle = (hovered)? (players[hover.player].color + colors.game.edgeMask): colors.game.edge;
    lineWidth = (hovered)? lineThick : lineSlim;
    ctx.strokeStyle = hovered? colors.game.edge: colors.game.background;
    ctx.lineWidth = lineThick + (hovered? 0: 2); 
  }else{
    lineStyle = players[edge.owner].color;
    lineWidth = lineMid;
  }

  if(edge.cells[0][0] === edge.cells[1][0]){
    //vertical edge
    const A = getCellPosition(edge.cells[1], cellSize);
    const B = addVec2(A, [0, cellSize - winRect.width/120]);

    drawEdgeLine([A[0], A[1] + winRect.width/120], B, lineStyle, lineWidth, ctx);
  }else{
    //horizontal edge
    const A = getCellPosition(edge.cells[1], cellSize);
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

  for(const edge of game.edges){
    drawEdge(edge, drawData);
  }
  drawBoard(game.board, drawData);
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

function EdgePlayed(EdgeIndex: number, game: Game, player: number){
  return undefined;
}

export {
  createGame,
  drawEdge,
  drawBoard,
  drawGame,
  getCellPosition,
  hoverEdgeIndex
}