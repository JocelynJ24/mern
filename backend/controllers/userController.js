const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')


// @ Description        Register New User 
// @ Route              POST /api/users
// @ Access             Public
const registerUser = asyncHandler (async (req, res) => {
    const { name, email, password } = req.body

    if ( !name || !email || !password ) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    // Check if User Exists
    const userExists = await User.findOneAndDelete({email})

    if (userExists) {
        res.status(400)
        throw new Error ('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    //Create User
    const user = await User.create({
        name, 
        email, 
        password: hashedPassword
    })

    if (user) {
        res.status(201).json({
            _id: user.id, 
            name: user.name,
            email: user.email, 
            token: generateToken(user._id)
        })

    } else {
        res.status (400)
        throw new Error('Invalid User Data')
    }
    
})

// @ Description        Authenticate a User 
// @ Route              POST /api/login
// @ Access             Public
const loginUser = asyncHandler (async (req, res) => {
    const { email, password } = req.body

    // Check for the User's Email
    const user = await User.findOne({email})

    // Match the User's password
    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id, 
            name: user.name, 
            email: user.email, 
            token: generateToken(user._id),
        })
    } else {
        res.status (400)
        throw new Error ('Invalid Credentials')
    }
})

// @ Description        Get user data 
// @ Route              GET /api/user/me
// @ Access             Private 
const getMe = asyncHandler (async (req, res) => { 
    const { _id, name, email } = await User.findById(req.user.id)

    res.status(200).json({
        id: _id, 
        name, 
        email,
    })
    res.json ({ message: 'User Data Display' })
})

// Generate JWT 
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = {
    registerUser, loginUser, getMe,
}


