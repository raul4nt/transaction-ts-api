import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

// Cookies <-> Formas da gente manter contexto entre requisições
// de maneira geral, coleta o que vc esta fazendo mesmo sem login
// gera um id no teu navegador ou algo do tipo
// parametros criados pela propria aplicaçao e enviado em todas
// as requisições
// ótimos para identificar usuarios ou anotar informações entre requisiçoes
// (informações de contexto)

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
      // antes de executar o handler(ou seja, o que vem abaixo), ele executará
      // este preHandler, que é um array de functions que eu posso colocar
      // neste caso, ele executara o checkSessionIdExists, e, caso de algum erro,
      // ja vai dar
    },
    async (request) => {
      const { sessionId } = request.cookies

      const transactions = await knex('transactions')
        .where('session_id', sessionId)
        .select()

      return { transactions }
      // o return fica melhor assim, com o transactions dentro de um
      // objeto, pois caso a gente queira futuramente retornar alguma outra
      // coisa junto, esta outra coisa nao se misturara com o select de
      // transactions
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const transaction = await knex('transactions')
        .where({
          session_id: sessionId,
          id,
        })
        .first()
      // com o first eu ja digo que vai ter apenas um id igual a esse
      // isso tb evita do banco, mesmo depois de achar um com id igual,
      // continuar fazendo uma varredura em todas as outras linhas para
      // tentar achar outro com este mesmo id

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const summary = await knex('transactions')
        .where('session_id', sessionId)
        // define o nome da coluna apenas como amount, pq se nao
        // ficaria sum('amount') no nome
        .sum('amount', { as: 'amount' })
        .first()
      // colocamos o first pq se nao ele retorna um array, queremos
      // dizer que o resultado vai ser um só

      return { summary }
    },
  )

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
