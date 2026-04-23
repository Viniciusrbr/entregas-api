import { Request, Response } from 'express';

class UsersController {
  create(req: Request, res: Response) {
    return res.json({ message: 'User created successfully' });
  }
}

export { UsersController };