const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const Post = require('../models/post');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

/**
 * 
 * Rakendus kuulab GET päringut asukohta "/",
 * kus esimene parameeter on relatiivne asukoht serveri mõistes
 * ehk kui veebiserver on localhost:3000, siis app.get('/asukoht') oleks localhost:3000/asukoht.
*/
router.get('/', (req, res) => {
    /**
     * Vaate "renderdamine", ehk parsitakse EJS süntaks HTML-iks kokku
     * ning saadetakse kliendile, kes selle päringu teostas (ehk kes sellele URL-ile läks)
    */
    res.render('pages/index');
});

router.get('/posts', (req, res) => {
    Post.find({}, (err, posts) => {
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
router.get('/posts/add', (req, res) => {
    res.render('pages/add-post');
});
// Postituse lisamine
router.post('/posts/add', (req, res) => {
    console.log(req.body);
    let newPost = new Post({
        title: req.body.title,
        author: req.body.author,
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
    Post.findOne({_id: postId}).exec((err, post) => {
        if(err) {
            console.log(err);
            res.redirect('/posts');
        }else{
            res.locals.post = post;
            res.render('pages/single-post');
        }
    });
});

module.exports = router;