// .d.ds = definição de tipos - não terá código de js - apenas de tyepscript
// eslint-disable-next-line
import { Knex } from 'knex'

// no knex temos como definir tipos especificos

// neste caso, estamos definindo em um arquivo d.ts os tipos
// de tabelas, ou seja, isso torna o codigo mais inteligente
// e ele ja vai ficar sabendo as tabelas que vamos ter no nosso
// codigo e tambem os campos que as tabelas possuem

// facilita no autocomplete do codigo tb

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string
      title: string
      amount: number
      created_at: string
      session_id?: string
    }
  }
}
