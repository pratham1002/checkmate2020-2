const socket = io()
let valid_move = { value: true }
let row=6,col=11,total_players=2,count_moves=0,hidden_move=0,orb_no=0,player,bg_color,clicks=0;
let bool,existing_div,matches,prev_parent_id,living_players=[0],current_status=[];
let game_over=[],p1=0,p0=0;
let grid=[];
let opponent = { id: 0 };
let flag = 0;
let selfTimer,selfTimeLeft=90,opponentTimer,opponentTimeLeft=90,timerInterval,gameComplete=false

window.onbeforeunload =function() {
    return "You will lose all your game progress. Are you sure, you want to close?"
  };

for(let r=0; r<row; r++)
    grid[r]=[];


function cssMultiStyles(element,css){
    let ele=document.getElementById(element);
    for(i in css){
        ele.style[i]=css[i];
    }                
}

function openFullscreen(elem) {
	if (elem.requestFullscreen) {
		elem.requestFullscreen();
	} else if (elem.mozRequestFullScreen) { /* Firefox */
		elem.mozRequestFullScreen();
	} else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
		elem.webkitRequestFullscreen();
	} else if (elem.msRequestFullscreen) { /* IE/Edge */
		elem.msRequestFullscreen();
	}
}

function show_instructions(){
	clicks++;
	let button=document.getElementsByClassName('info')[0]
	if(clicks%2!=0){
		document.getElementsByClassName('how-to-play')[0].style.visibility="visible" ;
		setTimeout(()=>{document.getElementsByClassName('how-to-play')[0].style.zIndex="5";} ,1000)
		document.getElementsByClassName('how-to-play')[0].style.transform="translateY(+100vh)" ;
	}
	else{
		let rules=document.getElementsByClassName('how-to-play')[0];
		document.getElementsByClassName('how-to-play')[0].style.transform="translateY(-100vh)";
	}
}


start_function = () =>	{
	document.getElementsByClassName('container')[0].style.visibility="visible" ;

	for(let row_entry=0; row_entry<row; row_entry++) {
		for(let col_entry=0; col_entry<col; col_entry++) {
			grid[row_entry][col_entry]=null;
			let div=document.createElement('div');
			div.setAttribute('id','r' + row_entry +'c' + col_entry); 
            div.addEventListener("click",() => {
            // check valid move here then 
            // 1. freeze the player
            // 2. send the click
                if (valid_move.value) {
                    document.getElementsByClassName('container')[0].style.pointerEvents = "none";
                    socket.emit('click-chain-reaction', div.id, count_moves%total_players, () => {
						console.log("move")
                        socket.emit('freeze-chain-reaction', valid_move.value)
                        if(!gameComplete){
                            clearTimeout(selfTimer)
                            selfTimeLeft=90
                            document.getElementById("timer").innerText=selfTimeLeft
                            clearTimeout(timerInterval)
                            opponentTimer=setTimeout(()=>{gameOver(count_moves%2?'player0':'player1');alert("Opponent's time up! You win!")},92*1000)
                        }
                    })
                }
            })
            document.getElementsByClassName('container')[0].appendChild(div);
            cssMultiStyles('r' + row_entry +'c' + col_entry,{'grid-column': col_entry+1 , 'grid-row': row_entry+1}) 
							
		}
	}
		setTimeout(()=>{document.getElementsByClassName('container')[0].style.zIndex="1";} ,2000) 
		document.getElementById('modal').style.transform="translateY(-100vh)" ;
		let elem = document.documentElement;
		openFullscreen(elem);
}

function start(){
	if(window.innerWidth<window.innerHeight)
		alert("Please play the game in Landscape View.")
	// screen.orientation.lock('landscape');

    document.getElementById('start').style.pointerEvents = "none";
    document.getElementById('pairing').removeAttribute('hidden');
	let is_paired = false
	socket.emit('pair-chain-reaction', async(bool, id, myName, opponentName) => {
        
        document.getElementById("player1").innerText=username.toUpperCase()
	document.getElementById("player1").style.color="red";

        // myName and OpponentName may be jumbled, thus the check
        document.getElementById("player2").innerText=myName==username?opponentName.toUpperCase():myName.toUpperCase()
        document.getElementById("player2").style.color="blue";

        opponent.id = id
		is_paired = bool
		console.log("Paired ", is_paired)
		if (is_paired) {
            start_function()
            if(!gameComplete){
                selfTimer=setTimeout(()=>{gameOver(count_moves%2?'player0':'player1');alert('Time up! You lose!')},92*1000)
                timerInterval=setInterval(()=>{document.getElementById("timer").innerText=selfTimeLeft;selfTimeLeft--},1000);
            }
        }
		else {
			console.log("Waiting to pair")
		}
	})

}

