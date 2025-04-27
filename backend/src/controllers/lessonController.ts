import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Lesson } from "../entity/Lesson";
import { Course } from "../entity/Course";
import { Video } from "../models/mongoose/Video";
import { Quiz } from "../models/mongoose/Quiz";
import { Types } from "mongoose";

export const createLesson = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const { title, description, order } = req.body;

    const courseRepository = AppDataSource.getRepository(Course);
    const course = await courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const lessonRepository = AppDataSource.getRepository(Lesson);
    const lesson = lessonRepository.create({
      title,
      description,
      order,
      course,
    });

    const result = await lessonRepository.save(lesson);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createLesson:", error);
    res.status(500).json({
      message: "Failed to create lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getLessons = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.find({ courseId })
      .populate("videos")
      .populate("quizzes")
      .sort({ order: 1 });
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ error: "Failed to fetch lessons" });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const lessonData = req.body;

    const lessonRepository = AppDataSource.getRepository(Lesson);
    const lesson = await lessonRepository.findOne({
      where: { id: lessonId },
      relations: ["course"],
    });

    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    lessonRepository.merge(lesson, lessonData);
    const result = await lessonRepository.save(lesson);
    res.json(result);
  } catch (error) {
    console.error("Error in updateLesson:", error);
    res.status(500).json({
      message: "Failed to update lesson",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const lessonRepository = AppDataSource.getRepository(Lesson);

    const lesson = await lessonRepository.findOne({ where: { id: lessonId } });
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await lessonRepository.remove(lesson);

    // Delete associated videos and quizzes
    await Video.deleteMany({ lessonId: lessonId });
    await Quiz.deleteMany({ lessonId: lessonId });

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ error: "Failed to delete lesson" });
  }
};

export const addVideo = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title, description, url, duration, order } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const video = new Video({
      title,
      description,
      url,
      duration,
      order,
      lessonId: new Types.ObjectId(lessonId),
    });
    await video.save();

    lesson.videos.push(video._id);
    await lesson.save();

    res.status(201).json(video);
  } catch (error) {
    console.error("Error adding video:", error);
    res.status(500).json({ error: "Failed to add video" });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { lessonId, videoId } = req.params;
    const { title, description, url, duration, order } = req.body;

    const video = await Video.findOneAndUpdate(
      { _id: videoId, lessonId },
      { title, description, url, duration, order },
      { new: true }
    );
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    res.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { lessonId, videoId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const video = await Video.findOneAndDelete({ _id: videoId, lessonId });
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    lesson.videos = lesson.videos.filter((id) => id.toString() !== videoId);
    await lesson.save();

    res.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({ error: "Failed to delete video" });
  }
};

export const addQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { title, description, questions } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const quiz = new Quiz({
      title,
      description,
      questions,
      lessonId: new Types.ObjectId(lessonId),
    });
    await quiz.save();

    lesson.quizzes.push(quiz._id);
    await lesson.save();

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Error adding quiz:", error);
    res.status(500).json({ error: "Failed to add quiz" });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId, quizId } = req.params;
    const { title, description, questions } = req.body;

    const quiz = await Quiz.findOneAndUpdate(
      { _id: quizId, lessonId },
      { title, description, questions },
      { new: true }
    );
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }
    res.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    res.status(500).json({ error: "Failed to update quiz" });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { lessonId, quizId } = req.params;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }

    const quiz = await Quiz.findOneAndDelete({ _id: quizId, lessonId });
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    lesson.quizzes = lesson.quizzes.filter((id) => id.toString() !== quizId);
    await lesson.save();

    res.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    res.status(500).json({ error: "Failed to delete quiz" });
  }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const videos = await Video.find({ lessonId }).sort({ order: 1 });
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.params;
    const quizzes = await Quiz.find({ lessonId });
    res.json(quizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};
