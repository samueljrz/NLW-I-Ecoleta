import { Request, Response, response } from 'express';
import knex from '../database/connection';

class PointController {
    async index(req: Request, res: Response) {
        const { city, uf, items } = req.query;

        const parsedItems = String(items).split(',').map(item => Number(item.trim()))

        const points = await knex('point')
        .join('point_item', 'point.id', '=', 'point_item.point_id')
        .whereIn('point_item.item_id', parsedItems)
        .where('city', String(city))
        .where('uf', String(uf))
        .distinct()
        .select('point.*');

        const serializedPoints = points.map(point => {
            return {
                ...point,
                image_url: `http://localhost:3333/uploads/${point.image}`
            }
        })

        return res.json(serializedPoints)
    }
    
    async show(req: Request, res: Response) {
        const { id } = req.params

        const point = await knex('point').where('id', id).first();

        if(!point) {
            return res.status(400).json({ message: "Point not found!" })
        }

        const serializedPoint = {
            ...point,
            image_url: `http://localhost:3333/uploads/${point.image}`
        };

        const items = await knex('item')
        .join('point_item', 'item.id', '=', 'point_item.item_id')
        .where('point_item.point_id', id)
        .select('item.title');

        return res.json({
            point: serializedPoint,
            items
        });
    }
    
    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = req.body
    
        const trx = await knex.transaction();
        
        const point = {
            image: req.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

        const insertedIds = await trx('point').insert(point);
    
        const point_id = insertedIds[0];
    
        const pointItem = items
            .split(',')
            .map((item: String) => Number(item.trim()))
            .map((item_id: Number) => {
                return {
                    item_id,
                    point_id
                }
            });
    
        await trx('point_item').insert(pointItem);
    
        await trx.commit();

        return res.json({
            id: point_id,
            ...point
        });
    }
};

export default PointController;
