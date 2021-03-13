const moogoose = require('mongoose')
const uri = process.env.MONGODB_URI
    // mongodb+srv://dbUser:123@cluster0.knc4f.mongodb.net/JobtestDB?retryWrites=true&w=majority
moogoose.connect('mongodb+srv://dbUser:123@cluster0.knc4f.mongodb.net/JobtestDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
const db = moogoose.connection

db.on('error', function(err) {
    if (err) console.log('Error DB: ' + err)
})

db.once('open', function() {
    console.log('Connected !')
})