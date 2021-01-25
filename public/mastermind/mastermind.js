document.addEventListener("DOMContentLoaded", function() {
  var clicks=0;
  var time=300;
  var t;
  var x;
  let guess = 0;
  let selectedColor = '';
  let bGround = 'rgba(0, 0, 0, 0) radial-gradient(gray,#595252) repeat scroll 0% 0% / auto padding-box border-box';
  $('.submit-btn').hide();
  let clickCount = 0;
  let isSelected = false;
  let answerRay = makeAnswer();
  let nanswerRay = makeNumToColor(answerRay);
  let tempRay = $('.guess-pegs');
  let guessBoxArray = [];
  let nextGrade = $($('.first-grade')[0]).parent()[0];
  
  //start page
  document.getElementById('modal-start').onclick=function(){
    document.getElementById('modal-start').style.visibility="hidden" ;
    document.getElementById('info').style.visibility="visible" ;
    document.getElementById('clock').style.visibility="visible" ;
    //startclock();
  }
  
  //timer
  /* function startclock(){
  x = setInterval(function() {
  
    var minutes = Math.floor(time/ (60));
    var seconds = Math.floor(time % 60);
    time--;
  
    document.getElementById("clock").innerHTML = minutes + ":" +('0'+ seconds).slice(-2);
    if(time<0)
    {
      loss();
    }
  }, 1000);
  } */

var time_in_minutes = 5;
var current_time = Date.parse(new Date());
var deadline = new Date(current_time + time_in_minutes*60*1000);
var paused = false; // is the clock paused?
var time_left; // time left on the clock when paused

function time_remaining(endtime){
	var t = Date.parse(endtime) - Date.parse(new Date());
	var seconds = Math.floor( (t/1000) % 60 );
	var minutes = Math.floor( (t/1000/60) % 60 );
	var hours = Math.floor( (t/(1000*60*60)) % 24 );
	var days = Math.floor( t/(1000*60*60*24) );
	return {'total':t, 'days':days, 'hours':hours, 'minutes':minutes, 'seconds':seconds};
}

var timeinterval;
function run_clock(id,endtime){
	var clock = document.getElementById(id);
	function update_clock(){
		var t = time_remaining(endtime);
    document.getElementById("clock").innerHTML = t.minutes + ":" +('0'+t.seconds).slice(-2);
    	if(t.total<=0){ clearInterval(timeinterval); loss();}
	}
	update_clock(); // run function once at first to avoid delay
	timeinterval = setInterval(update_clock,1000);
}
run_clock('clockdiv',deadline);


function pause_clock(){
	if(!paused){
		paused = true;
		clearInterval(timeinterval); // stop the clock
		time_left = time_remaining(deadline).total; // preserve remaining time
	}
}

function resume_clock(){
	if(paused){
		paused = false;

		// update the deadline to preserve the amount of time remaining
		deadline = new Date(Date.parse(new Date()) + time_left);

		// start the clock
		run_clock('clockdiv',deadline);
	}
}

  //Instructions tab
  document.getElementById('info').onclick=function(){show_instructions()};
  
  function show_instructions(){
    clicks++;
    if(clicks%2!=0){
      document.getElementById('modal').style.visibility="visible" ;
      pause_clock();
    }
    else{
      document.getElementById('modal').style.visibility="hidden" ;
      resume_clock();
    }
  }
  
    //win modal
    function win() {
    $('.modal1').fadeIn(200);
    clearInterval(x);
    //POST request using fetch to add score
    fetch("/score",{method:"POST",body:JSON.stringify({score:100}),headers:{"Content-type": "application/json; charset=UTF-8"}})
  }
  
    //loss modal
    function loss(){
      document.getElementById('loss1').innerHTML ="Answer: "+nanswerRay;
      $('.modal2').fadeIn(200);
      clearInterval(x);
    }
  
  
  for(let i = 9; i >= 0; i-- ) {
    guessBoxArray.push(tempRay[i]);
  }
  
    for(let i = 0; i < 10; i++) {
      let guessArray = guessBoxArray[i].getElementsByClassName("guess-peg");
      for(let j = 0; j < 4; j++) {
        $(guessArray[j]).attr('id',`g-${i}-${j}`);
      }
    }
  
    let masterGuessArray = [[-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1],
                            [-1, -1, -1, -1]];
  
    $('.submit-btn').click(function() {
      $('.active').removeClass('active');
      let gradeRay = getGrade();
      checkWin(gradeRay);
      let gradeBox = getGradeBox();
      placePegs(gradeRay, gradeBox);
      guess++;
      for(let i = 0; i < 4; i++) {
        $(`#g-${guess}-${i}`).addClass('active');
      }
      $('.submit-btn').hide();
    });
  
    $('.selector-inner').click(function () {
      isSelected = true;
      $('.selector-outer').css('background-color', 'gray');
      let peg = ($(this).parent())[0];
      selectedColor = $(this).css('background-color');
      $(peg).css('background-color', selectedColor);
    });
  
    $('.guess-peg').click(function() {
      if(isSelected) {
        if ($(this).hasClass('active')) {
          let number = parseInt($(this).css('border'));
          if(number === 1) { //insert peg
          $(this).css('background', 'none');
          $(this).css('background-color', selectedColor);
          $(this).css('border', '2px solid white');
          let coord = $(this).attr('id');
          updateMasterArray(selectedColor, coord);
          clickCount++;
          if(clickCount%4 === 0) {
              $('.submit-btn').show();
              //clickCount = 0;
          }
        } else { //peg removed                                    //check here
            $(this).css('background', bGround);
            $(this).css('border', '1px solid white');
            let coord = $(this).attr('id');
            updateMasterArray('x', coord);
            clickCount--;
            $('.submit-btn').hide();
          }
        }
      }
    });
  
  
  
    function makeAnswer() {
      let ray = [];
      for(let i = 0; i < 4; i++) {
        ray.push(Math.floor(Math.random() * 6));
      }
      return ray;
    }
  
    function updateMasterArray(col, xy) {
      let ray = xy.split('-');
      let x = ray[1];
      let y = ray[2];
      masterGuessArray[x][y] = makeColorANumber(col);
    }
  
    function makeColorANumber(col) {
      if(col === 'rgb(255, 0, 0)') return 0;
      if(col === 'rgb(0, 128, 0)') return 1;
      if(col === 'rgb(255, 255, 0)') return 2;
      if(col === 'rgb(0, 0, 0)') return 3;
      if(col === 'rgb(255, 255, 255)') return 4;
      if(col === 'rgb(128, 0, 128)') return 5;
      if(col === 'x') return -1;
    }
  
    function makeNumToColor(ray){
      let nray=[]
      for(var i=0;i<4;i++){
        if(ray[i] == 0){nray[i]='Red'}
        if(ray[i] == 1){nray[i]='Green'}
        if(ray[i] == 2){nray[i]='Yellow'}
        if(ray[i] == 3){nray[i]='Black'}
        if(ray[i] == 4){nray[i]='White'}
        if(ray[i] == 5){nray[i]='Purple'}
      }
      return nray;
    }
  
    function getGrade() {
      let gradRay = [];
      let aRay = [];
      for(let i = 0; i < 4; i++) {
        aRay.push(answerRay[i]);
      }
      // Red Peg Check
      for(let i = 0; i < 4; i++) {
        if(masterGuessArray[guess][i] === aRay[i]) {
          gradRay.push('red-peg');
          aRay[i] = -1;
          masterGuessArray[guess][i] = -2;
        }
      }
      // White Peg Check
      for(let i = 0; i < 4; i++) {
        for(let j = 0; j < 4; j++) {
          if(masterGuessArray[guess][i] === aRay[j]) {
            gradRay.push('white-peg');
            aRay[j] = -1;
            masterGuessArray[guess][i] = -2;
          }
        }
      }
      return gradRay;
    }
  
    function getGradeBox() {
      let activeGrade =  nextGrade.getElementsByClassName("grade-pegs")[0];
      nextGrade = $(nextGrade).prev()[0];
      return activeGrade;
    }
  
    function placePegs(ray, box) {
      let pegRay = box.getElementsByClassName("grade-peg");
      for(let i = 0; i < ray.length; i++) {
        $(pegRay[i]).addClass(`${ray[i]}`);
      }
      $('.white-peg').css('background', 'none').css('background-color', 'white');
      $('.red-peg').css('background', 'none').css('background-color', 'red');
    }
  
    function checkWin(ray) {
      let rayStr = ray.join();
      if(rayStr === "red-peg,red-peg,red-peg,red-peg")
      {
        win();
      }
      else if(guess==9)
      {
        //document.getElementById('loss').innerHTML =answerRay;
        loss();
      }
    }
  
  
  });