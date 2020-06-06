import { Request, Response } from 'express'
import knex from '../database/connection'

class ItemsController {
  async index(request: Request, response: Response) {
    const items = await knex('items').select('*')

    const serialized = items.map(({ id, title, image }) => ({
      id,
      title,
      image_url: `http://192.168.100.191:3333/uploads/${image}`
    }))

    response.json({ items: serialized })
  }
}

export default ItemsController
