import { faker } from '@faker-js/faker'

faker.seed(67890)

export const users: { id: number; name: string; email: string; password: string; status: string; created_at: Date; updated_at: Date }[] = Array.from({ length: 500 }, (_, index) => {
  const firstName = faker.person.firstName()
  const lastName = faker.person.lastName()
  return {
    id: index + 1,
    name: `${firstName} ${lastName}`,
    email: faker.internet.email({ firstName }).toLowerCase(),
    password: faker.internet.password(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'invited', 'suspended']),
    created_at: faker.date.past(),
    updated_at: faker.date.recent(),
  }
})
