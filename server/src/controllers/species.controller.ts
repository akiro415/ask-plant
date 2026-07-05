import { Request, Response, NextFunction } from 'express';
import { speciesService } from '../services/species.service';
import { createSpeciesSchema, updateSpeciesSchema, listSpeciesQuerySchema } from '../schemas/species.schema';

export const speciesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listSpeciesQuerySchema.parse(req.query);
      const items = await speciesService.list(query);
      res.json({ data: items });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const species = await speciesService.getById(String(req.params.id));
      res.json({ data: species });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSpeciesSchema.parse(req.body);
      const species = await speciesService.create(data);
      res.status(201).json({ data: species });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = updateSpeciesSchema.parse(req.body);
      const species = await speciesService.update(String(req.params.id), data);
      res.json({ data: species });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await speciesService.remove(String(req.params.id));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