function move(id,player,bool,random){
    
    player_num = player.match(/\d+/g);
    let c=document.getElementById(id).className;
    if(c==null || c==0 || c=='player'+player_num || bool ){
		if(!(bool)) {
			count_moves++;
			valid_move.value = true
		}
		else {
			valid_move.value = false
		}
		orb_no++;
		color=get_color(id,player,bool,+player_num[0]);
		orb_color=color.orb_color;
		bg_color=color.bg_color;
        capture(id,orb_color,player);
        let new_div=document.createElement('div');
		new_div.setAttribute('id',orb_no);
		// document.getElementById(id).setAttribute('class',player);
		document.getElementById(id).appendChild(new_div);
		check_split(id,player,false);
		if(document.getElementById(orb_no))
        cssMultiStyles(orb_no,{'background':orb_color});
		bool=false;

		let container=document.getElementsByClassName('container')[0];
		container.style.background=bg_color;
		container.style.border="0.2em solid "+bg_color;
		return new Promise((resolve, reject) => {
			resolve(valid_move.value)
		})
		// setInterval(move,2000,id,'player'+count_moves%total_players,false);
	}
	else {
		console.log("enter else block which sets valid_move to false")
		valid_move.value = false
		document.getElementsByClassName('container')[0].style.pointerEvents = "auto";
		return new Promise((resolve, reject) => {
			resolve(valid_move.value)
		})
	}
}


function add_orb(id,player){
	player_num = player.match(/\d+/g);
	matches = id.match(/\d+/g);
	for(let i=-1; i<2;i++)
		for(let j=-1; j<2;j++)
			{
				if(i!=j && (i-j == 1 || i-j==-1))
					{
						if(document.getElementById('r'+(+matches[0]+i) +'c'+ (+matches[1]+j) ))
						{
							div=document.createElement('div');
							div.setAttribute('id',++orb_no);
							color=get_color(id,player,bool,+player_num[0]);
							orb_color=color.orb_color;
							capture('r'+(+matches[0]+i) +'c'+(+matches[1]+j),orb_color,player);
							document.getElementById('r'+(+matches[0]+i) +'c'+ (+matches[1]+j) ).appendChild(div);
                            cssMultiStyles(orb_no,{'background':orb_color});
                            check_split(('r'+(+matches[0]+i) +'c'+ (+matches[1]+j) ),player,true);
						}
					}
			}	
	bool=false;
}

function get_color(id,player,bool,player_num){
        let orb_color;
        switch(player_num){
			case 0: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(255,0,0) 1%, rgb(190,0,0) 60%)'	,bg_color:'rgba(0,0,255)'};break;
            case 1: color={orb_color:'radial-gradient(circle at 50% 50%, blue 1%, darkblue 60%)',bg_color:'rgb(255,0,0)'};break;
            // case 2: color={orb_color:'radial-gradient(circle at 50% 50%, blue 1%, darkblue 60%)',bg_color:'rgb(255,0,0)'};break;
			// case 3: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(255, 0, 125) 1%, rgb(197, 0, 97) 60%)',bg_color:''};break;
			// case 4: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
            // case 5: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
            // case 6: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
            // case 7: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
            // case 8: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
            // case 9: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
            // case 10: color={orb_color:'radial-gradient(circle at 50% 50%, rgb(0,255,0) 1%, rgb(0,190,0) 60%)',bg_color:'black'};break;
        }
        return color;
}


function capture(id,orb_color,capturer){
    for(existing_div of document.getElementById(id).childNodes)   //while capturing this will turn all into conquerer's color
		{existing_div.style.background=orb_color;}
			// player_num = capturer.match(/\d+/g);
			// score[+player_num[0]]+=5; 
	document.getElementById(id).className=capturer;
	check(count_moves,capturer);

	
}

function check_split(id,player,bool){
	if(document.getElementById(id)!=null)
		{
			if(id=='r0c0'||id=='r0c'+(col-1)||id=='r'+(row-1)+'c0'||id=='r'+(row-1)+'c'+(col-1)){
				if(document.getElementById(id).childElementCount==2){
                    split_two(id,player);  
                }
            }
			else if(id.substring(0,2)=='r0'|| id.substring(2,4)=='c0'|| id.substring(0,2)=='r'+(row-1) || id.substring(2,5)=='c'+(col-1)){
				if( document.getElementById(id).childElementCount==3){ 
                    split_three(id,player);
                }
            }
			else{	
				if(document.getElementById(id).childElementCount==4 ){
					split_four(id,player);
				}
		}
	}
}	

function split_four(id,player){
	let parentDiv=document.getElementById(id);
	setTimeout(animateDelete,0,id,parentDiv,player);
	check(count_moves,player);
}

