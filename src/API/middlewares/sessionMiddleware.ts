import session from 'express-session';

//TOTO: !!!!
/*
if (!process.env.SECRET) {
  console.error('Secret is not defined!');
  process.exit(1);
}
*/

const sessionMiddleware = session({
  cookie: {
    maxAge: 3600000
  },
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
});

export default sessionMiddleware;
