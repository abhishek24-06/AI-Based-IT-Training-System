import { QuizAttempt, IQuizAttempt } from '../QuizAttempt';
import { Types } from 'mongoose';
import { connect, disconnect } from '../../../database';

describe('QuizAttempt Model', () => {
  beforeAll(async () => {
    await connect();
  });

  afterAll(async () => {
    await disconnect();
  });

  beforeEach(async () => {
    await QuizAttempt.deleteMany({});
  });

  it('should create a new quiz attempt', async () => {
    const attemptData = {
      quizId: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      score: 85,
      passed: true,
      timeSpent: 1200,
      answers: [
        {
          questionId: new Types.ObjectId(),
          answer: '42',
          timeSpent: 30,
          isCorrect: true
        }
      ]
    };

    const attempt = new QuizAttempt(attemptData);
    await attempt.save();

    const foundAttempt = await QuizAttempt.findById(attempt._id);
    expect(foundAttempt).toBeDefined();
    expect(foundAttempt?.score).toBe(85);
    expect(foundAttempt?.passed).toBe(true);
    expect(foundAttempt?.timeSpent).toBe(1200);
    expect(foundAttempt?.answers).toHaveLength(1);
  });

  it('should validate required fields', async () => {
    const attempt = new QuizAttempt({});
    
    let error;
    try {
      await attempt.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.quizId).toBeDefined();
    expect(error.errors.userId).toBeDefined();
    expect(error.errors.score).toBeDefined();
    expect(error.errors.passed).toBeDefined();
    expect(error.errors.timeSpent).toBeDefined();
    expect(error.errors.answers).toBeDefined();
  });

  it('should validate score range', async () => {
    const attempt = new QuizAttempt({
      quizId: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      score: 150,
      passed: true,
      timeSpent: 1200,
      answers: []
    });

    let error;
    try {
      await attempt.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.score).toBeDefined();
  });

  it('should validate timeSpent minimum', async () => {
    const attempt = new QuizAttempt({
      quizId: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      score: 85,
      passed: true,
      timeSpent: -100,
      answers: []
    });

    let error;
    try {
      await attempt.validate();
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();
    expect(error.errors.timeSpent).toBeDefined();
  });

  it('should populate quiz and user references', async () => {
    const quizId = new Types.ObjectId();
    const userId = new Types.ObjectId();

    const attempt = new QuizAttempt({
      quizId,
      userId,
      score: 85,
      passed: true,
      timeSpent: 1200,
      answers: []
    });

    await attempt.save();

    const populatedAttempt = await QuizAttempt.findById(attempt._id)
      .populate('quizId', 'title')
      .populate('userId', 'name');

    expect(populatedAttempt).toBeDefined();
    expect(populatedAttempt?.quizId).toBeDefined();
    expect(populatedAttempt?.userId).toBeDefined();
  });

  it('should automatically set completedAt timestamp', async () => {
    const attempt = new QuizAttempt({
      quizId: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      score: 85,
      passed: true,
      timeSpent: 1200,
      answers: []
    });

    await attempt.save();

    expect(attempt.completedAt).toBeDefined();
    expect(attempt.completedAt).toBeInstanceOf(Date);
  });

  it('should calculate total time spent from answers', async () => {
    const attempt = new QuizAttempt({
      quizId: new Types.ObjectId(),
      userId: new Types.ObjectId(),
      score: 85,
      passed: true,
      timeSpent: 0,
      answers: [
        {
          questionId: new Types.ObjectId(),
          answer: 'A',
          timeSpent: 30,
          isCorrect: true
        },
        {
          questionId: new Types.ObjectId(),
          answer: 'B',
          timeSpent: 45,
          isCorrect: false
        }
      ]
    });

    await attempt.save();

    const totalTimeSpent = attempt.answers.reduce((sum, answer) => sum + answer.timeSpent, 0);
    expect(attempt.timeSpent).toBe(totalTimeSpent);
  });
}); 