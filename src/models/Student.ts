import { ObjectType, Field, ID } from 'type-graphql'
import { prop as Property, getModelForClass } from '@typegoose/typegoose'
import { Book } from './Book'

@ObjectType()
export class Student {
  @Field(() => ID)
  id!: string

  @Field()
  @Property({ required: true })
  name!: string

  @Field()
  @Property({ required: false, unique: true, sparse: true })
  email?: string

  @Field()
  @Property({ required: true })
  password!: string

  @Field(() => [Book])
  @Property({ type: () => [Book], default: [] })
  books!: Book[]
}

export const StudentModel = getModelForClass(Student)
