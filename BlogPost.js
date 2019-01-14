  
  
  const express = require("express");
  const morgan = require('morgan');
  const router = express.Router();
  const mongoose = require("mongoose");
  mongoose.Promise = global.Promise;

  const bodyParser = require('body-parser');
  const jsonParser = bodyParser.json();

  const { PORT, DATABASE_URL } = require("./config");
  const { BlogPost, Author } = require("./model"); 

/*router.get("/", (req, res) => {
  res.json(BlogPost.get());
});*/

router.use(morgan('common'));
router.use(express.json());

router.get('/authors', (req, res) => {
  Author
    .find()
    .then(authors => {
      res.json(authors.map(author => {
        return {
          id: author._id,
          name: `${author.firstName} ${author.lastName}`,
          userName: author.userName
        };
      }));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});


router.post('/authors', (req, res) => {
  const requiredFields = ['firstName', 'lastName', 'userName'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Author
    .findOne({ userName: req.body.userName })
    .then(author => {
      if (author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            userName: req.body.userName
          })
          .then(author => res.status(201).json({
              _id: author.id,
              name: `${author.firstName} ${author.lastName}`,
              userName: author.userName
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});


router.put('/authors/:id', (req, res) => {
  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['firstName', 'lastName', 'userName'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  Author
    .findOne({ userName: updated.userName || '', _id: { $ne: req.params.id } })
    .then(author => {
      if(author) {
        const message = `Username already taken`;
        console.error(message);
        return res.status(400).send(message);
      }
      else {
        Author
          .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
          .then(updatedAuthor => {
            res.status(200).json({
              id: updatedAuthor.id,
              name: `${updatedAuthor.firstName} ${updatedAuthor.lastName}`,
              userName: updatedAuthor.userName
            });
          })
          .catch(err => res.status(500).json({ message: err }));
      }
    });
});


router.delete('/authors/:id', (req, res) => {
  BlogPost
    .remove({ author: req.params.id })
    .then(() => {
      Author
        .findByIdAndRemove(req.params.id)
        .then(() => {
          console.log(`Deleted blog posts owned by and author with id \`${req.params.id}\``);
          res.status(204).json({ message: 'success' });
        });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

router.get("/", (req, res) => {
  BlogPost
  .find()  
  .then(posts => {
    console.log(posts);
    res.json(posts.map(post => {
      return {
        id: post._id,
        author: post.authorName,
        content: post.content,
        title: post.title
      };
    }));
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  });
});

router.get("/:id", (req, res) => { 
  BlogPost
  .findById(req.params.id)
  .then(post => {
    res.json({
      id: post._id,
      author: post.authorName,
      content: post.content,
      title: post.title,
      comments: post.comments
    });
  })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post("/", jsonParser, (req, res) => {

  const requiredFields = ['title', 'content', 'author_id'];
  requiredFields.forEach(field => {
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  });

  Author
    .findById(req.body.author_id)
    .then(author => {
      if (author) {
        BlogPost
          .create({
            title: req.body.title,
            content: req.body.content,
            author: req.body.id
          })
          .then(blogPost => res.status(201).json({
              id: blogPost.id,
              author: `${author.firstName} ${author.lastName}`,
              content: blogPost.content,
              title: blogPost.title,
              comments: blogPost.comments
            }))
          .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
          });
      }
      else {
        const message = `Author not found`;
        console.error(message);
        return res.status(400).send(message);
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went horribly awry' });
    });
});

router.delete("/:id", (req, res) => {
  BlogPost.findByIdAndRemove(req.params.id)
  .then(() => {
    res.status(204).json({ message: 'success' });
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({ error: 'something went terribly wrong' });
  });
});

router.put("/:id", jsonParser, (req, res) => {

  if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    // we return here to break out of this function
    return res.status(400).json({message: message});
  }

  const updated = {};
  const updateableFields = [ "title", "content"];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
    .then(updatedPost => res.status(200).json({
      id: updatedPost.id,
      title: updatedPost.title,
      content: updatedPost.content
    }))
    .catch(err => res.status(500).json({ message: err }));
});

router.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(() => {
      console.log(`Deleted blog post with id \`${req.params.id}\``);
      res.status(204).end();
    });
});

module.exports = router;