function split_two(id,player){
	let parentDiv=document.getElementById(id);
	switch(id){
		case 'r0c0':  {	
            parentDiv.childNodes[0].style.animation="split_right 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_down 0.5s linear 0s";
            break;
        }

        case 'r0c'+(col-1):{
            parentDiv.childNodes[0].style.animation="split_left 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_down 0.5s linear 0s";
            break;
        }
								
        case 'r'+(row-1)+'c0':  {
            parentDiv.childNodes[0].style.animation="split_right 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_top 0.5s linear 0s";
            break;
        }

        case 'r'+(row-1)+'c'+(col-1):{
            parentDiv.childNodes[0].style.animation="split_left 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_top 0.5s linear 0s";
            break;
        }
    }
	setTimeout(()=>{delete_orbs(id,parentDiv,player)},500);
	check(count_moves,player);

}

function split_three(id,player){
	let parentDiv=document.getElementById(id);
	
	matches = id.match(/\d+/g);
    switch(+matches[0]){
        case 0: {
            console.log(+matches[0])
            parentDiv.childNodes[0].style.animation="split_right 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_down 0.5s linear 0s";
            parentDiv.childNodes[2].style.animation="split_left 0.5s linear 0s";
            break;
        }
        case (row-1): {	
            console.log(+matches[0])
            parentDiv.childNodes[0].style.animation="split_right 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_top 0.5s linear 0s";
            parentDiv.childNodes[2].style.animation="split_left 0.5s linear 0s";
            break; 
        }       
    }
    switch(+matches[1]){
        case 0:{ 
            console.log(+matches[0])
            parentDiv.childNodes[0].style.animation="split_right 0.5s linear 0s";
            parentDiv.childNodes[1].style.animation="split_top 0.5s linear 0s";
            parentDiv.childNodes[2].style.animation="split_down 0.5s linear 0s";
            break;
        }
        case (col-1): {	
            console.log(+matches[0])    
                parentDiv.childNodes[0].style.animation="split_left 0.5s linear 0s";
                parentDiv.childNodes[1].style.animation="split_top 0.5s linear 0s";
                parentDiv.childNodes[2].style.animation="split_down 0.5s linear 0s";
            break; 
        }     
    }
	setTimeout(()=>{delete_orbs(id,parentDiv,player)},500);
	check(count_moves,player);
}

function animateDelete(id,parentDiv,player){
	setTimeout(function()
	{parentDiv.childNodes[0].style.animation="split_right 0.5s linear 0s";
	parentDiv.childNodes[1].style.animation="split_top 0.5s linear 0s";
	parentDiv.childNodes[2].style.animation="split_left 0.5s linear 0s";
	parentDiv.childNodes[3].style.animation="split_down 0.5s linear 0s";
	},000);
	setTimeout(()=>{delete_orbs(id,parentDiv,player)},500);	
}

function delete_orbs(id,parentDiv,player){
    add_orb(id,player);
    while (parentDiv.firstChild) {
		parentDiv.removeChild(parentDiv.firstChild);
	}
	parentDiv.removeAttribute('class'); 
}

function check(count_moves,player){
    for(let row_entry=0; row_entry<row; row_entry++)
        {current_status[row_entry]=[]
            for(let col_entry=0; col_entry<col; col_entry++)
            {	
				let div=document.getElementById('r'+row_entry+'c'+col_entry)
				if(div.className)
					{current_status[row_entry][col_entry]={'parent_class':div.className, 'no_of_orbs': div.childElementCount}
					game_over.push(div.className.match(/\d+/g));
            }
		}  
	}  
    for(let i=0;i<game_over.length;i++)
        {
            if(+game_over[i] == 1)
                p1++;
            else if(+game_over[i]==0)
                p0++;			
        }
    if(count_moves>total_players && (p1 == 0 || p0 == 0))
        {
            gameOver(player)
        }
    p0=0;p1=0;game_over=[];
}

function gameOver(player){
    clearInterval(oppTimerDisplay)
    document.getElementsByClassName('container')[0].style.zIndex="0";
    cssMultiStyles('over',{'visibility':"visible",'z-index':"9999",'transform':'translateY(-100vh)',  'transition': 'transform 1s'})
    winner=player.match(/\d+/g);
    console.log(winner)
    console.log("WINNER PLAYER INDEX IS",winner)
    if (winner[0] == '0' && flag == 0) {
        flag += 1
        socket.emit('winner-chain-reaction', opponent.id, false)
    }
    else if (winner[0] == '1' && flag == 0) {
        flag += 1
        socket.emit('winner-chain-reaction', opponent.id, true)
    }
    gameComplete=true
    clearTimeout(selfTimer)
    clearTimeout(opponentTimer)
    clearInterval(timerInterval)
    p0=0;p1=0;game_over=[];
}

