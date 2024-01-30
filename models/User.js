const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter a username'],
    lowercase: true,
},
  email: {
    type: String,
    required: [true, 'Please enter an email'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please enter a password'],
    minlength: [6, 'Minimum password length is 6 characters'],
  }
});

userSchema.statics.checkName = async function (name) {
  const user = await this.findOne({name});

  if (user) {
    throw Error('username is already registered');
  }
}

userSchema.statics.NameValidation = async function (name) {
  function isValidString(inputString) {
    // استخدام تعبير القائمة الرئيسية للتحقق من وجود حروف وأرقام ومسافات فقط
    var regex = /^[a-zA-Z0-9\s]+$/;
  
    // تحقق من التطابق
    if (regex.test(inputString)) {
      return true; // النص صالح
    } else {
      return false; // النص غير صالح
    }
  }

  if (!isValidString(name) && name.length !== 0)  {
    throw Error('You Cant Use Special Characters In Username');
  }

  if (name.length > 25) {
    console.log(`${name} ${name.length} ${typeof name}`)
    throw Error('Too Long Password');
  }

}

userSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('user', userSchema);

module.exports = User;