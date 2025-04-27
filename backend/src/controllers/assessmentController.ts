import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Assessment } from '../entity/Assessment';

const assessmentRepository = AppDataSource.getRepository(Assessment);

export const assessmentController = {
  getAllAssessments: async (req: Request, res: Response) => {
    try {
      const assessments = await assessmentRepository.find();
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assessments', error });
    }
  },

  getAssessmentById: async (req: Request, res: Response) => {
    try {
      const assessment = await assessmentRepository.findOne({ where: { id: req.params.id } });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching assessment', error });
    }
  },

  createAssessment: async (req: Request, res: Response) => {
    try {
      const assessment = assessmentRepository.create(req.body);
      const result = await assessmentRepository.save(assessment);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error creating assessment', error });
    }
  },

  updateAssessment: async (req: Request, res: Response) => {
    try {
      const assessment = await assessmentRepository.findOne({ where: { id: req.params.id } });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      assessmentRepository.merge(assessment, req.body);
      const result = await assessmentRepository.save(assessment);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error updating assessment', error });
    }
  },

  deleteAssessment: async (req: Request, res: Response) => {
    try {
      const assessment = await assessmentRepository.findOne({ where: { id: req.params.id } });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      await assessmentRepository.remove(assessment);
      res.json({ message: 'Assessment deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting assessment', error });
    }
  },

  submitAssessment: async (req: Request, res: Response) => {
    try {
      const assessment = await assessmentRepository.findOne({ where: { id: req.params.id } });
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }
      // TODO: Implement assessment submission logic
      res.json({ message: 'Assessment submitted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error submitting assessment', error });
    }
  }
}; 