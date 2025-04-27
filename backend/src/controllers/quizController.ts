import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Quiz } from "../entity/Quiz";
import { Lesson } from "../entity/Lesson";
import { Question } from "../entity/Question";

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title, description, passingScore, questions } = req.body;

    const lessonRepository = AppDataSource.getRepository(Lesson);
    const lesson = await lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    const quizRepository = AppDataSource.getRepository(Quiz);
    const quiz = quizRepository.create({
      title,
      description,
      passingScore,
      lesson,
    });

    const savedQuiz = await quizRepository.save(quiz);

    // Create questions if provided
    if (questions && questions.length > 0) {
      const questionRepository = AppDataSource.getRepository(Question);
      const questionEntities = questions.map((q: any) => 
        questionRepository.create({
          ...q,
          quiz: savedQuiz
        })
      );
      await questionRepository.save(questionEntities);
    }

    const result = await quizRepository.findOne({
      where: { id: savedQuiz.id },
      relations: ['questions']
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error in createQuiz:', error);
    res.status(500).json({ 
      message: "Failed to create quiz",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const quizRepository = AppDataSource.getRepository(Quiz);
    
    const quizzes = await quizRepository.find({
      where: { lesson: { id: lessonId } },
      relations: ['questions'],
      order: { createdAt: 'ASC' }
    });
    
    res.json(quizzes);
  } catch (error) {
    console.error('Error in getQuizzes:', error);
    res.status(500).json({ 
      message: "Failed to fetch quizzes",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const quizData = req.body;

    const quizRepository = AppDataSource.getRepository(Quiz);
    const quiz = await quizRepository.findOne({ 
      where: { id: quizId },
      relations: ['lesson', 'questions']
    });
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    quizRepository.merge(quiz, quizData);
    const result = await quizRepository.save(quiz);
    res.json(result);
  } catch (error) {
    console.error('Error in updateQuiz:', error);
    res.status(500).json({ 
      message: "Failed to update quiz",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const quizRepository = AppDataSource.getRepository(Quiz);
    
    const quiz = await quizRepository.findOne({ where: { id: quizId } });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    await quizRepository.remove(quiz);
    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error('Error in deleteQuiz:', error);
    res.status(500).json({ 
      message: "Failed to delete quiz",
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 