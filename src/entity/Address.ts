import { ApolloServerPluginUsageReportingDisabled } from 'apollo-server-core';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cep: string;

  @Column()
  street: string;

  @Column()
  streetNumber: number;

  @Column()
  complement?: string;

  @Column()
  neighbourhood: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @ManyToOne(() => User, (userId) => userId.id)
  userId: number;
}
