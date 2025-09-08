'use strict';
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const IssueSchema = new mongoose.Schema({
  issue_title: {type: String, required: true},
  issue_text: {type: String, required: true},
  created_on: {type: Date, default: Date.now},
  updated_on: {type: Date, default: Date.now},
  created_by: {type: String, required: true},
  assigned_to: {type: String, default: ''},
  open: {type: Boolean, default: true},
  status_text: {type: String, default: ''}
});
const Issue = mongoose.model('Issue', IssueSchema);

module.exports = function (app) {

  app.route('/api/issues/:project')
    // View issues on a project
    .get(async function (req, res){
      try {
        let project = req.params.project;
        let filter = req.query;

        // Add query filters if needed
        if (req.query.open) {
          filter.open = req.query.open === 'true';
        }
        filter.project = project;

        const issues = await Issue.find({...filter});
        res.json(issues);
      } catch (err) {
        return res.status(500).json({error: 'internal server error'});
      }
    })
    
    // Create an issue
    .post(async function (req, res){
      let project = req.params.project;

      // Check for required fields
      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
        return res.json({error: 'required field(s) missing'});
      }

      // Create new issue
      const newIssue = new Issue({
        project: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      });

      try {
        const savedIssue = await newIssue.save();
        // Convert to plain object to remove mongoose metadata
        const issueObj = savedIssue.toObject();
        res.json(issueObj);
      } catch (err) {
        return res.status(500).json({ error: 'internal server error' });
      }
    })
    
    // Update an issue
    .put(async function (req, res){
      let project = req.params.project;
      let body = req.body;
      // Check for _id
      if (!body._id) {
        return res.json({ error: 'missing _id' });
      }
      // Check if at least one field to update is provided
      const updateFields = {};
      if (body.issue_title) updateFields.issue_title = body.issue_title;
      if (body.issue_text) updateFields.issue_text = body.issue_text;
      if (body.created_by) updateFields.created_by = body.created_by;
      if (body.assigned_to) updateFields.assigned_to = body.assigned_to;
      if (body.status_text) updateFields.status_text = body.status_text;
      if (body.open !== undefined) updateFields.open = body.open;
      if (Object.keys(updateFields).length === 0) {
        return res.json({ error: 'no update field(s) sent', '_id': body._id });
      }
      updateFields.updated_on = new Date();
      try {
        const updatedIssue = await Issue.findByIdAndUpdate(body._id, updateFields, { new: true });
        if (!updatedIssue) return res.json({ error: 'could not update', '_id': body._id });
        res.json({ result: 'successfully updated', '_id': body._id });
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'internal server error' });
      }
    })
    
    // Delete an issue
    .delete(async function (req, res){
      // let project = req.params.project;
      let body = req.body;

      // Check for _id
      if (!body._id) {
        return res.json({ error: 'missing _id' });
      }
      try {
        const deletedIssue = await Issue.findByIdAndDelete(body._id);
        if (!deletedIssue) return res.json({ error: 'could not delete', '_id': body._id });
        res.json({ result: 'successfully deleted', '_id': body._id });
      } catch (err) {
        return res.status(500).json({ error: 'internal server error' });
      }
    }
  );    
};
