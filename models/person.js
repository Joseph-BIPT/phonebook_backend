const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
const url = process.env.MONGODB_URI;

mongoose.connect(url)
// eslint-disable-next-line no-unused-vars
  .then(result => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err.message);

  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v){
        return /\d{2,3}-\d{6}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }

  }
})

personSchema.set('toJSON', {
  transform(document, returnedObject){
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id,
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema);