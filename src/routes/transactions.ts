import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'

// Cookies <-> Formas da gente manter contexto entre requisições
// de maneira geral, coleta o que vc esta fazendo mesmo sem login
// gera um id no teu navegador ou algo do tipo
// parametros criados pela propria aplicaçao e enviado em todas
// as requisições
// ótimos para identificar usuarios ou anotar informações entre requisiçoes
// (informações de contexto)

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

    let sessionId = request.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        // quais rotas podem usar este cookie
        maxAge: 60 * 60 * 24 * 7, // 7 days
        // passa em segundos quanto tempo o cookie vai durar no
        // navegador do usuario
      })
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })
}
