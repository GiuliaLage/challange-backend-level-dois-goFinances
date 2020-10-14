import { getRepository } from 'typeorm';
import Category from '../models/Category';
import AppError from '../errors/AppError';

class CreateCategoryService {
  public async execute(title: string): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const findCategory = await categoryRepository.findOne({ title });

    console.log(findCategory);

    if (findCategory) {
      throw new AppError('category Already exists.');
    }

    const category = categoryRepository.create({ title });
    await categoryRepository.save(category);

    return category;
  }
}

export default CreateCategoryService;
