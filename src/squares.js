/*
Fecha de entrega: 1 nov 2023, 9:00
Desarrollar un agente que juegue cuadrito. Tiene límite de tiempo:
 1. Aquí encuentran el código del ambiente
 2. Su agente debe heredar de la clase Agent y debe sobreescribir el método compute
 3. El método de iniciar el agente recibe tres argumentos: 
    - El color con que está jugando
    - El tablero inicial del cual puede obtener el tamaño (siempre cuadrado)
    - El tiempo total de juego en milisegundos
 4. El método compute recibe dos argumentos:
    - El tablero como va 
    - El tiempo que le queda a su agente en milisegundos
 5. El método compute debe retornar una lista con tres argumentos [fila, columna, lado]. El valor del lado
 es un número 0: arriba, 1: derecha, 2.abajo, 3:izquierda 
*/

/**
 * Abstarct agent class
 */
class Agent{
    /**
     * Creates an agent
     */
    constructor(){}
    
    /**
     * Initializes the agent
     * @param color Color of the agent pieces ('R':red or 'Y':yellow)
     * @param board Initial state of the board (empty, useful for obtaaining the size (nxn))
     * @param time Total amount of time the agent has for playing all the game (milliseconds)
     */
    init(color, board, time=20000){
        this.color = color
        this.time = time
        this.size = board.length
    }

    /**
     * Determines the next play of the agent
     * @param board Current square configuration
     * @param time Remaining time the agent has for playing all the game (milliseconds)
     * @return A list with three values [row, column, side]. Parameter size can take one of the following values: 
               0 is up, 1 is right, 2 is bottom, 3 is left  
     */
    compute( board, time ){ return [0,0,0]; }
}

/*
 * A class for board operations (it is not the board but a set of operations over it)
 */
class Board{
    constructor(){}

    // Initializes a board of the given size. A board is a matrix of size*size of integers 0, .., 15, -1, or -2
    init(size){
    	var m = size-1
        var board = []
        board[0] = []
        board[0][0] = 9
        for(var j=1; j<m; j++){
            board[0][j] = 1
        }
        board[0][m] = 3
	
        for(var i=1; i<m; i++){
            board[i] = []
            board[i][0] = 8
            for(var j=1; j<m; j++){
                board[i][j] = 0
            }
	    board[i][m] = 2
        }
        
        board[m] = []
        board[m][0] = 12
        for(var j=1; j<m; j++){
            board[m][j] = 4
        }
        board[m][m] = 6

        return board
    }

    // Deep clone of a board the reduce risk of damaging the real board
    clone(board){
        var size = board.length
        var b = []
        for(var i=0; i<size; i++){
            b[i] = []
            for(var j=0; j<size; j++)
                b[i][j] = board[i][j]
        }
        return b
    }

    // Determines if a line can be drawn at row r, column c, side s 
    check(board, r, c, s){
        if(board[r][c] < 0) return false
        s = 1<<s
        return ((board[r][c] & s)!=s)
    }

