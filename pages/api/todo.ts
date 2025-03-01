// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {db} from '@/utils/db';
import type { NextApiRequest, NextApiResponse } from 'next'




export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { completed } = req.query;

        const results = await db.todo.findMany({
          where: {
            completed: completed !== undefined ? completed === 'true' : undefined,
          },
          orderBy: {
            id: 'desc',
          },
        });
        res.status(200).json(results);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;
    case 'POST':
      try {
        const { text, completed } = req.body;
        const result = await db.todo.create({
          data: {
            text,
            completed,
          },
        });
        res.status(201).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;
    case 'PUT':
      try {
        const { id } = req.query;
        const { completed } = req.body;
        const result = await db.todo.update({
          where: {
            id: parseInt(id as string),
          },
          data: {
            completed,
          },
        });
        res.status(200).json(result);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        if (id) {
          await db.todo.delete({
            where: {
              id: parseInt(id as string),
            },
          })
        } else {
          await db.todo.deleteMany();
        }
        res.status(204).end();
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).json({ message: `Method ${method} Not Allowed` });
  }
}
