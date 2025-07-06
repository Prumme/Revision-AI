import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({ description: "ID de l'utilisateur" })
  id: string;

  @ApiProperty({ description: "Email de l'utilisateur" })
  email: string;

  @ApiProperty({ description: "Nom d'utilisateur" })
  username: string;

  @ApiProperty({ description: 'Date de dernière mise à jour du mot de passe' })
  lastUpdatedPassword: Date;

  @ApiProperty({ description: 'Email vérifié' })
  emailVerified: boolean;

  @ApiProperty({ description: "Rôle de l'utilisateur" })
  role: string;

  @ApiProperty({ description: "Niveau d'abonnement" })
  subscriptionTier: string;

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;

  @ApiProperty({ description: 'ID client', required: false })
  customerId?: string;

  @ApiProperty({ description: "URL de l'avatar", required: false })
  avatar?: string;

  @ApiProperty({ description: 'Biographie', required: false })
  bio?: string;

  @ApiProperty({ description: 'Compte supprimé', required: false })
  deleted?: boolean;

  @ApiProperty({ description: 'Compte bloqué', required: false })
  blocked?: boolean;
}

export class AddressDto {
  @ApiProperty({ description: "Ligne d'adresse 1" })
  line1: string;

  @ApiProperty({ description: "Ligne d'adresse 2", required: false })
  line2?: string;

  @ApiProperty({ description: 'Ville' })
  city: string;

  @ApiProperty({ description: 'État/Région' })
  state: string;

  @ApiProperty({ description: 'Code postal' })
  postalCode: string;

  @ApiProperty({ description: 'Pays' })
  country: string;
}

export class CustomerDto {
  @ApiProperty({ description: 'ID client' })
  customerId: string;

  @ApiProperty({ description: 'Prénom' })
  firstName: string;

  @ApiProperty({ description: 'Nom' })
  lastName: string;

  @ApiProperty({ description: "Niveau d'abonnement" })
  subscriptionTier: string;

  @ApiProperty({ description: 'Adresse', type: () => AddressDto })
  address: AddressDto;
}

export class QuizDto {
  @ApiProperty({ description: 'ID du quiz' })
  id: string;

  @ApiProperty({ description: "ID de l'utilisateur" })
  userId: string;

  @ApiProperty({ description: 'Nom du quiz' })
  name: string;

  @ApiProperty({ description: 'Description du quiz' })
  description: string;

  @ApiProperty({ description: 'Questions du quiz' })
  questions: any[];

  @ApiProperty({ description: 'Tags du quiz' })
  tags: string[];

  @ApiProperty({ description: 'Score de rigueur' })
  rigorScore: number;

  @ApiProperty({ description: 'Visibilité publique' })
  public: boolean;

  @ApiProperty({ description: 'Réponses au quiz' })
  answers: any[];

  @ApiProperty({ description: 'Contexte du quiz' })
  context: string;

  @ApiProperty({ description: 'Liste des likes' })
  likes: string[];

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;

  @ApiProperty({ description: 'Date de mise à jour' })
  updatedAt: Date;
}

export class UserData {
  @ApiProperty({
    description: "Données de l'utilisateur",
    type: () => UserDto,
  })
  user: UserDto;

  @ApiProperty({
    description: "Données du client (si l'utilisateur est un client)",
    type: () => CustomerDto,
    required: false,
  })
  customer?: CustomerDto;

  @ApiProperty({
    description: "Liste des quiz créés par l'utilisateur",
    type: () => [QuizDto],
  })
  quizzes: QuizDto[];
}
