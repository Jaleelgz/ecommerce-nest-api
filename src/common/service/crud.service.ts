import { Document, FilterQuery, Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import 'source-map-support/register';

@Injectable()
export abstract class CRUDService<T extends Document> {
  private readonly modelName: string;

  protected constructor(private readonly model: Model<T>) {
    for (const modelName of Object.keys(model.collection.conn.models)) {
      if (model.collection.conn.models[modelName] === this.model) {
        this.modelName = modelName;
        break;
      }
    }
  }

  /**
   * Retrieves a single document by populating dependent data if any
   * @param conditions
   * @param projection
   * @param options
   * @param populateOptions
   */
  async get(
    conditions: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
    populateOptions?: string,
  ): Promise<any> {
    if (!populateOptions || 0 === populateOptions.length)
      return await this.model
        .findOne(conditions as FilterQuery<T>, projection, options)
        .exec();
    else {
      const populateOptionsArray = populateOptions.split(',');
      const populatePath = populateOptionsArray[0];
      const populateSelect = populateOptionsArray[1];
      return await this.model
        .findOne(conditions as FilterQuery<T>, projection, options)
        .populate(populatePath, populateSelect)
        .exec();
    }
  }

  /**
   * Retrieves an array of documents
   * @param conditions
   * @param projection
   * @param options
   *
   */
  async list(
    conditions: Partial<Record<keyof T, unknown>>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
    populateOptions: string,
  ): Promise<T[]> {
    if (!populateOptions || 0 === populateOptions.length) {
      return await this.model
        .find(conditions as FilterQuery<T>, projection, options)
        .exec();
    } else {
      const populateOptionsArray = populateOptions.split(',');
      const populatePath = populateOptionsArray[0];
      const populateSelect = populateOptionsArray[1];
      return await this.model
        .find(conditions as FilterQuery<T>, projection, options)
        .populate(populatePath, populateSelect)
        .exec();
    }
  }

  /**
   * Retrieves an array of documents grouped by the given field
   * @param conditions
   * @param projection
   * @param options
   *
   */
  async groupedList(aggregateOptions: string) {
    return await this.model.aggregate(eval(aggregateOptions)).exec();
  }

  /**
   * Creates a new document
   * @param dto
   */
  async create(dto: any, session?: any): Promise<T> {
    return new this.model(dto).save({ session });
  }

  /**
   * Creates an array of documents
   * @param dtoList
   */
  async createAll(dtoList: any) {
    try {
      const res = await this.model.insertMany(dtoList, { ordered: false }); // With unordered inserts, if an error occurs during an insert of one of the documents, MongoDB continues to insert the remaining docs
      return res;
    } catch (err) {
      if (
        err.message.indexOf('Duplicate Key') >= 0 ||
        err.message.indexOf('dup key') >= 0
      )
        Logger.warn(err.message);
      else throw err;
    }
  }

  /**
   * Updates an existing document that match the conditions
   * @param conditions
   * @param update
   */
  async update(
    conditions: Partial<Record<keyof T, unknown>>,
    update: any,
    session?: any,
  ) {
    return this.model.findOneAndUpdate(conditions as FilterQuery<T>, update, {
      new: true,
      session,
    });
  }

  /**
   * Update all documents that match the conditions
   * @param conditions
   * @param update
   */
  async updateAll(
    conditions: Partial<Record<keyof T, unknown>>,
    update: any,
  ): Promise<any> {
    return this.model.updateMany(conditions as FilterQuery<T>, update, {
      new: true,
    });
  }

  /**
   * Upsert ( if exists update otherwise create it ) a document.
   * @param conditions
   * @param update
   */
  async upsert(conditions: Partial<Record<keyof T, unknown>>, update: any) {
    return this.model.findOneAndUpdate(conditions as FilterQuery<T>, update, {
      new: true,
      upsert: true,
    });
  }

  /**
   * Delete document that match the conditions
   * @param conditions
   */
  async delete(
    conditions: Partial<Record<keyof T, unknown>>,
    session?: any,
  ): Promise<any> {
    return this.model.deleteOne(conditions as FilterQuery<T>, { session });
  }

  /**
   * Delete all documents that match the conditions
   * @param conditions
   */
  async deleteAll(
    conditions: Partial<Record<keyof T, unknown>>,
    session?: any,
  ): Promise<any> {
    return this.model.deleteMany(conditions as FilterQuery<T>, { session });
  }
}
