require('dotenv').config();

const express = require('express');

const Person = require('./models/person');


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
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`));

app.get('/api/persons', (req, res) => {
    Person.find({}).then(persons => {
        res.json(persons);
    })
})

app.post('/api/persons', (req, res, next) => {
    const body = req.body;    
    
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

    Person.findOne({name: body.name})
        .then(person => {
            if(person){
                return res.status(400).json({
                    error: 'contact already exists'
                })        
            }else {
                const person = new Person({        
                    name: body.name,
                    number: body.number
                })
                person.save()
                    .then(person => {
                        res.json(person);
                    })
                    .catch(error => next(error))
            }
        })
        .catch(error => next(error))
})

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if(person){
                res.json(person);
            }else{
                res.status(404).end();
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (req, res, next) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => next(error));
})

app.put('/api/persons/:id', (req, res, next) => {    
    Person.findByIdAndUpdate(req.params.id, req.body, {new: true})
        .then(person => {            
            res.json(person);
        })
        .catch(error => next(error));
})

app.get('/info', (req, res, next) => {
    Person.find({})
        .then(persons => {
            if(persons){
                res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date}</p> `);
            }else{
                res.send(`<p>Phonebook is empty`);
            }
        })
        .catch(error => next(error))
    
})

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server listens at port: ${PORT}`);
})


function unknownEndpoint(req, res) {
    res.status(404).send({error: 'unknown endpoint'});
}


function errorHandler(error, req, res, next){
    console.error(error);

    if(error.name === 'CastError'){
        return res.status(400).send({error: 'malformated id'});
    }
    if(error.name === 'ValidationError'){
        return res.status(400).json({error: error.message});
    }
    next(error)
}


