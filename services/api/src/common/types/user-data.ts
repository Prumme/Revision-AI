import { Quiz } from '@entities/quiz.entity';
import { Customer } from '@entities/customer.entity';
import { User } from '@entities/user.entity';

export interface UserData {
  user: User;
  customer?: Customer;
  quizzes: Quiz[];
}
