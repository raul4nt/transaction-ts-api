import { expect, it, beforeAll, afterAll, describe } from 'vitest'
import request from 'supertest'
import { app } from '../src/app'

// categoria os testes(podemos colocar até subcategorias, 
// uma dentro da outra). ajuda a dividir. por exemplo, neste caso,
// o before all e o afterAll irao valer apenas para testes desta
// categoria
describe('Transaction routes', () => {

  beforeAll(async () => {
    await app.ready()
  })
  // ou seja, antes de executar as funções, irei verificar se meu app está pronto

  afterAll(async () => {
    await app.close()
  })
  // ou seja, depois de ter executado todas as funções, fecharei meu app

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      // pega o servidor do node, cada framework tem um server do js
      // (aquele createServer do node:http)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      // pega o servidor do node, cada framework tem um server do js
      // (aquele createServer do node:http)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      // este set"Cookie" é da documentação do supertest,
      // para pegar coisas da requisição
      .expect(200)
    
    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New transaction',
        amount: 5000,
      })
    ])
    // objectContaining = verifica se tem um objeto contendo
    // determindos campos/coisas. 

  })

})
