const express = require('express')
const fs = require('fs')
const cors = require('cors')
const {nanoid} = require('nanoid')


const readData = (fileName) => JSON.parse(fs.readFileSync(`./tasks/${fileName}.json`, 'utf8'))
const server = express()
server.use(cors())
server.use(express.json())

server.get('/api/users', (req, res) => {
    const users = getAllUsers()
    res.json(users)
})

server.get('/api/tasks/:category', (req, res) => {
    const data = readData(req.params.category)
    console.log(data)
    const findWork = data
        .filter(item => !item._isDeleted)
        .map(item => {
            delete item._isDeleted
            delete item._createdAt
            delete item._deletedAt
            return item
        })

    res.json(findWork)
})

server.get('/api/tasks/:category/:timespan', (req, res) => {
    const data = readData(req.params.category)
    const duration = {
        "day": 1000 * 60 * 60 * 24,
        "week": 1000 * 60 * 60 * 24 * 7,
        "month": 1000 * 60 * 60 * 24 * 30,
        "year": 1000 * 60 * 60 * 24 * 365,
    }
    const filteredData = data.filter(item => +new Date() - item._createdAt < duration[req.params.timespan])
    res.json(filteredData)
})
server.post("/api/tasks/:category", (req, res) => {
    const newTask = {
        "taskId": nanoid(5),
        "status": 'new',
        "title": req.body.title,
        "_isDeleted": false,
        "_createdAt": +new Date(),
        "_deletedAt": null
    }
    const data = readData(req.params.category)
    const updatedTask = [...data, newTask]
    fs.writeFileSync(`./tasks/${req.params.category}.json`, JSON.stringify(updatedTask, null, 2))
    res.json(newTask)
})

server.patch("/api/tasks/:category/:id", (req, res) => {
    const statuses = ['done', 'new', 'in progress', 'blocked']
    const data = readData(req.params.category)
    const updatedData = data.find(el => el.taskId === req.params.id)
    if (statuses.includes(req.body.status)) {
        const updatedTasks = data.map(item => item.taskId === req.params.id ? {
            ...item,
            status: req.body.status,
            _createdAt: +new Date()
        } : item)
        fs.writeFileSync(`./tasks/${req.params.category}.json`, JSON.stringify(updatedTasks, null, 2))
    }
    res.json(updatedData)
})
server.delete('/api/tasks/:category/:id', (req, res) => {
    const data = readData(req.params.category)
    const deletedData = data.find(el => el.taskId === req.params.id)
    const updatedTask = data.map(item => item.taskId === req.params.id ? {...item, _isDeleted: true} : item)
    fs.writeFileSync(`./tasks/${req.params.category}.json`, JSON.stringify(updatedTask, null, 2))
    res.json(deletedData)
    console.log(req.params)
})


server.listen(process.env.PORT || 8000, () => {
    console.log('Server is running')
})





