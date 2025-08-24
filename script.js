import ElioCanvas from "./elioCanvas.js"
import Sudoku from "./sudoku.js"


const divCv = document.querySelector(".canvas")
const numBtns = document.querySelectorAll(".actions button.num-btn") 
const btnFullScreen = document.querySelector(".actions button#fullScreen") 
const timerSpan = document.getElementById("timer")
const errorSoan = document.getElementById("errorCount")

let sudoku = null
let numSelected = null

let startTimestamp = null
let intervalId

const M = 3 // SUDOKU SPECIAL NUMBER
const N = M*M // 9
const W = Math.min(window.innerWidth-6,600) //Width
const cv = new ElioCanvas(W,W,divCv)


cv.setup = function (){
    cv.noStroke()
    fetchSudoku()
}

cv.draw = function (){

    //background
    cv.background("#FAFAFA")

    if(!sudoku) return
    
    sudoku.render(cv)

    // console.log(sudoku.selected)
}

cv.mouseMoved = function (e,mouseX,mouseY){
    const col = Math.floor(mouseX/W*N)
    const row = Math.floor(mouseY/W*N)
    sudoku.setHover(col,row)
    
}

cv.mouseClicked = function (e,mouseX,mouseY){
    const col = Math.floor(mouseX/W*N)
    const row = Math.floor(mouseY/W*N)
    console.log("CLICK",col,row)
    const {
        selectedNum,
        errors
    } = sudoku.click(col,row,numSelected)

    errorSoan.innerText = errors
    if(!startTimestamp){
        startTimestamp = sudoku.startTimestamp
        startTimer()
    }
    selectNum(selectedNum)
    
}

//this triggers the signal to run setup and draw
cv.start()



function startTimer(){
  if(intervalId) return
  intervalId = setInterval(() => {
    if(!startTimestamp) return
    const elapsed = Date.now() - startTimestamp
    const seconds = Math.floor(elapsed / 1000) % 60
    const minutes = Math.floor(elapsed / 60000) % 60
    const hours = Math.floor(elapsed / 3600000)
    timerSpan.innerText = 
      `${hours.toString().padStart(2,'0')}:${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`
  },1000)
}


async function fetchSudoku(){
    const api = "https://sudoku-api.vercel.app/api/dosuku"


    const response = await fetch(api)
    const data = await response.json()

    // console.log(data)
    const {value, solution} = data.newboard.grids[0]

    sudoku = new Sudoku(value, solution,N,M,W)

    // console.log(sudoku.solution)
}




function selectNum(n){
    
    if(isNaN(n)){
        numSelected = null
        for(let i=0; i<N;i++){
            numBtns[i].classList.remove("active")
        }
        return
    }

    const isSame = numSelected === n
    numSelected = isSame ? null : n

    for(let i=0; i<N;i++){
        if(n-1 === i && !isSame){
            numBtns[i].classList.add("active")
        }else{
            numBtns[i].classList.remove("active")
        }
    }
}

// -------- BIND BUTTONS --------
numBtns.forEach((x,i)=>x.addEventListener("click",()=>{
    selectNum(i+1)
}))
btnFullScreen.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
})