import { getCustomRepository, getRepository } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionRepository.getBalance();

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('transaction type is invalid');
    }

    if (type === 'outcome' && total < value) {
      throw new AppError('you do not have enough balance.');
    }

    const categoryExist = await categoryRepository.findOne({ title: category });

    if (!categoryExist) {
      const createCategory = categoryRepository.create({ title: category });
      const newCategory = await categoryRepository.save(createCategory);

      const createTransaction = transactionRepository.create({
        title,
        value,
        type,
        category: newCategory,
      });

      await transactionRepository.save(createTransaction);

      return createTransaction;
    }

    const createTransaction = transactionRepository.create({
      title,
      value,
      type,
      category: categoryExist,
    });

    await transactionRepository.save(createTransaction);

    return createTransaction;
  }
}

export default CreateTransactionService;
