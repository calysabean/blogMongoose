const uuid = require('uuid');

function StorageException(message) {
   this.message = message;
   this.name = "StorageException";
}

const BlogPosts = {
  create: function(title, content, author, publishDate) {
    const post = {
      id: uuid.v4(),
      title: title,
      content: content,
      author: author,
      created: number,
      publishDate: publishDate || Date.now(),
    };
    this.posts.push(post);
    return post;
  },
  get: function(id=null) {
 
    if (id !== null) {
      return this.posts.find(post => post.id === id);
    }
    
    return this.posts.sort(function(a, b) {
      return b.publishDate - a.publishDate
    });
  },
  delete: function(id) {
    const postIndex = this.posts.findIndex(
      post => post.id === id);
    if (postIndex > -1) {
      this.posts.splice(postIndex, 1);
    }
  },
  update: function(updatedPost) {
    const {id} = updatedPost;
    const postIndex = this.posts.findIndex(
      post => post.id === updatedPost.id);
    if (postIndex === -1) {
      throw new StorageException(
        `Can't update item \`${id}\` because doesn't exist.`)
    }
    this.posts[postIndex] = Object.assign(
      this.posts[postIndex], updatedPost);
    return this.posts[postIndex];
  }
};

function createBlogPostsModel() {
  const storage = Object.create(BlogPosts);
  storage.posts = [];
  return storage;
}

//schema code

const mongoose = require("mongoose");

// this is our schema to represent a blog
const blogPostSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    firstName: String,
    lastName: String
  },
});

blogPostSchema.virtual("authorString").get(function() {
  return `${this.author}`.trim();
});

blogPostSchema.methods.serialize = function() {
  return {

    id: this._id.uuid.v4(),
    title: this.title,
    content: this.content,
    author: this.author,
    created: this.number,
    publishDate: this.publishDate || Date.now(),
  };
};

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

//module.exports = {BlogPosts: createBlogPostsModel()};

module.exports = { BlogPost };
