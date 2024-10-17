import 'dotenv/config'
import { z } from 'zod'

// cria um esquema que espera um  objeto com
// determinadas chaves e valores
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
  // se tiver uma porta, ok, usa a que tem
  // se não tiver, vai usar o valor como 3333(valor default)
})

// o esquema exige que exista uma chave chamada DATABASE_URL e
// que o valor associado a essa chave seja uma string

// export const env = envSchema.parse(process.env)
// verifica se as variavéis presentes no process.env
// atendem o esquema definido em envSchema
// se não atende, ele já da um erro direto

export const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error?.format())

  throw new Error('Invalid environment variables!')
}

export const env = _env.data

// ao inves de usar o parse direto(codigo comentado), podemos usar
// o safeParse, pois com o safeParse podemos criar nossas proprias
// mensagens de erro, tornado o codigo mais descritivo

// o safeParse gera um boolean "success", ou seja, true or false
// se estiver tudo ok, true, se nao, false. ai ali verificamos:
// se o success for false(deu erro), eu gero uma mensagem de erro
// se deu certo, vai passar do if direto e a const env vai ter o conteudo
// de _env.data, que é o conteudo da minha .env
