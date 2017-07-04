import { BaseDbModel } from '../lib/db/basedbmodel'

export class EavAttribute extends BaseDbModel {
    protected table:string = 'eav_attribute';
    protected primaryKey:string = 'attribute_id';
}
