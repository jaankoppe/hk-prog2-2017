const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/user');
const Post = require('../models/post');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * 
 * Rakendus kuulab GET päringut asukohta "/",
 * kus esimene parameeter on relatiivne asukoht serveri mõistes
 * ehk kui veebiserver on localhost:3000, siis app.get('/asukoht') oleks localhost:3000/asukoht.
*/

function ensureAuthenticated(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }else{
        req.flash('danger', 'Please login');
        return res.redirect('/login');
    }
}


router.get('/', (req, res) => {
    /**
     * Vaate "renderdamine", ehk parsitakse EJS süntaks HTML-iks kokku
     * ning saadetakse kliendile, kes selle päringu teostas (ehk kes sellele URL-ile läks)
    */
    res.render('pages/index');
});

router.get('/login', (req, res) => {
    res.render('pages/login');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are logged out');
    return res.redirect('/');
});

router.get('/register', (req, res) => {
    res.render('pages/register');
});

router.post('/register', (req, res) => {
    let email = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    let newUser = new User({
        email: email,
        password: password
    });

    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            if(err) {
                console.log(err);
                return res.redirect('/register');
            }

            newUser.password = hash;
            newUser.save(function(err) {
                if(err) {
                    console.log(err);
                    return res.redirect('/register');
                }
                return res.redirect('/login');
            })
        });
    });
});

router.get('/posts', (req, res) => {
    Post.find({}).populate('author').exec( (err, posts) => {
        if(err) {
            console.log(err);
        }else{
            
            res.locals.posts = posts;
            console.log(posts);
            res.render('pages/posts');
            //res.json(posts);
        }
    });
});
// Postituse lisamise vaade
router.get('/posts/add', ensureAuthenticated, (req, res) => {
    res.render('pages/add-post');
});
// Postituse lisamine
router.post('/posts/add', (req, res) => {
    console.log(req.body);
    let newPost = new Post({
        title: req.body.title,
        author: req.user._id,
        content: req.body.content
    });

    newPost.save((err) => {
        if(err) {
            console.log(err);
            res.redirect('/posts/add');
        }else{
            res.redirect('/posts');
        }
    });
});

// Üksiku postituse vaade
router.get('/post/:id', (req, res) => {
    let postId = req.params.id;
    Post.findOne({_id: postId}).populate('author').exec((err, post) => {
        if(err) {
            console.log(err);
            res.redirect('/posts');
        }else{
            res.locals.post = post;
            res.render('pages/single-post');
        }
    });
});

// Üksiku postituse vaade + kõik teised
router.get('/post/:id/sidebar', (req, res) => {
    let postId = req.params.id;
    Post.find({}, (err, posts) => {
        if(err) {
            console.log(err);
        }else{
            console.log(posts);
            let currentPost = null;
            posts.forEach(function(post) {
                if(post._id == postId) {
                    currentPost = post;
                    res.locals.post = currentPost;
                }
            });

            res.locals.allPosts = posts;
            
            console.log(posts);
            res.render('pages/single-post');
            //res.json(posts);
        }
    });
});

// Postituse muutmise vaade
router.get('/post/:id/edit',ensureAuthenticated, (req, res) => {
    let postId = req.params.id;
    Post.findOne({_id: postId, author: req.user}).exec((err, post) => {
        if(err) {
            console.log(err);
            res.redirect('/posts');
        }else{
            if(post) {
                res.locals.post = post;
                res.render('pages/edit-post');
            }else{
                return res.redirect('/posts');
            }
            
        }
    });
});

router.post('/post/:id/edit', ensureAuthenticated, (req, res) => {
    let post = {
        title: req.body.title,
        author: req.body.author,
        content: req.body.content
    };

    let query = {_id: req.params.id, author: req.user};

    Post.update(query, post, (err) => {
        if(err) {
            console.log(err);
            res.redirect('/post/' + req.params.id + '/edit');
        }else{
            if(post) {
                res.redirect('/post/' + req.params.id);
            }else{
                res.redirect('/posts');
            }
        }
    });

});

module.exports = router;