const { io } = require("../app")

const {
    addUser,
    removeUser,
    getUser,
    isPaired,
    getOpponent,
    getUsersInRoom,
    getPairedUsers,
    getUnpairedUsers
} = require('../utils/tic-tac-toe-users')

io.on('connection', (socket) => { 
    console.log('Connection established!')

    socket.on('join-tic-tac-toe', (username, callback) => {
        try {
            const { error, user } = addUser({ id: socket.id, username: username })

            if (error) {
                return callback(error)
            }

            socket.join(user.room)
            // let arr_to_be_sent = []
            // let unpaired = false
            // let username_lower=username.toLowerCase()
            // let element,room
            
            console.log('Paired sers list:', getPairedUsers())
            // let paired_users = getPairedUsers()
            // let unpaired_users=getUnpairedUsers()
            console.log('Unpaired users list:', getUnpairedUsers()); 

            // for (elem in unpaired_users) {
            //     console.log('element is',elem)
            //     if (unpaired_users[elem].username == username_lower) {
            //         unpaired = true
            //         element=unpaired_users[elem]
            //         break
            //     }
            // }
            // console.log('Unpaired', unpaired)
            
            // if (unpaired) {
            //     arr_to_be_sent=[element]
            // }
            // else {
                
            //     element = paired_users.find(function(post, index) {
            //         if(post.username == username_lower)
            //             return true;
            //     });
            //     console.log('Element when paired',element)
            //     room = element.room
            //     for (elem in paired_users) {
            //         if (paired_users[elem].room == room) {
            //             arr_to_be_sent.push(paired_users[elem])
            //         }
            //     }
            // }

            callback('joined')
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('pair-tic-tac-toe', (username) => {
        try {
            if (isPaired(socket.id)) {
                console.log(username)
                
                const user = getUser(username)
                // const opponent = getOpponent(socket.id)
                // callback(true, opponent.id)'
                if (user !== undefined) {
                    
                    socket.to(user.room).emit('start-tic-tac-toe')
                }
                // io.to(opponent.id).emit('freezePlayer')
                
            }
            else {
                console.log('unpaired')
                //callback(false)
            }
        }
        catch (e) {
            console.log(e)
        }
    })

    socket.on('play-tic-tac-toe', (opponent, username, divId) => {
        const user = getUser(username)
        // console.log(user.room)
        if (user !== undefined) {
            socket.to(user.room).emit('opponentPlayed-tic-tac-toe', opponent, divId);
        }
        // callback();
    })

    socket.on('end-tic-tac-toe', (player) => {
        // winner recieved from client side, run database changes here
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log('Paired', getPairedUsers())
        console.log('Unpaired', getUnpairedUsers())
    })
})