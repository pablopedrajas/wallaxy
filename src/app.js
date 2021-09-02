const path = require('path')
const express = require('express')
const hbs = require('hbs')

// Create Express App
const app = express()
const port = process.env.PORT || 3000

// Define paths for Express configuration
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

// Setup handlebars engine and view location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve
app.use(express.static(publicDirectoryPath))

app.get('', (req,res) => {
    res.render('index', {
        title: 'Weather App',
        name: 'Licensede'
    })
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'About',
        name: 'Licensede'
    })
})

app.get('/donate', (req, res) => {
    res.render('donate', {
        title: 'Pricing',
        name: 'Licensede'
    })
})

/* app.get('/faq', (req, res) => {
    res.render('faq', {
        title: 'Frequently Asked Questions',
        name: 'Licensede'
    })
}) */

// Seting Error 404
app.get('*', (req, res) => {
    res.render('404', {
        title: '404: Page not found',
        name: 'Licensede'
    })
})

// App Listener
app.listen(port, () => {
    console.log('Server is up on port ' + port)
})
