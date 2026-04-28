import request from 'supertest'
import { app } from '@/app'
import { prismaMock } from '@/database/singleton'
import { UserRole } from '@/generated/prisma/client'
import { hash } from 'bcrypt'

describe('SessionsController', () => {

  it('should authenticate and get access token', async () => {
    const hashedPassword = await hash('123456', 1)

    prismaMock.user.findFirst.mockResolvedValue({
      id: 'test-uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      role: UserRole.customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const sessionResponse = await request(app).post('/sessions').send({
      email: 'john.doe@example.com',
      password: '123456',
    })

    expect(sessionResponse.status).toBe(200)
    expect(sessionResponse.body.token).toEqual(expect.any(String))
  })
})
