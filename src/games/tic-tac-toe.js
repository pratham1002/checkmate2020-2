const { io } = require("../app")
const User = require('../models/user')

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
              
            console.log('Paired sers list:', getPairedUsers())
            console.log('Unpaired users list:', getUnpairedUsers()); 

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
                const opponent = getOpponent(user.id)
                if (user !== undefined) {
                    
                    socket.to(user.room).emit('start-tic-tac-toe', user.username, opponent.username, true)
                    socket.to(opponent.room).emit('start-tic-tac-toe', user.username, opponent.username, false)
                }                
            }
            else {
                console.log('unpaired')
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

    socket.on('end-tic-tac-toe', async (player) => {
        // winner recieved from client side, run database changes here
        const user = await User.findOne({ username: player })
        user.score += 91
        await user.save()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log('Paired', getPairedUsers())
        console.log('Unpaired', getUnpairedUsers())
    })
})
