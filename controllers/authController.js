const User = require("../models/User");
const jwt = require('jsonwebtoken');

const handleErrors = (err) => {
  let errors = { email: '', password: '', name: '' };

  if (err.message === 'This User Isnt Exsists') {
    errors.email = 'This User Isnt Exsists';
  } else if (err.message === 'Name Isnt Correct') {
    errors.name = 'Name Isnt Correct';
  } else if (err.message === 'Password Isnt Correct') {
    errors.password = 'Password Isnt Correct';
  }

  if (err.message === 'You Cant Use Special Characters In Username') {
    errors.name = 'You Cant Use Special Characters In Username';
  } else if (err.message === "username is already registered") {
    errors.name = 'username is already registered';
  } else if (err.message === 'Too Long Password') {
    errors.name = 'Too Long Password';
  }



  // duplicate email error
  if (err.code === 11000) {
      errors.email = 'that email is already registered';
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

let maxAge = 3 * 24 * 60 * 60;

 function CreateToken(id) {
  return jwt.sign({ id }, 'key', {
    expiresIn: maxAge
  });
}

module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}


module.exports.signup_post = async (req, res) => {
  try {
    const checkUser = await User.checkName(req.body.name);
    const validation = await User.NameValidation(req.body.name);
    const user = await User.create(req.body);
    const token = CreateToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    return res.status(200).json({ user: user});
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  try {
    const user = await User.login(req.body.email, req.body);
    const token = CreateToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    return res.status(200).json({ user: user });
  } catch (err) {
    const errors = handleErrors(err);
    return res.status(400).json({ errors });
  }
}

module.exports.logout_get = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}