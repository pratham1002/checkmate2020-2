const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		unique: true,
		trim: true,
	},
	password: {
		type: String,
		required: true,
	},
	id_1: {
		type: String,
		trim: true,
		required: true,
		validate: {
			validator : function (id) {
				return /20[1-2][0-9][A-Za-z0-9]{4}[0-9]{4}[pP]/.test(id)
			}
		}
	},
	score: {
		type: Number,
		default: 0
	},
	room: {
		type: String,
		default: "room1"
	},
	/*	correctly_answered : [{
		type: mongoose.Schema.Types.ObjectId,
	}],*/
	tokens: [{
		token: {
			type: String,
		}
	}],
	games: {
		type: Object
	}
}, {
	timestamps: true
})

userSchema.statics.findByCredentials = async (username, password) => {
    const user = await User.findOne({username})

    if(!user){
        throw new Error("Unable to login.")
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error("Unable to login.")
    }

    return user
}

userSchema.pre('save', async function (next) {
	const user = this 
	if (!user.games) {
		user.games = {
			"tic-tac-toe": false,
			"master-mind": false,
			"chain-reaction": false,
			"mask-room": false,
			"bounce-room": false,
			"mirror-game": false,
			"tetris": false,
			"path-game": false,
			"checkers": false,
			"puzzle1": false,
			"puzzle2": false,
			"puzzle3": false,
			"puzzle4": false,
			"puzzle5": false,
			"puzzle6": false,
			"puzzle7": false,
			"puzzle8": false,
			"puzzle9": false,
			"puzzle10": false,
			"puzzle11": false,
			"puzzle12": false,
			"puzzle13": false,
		}
	}
	if (user.isModified('password')) {
		user.password = await bcrypt.hash(user.password, 8)
	}
	next()
}) 

userSchema.methods.toJSON = function () {
	const user = this 
	const userObject = user.toObject() 

	delete userObject.password 
	delete userObject.tokens 

	return userObject
} 

userSchema.methods.generateAuthToken = async function () {
	const user = this 
	const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET_KEY) 
	user.tokens = user.tokens.concat({ token }) 
	await user.save() 

	return token
} 


const User = mongoose.model('User', userSchema)

module.exports = User
