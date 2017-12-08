$( document ).ready(function() {

//properties
var stepsArr = [];
var ifGameOn = false;//is the game on?
var ifQuarterClickable = false;
var rounds = 0;
var ifStrict = false;
var timeOut;//for user fail to click on time
var timeInter; //for clear blink buttons
var displayTimeout; //for clear series of button to highlight
var winTimeout;//timeout when user wins the game
var ifSwitchOn = false;//is the swich turned on?

// const leftTopAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');//left top sound
// const rightTopAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3')//right top sound
// const leftBottomAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');//right sound
// const rightBottomAudio = new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');//right sound


//Web Audio API section
 var frequencies = [329.63,261.63,220,164.81];
 var ctx = new (window.AudioContext || window.webkitAudioContext)();
 if(!ctx)alert('sorry but your browser does not support the Web Audio Api,please consider downloading the latest google chrome!')
 var osc;

//plauAudio func
  var playAudio = function(num,delay,ifWrong){
    osc = ctx.createOscillator();
    osc.frequency.value = ifWrong? num : frequencies[num]; // value in hertz
    osc.type = 'triangle';
    osc.start(ctx.currentTime);
    osc.connect(ctx.destination);
    setTimeout(function(){
      osc.disconnect(ctx.destination);
      osc = null;
    },delay)
}

//event driven button clicked helper functions
var afterBtnClicked = function(bool,ifFail){
   clearTimeout(timeOut);//clear
   rounds = 0;
   startBtnSeries(bool);
   if(ifFail) {
    $('#counter').find('span').text('! !');
    blinkBtn();
  }
}

var btnClicked = function(num){
   if(num==stepsArr[rounds]) {//right btn
     playAudio(num,150);//shorter sound
      rounds++;
     if(rounds>=20) win();//20 rounds to win
      else if(rounds==stepsArr.length){//round finish
        afterBtnClicked(true);
      } 
    }
    else{//wrong btn pressed
      playAudio(100,500,true);
      if(ifStrict){//strict mode
        strictFail();
        return;
      }
      afterBtnClicked(false,true);
    }
}
//

//event listener for the pies
$('.quarter').on('click',function(){
  if (ifQuarterClickable) {
    clearTimeout(timeOut);//clear
    setTimeOut();//reset timeout
    highLightBtnCol(this,true)//highLigh btn
    let num = $(this).attr('id').slice(-1); 
    btnClicked(num);
  }
})
// $(".quarter").mouseup(function() {
// });

//check checkbox state to determine the status of the game
$('input').change(function() {
    if(this.checked) {
      ifSwitchOn = true;
      $('#counter').find('span').text('- -');
    }
    else {
     reset(true);
    }
});

//start button clicked
$('#start').on('click',function(){
  if(!ifSwitchOn) return;
  if(ifGameOn){//restart the game
    reset(false,false,true);
    startBtnSeries(true);
    return;
  }
   blinkBtn();
   ifGameOn = true; // game is on
   startBtnSeries(true);
})
//strict button clicked
$('#strict').on('click',function(){
  if(!ifSwitchOn) return;
  if($('#indicator').css('background-color')=='rgb(255, 0, 0)')  {
     $('#indicator').css('background-color','black');
    ifStrict = false;
  }else{
    $('#indicator').css('background-color','red');
    ifStrict = true;
  }
})

//start of button series display function
var startBtnSeries = function(ifIncrement){
  let len = stepsArr.length;
  ifQuarterClickable = false;
  //when new game or when user win the current round
  if(ifIncrement){
     let step = Math.floor((Math.random() * 4));    
     stepsArr.push(step);
     len = stepsArr.length;//new len
  }
  displayHighLightBtns(len);
}

var displayHighLightBtns =  function(i) {
  // var delay = i == stepsArr.length?1000:1500;
  if(displayTimeout) clearTimeout(displayTimeout);
  displayTimeout = setTimeout(function () {
  let len = stepsArr.length;
  let num = stepsArr[len-i];
  playAudio(num,500);//longer sound
  let ele = $('#quarter'+num)
  highLightBtnCol(ele,false);
  displayStepsNum(len);
  if (--i) {          // If i > 0, keep going
    displayHighLightBtns(i);       // Call the loop again, and pass it the current value of i
  } else{
  userToClickQuaters(600);
  } 
}, 1500);
};

//start of user click quarters
var userToClickQuaters = function(delay){
  setTimeout(function () {
    ifQuarterClickable = true;
     //user is expected to click a quarter within 3000 ms, otherwise is lost, click event will clear the function
  setTimeOut();
  },delay)
}
//end of buttons display

//universal reset function with parameters
var reset = function(ifResetIndicator,ifWin,ifRestart){  
    stepsArr = [];
    ifQuarterClickable = false;
    rounds = 0;
   if(timeOut) clearTimeout(timeOut);//clear
  if(winTimeout) clearTimeout(winTimeout);//in case reset right after win
   if(ifResetIndicator) {
     ifStrict = false;
     ifGameOn = false;
     ifSwitchOn = false;
      $('#counter').find('span').text('');
     $('#indicator').css('background-color','black');
   } else{
      if(ifRestart) {
        $('#counter').find('span').text('- -');
        blinkBtn();
        return;
      }
      $('#counter').find('span').text('! !');
      blinkBtn();
   }
  if(ifWin) ifGameOn = true;  
}
//function to handle if fail under strict mode
var strictFail = function(){
  reset(false);
  startBtnSeries(true);
}
//function to handle win 
var win = function(){
  reset(false,true);
  $('#counter').find('span').text('game');
   winTimeout = setTimeout(function(){
    startBtnSeries(true);
  },1500)
}

//if user fails to play button on time in not strict mode
var timeoutNotStrict = function(){
  $('#counter').find('span').text('! !');
  blinkBtn();
  startBtnSeries(false);
}

//set certain time limit for user to play next button
var setTimeOut = function(){
  if(timeOut) clearTimeout(timeOut); //??????????
    timeOut = setTimeout(function () {
    //timeout user not click on time
    playAudio(100,500,true);
    if(ifStrict) strictFail();
    else timeoutNotStrict();
  },3900)
}

//function to blink btns
var blinkBtn = function(){
  if(timeInter) clearInterval(timeInter);//in case malicious multiple clicks
   var elem = $('#counter').find('span');
    timeInter = setInterval(function() {
        if (elem.css('visibility') == 'hidden') {
            elem.css('visibility', 'visible');
        } else {
            elem.css('visibility', 'hidden');
        }    
    }, 200);
  
  setTimeout(function(){
    if(timeInter) clearInterval(timeInter);
    elem.css('visibility', 'visible');
  },800)
}


//function to display steps in console
var displayStepsNum = function(num){
  num = num < 10? '0'+num:num;
 $('#counter').find('span').text(num);
}


//start of color helper functions
var LightenDarkenColor = function(col,amt) {
    var usePound = false;
    if ( col[0] == "#" ) {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col,16);
    var r = (num >> 16) + amt;
    if ( r > 255 ) r = 255;
    else if  (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if ( b > 255 ) b = 255;
    else if  (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if ( g > 255 ) g = 255;
    else if  ( g < 0 ) g = 0;
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

var convertRbGToHex = function(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

var highLightBtnCol = function(ele,ifUser){
  var delay = ifUser?150:500;
  var color = $(ele).css('background-color');
  color = convertRbGToHex(color);
  var lighter = LightenDarkenColor(color,50);
  $(ele).css('background-color',lighter);
  setTimeout(function(){
    $(ele).css('background-color',color);
  },delay)
            
}

//end of color heler functions
})