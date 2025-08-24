export default class Sudoku {

  constructor(board, solution,N,M,W){

    this.initial = board.map(row => [...row])
    this.board = board.map(row => [...row])
    this.solution = solution.map(row => [...row])

    this.hasStarted = false
    this.startTimestamp = null

    this.N = N
    this.M = M
    this.W = W

    this.hover=null
    this.error=null //={x:0,y:0}
    this.errors = 0


    //configs
    this.showSameNumbers = true //same numbers as the selected will be highlighted
    this.showRowsAndCols = true //row and column of the selected number will be higilighted
  }



  render(cv){
    if(!this.hasStarted) return this.renderStart(cv)

    let hoverX, hoverY
    if(this.hover){
      hoverX = this.hover.x
      hoverY = this.hover.y
    }
    
    const nSelected = this.selected ? this.board[this.selected.y][this.selected.x] : null
    
    //rows
    for(let i=0; i<this.board.length; i++){
      const row = this.board[i]
      const isRowSelected = this.selected?.y === i

      //columns
      for(let j=0; j<row.length; j++){
        const n = row[j]
        const isOriginal = n === this.initial[i][j]
        const isHover = this.hover && hoverX === j && hoverY === i 
        const isColSelected = this.selected?.x === j
        const isErr = this.error && this.error.x === j && this.error.y === i
        const isSameNAsSelected = nSelected && nSelected === n

        //Cell origins
        const w = this.W / this.N
        const x = w*j
        const y = w*i
        
        let bg = null
        let textFill = isOriginal ? "#111" : "#999"
        //draw cell background
        if(isHover){
          //ESTA CLICKADA
          bg = "#000"
        }else if((isRowSelected && isColSelected)){
          bg = "#222"
        }else if(this.showRowsAndCols && (isRowSelected || isColSelected)){
          //ROW COLUMN SELECTED
          bg = "#666"
        }else if(this.showSameNumbers && isSameNAsSelected){
          bg=isOriginal ? "#111" : "#444"
        }

        if(bg){
          cv.fill(bg)
          cv.rect(x,y,w,w)
        }

        if(isErr){
          const p = w * 0.1
          cv.stroke("#F88")
          cv.strokeWeight(15)
          cv.line(x+p,y+p,x+w-p,y+w-p)
          cv.line(x+w-p,y+p,x+p,y+w-p)
          cv.strokeWeight(1)
          cv.stroke("#000")
        }
        
        if(n===0) continue


        //color del texto
        if(isHover || (isRowSelected && isColSelected) ){
          textFill = "#FFF"

        }else if(this.showRowsAndCols && (isRowSelected || isColSelected)){
          //selected
          textFill = isOriginal ? "#FFF" : "#BBB"

        }else if(this.showSameNumbers && isSameNAsSelected){
          textFill = isOriginal ? "#BBB" : "#DDD"
        }

        //TEXT
        cv.fill(textFill)
        cv.text(
          n,
          x+ this.W/this.N*0.3, //compensate text center
          y+ this.W/this.N*0.75,
          this.W/10
        )
      }   
    }

    this.renderLines(cv)
  }

  renderStart(cv){

    //draw play button
    const triangleW = this.W/7
    const x1 = this.W/2 - triangleW/2
    const y1 = this.W/2 - triangleW/2

    cv.fill("#000")
    cv.makeShape([
      [x1,y1],
      [x1+triangleW,y1+triangleW/2],
      [x1,y1+triangleW]
    ])
  }

  renderLines(cv){
    // render columns
    for(let i=1; i<this.N; i++){
        
      if(i%this.M === 0){
        cv.strokeWeight(3)
      }else{
        cv.strokeWeight(1)
      }
      
      cv.line(this.W/this.N*i,0,this.W/this.N*i,this.W)

    }
    
    //render rows
    for(let j=1; j<this.N; j++){
      if(j%this.M === 0){
        cv.strokeWeight(3)
      }else{
        cv.strokeWeight(1)
      }
      
      cv.line(0,this.W/this.N*j,this.W,this.W/this.N*j)

    }

  }

  setHover(col,row){
    this.hover = {x:col,y:row}
  }

  start(){
    this.hasStarted = true
    this.startTimestamp = Date.now()
  }

  click(col,row,n){
    let selectedBtn = null
    
    if(!this.hasStarted){
      this.start()
      return{
        selectedBtn,
        errors:this.errors
      }
    }

    if(this.error) this.error = null

    this.hover = {x:col,y:row}
    if(this.selected?.x === col && this.selected?.y === row){
      this.selected = null
    }else{
      this.selected =  {x:col,y:row}
    }

    if(n){
      const isEditable = this.initial[row][col] === 0
      if(isEditable){
        const isCorrect = n === this.solution[row][col]
        if(isCorrect){
          this.board[row][col] = n
        }else{
          this.error={x:col,y:row}
          this.errors ++
        }
      }
    }


    return {
      selectedBtn,
      errors:this.errors
    }
  }


    
}