    // Computes all the valid moves for the given 'color'
    valid_moves(board){
        var moves = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=0; s<4; s++)
                    if(this.check(board, i, j, s)) moves.push([i,j,s])
        return moves
    }
    
    fill(board, i, j, color){
        if(i<0 || i==board.length || j<0 || j==board.length) return board
    	
        if(board[i][j]==15 || board[i][j] == 14){
            board[i][j] = color
            if(i>0 && board[i-1][j]>=0){
                board[i-1][j] += 4
                this.fill(board,i-1,j,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j] == 13){
            board[i][j] = color
            if(j<board.length-1 && board[i][j+1]>=0){
                board[i][j+1] += 8
                this.fill(board,i,j+1,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==11){
            board[i][j] = color
            if(i<board.length-1 && board[i+1][j]>=0){
                board[i+1][j] += 1
                this.fill(board,i+1,j,color)
            }    
        }
        
        if(board[i][j]==15 || board[i][j]==7){
            board[i][j] = color
            if(j>0 && board[i][j-1]>=0){
                board[i][j-1] += 2
                this.fill(board,i,j-1,color)
            }    
        }
        return board
    }

    // Computes the new board when a piece of 'color' is set at row i, column j, side s. 
    // If it is an invalid movement stops the game and declares the other 'color' as winner
    move(board, i, j, s, color){
    	if(this.check(board, i, j, s)){
    	    var ocolor = (color==-2)?-1:-2
    	    board[i][j] |= 1<<s
    	    board = this.fill(board, i, j, ocolor)
    	    if(i>0 && s==0){
      	        board[i-1][j] |= 4
    	        board = this.fill(board, i-1, j, ocolor)
    	    }
    	    if(i<board.length-1 && s==2){
      	        if(board[i+1][j] >= 0) board[i+1][j] |= 1
    	        board = this.fill(board, i+1, j, ocolor)
    	    }
    	    if(j>0 && s==3){
      	        board[i][j-1] |= 2
    	        board = this.fill(board, i, j-1, ocolor)
    	    }
    	    
    	    if(j<board.length-1 && s==1){
      	        board[i][j+1] |= 8
    	        board = this.fill(board, i, j+1, ocolor)
    	    }
    	    return true 
    	}
    	return false
    }

    // Determines the winner of the game if available 'R': red, 'Y': yellow, ' ': none
    winner(board){
    	var cr = 0
    	var cy = 0
    	for(var i=0; i<board.length; i++)
    	  for(var j=0; j<board.length; j++)
    	  if(board[i][j]<0){
    	      if(board[i][j] == -1){ cr++ }else{ cy++ }
    	  }
    	if(cr+cy<board.length*board.length) return ' '
    	if(cr>cy) return 'R'
    	if(cy>cr) return 'Y'
        return ' '
    }

    // Draw the board on the canvas
    print(board){
        var size = board.length
        // Commands to be run (left as string to show them into the editor)
        var grid = []
        for(var i=0; i<size; i++){
            for(var j=0; j<size; j++){
                var commands = [{"command":"-"}]
                if(board[i][j] < 0){
                    if(board[i][j]==-1) commands.push({"command":"R"})
                    else commands.push({"command":"Y"})
                    commands.push({"command":"u"})
                    commands.push({"command":"r"})
                    commands.push({"command":"d"})
                    commands.push({"command":"l"})
                }else{
                    if((board[i][j]&1)==1) commands.push({"command":"u"})
                    if((board[i][j]&2)==2) commands.push({"command":"r"})
                    if((board[i][j]&4)==4) commands.push({"command":"d"})
                    if((board[i][j]&8)==8) commands.push({"command":"l"})
                }
                grid.push({"command":"translate", "y":i, "x":j, "commands":commands})
            }
        }

	var cmds = {"r":true,"x":1.0/size,"y":1.0/size,"command":"fit", "commands":grid}
        Konekti.client['canvas'].setText(cmds)
    }
}

/*
 * Player's Code (Must inherit from Agent: It is mandatory the inheritance process) 
 * This is an example of a rangom player agent
 *
 */
class RandomPlayer extends Agent{
    constructor(){ 
        super() 
        this.board = new Board()
    }

    compute(board, time){
        // Always cheks the current board status since opponent move can change several squares in the board
        var moves = this.board.valid_moves(board)
        // Randomly picks one available move
        var index = Math.floor(moves.length * Math.random())
        for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        for(var i=0; i<50000000; i++){} // Making it very slow to test time restriction
        return moves[index]
    }
}

/** @param {number} int  */
function ctrz(int){
    int >>>= 0;

    if(!int) return 32;

    int &= -int;
    return 31 - Math.clz32(int);
}

/**
 * @param {number} a
 * @param {number} b
 */
function GCD(a, b){
    if(a === 0) return b;
    if(b === 0) return a;

    let aZeros = ctrz(a);
    let bZeros = ctrz(b);

    let shift = aZeros > bZeros? bZeros: aZeros;

    a >>= aZeros;
    while(true){
        b >>=bZeros;

        let diff = b;

        diff -= a;
        bZeros = ctrz(diff);

        if(diff === 0) break;
        if(b < a) a = b;
        b = Math.abs(diff);
    }

    return a << shift;
}

function fact(n, stopValue = 2){
    if(stopValue < 2) stopValue = 2;
    let res = 1;
    for(let i = n; i >= stopValue; i--){
        res *= i;
    }
    return res;
}

class RandIndex{
    constructor(maxExclusive){
        this.max = maxExclusive;
        this.index = 0;
        this.value = Math.floor(Math.random() * maxExclusive);

        let coprimes = [2];
        for(let num = Math.floor(maxExclusive/2), i = 0; num < maxExclusive && i < 1000; num++, i++){
            if(GCD(num, maxExclusive) === 1){
                coprimes.push(num);
            }
        }

        this.coprime = coprimes[Math.floor(Math.random() * coprimes.length)];
    }

    hasNext(){
        return this.index < this.max
    }

    current(){
        return this.value;
    }

    next(){
        this.value += this.coprime;
        if(this.value >= this.max) this.value -= this.max;
        this.index++;

        return this.value;
    }
}

class PerformanceCheck{
    constructor(){
        this.clear();
    }

    startTimer(){
        this.started = true;
        this.start = performance.now();
    }

    endTimer() {
        this.end = performance.now();
        if(this.started){
            this.last = this.end - this.start;
            this.comp.push(this.last);
            this.count++;
        }
        this.started = false;
    }

    clear() {
        this.start = 0;
        this.end = 0;
        this.last = 0
        this.comp = [];
        this.count = 0;
        this.started = false;
    }

    getSum(){
        return this.comp.reduce((p,c) => p + c);
    }

    getAverage(){
        return this.comp.reduce((p,c) => p + c) / this.count;
    }

    getMedian(){
        return (this.comp.sort((a, b) => a - b))[Math.floor(this.comp.length/2)];
    }
}

class MyPlayer extends Agent{
    // red: -1, yellow: -2
    constructor(depth){ 
        super() 
        this.board = new Board()
        this.numColor = this.color === 'R'? -1: -2;   // el color en el maximizador es el jugador evaluando
        this.numOColor = this.color === 'R'? -2: -1;  // oposite color
        this.recieve = true;
        /** @type {number[][]} */
        this.turnBoard = null;

        this.firstPassPrev = -1;

        this.turnStart = Date.now();
        this.turnTime = 0;
        this.minimaxTimer = new PerformanceCheck();
    }

    trimmed_valid_moves(board){
        var moves = []
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=1; s<3; s++)
                    if(this.board.check(board, i, j, s)) moves.push([i,j,s])
        return moves
    }

    count_trimmed_valid_moves(board){
        var moves = 0
        var size = board.length
        for( var i=0; i<size; i++)
            for( var j=0; j<size; j++)
                for( var s=1; s<3; s++)
                    if(this.board.check(board, i, j, s)) moves++;
        return moves
    }

    randMove(board){
        let moves = this.trimmed_valid_moves(board)
        // Randomly picks one available move
        return moves[Math.floor(moves.length * Math.random())]
    }

    checkFillMove(board, i, j, s){
    	if(this.board.check(board, i, j, s)){
            let cell = board[i][j];
    	    cell |= 1<<s;

            if(cell == 7 || cell == 11 || cell == 13 || cell == 14){
                return true;
            }else{
                if(s === 1 && j < board.length - 1){
                    cell = board[i][j + 1];
                    cell |= 1<<3;
                    if(cell == 7 || cell == 11 || cell == 13 || cell == 14) return true;
                }else if(i < board.length - 1){
                    cell = board[i + 1][j];
                    cell |= 1;
                    if(cell == 7 || cell == 11 || cell == 13 || cell == 14) return true;
                }
            }
            
    	    return false;
    	}
    	return true;
    }

    /** @param {number[][]} board  */
    evaluate(board){
        let result = 0

        for(let i = 0; i < board.length; i++){
            for(let j = 0; j < board.length; j++){ //board is square
                if(Date.now() - this.turnStart >= (this.turnTime * 0.9)) return -Infinity;
                let cell = board[i][j];
                if(cell < 0 && cell !== this.turnBoard[i][j]){
                    if(cell === this.numColor) result++;
                    else result -= 1.1;
                }
            }
        }

        return result;
    }

    minimax(board, depth, maxPlayer = true,  alpha = -Infinity, beta = Infinity){

        if(depth === 0 || this.board.winner(board) !== " "){
            let result = this.evaluate(board);
            return [result, null];
        }

        let validMoves = this.trimmed_valid_moves(board);
        let indexGen = new RandIndex(validMoves.length);
        let finalMove = validMoves[0] ?? [-1,-1,-1];
        
        // let tree = []
        
        if(maxPlayer){
            let maxResult = -Infinity;

            while(indexGen.hasNext()){
                if(Date.now() - this.turnStart >= (this.turnTime * 0.9)) return [-Infinity, null];
                let move = validMoves[indexGen.next()];
                
                let newBoard = this.board.clone(board);
                
                this.board.move(newBoard, move[0], move[1], move[2], this.numColor) // el color en el maximizador es el jugador evaluando
                

                let [result, minMove] = this.minimax(newBoard, depth - 1, false, alpha, beta);
                

                if(result > maxResult){
                    maxResult = result;
                    finalMove = move;
                }

                alpha = (result > alpha)? result: alpha;

                if(beta <= alpha) break;
            }
            
            return [maxResult, finalMove]
        }else{
            
            let minResult = Infinity;

            while(indexGen.hasNext()){
                if(Date.now() - this.turnStart >= (this.turnTime * 0.9)) return [-Infinity, null];
                let move = validMoves[indexGen.next()];

                let newBoard = this.board.clone(board);
                this.board.move(newBoard, move[0], move[1], move[2], this.numOColor) // se voltean los colores para minimizador

                let [result, maxMove] = this.minimax(newBoard, depth - 1, true, alpha, beta);
                

                if(result < minResult){
                    minResult = result;
                    finalMove = move;
                }

                beta = (result < beta)? result: beta;

                if(beta <= alpha) break;
            }
            
            return [minResult, finalMove]
        }
    }



    compute(board, time){
        this.turnBoard = board;
        this.turnStart = Date.now();

        /** @type {number[] | null} */
        let move = null;
        /** @type {number | null} */
        let score = -Infinity;

        let boardTotalMoves = board.length * (board.length - 1) * 2;
        let validMoves = this.trimmed_valid_moves(board);
        let leftZeroMoves = 0

        let timeSlope = -0.09 * board.length + 2.9;
        if(timeSlope < 0.01) timeSlope = 0.01;

        this.turnTime = (isNaN(time))? 5000 :(timeSlope * time * validMoves.length / boardTotalMoves);

        for(let move of validMoves){   
            if(!this.checkFillMove(board, move[0], move[1], move[2])){

                leftZeroMoves++;
            }
        }

        let minZeroMoves = -0.0961538461538*boardTotalMoves + 22.3076923077;
        if(minZeroMoves < 2) minZeroMoves = 2;
        if(leftZeroMoves > minZeroMoves){
            let zeroMoves = Array(leftZeroMoves);
            let pushed = 0;
            for(let move of validMoves){
                if(!this.checkFillMove(board, move[0], move[1], move[2])){
                    zeroMoves[pushed] = move;
                    pushed++;
                }
            }

            move = zeroMoves[Math.floor(Math.random() * zeroMoves.length)];
        }else if(this.firstPassPrev < this.turnTime){
            let prevTime = 1;
            for(let i = 1; i <= validMoves.length; i++){
                let [newScore, newMove] = this.minimax(board, i);
                let ellapsed = Date.now() - this.turnStart;
                if(ellapsed < (this.turnTime * 0.9)){
                    score = newScore;
                    move = newMove;
                }else{
                    break;
                }
                console.log(i, score, this.color, this.turnTime, ellapsed);

                
                if(i > 1){
                    if((ellapsed*ellapsed/prevTime + (Date.now() - this.turnStart)) > this.turnTime) break;
                }else{
                    this.firstPassPrev = ellapsed;
                }
                prevTime = ellapsed;
                
            }
        }
        
        console.log(score, move, this.color, this.turnTime);

        if(!move) return validMoves[Math.floor(Math.random() * validMoves.length)];
        
        return move;
    }
}

/*
 * Environment (Cannot be modified or any of its attributes accesed directly)
 */
class Environment extends MainClient{
	constructor(){ 
        super()
        this.board = new Board()
    }

    setPlayers(players){ this.players = players }

	// Initializes the game 
	init(){ 
        var white = Konekti.vc('R').value // Name of competitor with red pieces
        console.log(white)
        var black = Konekti.vc('Y').value // Name of competitor with yellow pieces
        var time = 1000*parseInt(Konekti.vc('time').value) // Maximum playing time assigned to a competitor (milliseconds)
        var size = parseInt(Konekti.vc('size').value) // Size of the reversi board
        
        this.size = size
        this.rb = this.board.init(size)
        this.board.print(this.rb)
        var b1 = this.board.clone(this.rb)
        var b2 = this.board.clone(this.rb)

        this.white = white
        this.black = black
        this.ptime = {'R':time, 'Y':time}
        Konekti.vc('R_time').innerHTML = ''+time
        Konekti.vc('Y_time').innerHTML = ''+time
        this.player = 'R'
        this.winner = ''

        this.players[white].init('R', b1, time)
        this.players[black].init('Y', b2, time)
    }

    // Listen to play button 
	play(){ 
        var TIME = 10
        var x = this
        var board = x.board
        x.player = 'R'
        Konekti.vc('log').innerHTML = 'The winner is...'

        x.init()
        var start = -1

        function clock(){
            if(x.winner!='') return
            if(start==-1) setTimeout(clock,TIME)
            else{
                var end = Date.now()
                var ellapsed = end - start
                var remaining = x.ptime[x.player] - ellapsed
                Konekti.vc(x.player+'_time').innerHTML = remaining
                Konekti.vc((x.player=='R'?'Y':'R')+'_time').innerHTML = x.ptime[x.player=='R'?'Y':'R']
                
                if(remaining <= 0) x.winner = (x.player=='R'?x.black:x.white) + ' since ' + (x.player=='R'?x.white:x.black) + 'got time out'
                else setTimeout(clock,TIME) 
            }
        }
        
        function compute(){
            var w = x.player=='R'
            var id = w?x.white:x.black
            var nid = w?x.black:x.white
            var b = board.clone(x.rb)
            start = Date.now()
            var action = x.players[id].compute(b, x.ptime[x.player])
            var end = Date.now()
            var ply = (x.player=='R')?-1:-2
            var flag = board.move(x.rb, action[0], action[1], action[2], ply)
            if(!flag){
                x.winner = nid + ' ...Invalid move taken by ' + id + ' on column ' + action
            }else{
                var winner = board.winner(x.rb)
                if(winner!= ' ') x.winner = winner
                else{
                    var ellapsed = end - start
                    x.ptime[x.player] -= ellapsed
                    Konekti.vc(x.player+'_time').innerHTML = ''+x.ptime[x.player]
                    if(x.ptime[x.player] <= 0){ 
                        x.winner = nid + ' since ' + id + ' got run of time'
                    }else{
                        x.player = w?'Y':'R'
                    }
                }    
            }

            board.print(x.rb)
            start = -1
            if(x.winner=='') setTimeout(compute,TIME)
            else Konekti.vc('log').innerHTML = 'The winner is ' + x.winner
        }

        board.print(x.rb)
        setTimeout(clock, 1000)
        setTimeout(compute, 1000)
    }
}

// Drawing commands
function custom_commands(){
    return [
        { 
            "command":" ", "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":255, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }

            ]},
        { 
            "command":"-", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":128, "green":128, "blue":128, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0,1,1,0],
                    "y":[0,1,1,0,0]
                }
            ]
        },
        { 
            "command":"u", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,1],
                    "y":[0,0]
                }
            ]
        },
        { 
            "command":"d", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,1],
                    "y":[1,1]
                }
            ]
        },
        { 
            "command":"r", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[1,1],
                    "y":[0,1]
                }
            ]
        },
        { 
            "command":"l", 
            "commands":[
                {
                    "command":"strokeStyle",
                    "color":{"red":0, "green":0, "blue":255, "alpha":255}
                },
                {
                    "command":"polyline",
                    "x":[0,0],
                    "y":[0,1]
                }
            ]
        },
        {
            "command":"R",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":0, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                }
            ]
        },  
        {
            "command":"Y",
            "commands":[
                {
                    "command":"fillStyle",
                    "color":{"red":255, "green":255, "blue":0, "alpha":255}
                },
                {
                    "command":"polygon",
                    "x":[0.2,0.2,0.8,0.8],
                    "y":[0.2,0.8,0.8,0.2]
                },
            ]
        }
    ] 
}

