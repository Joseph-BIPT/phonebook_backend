const express = require('express');

const app = express();

const morgan = require('morgan');

let persons = [    
    { 
        id: "1",
        name: "Arto Hellas", 
        number: "040-123456"
    },
    { 
        id: "2",
        name: "Ada Lovelace", 
        number: "39-44-5323523"
    },
    { 
        id: "3",
        name: "Dan Abramov", 
        number: "12-43-234345"
    },
    { 
        id: "4",
        name: "Mary Poppendieck", 
        number: "39-23-6423122"
    }    
]

app.use(express.json());

app.use(express.static('dist'));

morgan.token('body', (req, res) => {
    if(req.method === 'POST'){
        return JSON.stringify(req.body)
    }else{
        return ' '
    }
})
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body')}`));

app.get('/api/persons', (req, res) => {
    res.json(persons);
})

app.post('/api/persons', (req, res) => {
    const body = req.body;
    const id = Math.floor(Math.random() * 1000000);
    
    if(!body.name){
        return res.status(400).json({
            error: 'name missing'
        })
    }
    if(!body.number){
        return res.status(400).json({
            error: 'number missing'
        })
    }

    const idx = persons.findIndex(person => person.name === body.name)
    if(idx !== -1){
        return res.status(400).json({
            error: 'contact already exists'
        })
    }
    const person = {
        id: id,
        name: body.name,
        number: body.number
    }
    persons = persons.concat(person);
    
    res.json(person);
})

app.get('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    const person = persons.find(person => person.id === id);
    console.log(id)
    if(!person){
        return res.status(404).json({
            error: 'person entry does not exist'
        });
    }
    res.json(person);
})

app.delete('/api/persons/:id', (req, res) => {
    const id = req.params.id;
    persons = persons.filter(person => person.id !== id);
    res.status(204).end();
})

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date}</p> `);
})

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listens at port: ${PORT}`);
})


function unknownEndpoint(req, res) {
    res.status(404).send({error: 'unknown endpoint'});
}