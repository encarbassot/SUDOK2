import ElioCanvas from "./elioCanvas.js"
import Sudoku from "./sudoku.js"


const divCv = document.querySelector(".canvas")
const numBtns = document.querySelectorAll(".actions button.num-btn") 
const btnFullScreen = document.querySelector(".actions button#fullScreen") 
const timerSpan = document.getElementById("timer")
const errorSpan = document.getElementById("errorCount")
const subNumBtn = document.getElementById("subNumbers")
const difficultySpan = document.getElementById("difficulty")
const settingsBtn = document.getElementById("settingsBtn")
const modalSettings = document.getElementById("modalSettings")
const fillAllSubBtn = document.getElementById("fillAllSubBtn")

let sudoku = null
let numSelected = null

let startTimestamp = null
let intervalId
let elapsedBeforePause = 0

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
    if(!sudoku) return 

    const col = Math.floor(mouseX/W*N)
    const row = Math.floor(mouseY/W*N)
    sudoku.setHover(col,row)
    
}

cv.mouseClicked = function (e,mouseX,mouseY){
    const col = Math.floor(mouseX/W*N)
    const row = Math.floor(mouseY/W*N)
    const {
        selectedNum,
        errors,
        counts,
    } = sudoku.click(col,row,numSelected)

    errorSpan.innerText = errors
    if(!startTimestamp){
        startTimestamp = sudoku.startTimestamp
        startTimer()
    }
    selectNum(selectedNum)

    renderCounts(counts)
    
}

//this triggers the signal to run setup and draw
cv.start()



async function fetchSudoku(){
    const api = "https://sudoku-api.vercel.app/api/dosuku"


    const response = await fetch(api)
    const data = await response.json()

    console.log(data)
    // console.log(data)
    const {value, solution,difficulty} = data.newboard.grids[0]

    sudoku = new Sudoku(value, solution,N,M,W)
    // sudoku.fillSubnumbers()
    difficultySpan.innerText = difficulty
    // console.log(sudoku.solution)
}


function renderCounts(counts){
    Object.entries(counts).forEach(([n,k])=>{
        updateCount(Number(n),k)
    })
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

// -------- BINDings BUTTONS --------
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


fillAllSubBtn.addEventListener("click",()=>{
    sudoku.fillSubnumbers()
})


subNumBtn.addEventListener("click",()=>{
    const state = sudoku.toggleShowNumbers()
    subNumBtn.classList.toggle("active",state)
})


//settings modal
settingsBtn.addEventListener("click",()=>{
    modalSettings.classList.remove("hidden")
})

// Array.from(document.querySelectorAll(".modal-bg")).forEach(modal=>{
//     const btn = modal.querySelector(".closeModalBtn")
//     btn.addEventListener("click",()=>{
//         modal.classList.add("hidden")
//     })
// })

document.querySelector(".closeModalBtn").addEventListener("click",()=>{
    modalSettings.classList.add("hidden")
})


// -------- BUTTONS COUNTERS --------
function updateCount(n, k) {
    const buttons = document.querySelectorAll(".num-btn")
    const btn = buttons[n - 1] // porque buttonIndex = n-1
    if (!btn) return
  
    const countSpan = btn.querySelector(".count")
    if (countSpan) {
      countSpan.textContent = k
    }
  }
  



  // --------- TIMER ---------
  function startTimer(){
    if(intervalId) return
  
    startTimestamp = Date.now() - (elapsedBeforePause || 0)
  
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
  
  function pauseTimer(){
    if(!startTimestamp) return
    elapsedBeforePause += Date.now() - startTimestamp
    startTimestamp = null
    clearInterval(intervalId)
    intervalId = null
  }
  

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseTimer()
    } else {
      startTimer()
    }
  })