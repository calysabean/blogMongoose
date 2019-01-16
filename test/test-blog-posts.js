hello

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);


describe('BlogPosts', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should show current blog-Posts on GET', function() {
   
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {

        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        res.body.should.have.length.of.at.least(1);

        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
        });
      });
  });

  it('should add a new Blog on POST', function() {
    const newBloPost = {
        title: 'New Post2', content: ['fake text'], author: 'some-name', publishDate: 'today'};
    return chai.request(app)
      .post('/blog-posts')
      .send(newBloPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'title', 'content', 'author', 'publishDate');
        res.body.title.should.equal(newBloPost.title);
        res.body.content.should.be.a('array');
        res.body.content.should.include.members(newBloPost.content);
      });
  });

  it('should update Blog on PUT', function() {

    const updateData = {
      title: 'random title',
      content: ['fake text'],
      author: 'random author',
      publishDate: 'random date'
    };

    return chai.request(app)

      .get('/blog-posts')
      .then(function(res) {
        updateData.id = res.body[0].id;

        return chai.request(app)
          .put(`/blog-posts/${updateData.id}`)
          .send(updateData)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });

  it('should delete Blog-Post on DELETE', function() {
    return chai.request(app)
      
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`)
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});