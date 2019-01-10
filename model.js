//schema code

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

// this is our schema to represent a blog
const blogPostSchema = mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  created: {type: Date, default: Date.now},
  author: {
    firstName: String,
    lastName: String
  },
});

blogPostSchema.virtual("authorString").get(function() {
  return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.serialize = function() {
  return {
    id: this._id,
    content: this.content,
    author: this.authorString,
    created: this.created,
  };
};

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

//module.exports = {BlogPosts: createBlogPostsModel()};

module.exports = { BlogPost };
