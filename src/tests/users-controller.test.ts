import request from 'supertest'
import { app } from '@/app'
import { prismaMock } from '@/database/singleton'
import { UserRole } from '@/generated/prisma/client'

describe('UsersController', () => {
  it('should create a new user successfully', async () => {
    prismaMock.user.findFirst.mockResolvedValue(null)

    prismaMock.user.create.mockResolvedValue({
      id: 'test-uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: UserRole.customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    })

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe('John Doe')
  })

  it('should throw an error if user with same email already exists', async () => {
    prismaMock.user.findFirst.mockResolvedValue({
      id: 'existing-uuid',
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'hashed-password',
      role: UserRole.customer,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123456',
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe('User with same email already exists')
  })

  it('should throw a validation error if email is invalid', async () => {
    const response = await request(app).post('/users').send({
      name: 'John Doe',
      email: 'invalid-email',
      password: '123456',
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/validation error/i)
  })
})
