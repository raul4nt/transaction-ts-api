import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select()

    return { transactions }
    // o return fica melhor assim, com o transactions dentro de um
    // objeto, pois caso a gente queira futuramente retornar alguma outra
    // coisa junto, esta outra coisa nao se misturara com o select de
    // transactions
  })

  app.get('/:id', async (request) => {
    const getTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getTransactionParamsSchema.parse(request.params)

    const transaction = await knex('transactions').where('id', id).first()
    // com o first eu ja digo que vai ter apenas um id igual a esse
    // isso tb evita do banco, mesmo depois de achar um com id igual,
    // continuar fazendo uma varredura em todas as outras linhas para
    // tentar achar outro com este mesmo id

    return { transaction }
  })

  app.get('/summary', async () => {
    const summary = await knex('transactions')
    .sum('amount', { as: 'amount' })
    // define o nome da coluna apenas como amount, pq se nao 
    // ficaria sum('amount') no nome
    .first()
    // colocamos o first pq se nao ele retorna um array, queremos
    // dizer que o resultado vai ser um só

    return { summary }
  })


  app.post('/', async (request, reply) => {
    // { title, amount, type: credit ou debit }
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(
      request.body,
    )

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
    })

    return reply.status(201).send()
  })
}
