import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { User } from '@entities/user.entity';
import {
  UserRepository,
  UserFilters,
  PaginationOptions,
  PaginatedResult,
} from '@repositories/user.repository';

@Injectable()
export class MongoUserRepository implements UserRepository {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const document = await this.userModel.findOne({ email }).exec();
    if (!document) return null;
    return this.documentToUser(document);
  }

  async findById(id: string): Promise<User | null> {
    const document = await this.userModel.findById(id).exec();
    if (!document) return null;
    return this.documentToUser(document);
  }

  async create(user: User): Promise<User> { 
    const document = await this.userModel.create(user);
    return this.documentToUser(document);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const document = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...user,
          updatedAt: new Date(),
        },
        { new: true },
      )
      .exec();

    if (!document) {
      throw new Error('Utilisateur non trouvé');
    }

    return this.documentToUser(document);
  }

  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.userModel.findByIdAndDelete(id).exec();
      return result !== null;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  async findAll(
    filters: UserFilters,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<User>> {
    let query: any = {};

    if (filters.onlyDeleted && filters.onlyBlocked) {
      query = { $or: [{ deleted: true }, { blocked: true }] };
    } else if (filters.onlyDeleted) {
      query.deleted = true;
    } else if (filters.onlyBlocked) {
      query.blocked = true;
    } else {
      if (!filters.includeDeleted) {
        query.deleted = { $ne: true };
      }
      if (!filters.includeBlocked) {
        query.blocked = { $ne: true };
      }
    }

    // Ajouter la recherche textuelle
    if (filters.search && filters.search.trim()) {
      const searchRegex = new RegExp(filters.search.trim(), 'i');
      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { username: { $regex: searchRegex } },
          { email: { $regex: searchRegex } },
        ],
      });
    }

    const skip = (pagination.page - 1) * pagination.limit;

    // Construire l'objet de tri
    let sortQuery: any = { createdAt: -1 }; // Tri par défaut
    if (filters.sortBy && filters.sortOrder) {
      // Valider les champs autorisés pour le tri
      const allowedSortFields = [
        'username',
        'email',
        'role',
        'createdAt',
        'emailVerified',
      ];
      if (allowedSortFields.includes(filters.sortBy)) {
        if (filters.sortBy === 'role') {
          // Tri spécial pour les rôles : admin en premier, puis user
          const roleOrder = filters.sortOrder === 'asc' ? 1 : -1;
          sortQuery = [
            {
              $addFields: {
                rolePriority: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ['$role', 'admin'] },
                        then: roleOrder === 1 ? 0 : 1,
                      },
                      {
                        case: { $eq: ['$role', 'user'] },
                        then: roleOrder === 1 ? 1 : 0,
                      },
                    ],
                    default: 2,
                  },
                },
              },
            },
            { $sort: { rolePriority: 1, role: roleOrder } },
          ];
        } else {
          sortQuery = {
            [filters.sortBy]: filters.sortOrder === 'asc' ? 1 : -1,
          };
        }
      }
    }

    let users;
    const total = await this.userModel.countDocuments(query);

    if (Array.isArray(sortQuery)) {
      // Utiliser l'agrégation pour le tri personnalisé des rôles
      const pipeline = [
        { $match: query },
        ...sortQuery,
        { $skip: skip },
        { $limit: pagination.limit },
      ];
      users = await this.userModel.aggregate(pipeline);
    } else {
      // Utiliser la méthode traditionnelle pour les autres tris
      users = await this.userModel
        .find(query)
        .skip(skip)
        .limit(pagination.limit)
        .sort(sortQuery);
    }

    const totalPages = Math.ceil(total / pagination.limit);

    return {
      data: users.map((user) => this.documentToUser(user)),
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
    };
  }

  private documentToUser(document: UserDocument): User {
    return {
      id: document._id.toString(),
      email: document.email,
      username: document.username,
      password: document.password,
      lastUpdatedPassword: document.lastUpdatedPassword,
      emailVerified: document.emailVerified,
      role: document.role,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      avatar: document.avatar,
      customerId: document.customerId,
      bio: document.bio,
      subscriptionTier: document.subscriptionTier,
      deleted: document.deleted,
      blocked: document.blocked,
    };
  }
}
