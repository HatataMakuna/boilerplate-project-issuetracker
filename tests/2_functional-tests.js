const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    let _id1; // For PUT and DELETE tests

    // #1
    test('Create an issue with every field: POST request to /api/issues/{project}', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Functional Test - Every field',
                assigned_to: 'Chai and Mocha',
                status_text: 'In QA'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'text');
                assert.equal(res.body.created_by, 'Functional Test - Every field');
                assert.equal(res.body.assigned_to, 'Chai and Mocha');
                assert.equal(res.body.status_text, 'In QA');

                _id1 = res.body._id; // Save _id for PUT and DELETE tests
                done();
            });
    });
    // #2
    test('Create an issue with only required fields: POST request to /api/issues/{project}', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text',
                created_by: 'Functional Test - Required fields'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.issue_title, 'Title');
                assert.equal(res.body.issue_text, 'text');
                assert.equal(res.body.created_by, 'Functional Test - Required fields');
                assert.equal(res.body.assigned_to, '');
                assert.equal(res.body.status_text, '');

                _id1 = res.body._id; // Save _id for PUT and DELETE tests
                done();
            });
    });
    // #3
    test('Create an issue with missing required fields: POST request to /api/issues/{project}', function(done) {
        chai.request(server)
            .post('/api/issues/test')
            .send({
                issue_title: 'Title',
                issue_text: 'text'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
    });
    // #4
    test('View issues on a project: GET request to /api/issues/{project}', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    });
    // #5
    test('View issues on a project with one filter: GET request to /api/issues/{project}', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .query({created_by: 'Functional Test - Every field'})
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                res.body.forEach(issue => {
                    assert.equal(issue.created_by, 'Functional Test - Every field');
                });
                done();
            });
    });
    // #6
    test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function(done) {
        chai.request(server)
            .get('/api/issues/test')
            .query({
                created_by: 'Functional Test - Every field',
                issue_title: 'Title'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                res.body.forEach(issue => {
                    assert.equal(issue.created_by, 'Functional Test - Every field');
                    assert.equal(issue.issue_title, 'Title');
                });
                done();
            });
    });
    // #7
    test('Update one field on an issue: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: _id1,
                issue_text: 'Updated text'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, _id1);
                done();
            });
    });
    // #8
    test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: _id1,
                issue_text: 'Updated text',
                issue_title: 'Updated title'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, _id1);
                done();
            });
    });
    // #9
    test('Update an issue with missing _id: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({
                issue_text: 'Updated text'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });
    // #10
    test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: _id1
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, _id1);
                done();
            });
    });
    // #11
    test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function(done) {
        chai.request(server)
            .put('/api/issues/test')
            .send({
                _id: '64a7f0f4e4b0c8b1c8e4d1a1',
                issue_text: 'Updated text'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not update');
                assert.equal(res.body._id, '64a7f0f4e4b0c8b1c8e4d1a1');
                done();
            });
    });
    // #12
    test('Delete an issue: DELETE request to /api/issues/{project}', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({
                _id: _id1
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, _id1);
                done();
            });
    });
    // #13
    test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({
                _id: '64a7f0f4e4b0c8b1c8e4d1a1'
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, '64a7f0f4e4b0c8b1c8e4d1a1');
                done();
            });
    });
    // #14
    test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function(done) {
        chai.request(server)
            .delete('/api/issues/test')
            .send({
            })
            .end(function(err, res){
                assert.equal(res.status, 200);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    });
});
