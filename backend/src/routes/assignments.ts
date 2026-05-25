import { Router, Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { generationQueue } from '../queue/queue';
import { getCache, setCache, deleteCache } from '../config/redis';
import { validate } from '../middleware/errorHandler';
import { createAssignmentSchema } from '../validation/schemas';

const router = Router();

// GET /api/assignments - List all assignments
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, status } = req.query;
    const filter: any = {};

    if (search) {
      filter.title = { $regex: search as string, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const assignments = await Assignment.find(filter)
      .select('-result')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/assignments/:id - Get single assignment with result
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check Redis cache first
    const cached = await getCache(`assignment:result:${id}`);
    if (cached) {
      console.log('📦 Serving from cache');
      res.json({ success: true, data: JSON.parse(cached) });
      return;
    }

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    // Cache the result if completed
    if (assignment.status === 'completed') {
      await setCache(`assignment:result:${id}`, JSON.stringify(assignment));
    }

    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/assignments - Create assignment & enqueue AI generation
router.post('/', validate(createAssignmentSchema), async (req: Request, res: Response) => {
  try {
    const { title, subject, className, dueDate, questionTypes, additionalInstructions } = req.body;

    // Create assignment in MongoDB
    const assignment = await Assignment.create({
      title,
      subject,
      className,
      dueDate: new Date(dueDate),
      questionTypes,
      additionalInstructions,
      status: 'pending',
    });

    // Add job to BullMQ queue
    await generationQueue.add('generate-paper', {
      assignmentId: assignment._id.toString(),
      title,
      subject,
      className,
      questionTypes,
      additionalInstructions,
    });

    res.status(201).json({
      success: true,
      data: assignment,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/assignments/:id - Delete assignment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    // Clear cache
    await deleteCache(`assignment:result:${id}`);

    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/assignments/:id/regenerate - Re-trigger AI generation
router.post('/:id/regenerate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    // Reset status and clear old result
    assignment.status = 'pending';
    assignment.result = undefined;
    await assignment.save();

    // Clear cache
    await deleteCache(`assignment:result:${id}`);

    // Re-enqueue job
    await generationQueue.add('generate-paper', {
      assignmentId: id,
      title: assignment.title,
      subject: assignment.subject,
      className: assignment.className,
      questionTypes: assignment.questionTypes,
      additionalInstructions: assignment.additionalInstructions,
    });

    res.json({ success: true, data: assignment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