function restart(){
	for(let row_entry=0; row_entry<row; row_entry++)
        for(let col_entry=0; col_entry<col; col_entry++)
        {
			let parentDiv=document.getElementById('r'+row_entry+'c'+col_entry);
			while (parentDiv.firstChild) {
					parentDiv.removeChild(parentDiv.firstChild);
				}
			parentDiv.removeAttribute('class'); 
	}
	document.getElementById('over').style.visibility="hidden";
	count_moves=0;//score=[0,0];
	let container=document.getElementsByClassName('container')[0];
	container.style.background="red";
	container.style.border="0.2em solid red";
}

// const { username } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const url = window.location.origin + "/me"
let username = "",score=0

async function play() {
	try {
		const res = await fetch(url)
		const user = await res.json()
		username = user.username
		score = user.score
		socket.emit('join-chain-reaction', username, (error) => {
			if (error) {
				return console.log(error)
			}
			console.log("Room Joined")
		})

        socket.on('start-chain-reaction', (opponent_id, myName, opponentName) => {
            
            document.getElementById("player1").innerText=username.toUpperCase()
	    document.getElementById("player1").style.color="blue";

            // myName and OpponentName may be jumbled, thus the check
            document.getElementById("player2").innerText=myName.toUpperCase()==username.toUpperCase()?opponentName.toUpperCase():myName.toUpperCase()
	    document.getElementById("player2").style.color="red";

			opponent.id = opponent_id
			console.log(opponent.id)
			start_function()
            opponentTimer=setTimeout(()=>{gameOver(count_moves%2?'player0':'player1');alert("Opponent's time up! You win!")},92*1000)
		})

		socket.on('move-chain-reaction', (grid, player) => {
			try {
				move(grid, 'player' + player, false)
				console.log(count_moves)
			} catch (e) {
				console.log(e)
			}
		})

		socket.on('unfreezeOpponent-chain-reaction', () => {
            console.log("unfreeze, make your move")
	    clearInterval(oppTimerDisplay)
            document.getElementById("waiting").innerText="";

            document.getElementsByClassName('container')[0].style.pointerEvents = "auto";
            if(!gameComplete){
                clearTimeout(opponentTimer)
                selfTimer=setTimeout(()=>{gameOver(count_moves%2?'player0':'player1');alert('Time up! You lose!')},92*1000)
                timerInterval=setInterval(()=>{document.getElementById("timer").innerText=selfTimeLeft;selfTimeLeft--},1000);
            }
        })

		socket.on('freezePlayer-chain-reaction', () => {
			console.log("freeze, waiting for opponent's move")
			oppTime=91
			oppTimerDisplay=setInterval(()=>{
				oppTime-=1
				document.getElementById("waiting").innerText="Waiting for opponent's move\n"+"( "+oppTime+" )";
			},1000)
			document.getElementById("timer").innerText=""
			document.getElementsByClassName('container')[0].style.pointerEvents = "none";
        })
        
        socket.on('winner-score-update',async(winner)=>{

            document.getElementById('winner').innerHTML=winner.toUpperCase()+' Wins!'
            if(winner.toLowerCase()==username.toLowerCase()){
               await fetch('/score',{
                method: 'POST',
                body: JSON.stringify({score:100, secret:"anshal", game:"chain-reaction"}),
                headers: { 
                    "Content-type": "application/json; charset=UTF-8"
                }
            })
            .then(res=>console.log(res.json()))
            .catch(err=>console.log(err))
            } else {
				console.log('score (0) updated for loser')
				await fetch('/score',{
					method: 'POST',
					body: JSON.stringify({score:0, secret:"anshal", game:"chain-reaction"}),
					headers: { 
						"Content-type": "application/json; charset=UTF-8"
					}
				})
				.then(res=>console.log(res.json()))
				.catch(err=>console.log(err))
			}
		})

		socket.on('opponent-leaves', (user) => {
			document.getElementsByClassName('container')[0].style.zIndex="0";
            cssMultiStyles('over',{'visibility':"visible",'z-index':"9999",'transform':'translateY(-100vh)',  'transition': 'transform 1s'})
			if (flag == 0) {
				flag += 1
				socket.emit('opponent-leaves-win', user.username)
			}
		})
	}
	catch (e) {
		console.log("error")
	}
}

play()

redirect=()=>{
    localStorage.removeItem('cr')
    alert("Please close this tab and return to your maze... ")
}
	// const res = await fetch(url).then(async (res) => {
    //     const result = await res.json().then((user) => {
    //         username = user.username
    //         room = user.room
    //     })
	// }).then(() => {
		
	// }).catch((e) => {
    //         console.log("fetch error")
    // })
	// }
