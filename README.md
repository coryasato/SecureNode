Secure Node
==========

Authentication App following Chris Sevilleja's excellent series, [Easy Node Authentication](http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local "Scotch.io").  Very clean and well written guide to Passport.js and Express.  I tweaked and added a few things noted below.

<hr />

### Adds and amends:

+ Updated to **Express 4**
+ Form validation w/ [express-validator](https://github.com/ctavan/express-validator)
+ csrf (now csurf @ [repo](https://github.com/expressjs/csurf)). <br />
	+ Note: Use req.csrfToken(), req.session._csrf is deprecated.
+ Added helmet for other Header securities.
+ Did NOT add Facebook or Twitter support.

<hr />

### Todo:

+ BDD tests.
+ SSL/TLS.
+ Create bootstrapped front-end w/ csrf tokens.
+ Add Github Strategy.  FTW!
+ Stress test all security gates for further learning.





