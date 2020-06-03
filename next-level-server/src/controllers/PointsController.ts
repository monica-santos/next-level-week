import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query

    const parsedItems = String(items)
      .split(',')
      .map((item) => +item.trim())

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    response.json({ points })
  }

  async show(request: Request, response: Response) {
    const { id } = request.params

    const point = await knex('points').where('id', id).first()
    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title')

    if (!point) return response.status(404).json({ message: 'Point not found' })
    response.json({ point: { ...point, items } })
  }

  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude,
      items
    } = request.body

    const point = {
      image:
        'https://images.unsplash.com/photo-1568835679605-ba674a4d12e1?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=300&q=50',
      name,
      email,
      whatsapp,
      city,
      uf,
      latitude,
      longitude
    }

    const trx = await knex.transaction()

    const insertedIds = await trx('points').insert(point)
    const point_id = insertedIds[0]

    const pointItems = items.map((item_id: number) => ({
      item_id,
      point_id
    }))

    await trx('point_items').insert(pointItems)
    await trx.commit()

    response.json({ point: { id: point_id, ...point } })
  }
}

export default PointsController
