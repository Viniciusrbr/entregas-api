import { Request, Response } from "express";
import z from "zod";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class DeliveryLogsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      delivery_id: z.uuid(),
      description: z.string(),
    })

    const { delivery_id, description } = bodySchema.parse(req.body);

    const delivery = await prisma.delivery.findUnique({
      where: {
        id: delivery_id,
      },
    })

    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    if (delivery.status === 'delivered') {
      throw new AppError('This order has already been delivered');
    }

    if (delivery.status === 'processing') {
      throw new AppError('Change status to shipped');
    }

    await prisma.deliveryLog.create({
      data: {
        deliveryId: delivery_id,
        description,
      },
    })

    return res.status(201).json();
  }

  async show(req: Request, res: Response) {
    const paramsSchema = z.object({
      delivery_id: z.uuid(),
    })

    const { delivery_id } = paramsSchema.parse(req.params);

    const delivery = await prisma.delivery.findUnique({
      where: {
        id: delivery_id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        deliveryLogs: true,
      },
    })

    if (req.user?.role === 'customer' && req.user.id !== delivery?.userId) {
      throw new AppError('The user can only view their own deliveries', 401);
    }

    return res.json(delivery);

  }
}

export { DeliveryLogsController };