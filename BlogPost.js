const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const { PORT, DATABASE_URL } = require("./config");
const { BlogPosts } = require("./model"); 

/*function blogText() {
  return (
    "Fake text. Fake text. Fake text. Fake text. Fake text. Fake text. Fake text. Fake text." +
    "Fake text. Fake text. Fake text. Fake text. Fake text." +
    "Fake text. Fake text. Fake text. Fake text. Fake text." +
    "Fake text. Fake text. Fake text. Fake text. Fake text." +
    "Fake text. Fake text. Fake text. Fake text. Fake text. " +
    "Fake text. Fake text. Fake text. Fake text. Fake text."
  );
}

BlogPosts.create("title1", blogText(), "Author1");
BlogPosts.create("title2", blogText(), "Author2");*/


//router.get("/", (req, res) => {
  //res.json(BlogPosts.get());
//});

router.get("/", (req, res) => {
  BlogPosts.find()
    
  .then(blogs => {
    res.json({
      blogs: blogs.map(blogs => blogs.serialize())
    });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });
});

router.get("/", (req, res) => { 
  BlogPosts

  .findById(req.params.id)
    .then(blog => res.json(blog.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post("/", jsonParser, (req, res) => {

    const requiredFields = ["title", "content", "author"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  //const item = BlogPosts.create(
    //req.body.title,
    //req.body.content,
    //req.body.author
  //);
  //res.status(201).json(item);
//});

  BlogPosts.create({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
})
.then(blog => res.status(201).json(blog.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

/*router.put("/:id", jsonParser, (req, res) => {
  const requiredFields = ["id", "title", "content", "author"];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    const message = `Request path id (${
      req.params.id
    }) and request body id ``(${req.body.id}) must match`;
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating blog post with id \`${req.params.id}\``);
  BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });
  res.status(200).end();
});*/

router.put("/:id", jsonParser, (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    // we return here to break out of this function
    return res.status(400).json({message: message});
  }

  const toUpdate = {};
  const updateableFields = ["id", "title", "content", "author"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BlogPosts
    .findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});

router.delete("/:id", (req, res) => {
  BlogPosts.findByIdAndRemove(req.params.id)
    .then(blog => res.status(204).end())
    .catch(err => res.status(500).json({ message: "Internal server error" }));
});




module.exports = router;
